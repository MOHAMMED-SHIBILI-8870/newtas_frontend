import api from './apiClient'
import { mutateRequest, safeListRequest } from './serviceHelpers'

export const fetchOffers = () => safeListRequest('/offers')

export const fetchActiveOffers = () => safeListRequest('/offers/active')

export const fetchAdminOffers = () => safeListRequest('/admin/offers')

export const createOffer = (payload) => mutateRequest(api.post('/admin/offers', payload))

export const updateOffer = (offerId, payload) => mutateRequest(api.put(`/admin/offers/${offerId}`, payload))

export const deleteOffer = (offerId) => mutateRequest(api.delete(`/admin/offers/${offerId}`))

export const validateCoupon = (payload) => mutateRequest(api.post('/offers/validate', payload))
