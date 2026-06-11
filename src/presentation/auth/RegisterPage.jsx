import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import AuthShell from './AuthShell'
import { registerUser } from '../../infrastructure/api/authApi'
import { getApiErrorMessage } from '../../infrastructure/api/apiHelpers'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return
    }

    const toastId = toast.loading('Creating your account...')

    try {
      setLoading(true)
      await registerUser({
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        password: form.password,
      })

      toast.success('Account created. Verify your OTP.', { id: toastId })
      navigate('/verify-otp', {
        state: {
          email: form.email.trim(),
          purpose: 'signup',
        },
      })
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Register failed'), { id: toastId })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      eyebrow="Create account"
      title="Join TravelAI and plan trips with confidence"
      subtitle="Register once, verify your account, and unlock booking, notifications, and AI trip requests."
      image="https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1600&q=80"
      overlay="from-slate-950/90 via-indigo-950/60 to-slate-950/70"
    >
      <div className="space-y-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-cyan-600">Register</p>
          <h2 className="mt-3 text-3xl font-black text-slate-950">Create your account</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Start with a verified account and get access to user tools right away.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            required
            value={form.full_name}
            onChange={(event) => setForm((current) => ({ ...current, full_name: event.target.value }))}
            placeholder="Full name"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-cyan-300"
          />
          <input
            type="email"
            required
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            placeholder="Email address"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-cyan-300"
          />
          <input
            type="password"
            required
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            placeholder="Password"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-cyan-300"
          />
          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-sm text-slate-600">
          Already have an account?{' '}
          <Link className="font-semibold text-cyan-700 transition hover:text-cyan-900" to="/login">
            Sign in
          </Link>
        </p>
      </div>
    </AuthShell>
  )
}

