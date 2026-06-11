import { Navigate } from 'react-router-dom'
import { useAuth } from '../../domain/context/AuthContext'

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }

  return user ? children : <Navigate to="/login" replace />
}

export default PrivateRoute
