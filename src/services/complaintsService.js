import api from './apiClient'
import { mutateRequest, safeItemRequest, safeListRequest } from './serviceHelpers'

export const fetchComplaints = () => safeListRequest('/complaints/me')

export const fetchAdminComplaints = () => safeListRequest('/admin/complaints')

export const fetchComplaintById = (complaintId) => safeItemRequest(`/complaints/${complaintId}`)

export const createComplaint = (payload) => mutateRequest(api.post('/complaints', payload))

export const updateComplaint = (complaintId, payload) =>
  mutateRequest(api.patch(`/complaints/${complaintId}`, payload))

export const addComplaintMessage = (complaintId, payload) =>
  mutateRequest(api.post(`/complaints/${complaintId}/messages`, payload))

export const resolveComplaint = (complaintId, payload = {}) =>
  mutateRequest(api.patch(`/admin/complaints/${complaintId}/status`, { status: 'resolved', ...payload }))

export const assignComplaint = (complaintId, payload = {}) =>
  mutateRequest(api.patch(`/admin/complaints/${complaintId}/status`, { status: 'assigned', ...payload }))
