import type { HTMLAttributes } from 'react'

type CardProps = HTMLAttributes<HTMLDivElement> & { interactive?: boolean }

export function Card({ interactive = false, className = '', ...props }: CardProps) {
  return <div {...props} className={`rounded-[24px] border border-transparent bg-white ${interactive ? 'transition-shadow hover:shadow-lift' : ''} ${className}`} />
}
