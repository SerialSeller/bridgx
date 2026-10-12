/// <reference types="node" />
export type ContentPart =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string } }
export type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string | ContentPart[] }

export async function chatJSON<T = unknown>(
  messages: ChatMessage[],
  { model, timeoutMs = 20_000 }: { model?: string; timeoutMs?: number } = {},
): Promise<T | null> {
  const base = process.env.LLM_BASE_URL?.replace(/\/+$/, '')
  const auth = process.env.LLM_AUTH
  const selectedModel = model ?? process.env.LLM_MODEL
  if (!base || !auth || !selectedModel) return null
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(`${base}/chat/completions`, {
      method: 'POST', signal: controller.signal,
      headers: { Authorization: auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: selectedModel, messages, response_format: { type: 'json_object' } }),
    })
    if (!response.ok) return null
    const data: unknown = await response.json()
    if (!data || typeof data !== 'object' || !('choices' in data) || !Array.isArray(data.choices)) return null
    const message = data.choices[0]?.message
    if (!message || typeof message.content !== 'string') return null
    const content = message.content.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
    return JSON.parse(content) as T
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}
