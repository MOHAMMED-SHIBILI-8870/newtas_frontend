import { useEffect, useState } from 'react'
import { User, Mail, Phone, MapPin, CreditCard, Shield, Lock, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { fetchDriverProfile, updateDriverProfile } from '../../../services/driverService'
import { getApiErrorMessage } from '../../../infrastructure/api/apiHelpers'
import AdminPageHeader from '../../../features/admin/components/AdminPageHeader'

export default function Profile() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  // Fields to edit
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')

  // Password fields
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const loadProfile = async () => {
    try {
      const data = await fetchDriverProfile()
      setProfile(data)
      setPhone(data?.phone || '')
      setAddress(data?.address || '')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to fetch profile details'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadProfile()
  }, [])

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    try {
      setUpdating(true)
      await updateDriverProfile({ phone, address })
      toast.success('Profile contact details updated successfully')
      await loadProfile()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to update contact info'))
    } finally {
      setUpdating(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    try {
      setUpdating(true)
      await updateDriverProfile({
        phone,
        address,
        old_password: oldPassword,
        new_password: newPassword,
      })
      toast.success('Password updated successfully')
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to change password'))
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 p-20 text-yellow-400">
        <Loader2 className="animate-spin" />
        <span>Loading profile...</span>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="My Account"
        title="Profile Settings"
        description="View your driver partner profile details and manage your security settings."
      />

      <div className="grid gap-8 md:grid-cols-3">
        {/* Read-Only Credentials Profile Card */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur-xl space-y-6">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-yellow-400 text-slate-950 font-black">
              {profile?.name ? profile.name[0].toUpperCase() : 'D'}
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">{profile?.name}</h3>
              <p className="text-xs text-white/50">Driver Partner</p>
            </div>
          </div>

          <div className="space-y-4 text-sm">
            <div className="space-y-1">
              <span className="text-white/40 block text-xs flex items-center gap-1.5">
                <Mail size={12} /> Email Address
              </span>
              <span className="font-semibold text-white break-all">{profile?.email}</span>
            </div>

            <div className="space-y-1">
              <span className="text-white/40 block text-xs flex items-center gap-1.5">
                <CreditCard size={12} /> License Number
              </span>
              <span className="font-semibold text-white">{profile?.license_number}</span>
            </div>

            <div className="space-y-1">
              <span className="text-white/40 block text-xs flex items-center gap-1.5">
                <Shield size={12} /> License Expiry
              </span>
              <span className="font-semibold text-white">
                {profile?.license_expiry ? new Date(profile.license_expiry).toLocaleDateString() : 'N/A'}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-white/40 block text-xs flex items-center gap-1.5">
                <Shield size={12} /> Account Status
              </span>
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold uppercase tracking-wider ${
                profile?.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
              }`}>
                {profile?.status}
              </span>
            </div>
          </div>
        </div>

        {/* Edit Form Contact Details Card */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur-xl md:col-span-2 space-y-6">
          <div>
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <Phone size={18} className="text-yellow-400" />
              Contact Details
            </h3>
            <p className="text-white/50 text-xs">Update your phone number and physical address details.</p>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="ml-1 text-xs font-bold uppercase text-white/50 flex items-center gap-1.5">
                <Phone size={12} /> Phone Number
              </label>
              <input
                required
                type="text"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 outline-none text-white transition focus:ring-2 focus:ring-yellow-400/20 focus:border-yellow-400 placeholder-white/20"
              />
            </div>

            <div>
              <label className="ml-1 text-xs font-bold uppercase text-white/50 flex items-center gap-1.5">
                <MapPin size={12} /> Physical Address
              </label>
              <textarea
                required
                rows={3}
                placeholder="Enter your street address..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 outline-none text-white transition focus:ring-2 focus:ring-yellow-400/20 focus:border-yellow-400 placeholder-white/20 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={updating}
              className="inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-6 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-yellow-500/10 transition hover:bg-yellow-300 disabled:opacity-75"
            >
              {updating ? <Loader2 className="animate-spin" size={16} /> : 'Save Changes'}
            </button>
          </form>

          {/* Change Password Card */}
          <div className="border-t border-white/10 pt-6 space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                <Lock size={18} className="text-yellow-400" />
                Change Password
              </h3>
              <p className="text-white/50 text-xs">Secure your account by changing your login credentials.</p>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="ml-1 text-xs font-bold uppercase text-white/50">Current Password</label>
                  <input
                    required
                    type="password"
                    placeholder="••••••••"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 outline-none text-white transition focus:ring-2 focus:ring-yellow-400/20 focus:border-yellow-400 placeholder-white/20"
                  />
                </div>
                <div>
                  <label className="ml-1 text-xs font-bold uppercase text-white/50">New Password</label>
                  <input
                    required
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 outline-none text-white transition focus:ring-2 focus:ring-yellow-400/20 focus:border-yellow-400 placeholder-white/20"
                  />
                </div>
                <div>
                  <label className="ml-1 text-xs font-bold uppercase text-white/50">Confirm Password</label>
                  <input
                    required
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 outline-none text-white transition focus:ring-2 focus:ring-yellow-400/20 focus:border-yellow-400 placeholder-white/20"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={updating}
                className="inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-6 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-yellow-500/10 transition hover:bg-yellow-300 disabled:opacity-75"
              >
                {updating ? <Loader2 className="animate-spin" size={16} /> : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
