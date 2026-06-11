import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import AuthShell from './AuthShell'
import { forgotPassword } from '../../infrastructure/api/authApi'
import { getApiErrorMessage } from '../../infrastructure/api/apiHelpers'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()

    const toastId = toast.loading('Sending OTP...')

    try {
      setLoading(true)
      await forgotPassword({ email })
      toast.success('OTP sent successfully', { id: toastId })
      navigate('/reset-password', { state: { email } })
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to send OTP'), { id: toastId })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      eyebrow="Password recovery"
      title="Reset your password without friction"
      subtitle="Enter your email address and we will send a one-time code to continue recovery."
      image="https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1600&q=80"
    >
      <div className="space-y-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-cyan-600">Forgot password</p>
          <h2 className="mt-3 text-3xl font-black text-slate-950">We will send you an OTP</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Use the same email address you registered with to continue the reset flow.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email address"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-cyan-300"
          />
          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>
        </form>

        <p className="text-sm text-slate-600">
          Remembered it?{' '}
          <Link className="font-semibold text-cyan-700 transition hover:text-cyan-900" to="/login">
            Back to login
          </Link>
        </p>
      </div>
    </AuthShell>
  )
}

