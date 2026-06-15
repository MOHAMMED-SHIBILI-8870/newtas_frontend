import { useMemo, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../../../domain/context/AuthContext'
import SectionHeading from '../../components/SectionHeading'
import StatusBadge from '../../components/StatusBadge'
import { createComplaint } from '../../../services/complaintsService'
import { fetchMyBookings } from '../../../infrastructure/api/tripService'

export default function ProfilePage() {
  const { user, logout, isAdmin } = useAuth()
  const [complaintTitle, setComplaintTitle] = useState('')
  const [complaintDescription, setComplaintDescription] = useState('')
  const [selectedBooking, setSelectedBooking] = useState('')
  const [bookings, setBookings] = useState([])
  const [submittingComplaint, setSubmittingComplaint] = useState(false)

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const myBookings = await fetchMyBookings()
        const bookingsList = Array.isArray(myBookings) ? myBookings : []
        setBookings(bookingsList)
        if (bookingsList.length > 0) {
          setSelectedBooking(String(bookingsList[0].id))
        }
      } catch (error) {
        console.error('Failed to load bookings for complaints', error)
      }
    }
    void loadBookings()
  }, [])

  const handleComplaintSubmit = async (e) => {
    e.preventDefault()

    let bookingIdToSend = Number(selectedBooking)
    if (!bookingIdToSend && bookings.length > 0) {
      bookingIdToSend = bookings[0].id
    }

    if (!bookingIdToSend) {
      toast.error('You need at least one booking to submit a complaint.')
      return
    }

    if (!complaintTitle.trim() || !complaintDescription.trim()) {
      toast.error('Please enter subject and description')
      return
    }
    setSubmittingComplaint(true)
    try {
      await createComplaint({
        booking_id: bookingIdToSend,
        title: complaintTitle,
        description: complaintDescription,
      })
      toast.success('Complaint submitted successfully!')
      setComplaintTitle('')
      setComplaintDescription('')
      if (bookings.length > 0) {
        setSelectedBooking(String(bookings[0].id))
      } else {
        setSelectedBooking('')
      }
    } catch (error) {
      toast.error('Failed to submit complaint')
    } finally {
      setSubmittingComplaint(false)
    }
  }

  const profileRows = useMemo(
    () => [
      { label: 'Full name', value: user?.full_name || 'Not available' },
      { label: 'Email', value: user?.email || 'Not available' },
      { label: 'Role', value: user?.role || 'user' },
      { label: 'Account ID', value: user?.id ?? 'N/A' },
      { label: 'Status', value: user?.is_blocked ? 'Blocked' : 'Active' },
      { label: 'Verification', value: user?.is_verified ? 'Verified' : 'Pending' },
    ],
    [user],
  )

  const handleLogout = () => {
    toast.success('Logged out successfully')
    void logout({ redirectTo: '/login' })
  }

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Profile"
        title="My profile"
        description="View your account details and open the admin dashboard if your role permits it."
      />

      <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(6,182,212,0.16),_transparent_30%),linear-gradient(to_right,_#ffffff,_#f8fafc)] p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.35em] text-cyan-600">Account details</p>
              <h2 className="mt-3 text-4xl font-black text-slate-950">{user?.full_name || user?.email || 'User'}</h2>
              <p className="mt-2 text-sm text-slate-500">{user?.email}</p>
            </div>
            <StatusBadge status={user?.role || 'user'}>{user?.role || 'user'}</StatusBadge>
          </div>
        </div>

        <div className="grid gap-4 p-8 md:grid-cols-2">
          {profileRows.map((row) => (
            <div key={row.label} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">{row.label}</p>
              <p className="mt-2 text-base font-semibold text-slate-950">{row.value}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 border-t border-slate-200 p-8">
          <Link
            to="/packages"
            className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-cyan-200 hover:text-cyan-700"
          >
            Browse packages
          </Link>
          {isAdmin ? (
            <Link
              to="/admin/dashboard"
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-600"
            >
              Admin dashboard
            </Link>
          ) : null}
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full bg-rose-50 px-5 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-100"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm mt-8">
        <div className="border-b border-slate-200 p-8">
          <h3 className="text-xl font-bold text-slate-900">File a Complaint</h3>
          <p className="mt-1 text-sm text-slate-500">Have an issue with a recent booking? Let us know.</p>
        </div>
        <form onSubmit={handleComplaintSubmit} className="p-8 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Subject</label>
            <input
              type="text"
              value={complaintTitle}
              onChange={(e) => setComplaintTitle(e.target.value)}
              placeholder="Subject of your issue"
              className="mt-1 block w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm outline-none transition focus:border-cyan-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Description</label>
            <textarea
              value={complaintDescription}
              onChange={(e) => setComplaintDescription(e.target.value)}
              placeholder="Detailed explanation of the problem"
              rows={4}
              className="mt-1 block w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm outline-none transition focus:border-cyan-300"
            />
          </div>
          <button
            type="submit"
            disabled={submittingComplaint}
            className="rounded-full bg-cyan-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:opacity-50"
          >
            {submittingComplaint ? 'Submitting...' : 'Submit Complaint'}
          </button>
        </form>
      </div>
    </div>
  )
}

