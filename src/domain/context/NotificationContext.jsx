/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useAuth } from './AuthContext'
import {
  fetchAdminNotifications,
  fetchNotifications,
  markAdminNotificationRead,
  markNotificationRead,
} from '../../infrastructure/api/notificationApi'

export const NotificationContext = createContext(null)

export const useNotifications = () => useContext(NotificationContext)

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated, isAdmin } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadNotifications = useCallback(async () => {
    if (!isAuthenticated) {
      setNotifications([])
      setError('')
      return []
    }

    setLoading(true)
    setError('')

    try {
      const data = isAdmin ? await fetchAdminNotifications() : await fetchNotifications()
      const list = Array.isArray(data) ? data : []
      setNotifications(list)
      return list
    } catch (requestError) {
      setError(requestError?.message || 'Failed to load notifications')
      setNotifications([])
      return []
    } finally {
      setLoading(false)
    }
  }, [isAdmin, isAuthenticated])

  const markAsRead = useCallback(
    async (notificationId) => {
      const apiCall = isAdmin ? markAdminNotificationRead : markNotificationRead
      await apiCall(notificationId)

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === notificationId ? { ...notification, is_read: true } : notification,
        ),
      )
    },
    [isAdmin],
  )

  const markAllAsRead = useCallback(async () => {
    const unreadNotifications = notifications.filter((notification) => !notification.is_read)

    if (unreadNotifications.length === 0) {
      return
    }

    await Promise.all(unreadNotifications.map((notification) => markAsRead(notification.id)))
  }, [markAsRead, notifications])

  useEffect(() => {
    let intervalId

    const timer = window.setTimeout(() => {
      if (!isAuthenticated) {
        setNotifications([])
        setError('')
        return
      }

      void loadNotifications()

      intervalId = window.setInterval(() => {
        void loadNotifications()
      }, 30000)
    }, 0)

    return () => {
      window.clearTimeout(timer)
      if (intervalId) {
        window.clearInterval(intervalId)
      }
    }
  }, [isAuthenticated, loadNotifications])

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.is_read).length,
    [notifications],
  )

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      loading,
      error,
      refreshNotifications: loadNotifications,
      markAsRead,
      markAllAsRead,
    }),
    [error, loadNotifications, loading, markAllAsRead, markAsRead, notifications, unreadCount],
  )

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}
