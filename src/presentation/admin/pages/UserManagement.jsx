import { useEffect, useState } from 'react'
import {
  Search,
  UserPlus,
  UserCheck,
  UserX,
  Shield,
  Loader2,
  X,
  Trash2,
} from 'lucide-react'
import toast from 'react-hot-toast'

import {
  fetchUsers,
  toggleBlockStatus,
  updateUserRole,
  createUserByAdmin,
  removeUser,
} from '../../../infrastructure/api/adminApi'
import { getApiErrorMessage } from '../../../infrastructure/api/apiHelpers'
import { useAuth } from '../../../domain/context/AuthContext'

const initialUser = {
  full_name: '',
  email: '',
  password: '',
  role: 'user',
}

export default function UserManagement() {
  const { user } = useAuth()
  const loggedInUserId = user?.id

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newUser, setNewUser] = useState(initialUser)

  const loadUsers = async () => {
    try {
      const data = await fetchUsers()
      setUsers(Array.isArray(data) ? data : [])
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to fetch users'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadUsers()
  }, [])

  const handleCreateUser = async (e) => {
    e.preventDefault()

    try {
      setIsSubmitting(true)
      await createUserByAdmin(newUser)
      toast.success('User created successfully')
      setIsModalOpen(false)
      setNewUser(initialUser)
      await loadUsers()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to create user'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleBlock = async (userId) => {
    if (userId === loggedInUserId) return

    try {
      await toggleBlockStatus(userId)
      setUsers((prevUsers) =>
        prevUsers.map((item) =>
          item.id === userId ? { ...item, is_blocked: !item.is_blocked } : item,
        ),
      )
      toast.success('User status updated successfully')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to update status'))
    }
  }

  const handleRoleUpdate = async (userId, newRole) => {
    if (userId === loggedInUserId) return

    try {
      await updateUserRole(userId, newRole)
      setUsers((prevUsers) =>
        prevUsers.map((item) => (item.id === userId ? { ...item, role: newRole } : item)),
      )
      toast.success('User role updated successfully')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to update role'))
    }
  }

  const handleDelete = async (userId) => {
    if (userId === loggedInUserId) return

    if (!window.confirm('Are you sure you want to delete this user?')) return

    try {
      const data = await removeUser(userId)
      toast.success(data?.message || 'User deleted successfully')
      setUsers((prevUsers) => prevUsers.filter((item) => item.id !== userId))
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to delete user'))
    }
  }

  const filteredUsers = users.filter((item) => {
    const name = item?.full_name || ''
    const email = item?.email || ''
    const role = item?.role || ''
    const currentStatus = item?.is_blocked ? 'Banned' : 'Active'

    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole =
      roleFilter === 'All' || role.toLowerCase() === roleFilter.toLowerCase()

    const matchesStatus = statusFilter === 'All' || currentStatus === statusFilter

    return matchesSearch && matchesRole && matchesStatus
  })

  return (
    <div className="space-y-8 font-sans">
      <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-4xl font-black text-white">Users</h1>
          <p className="text-white/60 text-sm mt-1">{filteredUsers.length} total registered users</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-4 py-2 font-bold text-slate-950 shadow-sm transition hover:bg-yellow-300"
        >
          <UserPlus size={18} /> Invite User
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/10 bg-zinc-950/60 p-4 shadow-sm">
        <div className="relative min-w-[260px] flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
          <input
            type="text"
            placeholder="Search by name or email..."
            className="w-full rounded-xl border border-white/10 bg-black py-2 pl-10 pr-4 text-white placeholder-white/30 outline-none transition focus:border-yellow-400/80"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="rounded-xl border border-white/10 bg-black px-4 py-2 text-sm font-semibold text-white outline-none focus:border-yellow-400/80"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="All" className="bg-zinc-950 text-white">Role: All</option>
          <option value="admin" className="bg-zinc-950 text-white">Admin</option>
          <option value="user" className="bg-zinc-950 text-white">User</option>
        </select>

        <select
          className="rounded-xl border border-white/10 bg-black px-4 py-2 text-sm font-semibold text-white outline-none focus:border-yellow-400/80"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All" className="bg-zinc-950 text-white">Status: All</option>
          <option value="Active" className="bg-zinc-950 text-white">Active</option>
          <option value="Banned" className="bg-zinc-950 text-white">Banned</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/60 backdrop-blur-md shadow-xl">
        {loading ? (
          <div className="flex items-center justify-center gap-2 p-20 text-yellow-300">
            <Loader2 className="animate-spin" />
            <span>Loading users...</span>
          </div>
        ) : (
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-white/10 bg-zinc-900/80 text-[11px] font-bold uppercase tracking-widest text-zinc-400">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {filteredUsers.map((item) => {
                const isCurrentUser = item.id === loggedInUserId

                return (
                  <tr
                    key={item.id}
                    className={`transition-colors ${
                      isCurrentUser ? 'border-l-4 border-yellow-400 bg-yellow-400/5' : 'hover:bg-white/5'
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-sm font-bold text-white">
                          {item.full_name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 font-bold text-white text-sm">
                            {item.full_name}
                            {isCurrentUser && (
                              <span className="rounded-full bg-yellow-400/20 px-2 py-0.5 text-[10px] text-yellow-355 font-bold">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-white/55">{item.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex w-fit items-center gap-2 rounded-lg border border-white/10 bg-black px-2 py-1">
                        <Shield size={14} className="text-white/40" />
                        <select
                          value={item.role}
                          disabled={isCurrentUser}
                          onChange={(e) => !isCurrentUser && handleRoleUpdate(item.id, e.target.value)}
                          className={`bg-transparent text-[11px] font-bold outline-none border-none ${
                            isCurrentUser ? 'cursor-not-allowed text-white/40' : 'cursor-pointer text-white'
                          }`}
                        >
                          <option value="user" className="bg-zinc-950 text-white">User</option>
                          <option value="admin" className="bg-zinc-950 text-white">Admin</option>
                        </select>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-wider border ${
                          !item.is_blocked
                            ? 'bg-emerald-450/10 text-emerald-300 border-emerald-450/20'
                            : 'bg-rose-500/10 text-rose-350 border-rose-550/20'
                        }`}
                      >
                        • {item.is_blocked ? 'Banned' : 'Active'}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          disabled={isCurrentUser}
                          title={
                            isCurrentUser
                              ? 'You cannot block yourself'
                              : item.is_blocked
                                ? 'Unblock User'
                                : 'Block User'
                          }
                          onClick={() => !isCurrentUser && handleToggleBlock(item.id)}
                          className={`rounded-lg p-2 transition-all ${
                            isCurrentUser
                              ? 'cursor-not-allowed opacity-40'
                              : item.is_blocked
                                ? 'text-emerald-400 hover:bg-emerald-400/10'
                                : 'text-rose-455 hover:bg-rose-500/10'
                          }`}
                        >
                          {item.is_blocked ? <UserCheck size={18} /> : <UserX size={18} />}
                        </button>

                        <button
                          disabled={isCurrentUser}
                          onClick={() => !isCurrentUser && handleDelete(item.id)}
                          className={`rounded-lg p-2 transition-all ${
                            isCurrentUser
                              ? 'cursor-not-allowed opacity-40'
                              : 'text-rose-455 hover:bg-rose-500/10 hover:text-rose-400'
                          }`}
                          title={isCurrentUser ? 'You cannot delete yourself' : 'Delete User'}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}

        {!loading && filteredUsers.length === 0 && (
          <div className="p-12 text-center font-medium text-white/45">
            No users found matching your search.
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-white/10 p-6">
              <h2 className="text-xl font-black text-white">Add New User</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-white/45 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 p-6">
              <div>
                <label className="ml-1 text-xs font-bold uppercase text-white/60">Full Name</label>
                <input
                  required
                  type="text"
                  placeholder="John Doe"
                  value={newUser.full_name}
                  onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black px-4 py-2 text-white outline-none transition focus:border-yellow-400/80 placeholder-white/30"
                />
              </div>

              <div>
                <label className="ml-1 text-xs font-bold uppercase text-white/60">Email Address</label>
                <input
                  required
                  type="email"
                  placeholder="john@example.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black px-4 py-2 text-white outline-none transition focus:border-yellow-400/80 placeholder-white/30"
                />
              </div>

              <div>
                <label className="ml-1 text-xs font-bold uppercase text-white/60">Password</label>
                <input
                  required
                  type="password"
                  placeholder="••••••••"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black px-4 py-2 text-white outline-none transition focus:border-yellow-400/80 placeholder-white/30"
                />
              </div>

              <div>
                <label className="ml-1 text-xs font-bold uppercase text-white/60">Assign Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black px-4 py-2 text-white outline-none transition focus:border-yellow-400/80"
                >
                  <option value="user" className="bg-zinc-950">User</option>
                  <option value="admin" className="bg-zinc-950">Admin</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 rounded-xl px-4 py-2 font-semibold text-white/70 hover:bg-white/5"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-400 px-4 py-2 font-bold text-slate-950 shadow-sm disabled:opacity-70 hover:bg-yellow-300"
                >
                  {isSubmitting ? <Loader2 size={18} className="animate-spin text-slate-950" /> : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
