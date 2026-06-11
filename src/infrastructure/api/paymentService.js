import api from './axios';
// Assuming unwrapApiResponse extracts res.data.data
import { unwrapApiResponse } from './apiHelpers'; 

export const getBookingById = (bookingId) =>
  api.get(`/bookings/${bookingId}`).then(unwrapApiResponse);

// Match Go backend: /payments/advance/:booking_id
export const createAdvancePayment = (bookingId) =>
  api.post(`/payments/booking/${bookingId}/advance `).then(unwrapApiResponse);

// Match Go backend: /payments/balance/:booking_id
export const createBalancePayment = (bookingId) =>
  api.post(`/payments/booking/${bookingId}/balance`).then(unwrapApiResponse);

// Verification calls (Required for the Razorpay 'handler' function)
export const verifyAdvancePayment = (bookingId, payload) =>
  api.post(`/payments/booking/${bookingId}/advance/verify`, payload).then(unwrapApiResponse);

export const verifyBalancePayment = (bookingId, payload) =>
  api.post(`/payments/booking/${bookingId}/balance/verify`, payload).then(unwrapApiResponse);