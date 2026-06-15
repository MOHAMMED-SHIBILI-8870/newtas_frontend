import { useEffect } from 'react'
import { CheckCheck, Bell, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useNotifications } from '../../../domain/context/NotificationContext'
import AdminPageHeader from '../../../features/admin/components/AdminPageHeader'

export default function Notifications() {
  const { notifications, loading, refreshNotifications, markAsRead } = useNotifications()

  useEffect(() => {
    void refreshNotifications()
  }, [refreshNotifications])

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId)
      toast.success('Notification marked as read')
    } catch (error) {
      toast.error(error?.message || 'Failed to mark notification as read')
    }
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Alert Center"
        title="My Notifications"
        description="Booking updates, vehicle assignments, and alerts related to your dispatches."
      />

      {loading ? (
        <div className="flex items-center justify-center gap-2 p-20 text-yellow-400">
          <Loader2 className="animate-spin" />
          <span>Loading notifications...</span>
        </div>
      ) : notifications.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-16 text-center space-y-4">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-white/40">
            <Bell size={28} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">All caught up!</h3>
            <p className="text-sm text-white/50 max-w-sm mx-auto mt-1">
              You have no active alerts or notifications at this time.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <article
              key={notification.id}
              className={`rounded-[28px] border p-6 transition duration-200 ${
                notification.is_read
                  ? 'border-white/5 bg-slate-900/40 text-white/80'
                  : 'border-yellow-400/20 bg-yellow-400/5 text-white'
              }`}
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-lg px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        notification.is_read
                          ? 'bg-white/5 text-white/40'
                          : 'bg-yellow-400/10 text-yellow-400'
                      }`}
                    >
                      {notification.is_read ? 'read' : 'unread'}
                    </span>
                    <span className="rounded-lg bg-white/5 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white/60">
                      {notification.type || 'general'}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white">{notification.title || 'Alert'}</h3>
                  <p className="max-w-3xl text-sm leading-6 text-white/70">{notification.message}</p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                    {notification.created_at ? new Date(notification.created_at).toLocaleString() : 'Unknown date'}
                  </p>
                </div>

                {!notification.is_read ? (
                  <button
                    type="button"
                    onClick={() => void handleMarkAsRead(notification.id)}
                    className="inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-4 py-2 text-xs font-bold text-slate-950 transition hover:bg-yellow-300 shadow-lg shadow-yellow-500/20"
                  >
                    <CheckCheck size={14} />
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
