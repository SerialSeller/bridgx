import { cloneElement, isValidElement, type ButtonHTMLAttributes, type ReactElement, type ReactNode } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  children: ReactNode
}

const variants = {
  primary: 'bg-brand text-white shadow-sm hover:bg-brand-deep',
  secondary: 'border border-line bg-white text-ink shadow-card hover:border-brand/25 hover:bg-aqua/40',
  outline: 'border border-brand/25 bg-transparent text-brand hover:bg-aqua/50',
  ghost: 'bg-transparent text-muted hover:bg-canvas hover:text-ink',
}

const sizes = {
  sm: 'min-h-10 gap-2 rounded-xl px-3.5 text-sm',
  md: 'min-h-11 gap-2.5 rounded-xl px-4 text-sm',
  lg: 'min-h-14 gap-3 rounded-2xl px-5 text-base',
}

export function Button({ asChild = false, size = 'md', variant = 'primary', className = '', children, ...props }: ButtonProps) {
  const classes = `inline-flex items-center justify-center font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`

  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<{ className?: string }>
    return cloneElement(child, { className: `${classes} ${child.props.className ?? ''}` })
  }

  return <button {...props} className={classes}>{children}</button>
}
