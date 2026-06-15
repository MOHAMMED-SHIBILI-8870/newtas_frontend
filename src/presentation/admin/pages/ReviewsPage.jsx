import { useEffect, useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Star, RefreshCw, MessageSquareQuote, ThumbsUp } from 'lucide-react'
import toast from 'react-hot-toast'
import { fetchAdminReviews } from '../../../services/reviewsService'
import { getApiErrorMessage } from '../../../infrastructure/api/apiHelpers'
import AdminPageHeader from '../../../features/admin/components/AdminPageHeader'
import AdminKpiCard from '../../../features/admin/components/AdminKpiCard'
import AdminChartCard from '../../../features/admin/components/AdminChartCard'
import DataTable from '../../../components/DataTable'

const normalizeReview = (review) => ({
  ...review,
  rating: Number(review?.rating || review?.stars || 0),
  title: review?.title || review?.headline || 'Review',
  comment: review?.comment || review?.message || review?.content || '',
  customer: review?.user?.full_name || review?.user?.email || review?.author_name || 'Unknown customer',
  tripLabel:
    review?.trip?.name ||
    review?.trip?.title ||
    `${review?.trip?.from || 'Unknown'} -> ${review?.trip?.to || 'Destination'}`,
  status: String(review?.status || 'published').toLowerCase(),
})

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [ratingFilter, setRatingFilter] = useState('all')

  const loadReviews = async ({ silent = false } = {}) => {
    try {
      if (silent) {
        setRefreshing(true)
      }

      const reviewData = await fetchAdminReviews()
      setReviews(Array.isArray(reviewData) ? reviewData.map(normalizeReview) : [])
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load reviews'))
      setReviews([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    void loadReviews()
  }, [])

  const filteredReviews = useMemo(
    () => reviews.filter((review) => ratingFilter === 'all' || String(review.rating) === ratingFilter),
    [ratingFilter, reviews],
  )

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length).toFixed(1)
      : '0.0'
  const fiveStarReviews = reviews.filter((review) => review.rating === 5).length
  const unratedReviews = reviews.filter((review) => review.rating === 0).length

  const ratingDistribution = useMemo(() => {
    const counts = new Map()
    reviews.forEach((review) => {
      const key = review.rating > 0 ? `${review.rating}` : '0'
      counts.set(key, (counts.get(key) || 0) + 1)
    })

    return Array.from(counts.entries())
      .map(([label, value]) => ({ label: label === '0' ? 'Unrated' : `${label} stars`, value }))
      .sort((left, right) => left.label.localeCompare(right.label))
  }, [reviews])

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Reviews"
        title="Review analytics"
        description="Browse customer feedback and inspect rating distribution across the platform."
        actions={
          <button
            type="button"
            onClick={() => void loadReviews({ silent: true })}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <AdminKpiCard label="Average rating" value={averageRating} helper="Out of 5 stars" icon={Star} tone="yellow" />
        <AdminKpiCard label="Five-star reviews" value={fiveStarReviews} helper="Excellent feedback" icon={ThumbsUp} tone="emerald" />
        <AdminKpiCard label="Unrated" value={unratedReviews} helper="Needs follow up" icon={MessageSquareQuote} tone="rose" />
      </div>

      <AdminChartCard eyebrow="Filters" title="Rating filter" description="Filter the review table by star count.">
        <label className="min-w-[180px]">
          <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.3em] text-white/45">Rating</span>
          <select
            value={ratingFilter}
            onChange={(event) => setRatingFilter(event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-300"
          >
            <option value="all" className="bg-zinc-950">All ratings</option>
            <option value="5" className="bg-zinc-950">5 stars</option>
            <option value="4" className="bg-zinc-950">4 stars</option>
            <option value="3" className="bg-zinc-950">3 stars</option>
            <option value="2" className="bg-zinc-950">2 stars</option>
            <option value="1" className="bg-zinc-950">1 star</option>
            <option value="0" className="bg-zinc-950">Unrated</option>
          </select>
        </label>
      </AdminChartCard>

      <AdminChartCard eyebrow="Distribution" title="Rating summary" description="A count of reviews by rating bucket.">
        <div className="h-80">
          {ratingDistribution.length === 0 ? (
            <div className="flex h-full items-center justify-center rounded-[24px] border border-dashed border-white/10 bg-white/5 text-sm text-white/45">
              No review data yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ratingDistribution}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#cbd5e1', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#cbd5e1', fontSize: 12 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: '#09090b',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '16px',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="value" radius={[12, 12, 0, 0]} fill="#a78bfa" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </AdminChartCard>

      {loading ? (
        <AdminChartCard eyebrow="Loading" title="Review records">
          <div className="rounded-[24px] border border-dashed border-white/10 bg-white/5 p-10 text-center text-sm text-white/45">
            Loading reviews...
          </div>
        </AdminChartCard>
      ) : (
        <DataTable
          title="Review listing"
          description="Search, sort, and export all customer reviews."
          rows={filteredReviews}
          rowKey="id"
          searchPlaceholder="Search by customer, trip, or review text"
          searchKeys={['customer', 'tripLabel', 'title', 'comment', 'rating']}
          filters={[
            {
              key: 'rating',
              label: 'Rating',
              value: ratingFilter,
              onChange: setRatingFilter,
              options: [
                { label: 'All ratings', value: 'all' },
                { label: '5 stars', value: '5' },
                { label: '4 stars', value: '4' },
                { label: '3 stars', value: '3' },
                { label: '2 stars', value: '2' },
                { label: '1 star', value: '1' },
                { label: 'Unrated', value: '0' },
              ],
            },
          ]}
          columns={[
            {
              key: 'customer',
              label: 'Customer',
              render: (row) => (
                <div>
                  <p className="font-semibold text-white">{row.customer}</p>
                  <p className="text-sm text-white/55">{row.tripLabel}</p>
                </div>
              ),
            },
            {
              key: 'rating',
              label: 'Rating',
              render: (row) => <span className="font-semibold text-yellow-300">{row.rating || 'N/A'}</span>,
            },
            {
              key: 'title',
              label: 'Review',
              render: (row) => (
                <div>
                  <p className="font-semibold text-white">{row.title}</p>
                  <p className="max-w-xl text-sm text-white/60">{row.comment}</p>
                </div>
              ),
            },
            {
              key: 'status',
              label: 'Status',
              render: (row) => (
                <span className="inline-flex rounded-full bg-zinc-800 px-3 py-1 text-xs font-bold uppercase tracking-[0.25em] text-white/80">
                  {row.status}
                </span>
              ),
            },
          ]}
          emptyState={
            <div className="rounded-[24px] border border-dashed border-white/10 bg-zinc-900/40 p-10 text-center">
              <p className="text-sm font-semibold text-white">No reviews match your filters.</p>
              <p className="mt-2 text-sm text-white/55">Clear the filter to see every review.</p>
            </div>
          }
        />
      )}
    </div>
  )
}
