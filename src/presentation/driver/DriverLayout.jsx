import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import DriverSidebar from './components/DriverSidebar'
import DriverTopbar from './components/DriverTopbar'
import { usePermission } from '../../hooks/usePermission'

const SIDEBAR_STATE_KEY = 'travelai.driver.sidebar.collapsed'

export default function DriverLayout() {
  const { pathname } = useLocation()
  const { logout } = usePermission()
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === 'undefined') {
      return false
    }

    return window.localStorage.getItem(SIDEBAR_STATE_KEY) === 'true'
  })
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(SIDEBAR_STATE_KEY, String(collapsed))
    }
  }, [collapsed])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(250,204,21,0.09),_transparent_28%),radial-gradient(circle_at_right,_rgba(59,130,246,0.08),_transparent_32%),linear-gradient(180deg,_#050506_0%,_#09090b_42%,_#0c0c11_100%)] text-white">
      <div className="flex min-h-screen">
        <DriverSidebar
          collapsed={collapsed}
          mobileOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
          onToggleCollapse={() => setCollapsed((current) => !current)}
          onLogout={() => void logout({ redirectTo: '/login' })}
        />

        <div className="flex min-h-screen flex-1 flex-col">
          <DriverTopbar
            onMenuToggle={() => setMobileOpen(true)}
            collapsed={collapsed}
            onToggleCollapse={() => setCollapsed((current) => !current)}
          />

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <div className="mx-auto w-full max-w-7xl space-y-8">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
