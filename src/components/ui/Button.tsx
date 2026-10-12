import { cloneElement, isValidElement, type ButtonHTMLAttributes, type ReactElement, type ReactNode } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  children: ReactNode
}

const variants = {
  primary: 'border border-ink bg-gold text-ink hover:bg-[#ffc633] active:translate-y-px',
  secondary: 'border border-ink bg-white text-ink hover:bg-pearl active:translate-y-px',
  outline: 'border border-ink/40 bg-transparent text-ink hover:bg-white',
  ghost: 'bg-transparent text-muted hover:bg-canvas hover:text-ink',
}

const sizes = {
  sm: 'min-h-10 gap-2 rounded-full px-4 text-sm',
  md: 'min-h-11 gap-2.5 rounded-full px-5 text-sm',
  lg: 'min-h-[52px] gap-3 rounded-full px-6 text-base',
}

export function Button({ asChild = false, size = 'md', variant = 'primary', className = '', children, ...props }: ButtonProps) {
  const classes = `inline-flex items-center justify-center font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`

  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<{ className?: string }>
    return cloneElement(child, { className: `${classes} ${child.props.className ?? ''}` })
  }

  return <button {...props} className={classes}>{children}</button>
}
