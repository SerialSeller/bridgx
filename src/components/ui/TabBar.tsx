import { Bookmark, UsersRound, UserRound, WandSparkles } from 'lucide-react'
import { NavLink } from 'react-router'

type TabBarProps = { slug: string }

const tabs = [
  { key: 'people', label: 'People', icon: UsersRound, path: 'people' },
  { key: 'matches', label: 'Matches', icon: WandSparkles, path: 'matches' },
  { key: 'saved', label: 'Saved', icon: Bookmark, path: 'saved' },
  { key: 'me', label: 'Me', icon: UserRound, path: 'me' },
]

export function TabBar({ slug }: TabBarProps) {
  return (
    <nav aria-label="Event navigation" className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-md border-t border-line bg-white/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur">
      <div className="mx-auto grid max-w-md grid-cols-4">
        {tabs.map(({ key, label, icon: Icon, path }) => (
          <NavLink key={key} to={`/e/${slug}/${path}`} className={({ isActive }) => `flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-semibold transition-colors ${isActive ? 'text-ink' : 'text-dim hover:text-ink'}`}>
            {({ isActive }) => <><Icon size={19} strokeWidth={isActive ? 2.3 : 1.8} aria-hidden="true" /><span>{label}</span></>}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
