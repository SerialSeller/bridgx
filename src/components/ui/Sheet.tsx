import { X } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'

type SheetProps = { open: boolean; onClose: () => void; title: string; children: ReactNode }

export function Sheet({ open, onClose, title, children }: SheetProps) {
  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/35 p-0 sm:items-center sm:p-5" onMouseDown={onClose}>
      <section role="dialog" aria-modal="true" aria-label={title} onMouseDown={(event) => event.stopPropagation()} className="w-full max-w-md rounded-t-3xl border border-line bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-lift sm:rounded-3xl">
        <div className="mb-5 flex items-center justify-between"><h2 className="font-display text-lg font-bold text-ink">{title}</h2><button onClick={onClose} className="grid size-10 place-items-center rounded-full bg-canvas text-muted hover:text-ink" aria-label="Close"><X size={18} /></button></div>
        {children}
      </section>
    </div>
  )
}
