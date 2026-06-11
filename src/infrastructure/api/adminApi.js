import api from './axios'
import { unwrapApiResponse } from './apiHelpers'

export const fetchUsers = async (filters = {}) => {
  const response = await api.get('/admin/users', { params: filters })
  return unwrapApiResponse(response)
}

export const toggleBlockStatus = async (userId) => {
  const response = await api.patch(`/admin/users/${userId}/block`)
  return unwrapApiResponse(response)
}

export const updateUserRole = async (userId, role) => {
  const response = await api.patch(`/admin/users/${userId}/role`, { role })
  return unwrapApiResponse(response)
}

export const createUserByAdmin = async (userData) => {
  const response = await api.post('/admin/users', userData)
  return unwrapApiResponse(response)
}

export const removeUser = async (id) => {
  const response = await api.delete(`/admin/users/${id}`)
  return unwrapApiResponse(response)
}

