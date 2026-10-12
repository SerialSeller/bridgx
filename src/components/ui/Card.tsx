import type { HTMLAttributes } from 'react'

type CardProps = HTMLAttributes<HTMLDivElement> & { interactive?: boolean }

export function Card({ interactive = false, className = '', ...props }: CardProps) {
  return <div {...props} className={`rounded-2xl border border-line bg-white shadow-card ${interactive ? 'transition-shadow hover:shadow-lift' : ''} ${className}`} />
}
