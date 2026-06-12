export const unwrapApiResponse = (response) => {
  const body = response?.data

  if (!body) {
    return null
  }

  if (body.success === false) {
    const error = new Error(body.error || body.message || 'Request failed')
    error.response = response
    throw error
  }

  return body.data ?? body ?? null
}

export const getApiErrorMessage = (error, fallback = 'Request failed') =>
  error?.response?.data?.error ||
  error?.response?.data?.message ||
  error?.message ||
  fallback

export const toArray = (value) => (Array.isArray(value) ? value : [])
