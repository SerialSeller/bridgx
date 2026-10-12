type SpinnerProps = { size?: 'sm' | 'md' | 'lg'; label?: string; className?: string }

const dimensions = { sm: 'size-4 border-2', md: 'size-6 border-[3px]', lg: 'size-9 border-[3px]' }

export function Spinner({ size = 'md', label = 'Loading', className = '' }: SpinnerProps) {
  return <span className={`inline-block animate-spin rounded-full border-brand/20 border-t-brand ${dimensions[size]} ${className}`} role="status"><span className="sr-only">{label}</span></span>
}
