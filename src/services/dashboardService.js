import api from './apiClient'
import { fetchAdminAiTripRequests } from './aiService'
import { fetchAdminNotifications } from './notificationsService'
import { fetchAdminVehicles } from './vehiclesService'
import { fetchAdminOffers } from './offersService'
import { fetchAdminComplaints } from './complaintsService'
import { fetchAdminReviews } from './reviewsService'
import { fetchUsers } from './adminService'
import { fetchAllBookings, fetchAllTrips } from './tripsService'
import { extractRecords, safeItemRequest } from './serviceHelpers'

const maybeFetchSummary = async () => {
  try {
    return await safeItemRequest('/admin/dashboard/summary')
  } catch {
    return null
  }
}

const settle = async (requestPromise) => {
  try {
    return await requestPromise
  } catch (error) {
    if (error?.response?.status === 404) {
      return []
    }

    throw error
  }
}

export const fetchAdminDashboardSummary = async () => {
  const remoteSummary = await maybeFetchSummary()
  if (remoteSummary) {
    return remoteSummary
  }

  const [
    users,
    trips,
    bookings,
    notifications,
    aiRequests,
    complaints,
    reviews,
    vehicles,
    offers,
  ] = await Promise.all([
    settle(fetchUsers()),
    settle(fetchAllTrips()),
    settle(fetchAllBookings()),
    settle(fetchAdminNotifications()),
    settle(fetchAdminAiTripRequests()),
    settle(fetchAdminComplaints()),
    settle(fetchAdminReviews()),
    settle(fetchAdminVehicles()),
    settle(fetchAdminOffers()),
  ])

  return {
    users: extractRecords(users),
    trips: extractRecords(trips),
    bookings: extractRecords(bookings),
    notifications: extractRecords(notifications),
    aiRequests: extractRecords(aiRequests),
    complaints: extractRecords(complaints),
    reviews: extractRecords(reviews),
    vehicles: extractRecords(vehicles),
    offers: extractRecords(offers),
  }
}

export const fetchAdminDashboardSettings = async () => {
  try {
    const response = await api.get('/admin/dashboard/settings')
    return response?.data?.data ?? response?.data ?? null
  } catch (error) {
    if (error?.response?.status === 404) {
      return null
    }

    throw error
  }
}

