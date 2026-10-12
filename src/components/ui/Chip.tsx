import { useState, type ButtonHTMLAttributes } from 'react'

type ChipProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> & {
  selected?: boolean
  size?: 'sm' | 'md'
  onSelectedChange?: (selected: boolean) => void
}

export function Chip({ selected, size = 'md', onSelectedChange, className = '', children, onClick, ...props }: ChipProps) {
  const [uncontrolled, setUncontrolled] = useState(false)
  const isSelected = selected ?? uncontrolled
  const dimensions = size === 'sm' ? 'min-h-7 px-2.5 text-[11px]' : 'min-h-9 px-3 text-xs'

  return (
    <button
      {...props}
      type={props.type ?? 'button'}
      aria-pressed={isSelected}
      onClick={(event) => {
        onClick?.(event)
        const next = !isSelected
        if (selected === undefined) setUncontrolled(next)
        onSelectedChange?.(next)
      }}
      className={`inline-flex shrink-0 items-center justify-center rounded-full border font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${dimensions} ${isSelected ? 'border-ink bg-ink text-white' : 'border-line bg-white text-ink hover:border-ink/40'} ${className}`}
    >
      {children}
    </button>
  )
}
