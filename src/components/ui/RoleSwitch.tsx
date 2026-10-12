import { Link } from 'react-router'
import { getAdminKey } from '../../lib/adminKey'

type Role = 'attendee' | 'organizer'

// Organizer view opens the admin page when this device created the event, otherwise the public live screen.
export function RoleSwitch({ slug, active }: { slug: string; active: Role }) {
  const adminKey = getAdminKey(slug)
  const organizerHref = adminKey ? `/e/${slug}/admin?key=${encodeURIComponent(adminKey)}` : `/e/${slug}/live`
  const options: { role: Role; label: string; to: string }[] = [
    { role: 'attendee', label: 'Attendee', to: `/e/${slug}` },
    { role: 'organizer', label: 'Organizer', to: organizerHref },
  ]

  return (
    <nav aria-label="Switch view" className="inline-flex shrink-0 items-center gap-1 rounded-full border border-line bg-white p-1">
      {options.map(({ role, label, to }) => (
        <Link
          key={role}
          to={to}
          aria-current={active === role ? 'page' : undefined}
          className={`inline-flex min-h-9 items-center rounded-full px-3.5 text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${active === role ? 'bg-ink text-white' : 'text-muted hover:text-ink'}`}
        >
          {label}
        </Link>
      ))}
    </nav>
  )
}
