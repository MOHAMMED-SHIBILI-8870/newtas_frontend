export const ROLE_PERMISSION_MAP = {
  admin: ['*'],
  agency: [
    'dashboard.read',
    'trips.read',
    'trips.write',
    'bookings.read',
    'bookings.write',
    'vehicles.read',
    'vehicles.write',
    'offers.read',
    'notifications.read',
    'tracking.read',
  ],
  driver: ['dashboard.read', 'bookings.read', 'notifications.read', 'tracking.read', 'trips.read'],
  guide: ['dashboard.read', 'bookings.read', 'notifications.read', 'trips.read', 'manage_reviews', 'reviews.read'],
  user: [
    'dashboard.read',
    'bookings.read',
    'bookings.write',
    'ai.write',
    'notifications.read',
    'payments.read',
    'reviews.write',
    'complaints.write',
    'offers.read',
    'offers.read',
    'tracking.read',
  ],
  supportagent: [
    'reviews.read',
    'complaints.read',
    'dashboard.read',
  ],
}

export const ROUTE_ROLE_GROUPS = {
  public: ['guest'],
  customer: ['user', 'agency', 'driver', 'guide'],
  admin: ['admin'],
}

export const isAdminRole = (role) => String(role || '').toLowerCase() === 'admin'

export const normalizeRole = (role) => String(role || 'user').toLowerCase()

export const getDefaultPermissionsForRole = (role) => {
  const normalizedRole = normalizeRole(role)
  return ROLE_PERMISSION_MAP[normalizedRole] || ROLE_PERMISSION_MAP.user
}

export const getRedirectPathForRole = (role) => {
  const normalizedRole = normalizeRole(role)

  if (normalizedRole === 'admin') {
    return '/admin/dashboard'
  }

  if (normalizedRole === 'driver') {
    return '/tracking'
  }

  if (normalizedRole === 'guide') {
    return '/chat'
  }

  if (normalizedRole === 'supportagent') {
    return '/chat'
  }

  return '/dashboard'
}

