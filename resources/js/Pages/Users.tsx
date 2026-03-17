import React, { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PlusIcon,
  SearchIcon,
  FilterIcon,
  Edit2Icon,
  Trash2Icon,
  UsersIcon,
  UserCheckIcon,
  UserPlusIcon,
  ShieldAlertIcon,
  EyeIcon,
  EyeOffIcon,
  KeyRoundIcon,
  RefreshCwIcon,
} from 'lucide-react'
import { adminApi } from '@/services/api'
import { Modal } from '../Components/Modal'
import { StatCard } from '../Components/StatCard'
import {
  confirmDelete,
  showDeletedToast,
  showSavedToast,
} from '../Components/confirmDelete'

interface User {
  id: string
  username: string
  name: string
  email: string
  role?: 'admin' | 'user'
  isActive: boolean
  dateJoined: string
  password: string
}

export function Users() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [formUsername, setFormUsername] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formPassword, setFormPassword] = useState('')
  const [formIsActive, setFormIsActive] = useState(true)
  const [showFormPassword, setShowFormPassword] = useState(false)

  // Change Password Modal
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [passwordChangeUserId, setPasswordChangeUserId] = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  // Password visibility per row
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set())
  const togglePasswordVisibility = (userId: string) => {
    setVisiblePasswords((prev) => {
      const next = new Set(prev)
      if (next.has(userId)) {
        next.delete(userId)
      } else {
        next.add(userId)
      }
      return next
    })
  }

  // Stats
  const totalUsers = users.length
  const activeUsers = users.filter((u) => u.isActive).length
  const newThisMonth = users.filter((u) => {
    const joinDate = new Date(u.dateJoined)
    const now = new Date()
    return (
      joinDate.getMonth() === now.getMonth() &&
      joinDate.getFullYear() === now.getFullYear()
    )
  }).length

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users
      .filter((u) => {
        const matchesSearch =
          u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.email.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus =
          statusFilter === 'all' ||
          (statusFilter === 'active' && u.isActive) ||
          (statusFilter === 'inactive' && !u.isActive)
        return matchesSearch && matchesStatus
      })
      .sort(
        (a, b) =>
          new Date(b.dateJoined).getTime() - new Date(a.dateJoined).getTime(),
      )
  }, [users, searchQuery, statusFilter])

  // Fetch users from API
  const fetchUsers = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true)
      setError(null)
      const response = await adminApi.users()
      const apiUsers = (response.data?.data || []).map((u: any) => ({
        id: u.id,
        username: u.name || u.email.split('@')[0],
        name: u.name || u.email.split('@')[0],
        email: u.email,
        role: u.role || 'user',
        isActive: true,
        dateJoined: u.created_at || new Date().toISOString(),
        password: '••••••••',
      }))
      setUsers(apiUsers)
    } catch (err: any) {
      setError('Unable to load users.')
      console.error('Failed to fetch users:', err)
    } finally {
      setLoading(false)
    }
  }

  // Refresh users function
  const refreshUsers = async () => {
    setIsRefreshing(true)
    try {
      await fetchUsers(false)
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    void fetchUsers()
  }, [])

  const openAddModal = () => {
    setEditingUserId(null)
    setFormUsername('')
    setFormEmail('')
    setFormPassword('')
    setFormIsActive(true)
    setShowFormPassword(false)
    setIsModalOpen(true)
  }

  const openEditModal = (user: User) => {
    setEditingUserId(user.id)
    setFormUsername(user.username)
    setFormEmail(user.email)
    setFormPassword(user.password)
    setFormIsActive(user.isActive)
    setShowFormPassword(false)
    setIsModalOpen(true)
  }

  const openPasswordModal = (user: User) => {
    setPasswordChangeUserId(user.id)
    setNewPassword('')
    setConfirmPassword('')
    setShowNewPassword(false)
    setShowConfirmPassword(false)
    setPasswordError('')
    setIsPasswordModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formUsername || !formEmail) return

    try {
      if (editingUserId) {
        await adminApi.updateUser(editingUserId, {
          name: formUsername,
          email: formEmail,
          password: formPassword,
        })
        showSavedToast('User updated')
      } else {
        await adminApi.createUser({
          name: formUsername,
          email: formEmail,
          password: formPassword,
        })
        showSavedToast('User created')
      }
      setIsModalOpen(false)
      await refreshUsers()
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save user')
    }
  }

  const handlePasswordChange = async () => {
    if (!newPassword) {
      setPasswordError('Please enter a new password.')
      return
    }
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.')
      return
    }
    if (passwordChangeUserId) {
      try {
        await adminApi.updateUserPassword(passwordChangeUserId, newPassword)
        showSavedToast('Password updated')
        setIsPasswordModalOpen(false)
        await refreshUsers()
      } catch (err: any) {
        setPasswordError(err?.response?.data?.message || 'Failed to update password')
      }
    }
  }

  const handleDeleteUser = async (id: string) => {
    const confirmed = await confirmDelete('user')
    if (!confirmed) return

    try {
      await adminApi.deleteUser(id)
      showDeletedToast('Deleted!', 'User has been deleted.')
      await refreshUsers()
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to delete user')
    }
  }

  const passwordChangeUser = users.find((u) => u.id === passwordChangeUserId)

  return (
    <motion.div
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      className="max-w-7xl mx-auto space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
          <p className="text-slate-500 mt-1">Manage system access and user accounts.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refreshUsers}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 rounded-lg font-medium transition-colors"
            title="Refresh user list"
          >
            <RefreshCwIcon className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors shadow-sm"
          >
            <PlusIcon className="w-5 h-5" />
            Add User
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={totalUsers.toString()}
          icon={UsersIcon}
          colorClass="bg-blue-100 text-blue-600"
        />
        <StatCard
          title="Active Users"
          value={activeUsers.toString()}
          icon={UserCheckIcon}
          colorClass="bg-emerald-100 text-emerald-600"
        />
        <StatCard
          title="New This Month"
          value={newThisMonth.toString()}
          icon={UserPlusIcon}
          colorClass="bg-purple-100 text-purple-600"
        />
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg text-slate-600 hidden sm:flex">
            <FilterIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Status:</span>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-lg w-full sm:w-auto">
            {(['all', 'active', 'inactive'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`flex-1 sm:flex-none px-4 py-1.5 text-sm font-medium rounded-md capitalize transition-colors ${
                  statusFilter === status
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Password</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Date Joined</th>
                <th className="px-6 py-4 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <ShieldAlertIcon className="w-12 h-12 text-slate-300 mb-3" />
                      <p className="text-lg font-medium text-slate-900">
                        No users found
                      </p>
                      <p className="text-sm">Try adjusting your search or filters.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, idx) => {
                  const isPasswordVisible = visiblePasswords.has(user.id)
                  return (
                    <motion.tr
                      initial={{
                        opacity: 0,
                        y: 10,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        delay: idx * 0.03,
                      }}
                      key={user.id}
                      className="hover:bg-slate-50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 border border-slate-200 text-slate-600 font-medium">
                            {user.username.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">
                              {user.username}
                            </p>
                            <p className="text-sm text-slate-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <code className="text-sm font-mono bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md text-slate-700 select-all">
                            {isPasswordVisible ? user.password : '••••••••••'}
                          </code>
                          <button
                            onClick={() => togglePasswordVisibility(user.id)}
                            className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
                            title={
                              isPasswordVisible ? 'Hide password' : 'Show password'
                            }
                          >
                            {isPasswordVisible ? (
                              <EyeOffIcon className="w-4 h-4" />
                            ) : (
                              <EyeIcon className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            user.isActive
                              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                              user.isActive ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          ></span>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">
                        {new Date(user.dateJoined).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openPasswordModal(user)}
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                            title="Change Password"
                          >
                            <KeyRoundIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(user)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title="Edit User"
                          >
                            <Edit2Icon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                            title="Delete User"
                          >
                            <Trash2Icon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUserId ? 'Edit User' : 'Add New User'}
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors"
            >
              {editingUserId ? 'Save Changes' : 'Create User'}
            </button>
          </div>
        }
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Username
            </label>
            <input
              type="text"
              value={formUsername}
              onChange={(e) => setFormUsername(e.target.value)}
              placeholder="e.g. john_doe"
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              placeholder="john@example.com"
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showFormPassword ? 'text' : 'password'}
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
                placeholder={editingUserId ? 'Current password' : 'Set a password'}
                required={!editingUserId}
                className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowFormPassword(!showFormPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
              >
                {showFormPassword ? (
                  <EyeOffIcon className="w-4 h-4" />
                ) : (
                  <EyeIcon className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                />
                <div
                  className={`block w-10 h-6 rounded-full transition-colors ${
                    formIsActive ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                ></div>
                <div
                  className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                    formIsActive ? 'transform translate-x-4' : ''
                  }`}
                ></div>
              </div>
              <div className="ml-3 text-sm font-medium text-slate-700">
                Active Account
              </div>
            </label>
            <p className="text-xs text-slate-500 mt-1 ml-13">
              Inactive users will not be able to log in to the system.
            </p>
          </div>
        </form>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title="Change Password"
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsPasswordModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handlePasswordChange}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors"
            >
              Update Password
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          {passwordChangeUser && (
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 text-slate-600 font-medium">
                {passwordChangeUser.username.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-slate-900">
                  {passwordChangeUser.username}
                </p>
                <p className="text-sm text-slate-500">{passwordChangeUser.email}</p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Current Password
            </label>
            <div className="relative">
              <input
                type="text"
                value={passwordChangeUser?.password || ''}
                readOnly
                className="w-full px-3 py-2 pr-10 border border-slate-200 rounded-lg bg-slate-50 text-slate-600 font-mono text-sm cursor-default"
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400">
                <KeyRoundIcon className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value)
                  setPasswordError('')
                }}
                placeholder="Enter new password"
                className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
              >
                {showNewPassword ? (
                  <EyeOffIcon className="w-4 h-4" />
                ) : (
                  <EyeIcon className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  setPasswordError('')
                }}
                placeholder="Confirm new password"
                className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
              >
                {showConfirmPassword ? (
                  <EyeOffIcon className="w-4 h-4" />
                ) : (
                  <EyeIcon className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {passwordError && (
              <motion.div
                initial={{
                  opacity: 0,
                  height: 0,
                }}
                animate={{
                  opacity: 1,
                  height: 'auto',
                }}
                exit={{
                  opacity: 0,
                  height: 0,
                }}
                className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-700"
              >
                {passwordError}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Modal>
    </motion.div>
  )
}
