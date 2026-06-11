import { Navigate } from 'react-router-dom'
import { usePermission } from '../../hooks/usePermission'
import LoadingState from './LoadingState'

const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, loading, role, getRedirectPathForRole } = usePermission()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <LoadingState label="Preparing the app..." />
      </div>
    )
  }

  if (!isAuthenticated) {
    return children
  }

  return <Navigate to={getRedirectPathForRole?.(role) || '/dashboard'} replace />
}

export default PublicOnlyRoute
