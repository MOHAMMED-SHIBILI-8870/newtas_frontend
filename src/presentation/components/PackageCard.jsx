import { CalendarDays, MapPin, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

const PackageCard = ({ trip }) => {
  const tripName = `${trip?.from || 'Unknown'} to ${trip?.to || 'Destination'}`

  return (
    <article className="group overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative h-56 overflow-hidden">
        <img
          src={trip?.image_url || 'https://images.unsplash.com/photo-1506920567564-8e2ff3f1b7f4?auto=format&fit=crop&w=1200&q=80'}
          alt={tripName}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />
        <div className="absolute left-4 top-4 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
          {trip?.trip_type || 'Package'}
        </div>
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4 text-white">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-200">From</p>
            <h3 className="mt-1 text-2xl font-black">{trip?.from}</h3>
            <p className="text-sm text-slate-200">{trip?.to}</p>
          </div>
          <div className="rounded-2xl bg-white/10 px-3 py-2 text-right backdrop-blur">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-cyan-200">Price</p>
            <p className="text-xl font-black">${Number(trip?.price || 0).toFixed(0)}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4 text-cyan-600" />
            {trip?.duration || 1} days
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-cyan-600" />
            {trip?.hotel_type || '3 Star'}
          </span>
        </div>

        <p className="line-clamp-3 text-sm leading-6 text-slate-600">
          {trip?.itinerary_raw ||
            'A handcrafted travel package with clear logistics, flexible planning, and a polished itinerary.'}
        </p>

        <div className="flex items-center justify-between gap-3 pt-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.25em] text-slate-600">
            <Sparkles className="h-3.5 w-3.5 text-cyan-600" />
            {trip?.status || 'active'}
          </div>

          <Link
            to={`/packages/${encodeURIComponent(trip?.name || trip?.to || '')}`}
            className="inline-flex items-center justify-center rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-600"
          >
            View Details
          </Link>
        </div>
      </div>
    </article>
  )
}

export default PackageCard

