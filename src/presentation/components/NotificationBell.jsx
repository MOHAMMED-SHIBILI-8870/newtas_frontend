import { useEffect, useMemo, useState } from 'react'
import { Bell, CheckCheck, RefreshCw } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useNotifications } from '../../domain/context/NotificationContext'

const themeMap = {
  light: {
    button: 'border-slate-200 bg-white text-slate-600 shadow-sm hover:border-cyan-200 hover:text-cyan-700',
    panel: 'border-slate-200 bg-white text-slate-950 shadow-2xl',
    subtitle: 'text-slate-500',
    item: 'hover:bg-slate-50',
    unread: 'border-cyan-200 bg-cyan-50/60',
    meta: 'text-slate-500',
    actionButton: 'text-slate-700 hover:text-slate-950',
    title: 'text-slate-950',
    message: 'text-slate-600',
  },
  dark: {
    button: 'border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white',
    panel: 'border-white/10 bg-slate-950/95 text-white shadow-2xl shadow-black/40 backdrop-blur-xl',
    subtitle: 'text-white/50',
    item: 'hover:bg-white/5',
    unread: 'border-yellow-400/30 bg-yellow-400/10',
    meta: 'text-white/55',
    actionButton: 'text-white/80 hover:text-white',
    title: 'text-white',
    message: 'text-white/65',
  },
}

const NotificationBell = ({ to = '/notifications', variant = 'light' }) => {
  const { unreadCount, notifications, refreshNotifications, markAsRead, markAllAsRead } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const theme = themeMap[variant] || themeMap.light

  useEffect(() => {
    setIsOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (isOpen) {
      void refreshNotifications()
    }
  }, [isOpen, refreshNotifications])

  const recentNotifications = useMemo(
    () =>
      [...notifications]
        .sort((left, right) => {
          if (Boolean(left.is_read) === Boolean(right.is_read)) {
            return new Date(right.created_at || 0).getTime() - new Date(left.created_at || 0).getTime()
          }

          return left.is_read ? 1 : -1
        })
        .slice(0, 5),
    [notifications],
  )

  const handleMarkAll = async () => {
    try {
      await markAllAsRead()
    } finally {
      setIsOpen(false)
    }
  }

  const handleToggle = () => setIsOpen((current) => !current)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleToggle}
        className={`relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border transition ${theme.button}`}
        aria-label="Open notifications"
        aria-expanded={isOpen}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-black text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setIsOpen(false)}
            aria-label="Close notifications"
          />

          <div className={`absolute right-0 z-50 mt-3 w-[22rem] overflow-hidden rounded-[28px] border ${theme.panel}`}>
            <div className="border-b border-white/10 px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-yellow-300">Notifications</p>
                  <p className={`mt-2 text-sm ${theme.subtitle}`}>
                    {unreadCount} unread, {notifications.length} total
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => void refreshNotifications()}
                  className={`inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-xs font-semibold transition hover:bg-white/5 ${theme.actionButton}`}
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Refresh
                </button>
              </div>
            </div>

            <div className="max-h-[24rem] overflow-y-auto p-2 custom-scrollbar">
              {recentNotifications.length === 0 ? (
                <div className="px-4 py-10 text-center text-sm text-white/55">
                  No notifications yet. New updates will appear here automatically.
                </div>
              ) : (
                <div className="space-y-2">
                  {recentNotifications.map((notification) => (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={() => void markAsRead(notification.id)}
                      className={`w-full rounded-2xl border p-4 text-left transition ${theme.item} ${
                        notification.is_read ? 'border-white/10' : theme.unread
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className={`truncate text-sm font-semibold ${theme.title}`}>
                            {notification.title || 'Notification'}
                          </p>
                          <p className={`mt-1 line-clamp-2 text-sm ${theme.message}`}>{notification.message}</p>
                          <p className={`mt-2 text-[11px] font-bold uppercase tracking-[0.3em] ${theme.meta}`}>
                            {notification.created_at
                              ? new Date(notification.created_at).toLocaleString()
                              : 'Unknown date'}
                          </p>
                        </div>

                        {!notification.is_read ? (
                          <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-yellow-400" />
                        ) : null}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 border-t border-white/10 p-3">
              <button
                type="button"
                onClick={handleMarkAll}
                disabled={unreadCount === 0}
                className={`inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40 ${theme.actionButton}`}
              >
                <CheckCheck className="h-4 w-4" />
                Mark all read
              </button>
              <Link
                to={to}
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-yellow-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-yellow-300"
              >
                View all
              </Link>
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}

export default NotificationBell
