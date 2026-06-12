import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { submitVerification } from '../../../infrastructure/api/tripService'
import toast from 'react-hot-toast'
import { getApiErrorMessage } from '../../../infrastructure/api/apiHelpers'
import { ShieldCheck, Upload, Users, User, MapPin, Phone } from 'lucide-react'

export default function TripVerificationPage() {
  const { bookingId } = useParams()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    fullName: '',
    address: '',
    phoneNumber: '',
    members: 1,
  })
  const [idImage, setIdImage] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setIdImage(e.target.files[0])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.fullName || !formData.address || !formData.phoneNumber || !idImage) {
      toast.error('Please fill in all fields and upload an ID image.')
      return
    }

    setSubmitting(true)

    try {
      const data = new FormData()
      data.append('booking_id', bookingId)
      data.append('full_name', formData.fullName)
      data.append('address', formData.address)
      data.append('phone_number', formData.phoneNumber)
      data.append('members', formData.members)
      data.append('id_image', idImage)

      await submitVerification(data)
      toast.success('Verification submitted successfully!')
      
      // Proceed to payment gateway
      navigate(`/payment/${bookingId}`)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to submit verification'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-cyan-600 shadow-sm">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-950">Verification Required</h1>
            <p className="text-sm text-slate-500">Please provide your details to complete your booking.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 flex items-center gap-2">
              <User className="h-4 w-4" /> Full Name
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              placeholder="As per your ID document"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 flex items-center gap-2">
              <MapPin className="h-4 w-4" /> Address
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              placeholder="Your complete residential address"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Phone className="h-4 w-4" /> Phone Number
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                placeholder="+91"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Users className="h-4 w-4" /> Total Members
              </label>
              <input
                type="number"
                name="members"
                min="1"
                value={formData.members}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Upload className="h-4 w-4" /> Upload Aadhar / ID Image
            </label>
            <div className="mt-2 flex justify-center rounded-xl border border-dashed border-slate-300 px-6 py-8 hover:bg-slate-50 transition">
              <div className="text-center">
                <Upload className="mx-auto h-8 w-8 text-slate-300" aria-hidden="true" />
                <div className="mt-4 flex text-sm leading-6 text-slate-600 justify-center">
                  <label
                    htmlFor="id_image"
                    className="relative cursor-pointer rounded-md bg-transparent font-semibold text-cyan-600 focus-within:outline-none hover:text-cyan-500"
                  >
                    <span>{idImage ? idImage.name : 'Upload a file'}</span>
                    <input id="id_image" name="id_image" type="file" className="sr-only" onChange={handleFileChange} accept="image/*,.pdf" />
                  </label>
                </div>
                {!idImage && <p className="text-xs leading-5 text-slate-500">PNG, JPG, PDF up to 10MB</p>}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200">
            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-600 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit Verification & Proceed to Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
