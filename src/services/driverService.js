import api from './apiClient'
import { mutateRequest, safeListRequest, safeItemRequest } from './serviceHelpers'

// =====================================
// ADMIN DRIVER ACTIONS
// =====================================
export const fetchDrivers = () => safeListRequest('/admin/drivers')

export const fetchDriverByID = (id) => safeItemRequest(`/admin/drivers/${id}`)

export const createDriver = (payload) => mutateRequest(api.post('/admin/drivers', payload))

export const updateDriver = (id, payload) => mutateRequest(api.put(`/admin/drivers/${id}`, payload))

export const deleteDriver = (id) => mutateRequest(api.delete(`/admin/drivers/${id}`))

export const assignVehicleToDriver = (id, payload) =>
  mutateRequest(api.put(`/admin/drivers/${id}/assign-vehicle`, payload))

export const assignDriverToBooking = (bookingId, payload) =>
  mutateRequest(api.put(`/admin/bookings/${bookingId}/assign-driver`, payload))

// =====================================
// DRIVER PORTAL ACTIONS
// =====================================
export const fetchDriverDashboard = () => safeItemRequest('/driver/dashboard')

export const fetchDriverTrips = () => safeListRequest('/driver/trips')

export const fetchDriverTripByID = (id) => safeItemRequest(`/driver/trips/${id}`)

export const updateTripStatus = (id, payload) => mutateRequest(api.patch(`/driver/trips/${id}/status`, payload))

export const fetchDriverVehicle = () => safeItemRequest('/driver/vehicle')

export const updateDriverTracking = (payload) => mutateRequest(api.post('/driver/tracking/update', payload))

export const fetchDriverProfile = () => safeItemRequest('/driver/profile')

export const updateDriverProfile = (payload) => mutateRequest(api.put('/driver/profile', payload))
