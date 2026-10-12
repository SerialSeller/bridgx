import { ArrowLeft, Printer } from 'lucide-react'
import { useQuery } from 'convex/react'
import type { CSSProperties } from 'react'
import { Link, useParams } from 'react-router'
import { QRCodeSVG } from 'qrcode.react'
import { api } from '../../../convex/_generated/api'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'

const PRINT_CSS = `
@media print {
  @page { size: A4; margin: 0 }
  html, body { background: var(--color-cream); margin: 0; padding: 0 }
  .bridgx-poster { print-color-adjust: exact; -webkit-print-color-adjust: exact }
}
`

const COLOR_EXACT = { printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' } as CSSProperties

const STEPS = [
  'Scan with your phone camera',
  'Tell us who you are in one sentence',
  'See who to meet, why, and what to say',
]

function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`font-display font-bold tracking-[-0.04em] ${className}`}>
      bridg<span className="text-gold">x</span>
    </span>
  )
}

function Squiggle() {
  return (
    <svg
      viewBox="0 0 120 18"
      aria-hidden="true"
      className="pointer-events-none absolute top-full left-[-3%] -mt-[0.6cqw] w-[106%] overflow-visible text-gold"
    >
      <path
        d="M4 11 C 16 4, 26 15, 40 9 S 64 3, 80 10 S 104 14, 116 6"
        stroke="currentColor"
        strokeWidth={6}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}

export function PosterPage() {
  const { slug = '' } = useParams()
  const event = useQuery(api.events.getBySlug, slug ? { slug } : 'skip')

  if (slug && event === undefined) {
    return (
      <main className="grid min-h-dvh place-items-center bg-canvas px-4">
        <Spinner size="lg" label="Loading poster" />
      </main>
    )
  }

  if (!event) {
    return (
      <main className="grid min-h-dvh place-items-center bg-canvas px-4">
        <div className="max-w-sm text-center">
          <Wordmark className="text-2xl text-ink" />
          <h1 className="mt-6 text-2xl font-bold tracking-[-0.02em] text-ink">Event not found</h1>
          <p className="mt-2 text-muted">This link does not match any event. Check the address and try again.</p>
          <Button asChild variant="secondary" className="mt-6">
            <Link to="/">Go home</Link>
          </Button>
        </div>
      </main>
    )
  }

  const joinUrl = `${window.location.origin}/e/${slug}`
  const displayUrl = `${window.location.host}/e/${slug}`
  const meta = [event.date, event.location].filter(Boolean).join('  ·  ')
  const nameSize = event.name.length > 40 ? 'text-[length:6cqw]' : event.name.length > 22 ? 'text-[length:7.2cqw]' : 'text-[length:8.6cqw]'

  return (
    <main className="min-h-dvh bg-canvas px-4 py-6 sm:py-10 print:min-h-0 print:bg-cream print:p-0">
      <style>{PRINT_CSS}</style>

      <div className="mx-auto mb-6 flex w-full max-w-[600px] items-center justify-between gap-3 print:hidden">
        <Link
          to={`/e/${slug}`}
          className="inline-flex min-h-10 items-center gap-2 rounded-full px-3 text-sm font-semibold text-muted transition-colors hover:bg-white hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Back to event
        </Link>
        <Button onClick={() => window.print()}>
          <Printer size={18} aria-hidden="true" />
          Print poster
        </Button>
      </div>

      <div
        style={COLOR_EXACT}
        className="bridgx-poster @container mx-auto flex aspect-[210/297] w-full max-w-[600px] flex-col overflow-hidden rounded-[24px] border border-line bg-cream text-ink print:h-[297mm] print:w-[210mm] print:max-w-none print:rounded-none print:border-0"
      >
        {/* Brand panel */}
        <header className="relative shrink-0 overflow-hidden rounded-b-[7cqw] bg-ultramarine px-[7cqw] pt-[6.5cqw] pb-[8cqw] text-white">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-[17cqw] -right-[6cqw] select-none text-[length:62cqw] leading-none font-bold tracking-[-0.06em] text-royal"
          >
            x
          </span>
          <div className="relative flex items-center justify-between gap-[3cqw]">
            <Wordmark className="text-[length:4.4cqw] leading-none" />
            <span className="rounded-full border border-white/35 px-[2.6cqw] py-[1cqw] text-[length:2cqw] font-semibold tracking-widest text-white/85 uppercase">
              Scan to join
            </span>
          </div>
          <p className="relative mt-[7cqw] text-[length:2.4cqw] font-semibold tracking-widest text-white/75 uppercase">
            You're invited to meet
          </p>
          <h1 className={`relative mt-[1.6cqw] max-w-[88%] font-display leading-[1.02] font-bold tracking-[-0.03em] break-words text-balance ${nameSize}`}>
            {event.name}
          </h1>
          {meta && <p className="relative mt-[2.6cqw] text-[length:2.8cqw] font-medium text-white/80">{meta}</p>}
        </header>

        {/* Body */}
        <section className="flex flex-1 flex-col justify-between px-[7cqw] pt-[6cqw] pb-[5cqw]">
          <h2 className="font-display text-[length:7cqw] leading-[1.08] font-bold tracking-[-0.035em] text-ink">
            Meet the{' '}
            <span className="relative inline-block">
              right
              <Squiggle />
            </span>
            <br />
            people here.
          </h2>

          <div className="flex items-center gap-[5cqw]">
            <div className="w-[44%] shrink-0 rounded-[6.5cqw] border border-line bg-white p-[4cqw]">
              <QRCodeSVG
                value={joinUrl}
                size={260}
                level="M"
                marginSize={0}
                bgColor="#ffffff"
                fgColor="#1a1a1a"
                title={`Join ${event.name} on bridgx`}
                className="block h-auto w-full"
              />
            </div>

            <ol className="flex min-w-0 flex-1 flex-col gap-[3.4cqw]">
              {STEPS.map((step, i) => (
                <li key={step} className="flex items-start gap-[2.6cqw]">
                  <span className="grid size-[6cqw] shrink-0 place-items-center rounded-full bg-gold text-[length:3cqw] font-bold text-ink">
                    {i + 1}
                  </span>
                  <span className="min-w-0 pt-[0.9cqw] text-[length:3cqw] leading-[1.25] font-semibold tracking-[-0.01em] text-ink">
                    {step}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <footer className="flex items-end justify-between gap-[3cqw] border-t border-line pt-[3.4cqw]">
            <div className="min-w-0">
              <p className="text-[length:2.9cqw] font-bold tracking-[-0.01em] text-muted">No app. No login. 20 seconds.</p>
              <p className="mt-[0.8cqw] truncate text-[length:2.2cqw] font-medium text-dim">{displayUrl}</p>
            </div>
            <Wordmark className="shrink-0 text-[length:3.6cqw] leading-none text-ink" />
          </footer>
        </section>
      </div>
    </main>
  )
}
