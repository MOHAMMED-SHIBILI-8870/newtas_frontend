import api from './apiClient'
import { mutateRequest, safeItemRequest, safeListRequest } from './serviceHelpers'

export const fetchLiveTracking = (bookingId) => safeItemRequest(`/tracking/booking/${bookingId}`)

export const fetchTrackingHistory = (bookingId) => safeListRequest(`/tracking/booking/${bookingId}/history`)

export const fetchAdminTrackingDashboard = () => safeListRequest('/admin/tracking')

export const updateTrackingState = (payload) =>
  mutateRequest(api.post('/tracking', payload))
