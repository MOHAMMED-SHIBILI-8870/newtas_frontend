import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import AuthShell from './AuthShell'
import { verifyOtp } from '../../infrastructure/api/authApi'
import { getApiErrorMessage } from '../../infrastructure/api/apiHelpers'

export default function OtpVerificationPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const email = location.state?.email
  const purpose = location.state?.purpose || 'signup'

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!email) {
      navigate('/register')
      return
    }

    const toastId = toast.loading('Verifying OTP...')

    try {
      setLoading(true)
      await verifyOtp({ email, otp, purpose })
      toast.success('OTP verified successfully', { id: toastId })
      navigate('/login')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Invalid or expired OTP'), { id: toastId })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      eyebrow="Verification"
      title="Verify your one-time password"
      subtitle="Enter the OTP sent to your inbox to activate the account or finish a recovery flow."
      image="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80"
      overlay="from-slate-950/90 via-blue-950/60 to-slate-950/75"
    >
      <div className="space-y-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-cyan-600">Verify OTP</p>
          <h2 className="mt-3 text-3xl font-black text-slate-950">Complete verification</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            The code should match the email address below and the selected purpose.
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
          <div>
            <span className="font-semibold text-slate-900">Email:</span> {email}
          </div>
          <div className="mt-1">
            <span className="font-semibold text-slate-900">Purpose:</span> {purpose}
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            required
            value={otp}
            onChange={(event) => setOtp(event.target.value)}
            placeholder="Enter OTP"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-sm tracking-[0.35em] outline-none transition focus:border-cyan-300"
          />
          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>

        <p className="text-sm text-slate-600">
          Need to start over?{' '}
          <Link className="font-semibold text-cyan-700 transition hover:text-cyan-900" to="/register">
            Back to registration
          </Link>
        </p>
      </div>
    </AuthShell>
  )
}

