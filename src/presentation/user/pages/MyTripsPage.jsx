import SectionHeading from '../../components/SectionHeading'
import EmptyState from '../../components/EmptyState'

export default function MyTripsPage() {
  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="My Trips"
        title="Coming Soon"
        description="This space is reserved for the future trip-building workspace."
      />

      <EmptyState
        title="Coming Soon"
        description="We are building a dedicated workspace for your curated trips and saved itineraries."
      />
    </div>
  )
}

