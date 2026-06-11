import { useMemo, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { ClipboardList, WandSparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import { generateTripPlan, submitAiTripRequest } from '../../../infrastructure/api/aiApi'
import { getApiErrorMessage } from '../../../infrastructure/api/apiHelpers'
import SectionHeading from '../../components/SectionHeading'
import EmptyState from '../../components/EmptyState'

const initialForm = {
  from: '',
  to: '',
  days: 3,
  trip_type: 'Family',
  budget_level: 'Medium',
  members: 2,
  children: 0,
  hotel_type: '3 Star',
  transport: 'Car',
  created_by: 'user',
}

export default function AIPlannerPage() {
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [generatedPlan, setGeneratedPlan] = useState('')
  const [prompt, setPrompt] = useState('')

  const canSend = useMemo(() => Boolean(generatedPlan && form.from && form.to), [form.from, form.to, generatedPlan])

  const handleGenerate = async (event) => {
    event.preventDefault()

    const toastId = toast.loading('Generating trip plan...')

    try {
      setLoading(true)
      const result = await generateTripPlan(form)
      const nextPlan = result?.result || result?.generated_plan || ''
      setGeneratedPlan(nextPlan)
      setPrompt(result?.prompt || '')
      toast.success('Trip plan generated', { id: toastId })
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to generate trip plan'), { id: toastId })
    } finally {
      setLoading(false)
    }
  }

  const handleSendToAdmin = async () => {
    if (!canSend) {
      toast.error('Generate a plan before sending it to admin')
      return
    }

    const toastId = toast.loading('Sending request to admin...')

    try {
      setSending(true)
      await submitAiTripRequest({
        ...form,
        prompt,
        generated_plan: generatedPlan,
      })
      toast.success('AI trip request sent to admin', { id: toastId })
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to send request'), { id: toastId })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="AI Planner"
        title="Generate and send a trip request"
        description="Create a trip plan with AI, review the output, and send it to admins for approval."
      />

      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <form onSubmit={handleGenerate} className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="From" value={form.from} onChange={(value) => setForm((current) => ({ ...current, from: value }))} />
            <Field label="To" value={form.to} onChange={(value) => setForm((current) => ({ ...current, to: value }))} />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <Field type="number" label="Days" value={form.days} onChange={(value) => setForm((current) => ({ ...current, days: Number(value) }))} />
            <Field type="number" label="Members" value={form.members} onChange={(value) => setForm((current) => ({ ...current, members: Number(value) }))} />
            <Field type="number" label="Children" value={form.children} onChange={(value) => setForm((current) => ({ ...current, children: Number(value) }))} />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <SelectField label="Trip type" value={form.trip_type} onChange={(value) => setForm((current) => ({ ...current, trip_type: value }))} options={['Family', 'Adventure', 'Solo', 'Couple', 'Friends']} />
            <SelectField label="Budget" value={form.budget_level} onChange={(value) => setForm((current) => ({ ...current, budget_level: value }))} options={['Low', 'Medium', 'High']} />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <SelectField label="Hotel type" value={form.hotel_type} onChange={(value) => setForm((current) => ({ ...current, hotel_type: value }))} options={['Budget', '3 Star', '4 Star', '5 Star']} />
            <SelectField label="Transport" value={form.transport} onChange={(value) => setForm((current) => ({ ...current, transport: value }))} options={['Car', 'Bus', 'Train', 'Flight']} />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <WandSparkles className="h-4 w-4" />
            {loading ? 'Generating...' : 'Generate trip plan'}
          </button>

          <button
            type="button"
            onClick={handleSendToAdmin}
            disabled={!canSend || sending}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-cyan-200 hover:text-cyan-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <ClipboardList className="h-4 w-4" />
            {sending ? 'Sending...' : 'Send to admin'}
          </button>
        </form>

        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-cyan-600">Generated plan</p>
          <h2 className="mt-3 text-3xl font-black text-slate-950">Review before approval</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Once generated, you can send the plan to an admin and track the approval result in notifications.
          </p>

          <div className="mt-6 rounded-[28px] bg-slate-50 p-5">
            {generatedPlan ? (
              <div className="prose prose-slate max-w-none">
                <ReactMarkdown>{generatedPlan}</ReactMarkdown>
              </div>
            ) : (
              <EmptyState
                title="No plan generated yet"
                description="Fill the form and generate a trip plan to preview the AI output here."
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const Field = ({ label, value, onChange, type = 'text' }) => (
  <label className="space-y-2">
    <span className="ml-1 text-xs font-bold uppercase tracking-[0.3em] text-slate-400">{label}</span>
    <input
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-cyan-300"
    />
  </label>
)

const SelectField = ({ label, value, onChange, options }) => (
  <label className="space-y-2">
    <span className="ml-1 text-xs font-bold uppercase tracking-[0.3em] text-slate-400">{label}</span>
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-cyan-300"
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </label>
)

