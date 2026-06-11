import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import AuthShell from './AuthShell'
import { resetPassword } from '../../infrastructure/api/authApi'
import { getApiErrorMessage } from '../../infrastructure/api/apiHelpers'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const email = location.state?.email

  useEffect(() => {
    if (!email) {
      navigate('/forgot-password', { replace: true })
    }
  }, [email, navigate])

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return
    }

    const toastId = toast.loading('Resetting password...')

    try {
      setLoading(true)
      await resetPassword({
        email,
        otp,
        new_password: password,
      })

      toast.success('Password reset successfully', { id: toastId })
      navigate('/login')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Reset failed'), { id: toastId })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      eyebrow="Reset password"
      title="Create a new secure password"
      subtitle="Verify the OTP from your email and set a fresh password for your account."
      image="https://images.unsplash.com/photo-1506459225024-1428097a7e18?auto=format&fit=crop&w=1600&q=80"
      overlay="from-slate-950/92 via-fuchsia-950/60 to-slate-950/75"
    >
      <div className="space-y-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-cyan-600">Reset</p>
          <h2 className="mt-3 text-3xl font-black text-slate-950">Enter OTP and new password</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            We will update your credentials immediately after the OTP is verified.
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
          <span className="font-semibold text-slate-900">Email:</span> {email}
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            required
            value={otp}
            onChange={(event) => setOtp(event.target.value)}
            placeholder="One-time password"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-cyan-300"
          />
          <input
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="New password"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-cyan-300"
          />
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Confirm new password"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-cyan-300"
          />
          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Resetting password...' : 'Reset password'}
          </button>
        </form>

        <p className="text-sm text-slate-600">
          Need another OTP?{' '}
          <Link className="font-semibold text-cyan-700 transition hover:text-cyan-900" to="/forgot-password">
            Request a new code
          </Link>
        </p>
      </div>
    </AuthShell>
  )
}

