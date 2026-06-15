import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './presentation/components/ProtectedRoute'
import PublicOnlyRoute from './presentation/components/PublicOnlyRoute'
import PublicLayout from './presentation/layouts/PublicLayout'
import UserLayout from './presentation/layouts/UserLayout'
import AdminLayout from './presentation/admin/AdminLayout'
import HomePage from './presentation/public/pages/HomePage'
import PackagesPage from './presentation/public/pages/PackagesPage'
import TripDetailsPage from './presentation/public/pages/TripDetailsPage'
import UnauthorizedPage from './presentation/public/pages/UnauthorizedPage'
import LoginPage from './presentation/auth/LoginPage'
import RegisterPage from './presentation/auth/RegisterPage'
import OtpVerificationPage from './presentation/auth/OtpVerificationPage'
import ForgotPasswordPage from './presentation/auth/ForgotPasswordPage'
import ResetPasswordPage from './presentation/auth/ResetPasswordPage'
import DashboardPage from './presentation/user/pages/DashboardPage'
import BookingsPage from './presentation/user/pages/BookingsPage'
import HistoryPage from './presentation/user/pages/HistoryPage'
import NotificationsPage from './presentation/user/pages/NotificationsPage'
import ProfilePage from './presentation/user/pages/ProfilePage'
import MyTripsPage from './presentation/user/pages/MyTripsPage'
import AIPlannerPage from './presentation/user/pages/AIPlannerPage'
import AdminDashboard from './presentation/admin/pages/Dashboard'
import UserManagement from './presentation/admin/pages/UserManagement'
import TripManagement from './presentation/admin/pages/TripManagement'
import BookingManagementPage from './presentation/admin/pages/Payment'
import NotificationManagementPage from './presentation/admin/pages/NotificationManagementPage'
import AIApprovalPage from './presentation/admin/pages/AIApprovalPage'
import PaymentsPage from './presentation/admin/pages/PaymentsPage'
import PaymentGateway from './presentation/user/pages/paymentGateway'
import VehiclesPage from './presentation/admin/pages/VehiclesPage'
import OffersPage from './presentation/admin/pages/OffersPage'
import ReviewsPage from './presentation/admin/pages/ReviewsPage'
import ComplaintsPage from './presentation/admin/pages/ComplaintsPage'
import TrackingPage from './presentation/admin/pages/TrackingPage'
import RolesPage from './presentation/admin/pages/RolesPage'
import TripVerificationPage from './presentation/user/pages/TripVerificationPage'
import ChatPage from './presentation/user/pages/ChatPage'
import GuideReviewsPage from './presentation/user/pages/GuideReviewsPage'
import SupportComplaintsPage from './presentation/user/pages/SupportComplaintsPage'
import SupportHub from './presentation/admin/pages/SupportHub'

export default function App() {
  return (
    <Routes>

      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="/guide/dashboard" element={<Navigate to="/dashboard" replace />} />

      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="packages" element={<PackagesPage />} />
        <Route path="packages/:name" element={<TripDetailsPage />} />
        <Route path="trip/:name" element={<TripDetailsPage />} />
        <Route path="unauthorized" element={<UnauthorizedPage />} />
      </Route>

      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <RegisterPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/verify-otp"
        element={
          <PublicOnlyRoute>
            <OtpVerificationPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicOnlyRoute>
            <ForgotPasswordPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/reset-password"
        element={
          <PublicOnlyRoute>
            <ResetPasswordPage />
          </PublicOnlyRoute>
        }
      />

      <Route element={<ProtectedRoute roles={['user', 'agency', 'driver', 'guide', 'supportagent']}><UserLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/bookings" element={<BookingsPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/my-trips" element={<MyTripsPage />} />
        <Route path="/ai-planner" element={<AIPlannerPage />} />
        <Route path="/tracking" element={<TrackingPage />} />
        <Route path="/payment/:bookingId"
          element={<PaymentGateway />}
        />
        <Route path="/booking/:bookingId/verify" element={<TripVerificationPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/reviews" element={<GuideReviewsPage />} />
        <Route path="/support" element={<SupportHub />} />
        <Route path="/complaints" element={<SupportComplaintsPage />} />
      </Route>

      <Route element={<ProtectedRoute><UserLayout /></ProtectedRoute>}>
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="users" element={<ProtectedRoute roles={['admin']}><UserManagement /></ProtectedRoute>} />
        <Route path="trips" element={<ProtectedRoute roles={['admin']}><TripManagement /></ProtectedRoute>} />
        <Route path="bookings" element={<ProtectedRoute roles={['admin']}><BookingManagementPage /></ProtectedRoute>} />
        <Route path="orders" element={<Navigate to="/admin/bookings" replace />} />
        <Route path="payments" element={<ProtectedRoute roles={['admin']}><PaymentsPage /></ProtectedRoute>} />
        <Route path="notifications" element={<ProtectedRoute roles={['admin']}><NotificationManagementPage /></ProtectedRoute>} />
        <Route path="ai-requests" element={<ProtectedRoute roles={['admin']}><AIApprovalPage /></ProtectedRoute>} />
        <Route path="vehicles" element={<ProtectedRoute roles={['admin']}><VehiclesPage /></ProtectedRoute>} />
        <Route path="offers" element={<ProtectedRoute roles={['admin']}><OffersPage /></ProtectedRoute>} />
        <Route path="reviews" element={<ReviewsPage />} />
        <Route path="complaints" element={<ComplaintsPage />} />
        <Route path="tracking" element={<ProtectedRoute roles={['admin']}><TrackingPage /></ProtectedRoute>} />
        <Route path="roles" element={<ProtectedRoute roles={['admin']}><RolesPage /></ProtectedRoute>} />
        <Route path="support" element={<SupportHub />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>

  )
}
