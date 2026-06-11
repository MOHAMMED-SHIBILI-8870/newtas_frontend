import api from './axios'
import { unwrapApiResponse } from './apiHelpers'
import { clearStoredSession } from '../auth/session'

export const registerUser = (data) => api.post('/auth/register', data).then(unwrapApiResponse)

export const loginUser = (data) => api.post('/auth/login', data).then(unwrapApiResponse)

export const verifyOtp = (data) => api.post('/auth/verify-otp', data).then(unwrapApiResponse)

export const forgotPassword = (data) => api.post('/auth/forgot-password', data).then(unwrapApiResponse)

export const resetPassword = (data) => api.post('/auth/reset-password', data).then(unwrapApiResponse)

export const resendOtp = (data) => api.post('/auth/resend-otp', data).then(unwrapApiResponse)

export const logoutUser = async () => {
  try {
    const response = await api.post('/auth/logout')
    return unwrapApiResponse(response)
  } finally {
    clearStoredSession()
  }
}

export const refreshSession = () => api.post('/auth/refresh').then(unwrapApiResponse)
