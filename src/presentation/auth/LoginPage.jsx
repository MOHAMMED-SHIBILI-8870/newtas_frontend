import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../../domain/context/AuthContext'
import { loginUser } from '../../infrastructure/api/authApi'
import { getApiErrorMessage } from '../../infrastructure/api/apiHelpers'
import AuthShell from './AuthShell'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, getRedirectPathForRole } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()

    const toastId = toast.loading('Signing you in...')

    try {
      setLoading(true)
      const response = await loginUser({ email, password })
      login(response.user, response.access_token)
      toast.success('Welcome back!', { id: toastId })

      const from = location.state?.from
      if (from) {
        navigate(from, { replace: true })
        return
      }

      navigate(getRedirectPathForRole(response.user?.role), { replace: true })
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Login failed'), { id: toastId })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      eyebrow="Sign in"
      title="Welcome back to TravelAI"
      subtitle="Access your dashboard, bookings, notifications, and AI trip planner in one polished workspace."
      image="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1600&q=80"
    >
      <div className="space-y-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-cyan-600">Login</p>
          <h2 className="mt-3 text-3xl font-black text-slate-950">Sign in to continue</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Use your registered email and password to resume your session.
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
          <input
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-cyan-300"
          />

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="flex items-center justify-between gap-3 text-sm">
          <Link to="/forgot-password" className="font-semibold text-cyan-700 transition hover:text-cyan-900">
            Forgot password?
          </Link>
          <Link to="/register" className="font-semibold text-slate-600 transition hover:text-slate-950">
            Create an account
          </Link>
        </div>

        
      </div>
    </AuthShell>
  )
}

