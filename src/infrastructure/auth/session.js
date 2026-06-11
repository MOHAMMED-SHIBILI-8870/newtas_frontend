const TOKEN_KEY = 'token'
const USER_KEY = 'user'

const parseJson = (value) => {
  if (!value) {
    return null
  }

  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

const decodeBase64Url = (value) => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padding = '='.repeat((4 - (normalized.length % 4)) % 4)
  const base64 = `${normalized}${padding}`

  if (typeof window !== 'undefined' && typeof window.atob === 'function') {
    return window.atob(base64)
  }

  if (typeof globalThis.Buffer !== 'undefined') {
    return globalThis.Buffer.from(base64, 'base64').toString('utf8')
  }

  return null
}

export const decodeJwtPayload = (token) => {
  if (!token || typeof token !== 'string') {
    return null
  }

  const segments = token.split('.')
  if (segments.length < 2) {
    return null
  }

  try {
    const decoded = decodeBase64Url(segments[1])
    if (!decoded) {
      return null
    }

    return JSON.parse(decoded)
  } catch {
    return null
  }
}

export const isTokenExpired = (token) => {
  const payload = decodeJwtPayload(token)
  if (!payload?.exp) {
    return false
  }

  return payload.exp * 1000 <= Date.now()
}

export const getStoredSession = () => {
  if (typeof window === 'undefined') {
    return null
  }

  const token = window.localStorage.getItem(TOKEN_KEY)
  const user = parseJson(window.localStorage.getItem(USER_KEY))

  if (!token || !user) {
    return null
  }

  if (isTokenExpired(token)) {
    clearStoredSession()
    return null
  }

  return { token, user }
}

export const persistSession = ({ token, user }) => {
  if (typeof window === 'undefined' || !token || !user) {
    return
  }

  window.localStorage.setItem(TOKEN_KEY, token)
  window.localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export const clearStoredSession = () => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(TOKEN_KEY)
  window.localStorage.removeItem(USER_KEY)
}

export const getStoredToken = () => {
  if (typeof window === 'undefined') {
    return null
  }

  return window.localStorage.getItem(TOKEN_KEY)
}
