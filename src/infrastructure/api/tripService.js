import api from './axios'
import { unwrapApiResponse } from './apiHelpers'

export const getTrips = () => api.get('/trips').then(unwrapApiResponse)

export const getTripByName = (name) =>
  api.get(`/trips/${encodeURIComponent(name)}`).then(unwrapApiResponse)

export const fetchAllTrips = () => api.get('/trips').then(unwrapApiResponse)

export const createNewTrip = (tripData) => api.post('/admin/trips', tripData).then(unwrapApiResponse)

export const updateTrip = (id, tripData) => api.patch(`/admin/trips/${id}`, tripData).then(unwrapApiResponse)

export const deleteTrip = (id) => api.delete(`/admin/trips/${id}`).then(unwrapApiResponse)

export const fetchAllBookedOrders = () => api.get('/admin/orders/all').then(unwrapApiResponse)

export const bookTrip = (tripId, bookingData) => api.post(`/bookings/trip/${tripId}`, bookingData).then(unwrapApiResponse)

export const fetchMyBookings = () => api.get('/bookings/my-orders').then(unwrapApiResponse)

export const updateCustomBookingPlans = (bookingId, plans) =>
  api.patch(`/bookings/custom-plan/${bookingId}`, { plans }).then(unwrapApiResponse)

export const fetchAllBookings = () => api.get('/admin/orders/all').then(unwrapApiResponse)

export const submitVerification = (formData) =>  api.post('/verifications', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }).then(unwrapApiResponse)
