import axios from 'axios'
import { clearStoredSession, getStoredToken, persistSession } from '../auth/session'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8997'

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

const refreshClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

const notifyAuthEvent = (name, detail = {}) => {
  if (typeof window === 'undefined') {
    return
  }

  window.dispatchEvent(new CustomEvent(name, { detail }))
}

api.interceptors.request.use((config) => {
  const token = getStoredToken()

  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status
    const originalRequest = error?.config || {}
    const requestUrl = String(originalRequest.url || '')

    if (
      status === 401 &&
      !originalRequest._retry &&
      !requestUrl.includes('/auth/login') &&
      !requestUrl.includes('/auth/register') &&
      !requestUrl.includes('/auth/refresh')
    ) {
      originalRequest._retry = true

      try {
        const refreshResponse = await refreshClient.post('/auth/refresh', {})
        const payload = refreshResponse?.data?.data ?? refreshResponse?.data ?? {}
        const nextToken = payload.access_token || payload.accessToken
        const nextUser = payload.user

        if (nextToken && nextUser) {
          persistSession({ token: nextToken, user: nextUser })
          originalRequest.headers = originalRequest.headers ?? {}
          originalRequest.headers.Authorization = `Bearer ${nextToken}`
          notifyAuthEvent('auth:session-refreshed', { token: nextToken, user: nextUser })
          return api(originalRequest)
        }
      } catch {
        clearStoredSession()
        notifyAuthEvent('auth:session-expired', { reason: 'refresh_failed' })
      }
    }

    if (status === 403) {
      const message = String(error?.response?.data?.message || error?.response?.data?.error || '').toLowerCase()
      if (message.includes('blocked') || message.includes('not verified')) {
        clearStoredSession()
        notifyAuthEvent('auth:session-forbidden', { reason: message || 'forbidden' })
      }
    }

    return Promise.reject(error)
  },
)

export default api
