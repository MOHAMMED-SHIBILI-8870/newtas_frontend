import { Navigate, useLocation } from 'react-router-dom'
import { usePermission } from '../../hooks/usePermission'
import LoadingState from './LoadingState'

const ProtectedRoute = ({ children, roles = [], permissions = [], requireAllPermissions = false }) => {
  const { isAuthenticated, isAdmin, loading, hasAnyPermission, hasAllPermissions, role } = usePermission()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <LoadingState label="Loading your session..." />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (roles.length > 0) {
    const userRole = String(role || (isAdmin ? 'admin' : 'user')).toLowerCase()
    const allowedRoles = roles.map((r) => String(r || '').toLowerCase())
    if (!allowedRoles.includes(userRole)) {
      return <Navigate to="/unauthorized" replace />
    }
  }

  if (permissions.length > 0) {
    const allowed = requireAllPermissions ? hasAllPermissions(permissions) : hasAnyPermission(permissions)
    if (!allowed) {
      return <Navigate to="/unauthorized" replace />
    }
  }

  return children
}

export default ProtectedRoute
