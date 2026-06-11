import api from './axios'
import { unwrapApiResponse } from './apiHelpers'

export const fetchNotifications = () => api.get('/notifications').then(unwrapApiResponse)

export const fetchAdminNotifications = () => api.get('/admin/notifications').then(unwrapApiResponse)

export const markNotificationRead = (id) => api.patch(`/notifications/${id}/read`).then(unwrapApiResponse)

export const markAdminNotificationRead = (id) => api.patch(`/admin/notifications/${id}/read`).then(unwrapApiResponse)

