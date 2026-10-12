import type { ReactNode } from 'react'

type EmptyStateProps = { icon: ReactNode; title: string; description: string; action?: ReactNode }

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <section className="rounded-2xl border border-dashed border-line bg-white/80 px-6 py-8 text-center" aria-live="polite">
      <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-aqua text-brand">{icon}</div>
      <h2 className="mt-4 font-display text-lg font-bold text-ink">{title}</h2>
      <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-muted">{description}</p>
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </section>
  )
}
