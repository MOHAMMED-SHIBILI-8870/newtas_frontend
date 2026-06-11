import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CalendarDays, ShieldCheck, Sparkles, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import { getTrips } from '../../../infrastructure/api/tripService'
import { getApiErrorMessage } from '../../../infrastructure/api/apiHelpers'
import PackageCard from '../../components/PackageCard'
import SectionHeading from '../../components/SectionHeading'
import LoadingState from '../../components/LoadingState'
import EmptyState from '../../components/EmptyState'

const stats = [
  { label: 'Destinations', value: '120+', icon: CalendarDays },
  { label: 'Travellers', value: '18k+', icon: Users },
  { label: 'Protected Journeys', value: '100%', icon: ShieldCheck },
  { label: 'AI Plans', value: '24/7', icon: Sparkles },
]

export default function HomePage() {
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadTrips = async () => {
      try {
        const data = await getTrips()
        setTrips(Array.isArray(data) ? data : [])
      } catch (error) {
        toast.error(getApiErrorMessage(error, 'Failed to load featured packages'))
        setTrips([])
      } finally {
        setLoading(false)
      }
    }

    void loadTrips()
  }, [])

  const featuredTrips = useMemo(() => trips.slice(0, 3), [trips])

  return (
    <div className="space-y-20 pb-16">
      <section className="mx-auto grid max-w-7xl gap-10 px-4 pb-4 pt-8 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.35em] text-cyan-700">
            <Sparkles className="h-4 w-4" />
            AI-Powered Travel Platform
          </div>

          <div className="space-y-5">
            <h1 className="max-w-2xl text-5xl font-black leading-tight text-slate-950 sm:text-6xl">
              Book trips, generate AI itineraries, and let admins approve faster.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-600">
              Browse packages, manage bookings, and submit AI-generated trip requests through a clean public,
              user, and admin workflow built for production use.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/packages"
              className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-cyan-600"
            >
              Explore Packages <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-cyan-200 hover:text-cyan-700"
            >
              Sign in to book
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <div key={stat.label} className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">{stat.label}</p>
                    <Icon className="h-4 w-4 text-cyan-600" />
                  </div>
                  <p className="mt-4 text-3xl font-black text-slate-950">{stat.value}</p>
                </div>
              )
            })}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-slate-950 shadow-2xl">
          <img
            src="https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=1600&q=80"
            alt="Hero travel"
            className="h-full min-h-[560px] w-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-cyan-200">Feature flow</p>
            <h2 className="mt-3 text-3xl font-black leading-tight">
              Generate a trip plan, review it, and send it to admins in one flow.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-200">
              The new AI request workflow stores generated plans, notifies administrators, and turns approvals into
              live packages.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Featured Packages"
          title="Popular travel packages"
          description="These are pulled directly from the backend and surfaced with clean cards, fast loading states, and clear detail links."
          action={
            <Link
              to="/packages"
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-cyan-200 hover:text-cyan-700"
            >
              View all packages
            </Link>
          }
        />

        <div className="mt-8">
          {loading ? (
            <LoadingState label="Loading featured trips..." />
          ) : featuredTrips.length === 0 ? (
            <EmptyState
              title="No packages available yet"
              description="Once the backend has trip templates, they will appear here automatically."
            />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {featuredTrips.map((trip) => (
                <PackageCard key={trip.id} trip={trip} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

