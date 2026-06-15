import api from './apiClient'
import { mutateRequest, safeListRequest } from './serviceHelpers'

export const fetchMyReviews = () => safeListRequest('/reviews/me')

export const fetchAdminReviews = () => safeListRequest('/admin/reviews')

export const fetchAssignedReviews = () => safeListRequest('/reviews/assigned')

export const fetchTripReviews = (tripId) => safeListRequest(`/reviews/trip/${tripId}`)

export const fetchTripReviewSummary = (tripId) => safeListRequest(`/reviews/trip/${tripId}/summary`)

export const createReview = (payload) => mutateRequest(api.post('/reviews', payload))

export const deleteReview = (reviewId) => mutateRequest(api.delete(`/admin/reviews/${reviewId}`))
