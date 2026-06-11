import api from './apiClient'
import { mutateRequest, safeListRequest } from './serviceHelpers'

export const fetchRoles = () => safeListRequest('/admin/rbac/roles')

export const fetchPermissions = () => safeListRequest('/admin/rbac/permissions')

export const updateUserPermissions = (userId, permissions) =>
  mutateRequest(api.patch(`/admin/rbac/users/${userId}/role`, { permissions }))
