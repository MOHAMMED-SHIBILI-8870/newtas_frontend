import { useEffect } from 'react'
import { CheckCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { useNotifications } from '../../../domain/context/NotificationContext'
import SectionHeading from '../../components/SectionHeading'
import LoadingState from '../../components/LoadingState'
import EmptyState from '../../components/EmptyState'
import StatusBadge from '../../components/StatusBadge'

export default function NotificationsPage() {
  const { notifications, loading, refreshNotifications, markAsRead } = useNotifications()

  useEffect(() => {
    void refreshNotifications()
  }, [refreshNotifications])

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId)
      toast.success('Notification marked as read')
    } catch (error) {
      toast.error(error?.message || 'Failed to mark notification')
    }
  }

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Notifications"
        title="My notifications"
        description="Booking updates, AI review outcomes, and admin actions show up here."
      />

      {loading ? (
        <LoadingState label="Loading notifications..." />
      ) : notifications.length === 0 ? (
        <EmptyState
          title="No notifications"
          description="You will see messages here when bookings are created, AI requests are reviewed, or admins take action."
        />
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <article
              key={notification.id}
              className={`rounded-[28px] border p-6 shadow-sm transition ${
                notification.is_read ? 'border-slate-200 bg-white' : 'border-cyan-200 bg-cyan-50/50'
              }`}
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={notification.is_read ? 'read' : 'unread'}>
                      {notification.is_read ? 'read' : 'unread'}
                    </StatusBadge>
                    <StatusBadge status={notification.type || 'general'}>{notification.type || 'general'}</StatusBadge>
                  </div>
                  <h3 className="text-2xl font-black text-slate-950">{notification.title || 'Notification'}</h3>
                  <p className="max-w-3xl text-sm leading-6 text-slate-600">{notification.message}</p>
                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
                    {notification.created_at ? new Date(notification.created_at).toLocaleString() : 'Unknown date'}
                  </p>
                </div>

                {!notification.is_read ? (
                  <button
                    type="button"
                    onClick={() => void handleMarkAsRead(notification.id)}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-600"
                  >
                    <CheckCheck className="h-4 w-4" />
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
