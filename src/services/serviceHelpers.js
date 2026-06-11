import api from './apiClient'
import { unwrapApiResponse } from '../infrastructure/api/apiHelpers'

export const extractRecords = (value) => {
  if (Array.isArray(value)) {
    return value
  }

  if (Array.isArray(value?.items)) {
    return value.items
  }

  if (Array.isArray(value?.results)) {
    return value.results
  }

  if (Array.isArray(value?.data)) {
    return value.data
  }

  return []
}

export const safeListRequest = async (path, config = {}) => {
  try {
    const response = await api.get(path, config)
    const body = unwrapApiResponse(response)
    return extractRecords(body)
  } catch (error) {
    if (error?.response?.status === 404) {
      return []
    }

    throw error
  }
}

export const safeItemRequest = async (path, config = {}) => {
  try {
    const response = await api.get(path, config)
    return unwrapApiResponse(response)
  } catch (error) {
    if (error?.response?.status === 404) {
      return null
    }

    throw error
  }
}

export const mutateRequest = async (request) => {
  const response = await request
  return unwrapApiResponse(response)
}

export const sumNumbers = (items, selector) =>
  extractRecords(items).reduce((total, item) => total + Number(selector(item) || 0), 0)

