import { UserRound } from 'lucide-react'

type AvatarProps = { name: string; src?: string; size?: 'sm' | 'md' | 'lg' | 'xl'; className?: string }

const sizes = {
  sm: 'size-8 text-[10px]',
  md: 'size-10 text-xs',
  lg: 'size-12 text-sm',
  xl: 'size-16 text-lg',
}

function initialsFor(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'B'
}

export function Avatar({ name, src, size = 'md', className = '' }: AvatarProps) {
  return (
    <span className={`inline-grid shrink-0 place-items-center overflow-hidden rounded-2xl bg-aqua font-bold text-brand ${sizes[size]} ${className}`}>
      {src ? <img src={src} alt={name} className="size-full object-cover" /> : <span aria-label={name}>{initialsFor(name) || <UserRound size={18} />}</span>}
    </span>
  )
}
