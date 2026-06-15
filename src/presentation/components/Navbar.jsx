import { useEffect, useMemo, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import {
  Menu,
  X,
  ChevronDown,
  LogOut,
  LayoutDashboard,
  Home,
  PackageSearch,
  BookOpen,
  History,
  Bell,
  CircleUserRound,
  Sparkles,
  ClipboardList,
  MapPinned,
  Route,
  MessageCircle,
  Star,
  AlertTriangle,
  Users,
} from 'lucide-react'
import { usePermission } from '../../hooks/usePermission'
import NotificationBell from './NotificationBell'

const publicLinks = [
  { label: 'Home', to: '/' },
  { label: 'Packages', to: '/packages' },
  { label: 'Login', to: '/login' },
  { label: 'Register', to: '/register' },
]

const userLinks = [
  { label: 'Home', to: '/', icon: Home },
  { label: 'Packages', to: '/packages', icon: PackageSearch },
  { label: 'Bookings', to: '/bookings', icon: BookOpen },
  { label: 'History', to: '/history', icon: History },
  { label: 'Chat', to: '/chat', icon: MessageCircle },
  { label: 'My Trips', to: '/my-trips', icon: Sparkles },
  { label: 'Notifications', to: '/notifications', icon: Bell },
  { label: 'User Profile', to: '/profile', icon: CircleUserRound },
]

const adminLinks = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Users', to: '/admin/users', icon: Users },
  { label: 'Trips', to: '/admin/trips', icon: MapPinned },
  { label: 'Orders', to: '/admin/bookings', icon: ClipboardList },
  { label: 'Support Chats', to: '/admin/support', icon: MessageCircle },
  { label: 'Notifications', to: '/admin/notifications', icon: Bell },
  { label: 'AI Requests', to: '/admin/ai-requests', icon: Sparkles },
]

const supportLinks = [
  { label: 'Chat', to: '/support', icon: MessageCircle },
  { label: 'Reviews', to: '/reviews', icon: Star },
  { label: 'Notifications', to: '/notifications', icon: Bell },
  { label: 'Profile', to: '/profile', icon: CircleUserRound },
]

const agencyLinks = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Trips', to: '/packages', icon: MapPinned },
  { label: 'Tracking', to: '/tracking', icon: Route },
  { label: 'Notifications', to: '/notifications', icon: Bell },
  { label: 'Profile', to: '/profile', icon: CircleUserRound },
]

const driverLinks = [
  { label: 'Tracking', to: '/tracking', icon: Route },
  { label: 'My Trips', to: '/my-trips', icon: ClipboardList },
  { label: 'Notifications', to: '/notifications', icon: Bell },
  { label: 'Profile', to: '/profile', icon: CircleUserRound },
]

const guideLinks = [
  { label: 'Chat', to: '/chat', icon: MessageCircle },
  { label: 'Reviews', to: '/reviews', icon: Star },
  { label: 'Notifications', to: '/notifications', icon: Bell },
  { label: 'Profile', to: '/profile', icon: CircleUserRound },
]

const navLinkClass = ({ isActive }) =>
  `rounded-full px-4 py-2 text-sm font-medium transition ${isActive
    ? 'bg-slate-950 text-white shadow-lg shadow-slate-950/15'
    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
  }`

const mobileLinkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${isActive
    ? 'bg-slate-950 text-white shadow-lg shadow-slate-950/10'
    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
  }`

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, isAgency, isDriver, isGuide, isSupportAgent, logout, getRedirectPathForRole, role } =
    usePermission()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setMobileOpen(false)
    setAccountOpen(false)
  }, [location.pathname])

  const links = useMemo(() => {
    if (!isAuthenticated) {
      return publicLinks
    }

    if (isAdmin) {
      return adminLinks
    }

    if (isSupportAgent) {
      return supportLinks
    }

    if (isAgency) {
      return agencyLinks
    }

    if (isDriver) {
      return driverLinks
    }

    if (isGuide) {
      return guideLinks
    }

    return userLinks
  }, [isAdmin, isSupportAgent, isAgency, isAuthenticated, isDriver, isGuide])

  const initials = (user?.full_name || user?.email || 'U')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

  const handleLogout = () => {
    void logout({ redirectTo: '/login' })
  }

  return (
    <header className="relative sticky top-0 z-50 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Link
            to={isAuthenticated ? getRedirectPathForRole(user?.role) : '/'}
            className="flex items-center gap-3 rounded-2xl bg-slate-950 px-4 py-2 text-white shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5"
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500 text-sm font-black text-white">
              TA
            </span>
            <span className="hidden flex-col leading-none sm:flex">
              <span className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-200">
                TravelAI
              </span>
              <span className="text-sm font-semibold text-white/90">
                {isAuthenticated ? (isAdmin ? 'Admin Console' : 'Traveller Hub') : 'Travel Smarter'}
              </span>
            </span>
          </Link>
        </div>

        <nav className="hidden items-center gap-2 lg:flex">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.to === '/'} className={navLinkClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <NotificationBell to={isAdmin ? '/admin/notifications' : '/notifications'} variant="light" />

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setAccountOpen((current) => !current)}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-200"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-950 to-cyan-600 text-sm font-black text-white">
                    {initials || 'U'}
                  </span>
                  <span className="hidden flex-col items-start leading-tight sm:flex">
                    <span className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
                      {isAdmin ? 'Admin' : isSupportAgent ? 'Support' : isGuide ? 'Guide' : 'User'}
                    </span>
                    <span className="max-w-[160px] truncate text-sm font-semibold text-slate-900">
                      {user?.full_name || user?.email || 'Account'}
                    </span>
                  </span>
                  <ChevronDown className={`h-4 w-4 text-slate-500 transition ${accountOpen ? 'rotate-180' : ''}`} />
                </button>

                {accountOpen ? (
                  <>
                    <button
                      type="button"
                      className="fixed inset-0 z-40 cursor-default"
                      onClick={() => setAccountOpen(false)}
                      aria-label="Close account menu"
                    />
                    <div className="absolute right-0 z-50 mt-3 w-72 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
                      <div className="border-b border-slate-100 bg-slate-50 px-4 py-4">
                        <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Signed in as</p>
                        <p className="mt-2 truncate text-sm font-semibold text-slate-900">{user?.email}</p>
                        <p className="mt-1 text-xs text-slate-500">{user?.role}</p>
                      </div>
                      <div className="p-2">
                        <NavLink
                          to={getRedirectPathForRole(role)}
                          className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                        >
                          <LayoutDashboard className="h-4 w-4 text-cyan-600" />
                          Dashboard
                        </NavLink>
                        <NavLink
                          to="/profile"
                          className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                        >
                          <CircleUserRound className="h-4 w-4 text-cyan-600" />
                          My Profile
                        </NavLink>
                      </div>
                      <div className="border-t border-slate-100 p-2">
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                        >
                          <LogOut className="h-4 w-4" />
                          Logout
                        </button>
                      </div>
                    </div>
                  </>
                ) : null}
              </div>
            </>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Link
                to="/login"
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-cyan-200 hover:text-cyan-700"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-600"
              >
                Register
              </Link>
            </div>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen((current) => !current)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-200 lg:hidden"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="lg:hidden">
          <div className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 right-0 top-full z-50 border-t border-slate-200 bg-white px-4 py-4 shadow-2xl">
            <div className="mx-auto max-w-7xl space-y-2">
              {links.map((link) => {
                const Icon = link.icon || null
                return (
                  <NavLink key={link.to} to={link.to} end={link.to === '/'} className={mobileLinkClass}>
                    {Icon ? <Icon className="h-4 w-4" /> : null}
                    {link.label}
                  </NavLink>
                )
              })}

              {!isAuthenticated ? (
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Link
                    to="/login"
                    className="rounded-2xl border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-cyan-200"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="rounded-2xl bg-slate-950 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-cyan-600"
                  >
                    Register
                  </Link>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-100"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  )
}

export default Navbar
