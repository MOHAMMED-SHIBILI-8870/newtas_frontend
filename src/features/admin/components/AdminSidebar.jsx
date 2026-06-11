import { useMemo, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  Coins,
  Files,
  Bell,
  MapPinned,
  PackageSearch,
  ShieldCheck,
  Truck,
  BadgePercent,
  Star,
  MessageCircleWarning,
  Route,
  LogOut,
  X,
  Users,
} from 'lucide-react'
import { usePermission } from '../../../hooks/usePermission'

const navigation = [
  {
    section: 'Overview',
    items: [
      { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard, permission: 'dashboard.read' },
    ],
  },
  {
    section: 'Trip Management',
    items: [
      { label: 'Trips', to: '/admin/trips', icon: MapPinned, permission: 'trips.read' },
      { label: 'Trip Plans', to: '/admin/ai-requests', icon: PackageSearch, permission: 'ai.write' },
      { label: 'Trip Slots', to: '/admin/trips', icon: Files, permission: 'trips.read' },
    ],
  },
  {
    section: 'Operations',
    items: [
      { label: 'Bookings', to: '/admin/bookings', icon: Files, permission: 'bookings.read' },
      { label: 'Payments', to: '/admin/payments', icon: Coins, permission: 'payments.read' },
      { label: 'Vehicles', to: '/admin/vehicles', icon: Truck, permission: 'vehicles.read' },
      { label: 'Tracking', to: '/admin/tracking', icon: Route, permission: 'tracking.read' },
    ],
  },
  {
    section: 'Engagement',
    items: [
      { label: 'Users', to: '/admin/users', icon: Users, permission: 'users.read' },
      { label: 'Roles & Permissions', to: '/admin/roles', icon: ShieldCheck, permission: 'roles.read' },
      { label: 'Offers', to: '/admin/offers', icon: BadgePercent, permission: 'offers.read' },
      { label: 'Reviews', to: '/admin/reviews', icon: Star, permission: 'reviews.read' },
      { label: 'Complaints', to: '/admin/complaints', icon: MessageCircleWarning, permission: 'complaints.read' },
      { label: 'Notifications', to: '/admin/notifications', icon: Bell, permission: 'notifications.read' },
    ],
  },
]

const baseLinkClass =
  'group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-yellow-400/70'

const getLinkClass = ({ isActive }) =>
  `${baseLinkClass} ${
    isActive
      ? 'bg-yellow-400/15 text-yellow-200 shadow-[0_10px_30px_rgba(250,204,21,0.12)]'
      : 'text-white/65 hover:bg-white/5 hover:text-white'
  }`

const getCollapsedLinkClass = ({ isActive }) =>
  `flex h-11 w-11 items-center justify-center rounded-2xl transition ${
    isActive ? 'bg-yellow-400/15 text-yellow-200' : 'text-white/65 hover:bg-white/5 hover:text-white'
  }`

const SidebarItem = ({ item, collapsed, onNavigate }) => {
  const { hasPermission } = usePermission()
  if (!hasPermission(item.permission)) {
    return null
  }

  const Icon = item.icon

  return (
    <NavLink
      to={item.to}
      onClick={onNavigate}
      className={collapsed ? getCollapsedLinkClass : getLinkClass}
      title={collapsed ? item.label : undefined}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed ? <span>{item.label}</span> : null}
    </NavLink>
  )
}

export default function AdminSidebar({ collapsed, mobileOpen, onClose, onToggleCollapse, onLogout }) {
  const { user, isAdmin, hasPermission } = usePermission()
  const [openSections, setOpenSections] = useState(
    () => new Set(navigation.map((group) => group.section)),
  )

  const initials = useMemo(() => {
    const source = user?.full_name || user?.email || 'A'
    return source
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase()
  }, [user?.email, user?.full_name])

  const handleNavigate = () => {
    if (mobileOpen) {
      onClose?.()
    }
  }

  const toggleSection = (section) => {
    setOpenSections((current) => {
      const next = new Set(current)
      if (next.has(section)) {
        next.delete(section)
      } else {
        next.add(section)
      }
      return next
    })
  }

  const sidebarWidthClass = collapsed ? 'lg:w-24' : 'lg:w-80'

  return (
    <>
      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
          aria-label="Close admin navigation"
          onClick={onClose}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-80 flex-col border-r border-white/10 bg-[radial-gradient(circle_at_top,_rgba(250,204,21,0.12),_transparent_30%),linear-gradient(180deg,_#09090b_0%,_#0d0d11_40%,_#09090b_100%)] text-white transition-transform duration-300 lg:static lg:z-auto ${sidebarWidthClass} ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-5">
          <Link to="/admin/dashboard" className="flex items-center gap-3">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-400 text-base font-black text-slate-950 shadow-lg shadow-yellow-500/20">
              TA
            </span>
            {!collapsed ? (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-yellow-200/80">
                  Travel Management
                </p>
                <p className="mt-1 text-sm font-semibold text-white/85">Admin Console</p>
              </div>
            ) : null}
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleCollapse}
              className="hidden h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white lg:inline-flex"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white lg:hidden"
              aria-label="Close sidebar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="border-b border-white/10 px-5 py-5">
          <div className="flex items-center gap-3 rounded-[24px] border border-white/10 bg-white/5 p-3">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-yellow-400 text-sm font-black text-slate-950">
              {initials}
            </div>
            {!collapsed ? (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">{user?.full_name || user?.email || 'Account'}</p>
                <p className="truncate text-xs text-white/55">{user?.role || (isAdmin ? 'admin' : 'user')}</p>
              </div>
            ) : null}
          </div>
        </div>

        <div className="custom-scrollbar flex-1 overflow-y-auto px-4 py-5">
          <nav className="space-y-6">
            {navigation.map((group) => {
              const hasVisibleItems = group.items.some((item) => !item.permission || hasPermission(item.permission))

              if (!hasVisibleItems) {
                return null
              }

              const isOpen = openSections.has(group.section)

              return (
                <section key={group.section}>
                  {!collapsed ? (
                    <button
                      type="button"
                      onClick={() => toggleSection(group.section)}
                      className="mb-3 flex w-full items-center justify-between rounded-2xl px-2 py-1 text-left text-[11px] font-bold uppercase tracking-[0.35em] text-white/35 transition hover:text-white/55"
                    >
                      <span>{group.section}</span>
                      <ChevronRight className={`h-4 w-4 transition ${isOpen ? 'rotate-90' : ''}`} />
                    </button>
                  ) : null}

                  {(collapsed || isOpen) && (
                    <div className={`space-y-1 ${collapsed ? 'pt-1' : ''}`}>
                      {group.items.map((item) => (
                        <SidebarItem key={item.to} item={item} collapsed={collapsed} onNavigate={handleNavigate} />
                      ))}
                    </div>
                  )}
                </section>
              )
            })}
          </nav>
        </div>

        <div className="border-t border-white/10 p-4">
          <button
            type="button"
            onClick={onLogout}
            className={`flex w-full items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-500/15 hover:text-red-100 ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <LogOut className="h-4 w-4" />
            {!collapsed ? <span>Logout</span> : null}
          </button>
        </div>
      </aside>
    </>
  )
}
