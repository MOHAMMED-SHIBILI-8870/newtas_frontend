import { useAuth } from '../domain/context/AuthContext'
import { getDefaultPermissionsForRole } from '../domain/constants/permissions'

const hasWildcardAccess = (permissions) => permissions.includes('*')

export const usePermission = () => {
  const auth = useAuth()
  const basePermissions = getDefaultPermissionsForRole(auth?.user?.role)
  const explicitPermissions = Array.isArray(auth?.user?.permissions) ? auth.user.permissions : []
  const permissions = Array.from(new Set([...basePermissions, ...explicitPermissions]))

  const hasPermission = (permission) => {
    if (!permission) {
      return true
    }

    if (Array.isArray(permission)) {
      return permission.some((item) => hasPermission(item))
    }

    if (hasWildcardAccess(permissions)) {
      return true
    }

    return permissions.includes(permission)
  }

  const hasAllPermissions = (requiredPermissions = []) =>
    requiredPermissions.every((permission) => hasPermission(permission))

  const hasAnyPermission = (requiredPermissions = []) =>
    requiredPermissions.some((permission) => hasPermission(permission))

  return {
    ...auth,
    permissions,
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
  }
}
