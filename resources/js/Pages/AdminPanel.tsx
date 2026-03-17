import React, { useState, useEffect, useMemo, Fragment } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ActivityIcon,
  AlertTriangleIcon,
  ArrowDownIcon,
  ArrowLeftRightIcon,
  ArrowUpIcon,
  CheckCircle2Icon,
  ChevronUpIcon,
  ClockIcon,
  DatabaseIcon,
  EyeIcon,
  InfoIcon,
  RefreshCwIcon,
  SearchIcon,
  ServerIcon,
  TargetIcon,
  TagIcon,
  WalletIcon,
  UsersIcon,
  ShieldIcon,
  ShieldCheckIcon,
  UserCheckIcon,
  UserXIcon,
  XIcon,
} from 'lucide-react'
import { StatCard } from '@/Components/StatCard'
import { Modal } from '@/Components/Modal'
import { adminApi } from '@/services/api'
import { showSavedToast } from '@/Components/confirmDelete'
import type { User, Transaction, Wallet, Category, Budget } from '@/data/mockData'

type UserRole = 'admin' | 'user'

type ActivityLogType = 'success' | 'warning' | 'info'

interface ActivityLog {
  id: string
  user: string
  action: string
  target: string
  timestamp: string
  type: ActivityLogType
}

interface AdminProps {
  users: User[]
  transactions: Transaction[]
  wallets: Wallet[]
  categories: Category[]
  budgets: Budget[]
  onEditUser?: (user: User) => void
  onRefresh?: () => void
}

// Generate activity logs from actual user data
const generateActivityLogs = (
  transactions: Transaction[],
  wallets: Wallet[],
  budgets: Budget[],
  users: User[],
  categories: Category[],
): ActivityLog[] => {
  const logs: ActivityLog[] = []
  let timeOffset = 0

  // Add transaction activities
  transactions.forEach((t, idx) => {
    const user = users.find((u) => u.id === t.userId)
    const wallet = wallets.find((w) => w.id === t.walletId)
    const timestamp = new Date(Date.now() - timeOffset * 1000 * 60).toISOString()
    
    logs.push({
      id: `txn_${t.id}`,
      user: user?.name || user?.username || 'Unknown',
      action: t.transactionType === 'income' ? 'Received income' : 'Made a transaction',
      target: `${wallet?.name || 'Wallet'} - ${t.title}`,
      timestamp,
      type: t.transactionType === 'income' ? 'success' : 'info',
    })
    timeOffset += 15 // 15 minutes between activities
  })

  // Add wallet creation activities
  wallets.forEach((w, idx) => {
    const user = users.find((u) => u.id === w.userId)
    const timestamp = new Date(Date.now() - timeOffset * 1000 * 60).toISOString()
    
    logs.push({
      id: `wallet_${w.id}`,
      user: user?.name || user?.username || 'Unknown',
      action: 'Created a new wallet',
      target: w.name,
      timestamp,
      type: 'success',
    })
    timeOffset += 20
  })

  // Add budget creation activities
  budgets.forEach((b, idx) => {
    const user = users.find((u) => u.id === b.userId)
    const category = categories.find((c: Category) => c.id === b.categoryId)
    const timestamp = new Date(Date.now() - timeOffset * 1000 * 60).toISOString()
    
    logs.push({
      id: `budget_${b.id}`,
      user: user?.name || user?.username || 'Unknown',
      action: 'Set a budget limit',
      target: `${category?.name || 'Category'} - $${b.limitAmount}`,
      timestamp,
      type: 'info',
    })
    timeOffset += 25
  })

  // Sort by timestamp (newest first)
  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}



export function Admin({
  users,
  transactions,
  wallets,
  categories,
  budgets,
  onEditUser,
  onRefresh,
}: AdminProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all')
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])
  const [displayedLogsCount, setDisplayedLogsCount] = useState(3)
  const [isLoadingMoreLogs, setIsLoadingMoreLogs] = useState(false)
  const [isRefreshingLogs, setIsRefreshingLogs] = useState(false)
  const [stats, setStats] = useState<{
    totalUsers: number
    adminCount: number
    activeCount: number
    inactiveCount: number
    totalBalance: number
    totalTransactions: number
    totalCategories: number
    totalBudgets: number
  } | null>(null)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    userId: string
    newRole: UserRole
    username: string
  }>({
    isOpen: false,
    userId: '',
    newRole: 'user',
    username: '',
  })

  // Fetch activity logs and stats on mount
  useEffect(() => {
    const fetchActivityLogs = async () => {
      try {
        const response = await adminApi.activityLogs()
        setActivityLogs(response.data)
      } catch (err) {
        console.error('Failed to fetch activity logs:', err)
        // Generate logs from actual user data as fallback
        const generatedLogs = generateActivityLogs(transactions, wallets, budgets, users, categories)
        setActivityLogs(generatedLogs.length > 0 ? generatedLogs : [])
      }
    }

    const fetchStats = async () => {
      try {
        const response = await adminApi.stats()
        setStats(response.data)
      } catch (err) {
        console.error('Failed to fetch stats:', err)
        // Immediately use fallback calculation
        updateLocalStats()
      }
    }

    fetchActivityLogs()
    fetchStats()
  }, [transactions, wallets, budgets, users, categories])

  // Update stats whenever data changes
  useEffect(() => {
    updateLocalStats()
  }, [users, transactions, wallets, categories, budgets])

  const updateLocalStats = () => {
    setStats({
      totalUsers: users.length,
      adminCount: users.filter((u) => u.role === 'admin').length,
      activeCount: users.filter((u) => u.isActive).length,
      inactiveCount: users.filter((u) => !u.isActive).length,
      totalBalance: wallets.reduce((s, w) => s + (w.balance || 0), 0),
      totalTransactions: transactions.length,
      totalCategories: categories.length,
      totalBudgets: budgets.length,
    })
  }

  // Stats
  const calculatedTotalBalance = wallets.reduce((s, w) => s + (w.balance || 0), 0)
  const totalUsers = stats?.totalUsers ?? users.length
  const adminCount = stats?.adminCount ?? users.filter((u) => u.role === 'admin').length
  const activeCount = stats?.activeCount ?? users.filter((u) => u.isActive).length
  const inactiveCount = stats?.inactiveCount ?? users.filter((u) => !u.isActive).length
  const totalBalance = stats?.totalBalance !== undefined && stats?.totalBalance !== null ? stats.totalBalance : calculatedTotalBalance
  const totalTransactions = stats?.totalTransactions ?? transactions.length
  const totalCategories = stats?.totalCategories ?? categories.length
  const totalBudgets = stats?.totalBudgets ?? budgets.length

  // Selected user data
  const selectedUser = users.find((u) => u.id === selectedUserId)
  const selectedUserWallets = wallets.filter((w) => w.userId === selectedUserId)
  const selectedUserTransactions = transactions
    .filter((t) => t.userId === selectedUserId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  const selectedUserCategories = categories.filter(
    (c) => c.userId === selectedUserId,
  )
  const selectedUserBudgets = budgets.filter((b) => b.userId === selectedUserId)

  // Per-user summary for the table
  const getUserSummary = (userId: string) => {
    const userWallets = wallets.filter((w) => w.userId === userId)
    const userTxns = transactions.filter((t) => t.userId === userId)
    const userBudgets = budgets.filter((b) => b.userId === userId)
    const totalBal = userWallets.reduce((s, w) => s + w.balance, 0)
    return {
      walletCount: userWallets.length,
      transactionCount: userTxns.length,
      budgetCount: userBudgets.length,
      totalBalance: totalBal,
    }
  }

  const filteredUsers = useMemo(() => {
    return users
      .filter((u) => {
        const matchesSearch =
          u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.email.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesRole =
          roleFilter === 'all' ||
          (roleFilter === 'admin' && u.role === 'admin') ||
          (roleFilter === 'user' && u.role === 'user')
        return matchesSearch && matchesRole
      })
      .sort((a, b) => {
        if (a.role === 'admin' && b.role !== 'admin') return -1
        if (a.role !== 'admin' && b.role === 'admin') return 1
        return a.username?.localeCompare(b.username ?? '') ?? 0
      })
  }, [users, searchQuery, roleFilter])

  const openConfirmModal = (
    userId: string,
    newRole: UserRole,
    username: string,
  ) => {
    setConfirmModal({
      isOpen: true,
      userId,
      newRole,
      username,
    })
  }

  const displayedLogs = activityLogs.slice(0, displayedLogsCount)
  const hasMoreLogs = activityLogs.length > displayedLogsCount

  const refreshActivityLogs = async () => {
    setIsRefreshingLogs(true)
    try {
      const response = await adminApi.activityLogs()
      setActivityLogs(response.data)
      setDisplayedLogsCount(3) // Reset to showing first 3
    } catch (err) {
      console.error('Failed to refresh activity logs:', err)
    } finally {
      setIsRefreshingLogs(false)
    }
  }

  const handleLoadMoreLogs = async () => {
    setIsLoadingMoreLogs(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
      setDisplayedLogsCount((prev) => prev + 3)
    } finally {
      setIsLoadingMoreLogs(false)
    }
  }

  const handleRoleChange = async () => {
    try {
      await adminApi.updateUserRole(confirmModal.userId, confirmModal.newRole)
      const user = users.find((u) => u.id === confirmModal.userId)
      if (user && onEditUser) {
        onEditUser({ ...user, role: confirmModal.newRole })
      }
      showSavedToast('Role updated', `User role changed to ${confirmModal.newRole}`)
      
      // Refresh stats and activity logs immediately
      try {
        const response = await adminApi.stats()
        setStats(response.data)
      } catch (err) {
        console.error('Failed to refresh stats:', err)
      }
      
      await refreshActivityLogs()
    } catch (err: any) {
      console.error('Failed to update user role:', err)
    }
    setConfirmModal({
      isOpen: false,
      userId: '',
      newRole: 'user',
      username: '',
    })
  }

  const handleStatusToggle = async (userId: string, newStatus: boolean) => {
    try {
      await adminApi.updateUserStatus(userId, newStatus)
      const user = users.find((u) => u.id === userId)
      if (user && onEditUser) {
        onEditUser({ ...user, isActive: newStatus })
      }
      showSavedToast('Status updated', `User is now ${newStatus ? 'Active' : 'Inactive'}`)
      
      // Refresh stats and activity logs immediately
      try {
        const response = await adminApi.stats()
        setStats(response.data)
      } catch (err) {
        console.error('Failed to refresh stats:', err)
      }
      
      await refreshActivityLogs()
    } catch (err: any) {
      console.error('Failed to update user status:', err)
    }
  }

  const formatTimestamp = (ts: string) => {
    const date = new Date(ts)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays === 1) return 'Yesterday'
    return `${diffDays}d ago`
  }

  const getLogIcon = (type: ActivityLogType) => {
    switch (type) {
      case 'success':
        return <CheckCircle2Icon className="w-4 h-4 text-emerald-500" />
      case 'warning':
        return <AlertTriangleIcon className="w-4 h-4 text-amber-500" />
      case 'info':
        return <InfoIcon className="w-4 h-4 text-blue-500" />
    }
  }

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
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 bg-amber-100 rounded-xl">
            <ShieldCheckIcon className="w-6 h-6 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Panel</h1>
        </div>
        <p className="text-slate-500 mt-1 ml-14">
          Full system control — view all users, their data, and manage roles.
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={totalUsers.toString()}
          icon={UsersIcon}
          colorClass="bg-blue-100 text-blue-600"
          delay={0.1}
        />
        <StatCard
          title="Admins"
          value={adminCount.toString()}
          icon={ShieldCheckIcon}
          colorClass="bg-amber-100 text-amber-600"
          delay={0.2}
        />
        <StatCard
          title="Active Users"
          value={activeCount.toString()}
          icon={UserCheckIcon}
          colorClass="bg-emerald-100 text-emerald-600"
          delay={0.3}
        />
        <StatCard
          title="Inactive Users"
          value={inactiveCount.toString()}
          icon={UserXIcon}
          colorClass="bg-rose-100 text-rose-600"
          delay={0.4}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Health */}
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.5,
          }}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6"
        >
          <h2 className="text-lg font-semibold text-slate-900 mb-5 flex items-center gap-2">
            <ServerIcon className="w-5 h-5 text-slate-400" />
            System Overview
          </h2>
          <div className="space-y-4">
            {[
              {
                icon: <ArrowLeftRightIcon className="w-5 h-5 text-blue-500" />,
                label: 'Total Transactions',
                value: totalTransactions,
              },
              {
                icon: <WalletIcon className="w-5 h-5 text-emerald-500" />,
                label: 'Total Balance (All Users)',
                value: `$${totalBalance.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                })}`,
              },
              {
                icon: <TagIcon className="w-5 h-5 text-purple-500" />,
                label: 'Total Categories',
                value: totalCategories,
              },
              {
                icon: <TargetIcon className="w-5 h-5 text-amber-500" />,
                label: 'Active Budgets',
                value: totalBudgets,
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span className="text-sm font-medium text-slate-700">
                    {item.label}
                  </span>
                </div>
                <span className="text-sm font-bold text-slate-900">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Activity Log */}
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.6,
          }}
          className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
        >
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ActivityIcon className="w-5 h-5 text-slate-400" />
              <h2 className="text-lg font-semibold text-slate-900">Recent Activity</h2>
            </div>
            <button
              onClick={refreshActivityLogs}
              disabled={isRefreshingLogs}
              className="p-1.5 text-slate-400 hover:text-amber-600 disabled:text-slate-300 transition-colors rounded-md hover:bg-amber-50"
              title="Refresh activity logs"
            >
              <RefreshCwIcon className={`w-4 h-4 ${isRefreshingLogs ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {displayedLogs.map((log, idx) => (
              <motion.div
                initial={{
                  opacity: 0,
                  x: -10,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  delay: 0.7 + idx * 0.04,
                }}
                key={log.id}
                className="px-6 py-3.5 flex items-center gap-4"
              >
                <div className="flex-shrink-0">{getLogIcon(log.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-800">
                    <span className="font-medium">{log.user}</span>{' '}
                    <span className="text-slate-500">{log.action}</span>{' '}
                    <span className="font-medium">{log.target}</span>
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 flex-shrink-0">
                  <ClockIcon className="w-3.5 h-3.5" />
                  {formatTimestamp(log.timestamp)}
                </div>
              </motion.div>
            ))}
            {hasMoreLogs && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="px-6 py-4 text-center border-t border-slate-100"
              >
                <button
                  onClick={handleLoadMoreLogs}
                  disabled={isLoadingMoreLogs}
                  className="text-sm font-medium text-amber-600 hover:text-amber-700 disabled:text-slate-400 transition-colors"
                >
                  {isLoadingMoreLogs ? 'Loading...' : `Load More (${activityLogs.length - displayedLogsCount} remaining)`}
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      {/* User Data Browser — the key admin feature */}
      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: 0.8,
        }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <ShieldIcon className="w-5 h-5 text-slate-400" />
            All Users & Their Data
          </h2>
        </div>

        {/* Search & Filter */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between mb-4">
          <div className="relative w-full sm:max-w-sm">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
          <div className="flex bg-slate-100 p-1 rounded-lg w-full sm:w-auto">
            {(['all', 'admin', 'user'] as const).map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`flex-1 sm:flex-none px-4 py-1.5 text-sm font-medium rounded-md capitalize transition-colors ${roleFilter === role ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* Users Table with Data Summary */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
                  <th className="px-6 py-4 font-medium">User</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-center">Wallets</th>
                  <th className="px-6 py-4 font-medium text-center">Transactions</th>
                  <th className="px-6 py-4 font-medium text-right">Balance</th>
                  <th className="px-6 py-4 font-medium text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user, idx) => {
                  const summary = getUserSummary(user.id)
                  const isSelected = selectedUserId === user.id
                  return (
                    <Fragment key={user.id}>
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
                          delay: 0.9 + idx * 0.03,
                        }}
                        className={`transition-colors cursor-pointer ${isSelected ? 'bg-amber-50' : 'hover:bg-slate-50'}`}
                        onClick={() =>
                          setSelectedUserId(isSelected ? null : user.id)
                        }
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-medium text-sm border ${user.role === 'admin' ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-slate-100 border-slate-200 text-slate-600'}`}
                            >
                              {user.username?.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{user.username || user.name}</p>
                              <p className="text-sm text-slate-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${user.role === 'admin' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-slate-50 text-slate-600 border border-slate-200'}`}
                          >
                            {user.role === 'admin' ? (
                              <ShieldCheckIcon className="w-3.5 h-3.5" />
                            ) : (
                              <UsersIcon className="w-3.5 h-3.5" />
                            )}
                            {user.role === 'admin' ? 'Admin' : 'User'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleStatusToggle(user.id, !user.isActive)}
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${user.isActive ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 hover:bg-emerald-50' : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-50'}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full mr-1.5 ${user.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`}
                            ></span>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm font-medium text-slate-700">
                            {summary.walletCount}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm font-medium text-slate-700">
                            {summary.transactionCount}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm font-bold text-slate-900">
                            ${summary.totalBalance.toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                            })}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedUserId(isSelected ? null : user.id)
                              }}
                              className={`p-1.5 rounded-md transition-colors ${isSelected ? 'text-amber-600 bg-amber-100' : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'}`}
                              title="View user data"
                            >
                              {isSelected ? (
                                <ChevronUpIcon className="w-4 h-4" />
                              ) : (
                                <EyeIcon className="w-4 h-4" />
                              )}
                            </button>
                            {user.role === 'admin' ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  openConfirmModal(
                                    user.id,
                                    'user',
                                    user.username || user.name,
                                  )
                                }}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                                title="Demote"
                              >
                                <ArrowDownIcon className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  openConfirmModal(
                                    user.id,
                                    'admin',
                                    user.username || user.name,
                                  )
                                }}
                                className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                                title="Promote"
                              >
                                <ArrowUpIcon className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </motion.tr>

                      {/* Expanded User Data Panel */}
                      <AnimatePresence>
                        {isSelected && (
                          <motion.tr
                            initial={{
                              opacity: 0,
                            }}
                            animate={{
                              opacity: 1,
                            }}
                            exit={{
                              opacity: 0,
                            }}
                          >
                            <td colSpan={7} className="p-0">
                              <motion.div
                                initial={{
                                  height: 0,
                                }}
                                animate={{
                                  height: 'auto',
                                }}
                                exit={{
                                  height: 0,
                                }}
                                className="overflow-hidden"
                              >
                                <div className="px-6 py-5 bg-slate-50 border-t border-slate-200 space-y-4">
                                  <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                                      <DatabaseIcon className="w-4 h-4 text-slate-400" />
                                      {selectedUser?.username || selectedUser?.name}'s Data
                                    </h3>
                                    <button
                                      onClick={() => setSelectedUserId(null)}
                                      className="p-1 text-slate-400 hover:text-slate-600 rounded"
                                    >
                                      <XIcon className="w-4 h-4" />
                                    </button>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {/* Wallets */}
                                    <div className="bg-white rounded-xl border border-slate-200 p-4">
                                      <div className="flex items-center gap-2 mb-3">
                                        <WalletIcon className="w-4 h-4 text-emerald-500" />
                                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                          Wallets ({selectedUserWallets.length})
                                        </span>
                                      </div>
                                      {selectedUserWallets.length === 0 ? (
                                        <p className="text-xs text-slate-400">No wallets</p>
                                      ) : (
                                        <div className="space-y-2">
                                          {selectedUserWallets.map((w) => (
                                            <div
                                              key={w.id}
                                              className="flex justify-between items-center text-sm"
                                            >
                                              <span className="text-slate-700">{w.name}</span>
                                              <span className="font-medium text-slate-900">
                                                ${w.balance.toLocaleString('en-US', {
                                                  minimumFractionDigits: 2,
                                                })}
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>

                                    {/* Recent Transactions */}
                                    <div className="bg-white rounded-xl border border-slate-200 p-4">
                                      <div className="flex items-center gap-2 mb-3">
                                        <ArrowLeftRightIcon className="w-4 h-4 text-blue-500" />
                                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                          Transactions ({selectedUserTransactions.length})
                                        </span>
                                      </div>
                                      {selectedUserTransactions.length === 0 ? (
                                        <p className="text-xs text-slate-400">No transactions</p>
                                      ) : (
                                        <div className="space-y-2">
                                          {selectedUserTransactions
                                            .slice(0, 4)
                                            .map((t) => (
                                              <div
                                                key={t.id}
                                                className="flex justify-between items-center text-sm"
                                              >
                                                <span className="text-slate-700 truncate max-w-[120px]">
                                                  {t.title}
                                                </span>
                                                <span
                                                  className={`font-medium ${t.transactionType === 'income' ? 'text-emerald-600' : 'text-slate-900'}`}
                                                >
                                                  {t.transactionType === 'income' ? '+' : '-'}
                                                  ${t.amount.toFixed(2)}
                                                </span>
                                              </div>
                                            ))}
                                          {selectedUserTransactions.length >
                                            4 && (
                                            <p className="text-xs text-slate-400">
                                              +{selectedUserTransactions.length - 4} more
                                            </p>
                                          )}
                                        </div>
                                      )}
                                    </div>

                                    {/* Categories */}
                                    <div className="bg-white rounded-xl border border-slate-200 p-4">
                                      <div className="flex items-center gap-2 mb-3">
                                        <TagIcon className="w-4 h-4 text-purple-500" />
                                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                          Categories ({selectedUserCategories.length})
                                        </span>
                                      </div>
                                      {selectedUserCategories.length === 0 ? (
                                        <p className="text-xs text-slate-400">No categories</p>
                                      ) : (
                                        <div className="flex flex-wrap gap-1.5">
                                          {selectedUserCategories.map((c) => (
                                            <span
                                              key={c.id}
                                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${c.type === 'income' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}
                                            >
                                              {c.name}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                    </div>

                                    {/* Budgets */}
                                    <div className="bg-white rounded-xl border border-slate-200 p-4">
                                      <div className="flex items-center gap-2 mb-3">
                                        <TargetIcon className="w-4 h-4 text-amber-500" />
                                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                          Budgets ({selectedUserBudgets.length})
                                        </span>
                                      </div>
                                      {selectedUserBudgets.length === 0 ? (
                                        <p className="text-xs text-slate-400">No budgets</p>
                                      ) : (
                                        <div className="space-y-2">
                                          {selectedUserBudgets.map((b) => {
                                            const cat = categories.find(
                                              (c) => c.id === b.categoryId,
                                            )
                                            const spent = transactions
                                              .filter(
                                                (t) =>
                                                  t.categoryId === b.categoryId &&
                                                  t.userId === selectedUserId &&
                                                  t.transactionType === 'expense',
                                              )
                                              .reduce((s, t) => s + t.amount, 0)
                                            const pct = Math.min(
                                              (spent / b.limitAmount) * 100,
                                              100,
                                            )
                                            return (
                                              <div key={b.id}>
                                                <div className="flex justify-between text-xs mb-1">
                                                  <span className="text-slate-700">
                                                    {cat?.name || 'Unknown'}
                                                  </span>
                                                  <span className="text-slate-500">
                                                    ${spent.toFixed(0)}/$ {b.limitAmount}
                                                  </span>
                                                </div>
                                                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                  <div
                                                    className={`h-full rounded-full ${pct > 90 ? 'bg-rose-500' : pct > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                                    style={{
                                                      width: `${pct}%`,
                                                    }}
                                                  />
                                                </div>
                                              </div>
                                            )
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            </td>
                          </motion.tr>
                        )}
                      </AnimatePresence>
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      {/* Confirm Role Change Modal */}
      <Modal
        isOpen={confirmModal.isOpen}
        onClose={() =>
          setConfirmModal({
            isOpen: false,
            userId: '',
            newRole: 'user',
            username: '',
          })
        }
        title={
          confirmModal.newRole === 'admin'
            ? 'Promote to Admin'
            : 'Demote to User'
        }
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() =>
                setConfirmModal({
                  isOpen: false,
                  userId: '',
                  newRole: 'user',
                  username: '',
                })
              }
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleRoleChange}
              className={`px-4 py-2 text-white rounded-lg font-medium transition-colors ${confirmModal.newRole === 'admin' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-rose-500 hover:bg-rose-600'}`}
            >
              {confirmModal.newRole === 'admin'
                ? 'Yes, Promote'
                : 'Yes, Demote'}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          {confirmModal.newRole === 'admin' ? (
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <ShieldCheckIcon className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">
                  Promote <strong>{confirmModal.username}</strong> to Admin?
                </p>
                <p className="text-sm text-amber-700 mt-1">
                  This user will gain full administrative privileges including
                  viewing all users' data, managing roles, and editing any
                  record.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 rounded-xl">
              <AlertTriangleIcon className="w-6 h-6 text-rose-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-rose-800">
                  Demote <strong>{confirmModal.username}</strong> to regular
                  User?
                </p>
                <p className="text-sm text-rose-700 mt-1">
                  This user will lose all administrative privileges and will
                  only be able to see and manage their own data.
                </p>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </motion.div>
  )
}
