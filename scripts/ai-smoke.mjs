import { spawnSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { parseEnv } from 'node:util'
import { deflateSync } from 'node:zlib'

const local = Object.assign({}, ...['.env', '.env.local'].filter(existsSync).map((path) => parseEnv(readFileSync(path, 'utf8'))))
const key = local.FAL_KEY || process.env.FAL_KEY
if (!key || /[\r\n"]/.test(key)) {
  console.error('Add FAL_KEY to the ignored .env.local file before running the smoke test.')
  process.exit(1)
}
const baseUrl = 'https://fal.run/openrouter/router/openai/v1'
const models = [local.LLM_MODEL || 'openai/gpt-6-luna']
const directory = mkdtempSync(join(tmpdir(), 'bridgx-ai-'))

// A synthetic red PNG proves vision without sharing anyone's profile or contact details.
function chunk(type, data) {
  const typeAndData = Buffer.concat([Buffer.from(type), data])
  let crc = 0xffffffff
  for (const byte of typeAndData) {
    crc ^= byte
    for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0)
  }
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length)
  const checksum = Buffer.alloc(4)
  checksum.writeUInt32BE((crc ^ 0xffffffff) >>> 0)
  return Buffer.concat([length, typeAndData, checksum])
}
const header = Buffer.alloc(13)
header.writeUInt32BE(64, 0)
header.writeUInt32BE(64, 4)
header[8] = 8
header[9] = 2
const pixels = Buffer.alloc(64 * (1 + 64 * 3))
for (let y = 0; y < 64; y++) {
  for (let x = 0; x < 64; x++) pixels[y * 193 + 1 + x * 3] = 255
}
const png = Buffer.concat([
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  chunk('IHDR', header), chunk('IDAT', deflateSync(pixels)), chunk('IEND', Buffer.alloc(0)),
])

function call(model, content, name) {
  const input = join(directory, `${name}.json`)
  const output = join(directory, `${name}-response.json`)
  writeFileSync(input, JSON.stringify({
    model, messages: [{ role: 'user', content }],
    response_format: { type: 'json_object' }, max_tokens: 512,
  }))
  // Supply the credential via stdin, not argv or shell interpolation.
  const result = spawnSync('curl', [
    '--disable', '--silent', '--show-error', '--fail-with-body', '--max-time', '60',
    '--config', '-', '--request', 'POST', '--data-binary', `@${input}`,
    '--output', output, '--write-out', '%{http_code}', `${baseUrl}/chat/completions`,
  ], {
    input: `header = "Authorization: Key ${key}"\nheader = "Content-Type: application/json"\n`,
    encoding: 'utf8', timeout: 65000,
  })
  if (result.status !== 0) throw new Error(`${name}: HTTP ${result.stdout || 'unavailable'}`)
  const response = JSON.parse(readFileSync(output, 'utf8'))
  const text = response.choices?.[0]?.message?.content
  if (typeof text !== 'string') throw new Error(`${name}: missing message content`)
  return JSON.parse(text.replace(/^\s*```(?:json)?\s*/i, '').replace(/\s*```\s*$/, ''))
}

try {
  let passed = false
  for (const model of models) {
    try {
      const text = call(model, 'Return the JSON object {"ok":true}. No other text.', 'text')
      if (text.ok !== true) throw new Error('text: JSON assertion failed')
      const vision = call(model, [
        { type: 'text', text: 'What is the solid color of this image? Return JSON with a single lowercase color field.' },
        { type: 'image_url', image_url: { url: `data:image/png;base64,${png.toString('base64')}` } },
      ], 'vision')
      if (vision.color?.toLowerCase() !== 'red') throw new Error('vision: color assertion failed')
      const report = { testedAt: new Date().toISOString(), baseUrl, model, text, vision }
      writeFileSync('ai-smoke.local', `${JSON.stringify(report, null, 2)}\n`, { mode: 0o600 })
      console.log(JSON.stringify(report, null, 2))
      passed = true
      break
    } catch (error) {
      console.error(`${model}: ${error.message}`)
    }
  }
  if (!passed) process.exitCode = 1
} finally {
  rmSync(directory, { recursive: true, force: true })
}
