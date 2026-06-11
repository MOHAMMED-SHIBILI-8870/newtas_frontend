import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { logoutUser } from '../../infrastructure/api/authApi'
import { AuthContext } from './AuthContext'
import { clearStoredSession, getStoredSession, isTokenExpired, persistSession } from '../../infrastructure/auth/session'
import {
  getDefaultPermissionsForRole,
  getRedirectPathForRole,
  isAdminRole,
  normalizeRole,
} from '../constants/permissions'

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate()
  const [session, setSession] = useState(() => getStoredSession())

  const user = session?.user ?? null
  const token = session?.token ?? null
  const role = normalizeRole(user?.role)

  const syncSessionFromStorage = useCallback(() => {
    const nextSession = getStoredSession()
    setSession(nextSession)
    return nextSession
  }, [])

  const login = useCallback((userData, authToken) => {
    if (userData && typeof userData === 'object' && 'user' in userData && 'token' in userData && !authToken) {
      authToken = userData.token
      userData = userData.user
    }

    if (!userData || !authToken) {
      return
    }

    persistSession({ token: authToken, user: userData })
    setSession({ token: authToken, user: userData })
  }, [])

  const logout = useCallback(
    async (options = {}) => {
      const { redirectTo = '/login', skipRemote = false, replace = true } = options

      if (!skipRemote) {
        try {
          await logoutUser()
        } catch {
          // Ignore logout API failures; the local session still needs to clear.
        }
      }

      clearStoredSession()
      setSession(null)

      if (redirectTo) {
        navigate(redirectTo, { replace })
      }
    },
    [navigate],
  )

  const refreshFromStorage = useCallback(() => syncSessionFromStorage(), [syncSessionFromStorage])

  useEffect(() => {
    const onSessionRefreshed = (event) => {
      const nextToken = event?.detail?.token || getStoredSession()?.token
      const nextUser = event?.detail?.user || getStoredSession()?.user

      if (nextToken && nextUser) {
        persistSession({ token: nextToken, user: nextUser })
        setSession({ token: nextToken, user: nextUser })
      }
    }

    const onSessionExpired = () => {
      clearStoredSession()
      setSession(null)
      navigate('/login?reason=expired', { replace: true })
    }

    const onSessionForbidden = () => {
      clearStoredSession()
      setSession(null)
      navigate('/unauthorized', { replace: true })
    }

    const onStorage = (event) => {
      if (event.key === 'token' || event.key === 'user') {
        syncSessionFromStorage()
      }
    }

    const onVisibilityChange = () => {
      const nextSession = getStoredSession()
      if (!nextSession && token) {
        clearStoredSession()
        setSession(null)
      }
      if (nextSession?.token && isTokenExpired(nextSession.token)) {
        clearStoredSession()
        setSession(null)
      }
    }

    window.addEventListener('auth:session-refreshed', onSessionRefreshed)
    window.addEventListener('auth:session-expired', onSessionExpired)
    window.addEventListener('auth:session-forbidden', onSessionForbidden)
    window.addEventListener('storage', onStorage)
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      window.removeEventListener('auth:session-refreshed', onSessionRefreshed)
      window.removeEventListener('auth:session-expired', onSessionExpired)
      window.removeEventListener('auth:session-forbidden', onSessionForbidden)
      window.removeEventListener('storage', onStorage)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [navigate, syncSessionFromStorage, token])

  const value = useMemo(
    () => ({
      user,
      token,
      role,
      isAuthenticated: Boolean(user && token),
      isAdmin: isAdminRole(role),
      isAgency: role === 'agency',
      isDriver: role === 'driver',
      isGuide: role === 'guide',
      isUser: Boolean(user) && role !== 'admin',
      permissions: Array.from(
        new Set([
          ...getDefaultPermissionsForRole(role),
          ...(Array.isArray(user?.permissions) ? user.permissions : []),
        ]),
      ),
      loading: false,
      login,
      logout,
      refreshFromStorage,
      syncSessionFromStorage,
      getRedirectPathForRole,
    }),
    [login, logout, refreshFromStorage, role, syncSessionFromStorage, token, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
