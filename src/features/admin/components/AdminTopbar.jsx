import { Menu, PanelLeftOpen, PanelLeftClose, ExternalLink } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { usePermission } from '../../../hooks/usePermission'
import NotificationBell from '../../../presentation/components/NotificationBell'

const titleMap = [
  { prefix: '/admin/dashboard', title: 'Dashboard' },
  { prefix: '/admin/users', title: 'Users' },
  { prefix: '/admin/trips', title: 'Trips' },
  { prefix: '/admin/bookings', title: 'Bookings' },
  { prefix: '/admin/payments', title: 'Payments' },
  { prefix: '/admin/vehicles', title: 'Vehicles' },
  { prefix: '/admin/offers', title: 'Offers' },
  { prefix: '/admin/reviews', title: 'Reviews' },
  { prefix: '/admin/complaints', title: 'Complaints' },
  { prefix: '/admin/tracking', title: 'Tracking' },
  { prefix: '/admin/notifications', title: 'Notifications' },
  { prefix: '/admin/ai-requests', title: 'AI Requests' },
  { prefix: '/admin/roles', title: 'Roles & Permissions' },
]

export default function AdminTopbar({ onMenuToggle, collapsed, onToggleCollapse }) {
  const { pathname } = useLocation()
  const { user, logout } = usePermission()

  const currentTitle =
    titleMap.find((entry) => pathname.startsWith(entry.prefix))?.title ||
    'Dashboard'

  const initials = (user?.full_name || user?.email || 'A')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuToggle}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/80 transition hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Open admin navigation"
          >
            <Menu className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/80 transition hover:bg-white/10 hover:text-white lg:inline-flex"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
          </button>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.45em] text-yellow-300/80">Workspace</p>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-white">{currentTitle}</h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/75 transition hover:bg-white/10 hover:text-white md:inline-flex"
          >
            <ExternalLink className="h-4 w-4" />
            Public site
          </Link>

          <div className="hidden md:block">
            <NotificationBell to="/admin/notifications" variant="dark" />
          </div>

          <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-2">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-yellow-400 text-sm font-black text-slate-950">
              {initials || 'A'}
            </div>
            <div className="hidden min-w-0 flex-col sm:flex">
              <span className="truncate text-sm font-semibold text-white">{user?.full_name || user?.email || 'Admin'}</span>
              <span className="text-xs text-white/55">{user?.role || 'admin'}</span>
            </div>
            <button
              type="button"
              onClick={() => void logout({ redirectTo: '/login' })}
              className="hidden rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white/75 transition hover:bg-white/10 hover:text-white sm:inline-flex"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
