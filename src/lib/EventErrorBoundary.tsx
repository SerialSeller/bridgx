import { Component } from 'react'
import type { ReactNode } from 'react'

export class EventErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() {
    if (!this.state.failed) return this.props.children
    return <main className="mx-auto min-h-svh max-w-md bg-cream px-4 py-12 font-sans text-ink">
      <h1 className="text-[32px] font-bold leading-[1.15]">We couldn’t load this event.</h1>
      <p className="mt-4 text-charcoal">Check your connection and try again. Your saved profile stays in this browser.</p>
      <button className="mt-6 min-h-11 rounded-full border border-ink px-5 text-sm font-bold" onClick={() => window.location.reload()}>Try again</button>
      <a className="ml-4 inline-flex min-h-11 items-center text-sm underline underline-offset-4" href="/">Go home</a>
    </main>
  }
}
