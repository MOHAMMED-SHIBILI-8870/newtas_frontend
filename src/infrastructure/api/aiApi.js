import api from './axios'
import { unwrapApiResponse } from './apiHelpers'

export const generateTripPlan = (payload) => api.post('/ai/chat', payload).then(unwrapApiResponse)

export const submitAiTripRequest = (payload) => api.post('/ai/requests', payload).then(unwrapApiResponse)

export const fetchMyAiTripRequests = () => api.get('/ai/requests').then(unwrapApiResponse)

export const fetchAdminAiTripRequests = () => api.get('/admin/ai-requests').then(unwrapApiResponse)

export const approveAiTripRequest = (id, payload = {}) =>
  api.patch(`/admin/ai-requests/${id}/approve`, payload).then(unwrapApiResponse)

export const rejectAiTripRequest = (id, payload = {}) =>
  api.patch(`/admin/ai-requests/${id}/reject`, payload).then(unwrapApiResponse)

