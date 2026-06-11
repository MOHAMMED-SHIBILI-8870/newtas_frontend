import api from './apiClient'
import { mutateRequest, safeListRequest } from './serviceHelpers'

export const fetchVehicles = () => safeListRequest('/vehicles')

export const fetchAdminVehicles = () => safeListRequest('/admin/vehicles')

export const createVehicle = (payload) => mutateRequest(api.post('/admin/vehicles', payload))

export const updateVehicle = (vehicleId, payload) => mutateRequest(api.put(`/admin/vehicles/${vehicleId}`, payload))

export const deleteVehicle = (vehicleId) => mutateRequest(api.delete(`/admin/vehicles/${vehicleId}`))

export const assignVehicle = (vehicleId, payload) =>
  mutateRequest(api.patch(`/admin/vehicles/${vehicleId}/assign-trip`, payload))
