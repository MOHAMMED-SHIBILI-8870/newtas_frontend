import { Link } from 'react-router-dom'
import { Lock } from 'lucide-react'

export default function UnauthorizedPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-4xl items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="w-full rounded-[32px] border border-slate-200 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-50 text-rose-600">
          <Lock className="h-8 w-8" />
        </div>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.35em] text-rose-600">Unauthorized</p>
        <h1 className="mt-3 text-3xl font-black text-slate-950">You do not have access to this page.</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Your session may be expired or your role does not allow this route.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/"
            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-600"
          >
            Go home
          </Link>
          <Link
            to="/login"
            className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-cyan-200 hover:text-cyan-700"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  )
}

