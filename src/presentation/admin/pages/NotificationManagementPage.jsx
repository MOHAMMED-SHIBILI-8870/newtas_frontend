import { useEffect, useMemo, useState } from 'react'
import { CheckCheck, Search } from 'lucide-react'
import toast from 'react-hot-toast'

import {
  fetchAdminNotifications,
  markAdminNotificationRead,
} from '../../../infrastructure/api/notificationApi'

import { getApiErrorMessage } from '../../../infrastructure/api/apiHelpers'

import SectionHeading from '../../components/SectionHeading'
import LoadingState from '../../components/LoadingState'
import EmptyState from '../../components/EmptyState'
import StatusBadge from '../../components/StatusBadge'

export default function NotificationManagementPage() {

  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    let mounted = true
    const loadNotifications = async () => {

      try {
        const data = await fetchAdminNotifications()
        if (mounted) {
          setNotifications(
            Array.isArray(data)
              ? data
              : [],
          )
        }
      } catch (error) {
        if (mounted) {
          toast.error(
            getApiErrorMessage(
              error,
              'Failed to load notifications',
            ),
          )
          setNotifications([])
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }
    loadNotifications()
    const interval = setInterval(() => {
      loadNotifications()
    }, 30000)
    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [])

  const filteredNotifications = useMemo(
    () =>
      notifications.filter((notification) => {

        const query = search.trim().toLowerCase()

        if (!query) return true

        return (

          String(notification?.title || '')
            .toLowerCase()
            .includes(query)

          ||

          String(notification?.message || '')
            .toLowerCase()
            .includes(query)

          ||

          String(notification?.type || '')
            .toLowerCase()
            .includes(query)
        )
      }),

    [notifications, search],
  )

  const handleMarkAsRead = async (
    notificationId,
  ) => {

    try {

      await markAdminNotificationRead(
        notificationId,
      )

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === notificationId
            ? {
              ...notification,
              is_read: true,
            }
            : notification,
        ),
      )

      toast.success(
        'Notification marked as read',
      )

    } catch (error) {

      toast.error(
        getApiErrorMessage(
          error,
          'Failed to update notification',
        ),
      )
    }
  }

  return (
    <div className="space-y-8">

      <SectionHeading
        eyebrow="Notifications"
        title="Notification management"
        description="Review every system notification, including user bookings and AI approvals."
      />

      <div className="rounded-[28px] border border-white/10 bg-zinc-950/60 p-4 shadow-xl">

        <div className="relative">

          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />

          <input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search notifications..."
            className="w-full rounded-2xl border border-white/10 bg-black py-3 pl-11 pr-4 text-sm text-white placeholder-white/30 outline-none transition focus:border-yellow-400/80"
          />

        </div>

      </div>

      {loading ? (

        <LoadingState label="Loading admin notifications..." />

      ) : filteredNotifications.length === 0 ? (

        <EmptyState
          title="No notifications found"
          description="Notifications will show here as users book trips or submit AI requests."
        />

      ) : (

        <div className="space-y-4">

          {filteredNotifications.map((notification) => (

            <article
              key={notification.id}
              className={`rounded-[28px] border p-6 shadow-xl ${notification.is_read
                ? 'border-white/10 bg-zinc-900/40 text-white'
                : 'border-yellow-400/25 bg-yellow-400/5 text-white'
                }`}
            >

              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">

                <div className="space-y-3">

                  <div className="flex flex-wrap gap-2">

                    <StatusBadge
                      status={
                        notification.is_read
                          ? 'read'
                          : 'unread'
                      }
                    >
                      {notification.is_read
                        ? 'read'
                        : 'unread'}
                    </StatusBadge>

                    <StatusBadge
                      status={
                        notification.type ||
                        'general'
                      }
                    >
                      {notification.type ||
                        'general'}
                    </StatusBadge>

                  </div>

                  <h3 className="text-2xl font-black text-white">
                    {notification.title ||
                      'Notification'}
                  </h3>

                  <p className="max-w-4xl text-sm leading-6 text-white/70">
                    {notification.message}
                  </p>

                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/45">

                    {notification.created_at
                      ? new Date(
                        notification.created_at,
                      ).toLocaleString()
                      : 'Unknown date'}

                  </p>

                </div>

                {!notification.is_read ? (

                  <button
                    type="button"
                    onClick={() =>
                      void handleMarkAsRead(
                        notification.id,
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-full bg-yellow-400 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-yellow-300"
                  >

                    <CheckCheck className="h-4 w-4 text-slate-950" />

                    Mark as read

                  </button>

                ) : null}

              </div>

            </article>
          ))}

        </div>
      )}

    </div>
  )
}