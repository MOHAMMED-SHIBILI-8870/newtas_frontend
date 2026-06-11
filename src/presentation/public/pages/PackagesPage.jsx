import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, SlidersHorizontal } from 'lucide-react'
import toast from 'react-hot-toast'
import { getTrips } from '../../../infrastructure/api/tripService'
import { getApiErrorMessage } from '../../../infrastructure/api/apiHelpers'
import PackageCard from '../../components/PackageCard'
import LoadingState from '../../components/LoadingState'
import EmptyState from '../../components/EmptyState'
import SectionHeading from '../../components/SectionHeading'

const budgetOptions = ['all', 'Low', 'Medium', 'High']
const tripTypeOptions = ['all', 'Family', 'Adventure', 'Solo', 'Couple', 'Friends']

export default function PackagesPage() {
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [budget, setBudget] = useState('all')
  const [tripType, setTripType] = useState('all')

  useEffect(() => {
    const loadTrips = async () => {
      try {
        const data = await getTrips()
        setTrips(Array.isArray(data) ? data : [])
      } catch (error) {
        toast.error(getApiErrorMessage(error, 'Failed to load packages'))
        setTrips([])
      } finally {
        setLoading(false)
      }
    }

    void loadTrips()
  }, [])

  const filteredTrips = useMemo(
    () =>
      trips.filter((trip) => {
        const searchValue = search.trim().toLowerCase()
        const matchesSearch =
          !searchValue ||
          String(trip?.from || '').toLowerCase().includes(searchValue) ||
          String(trip?.to || '').toLowerCase().includes(searchValue)
        const matchesBudget = budget === 'all' || String(trip?.budget_level || '').toLowerCase() === budget.toLowerCase()
        const matchesType = tripType === 'all' || String(trip?.trip_type || '').toLowerCase() === tripType.toLowerCase()
        return matchesSearch && matchesBudget && matchesType
      }),
    [budget, search, tripType, trips],
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Packages"
        title="Browse all trip packages"
        description="Search, filter, and open the trip details page to inspect itineraries, pricing, and book a package."
        action={
          <Link
            to="/ai-planner"
            className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-600"
          >
            AI Planner
          </Link>
        }
      />

      <div className="mt-8 rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1.4fr_0.8fr_0.8fr]">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-cyan-300"
              placeholder="Search by origin or destination"
            />
          </div>

          <div className="relative">
            <SlidersHorizontal className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <select
              value={budget}
              onChange={(event) => setBudget(event.target.value)}
              className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-cyan-300"
            >
              {budgetOptions.map((option) => (
                <option key={option} value={option}>
                  {option === 'all' ? 'All budgets' : option}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <SlidersHorizontal className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <select
              value={tripType}
              onChange={(event) => setTripType(event.target.value)}
              className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-cyan-300"
            >
              {tripTypeOptions.map((option) => (
                <option key={option} value={option}>
                  {option === 'all' ? 'All trip types' : option}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mt-8">
        {loading ? (
          <LoadingState label="Loading packages..." />
        ) : filteredTrips.length === 0 ? (
          <EmptyState
            title="No matching packages"
            description="Try a different search term or clear the filters to see the full package list."
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredTrips.map((trip) => (
              <PackageCard key={trip.id} trip={trip} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

