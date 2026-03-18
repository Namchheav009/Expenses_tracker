import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  TargetIcon,
  Edit2Icon,
  Trash2Icon,
} from 'lucide-react'
import type { Budget, Category, Transaction, User } from '../data/mockData'
import { Modal } from '../Components/Modal'
import { confirmDelete, showDeletedToast, showSavedToast } from '../Components/confirmDelete'
import React from 'react'

interface BudgetsProps {
  budgets: Budget[]
  categories: Category[]
  transactions: Transaction[]
  onAddBudget: (budget: Omit<Budget, 'id'>) => void
  onUpdateBudget: (id: string, budget: Omit<Budget, 'id'>) => void
  onDeleteBudget: (id: string) => void
  isAdmin?: boolean
  users?: User[]
  currentUserId?: string
}

export function Budgets({
  budgets,
  categories,
  transactions,
  onAddBudget,
  onUpdateBudget,
  onDeleteBudget,
  isAdmin = false,
  users = [],
  currentUserId = '',
}: BudgetsProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1)
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formCategory, setFormCategory] = useState('')
  const [formLimit, setFormLimit] = useState('')
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
  const [filterUser, setFilterUser] = useState<string>('all')
  const [selectedUserId, setSelectedUserId] = useState<string>(currentUserId)
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]

  const getUserName = (userId: string) => {
    const user = users.find((u) => u.id === userId)
    return user?.username || user?.name || userId
  }

  const userIdsInBudgets = isAdmin
    ? [...new Set(budgets.map((b) => b.userId))]
    : []

  // Ensure admin has a valid selected user when opening the add UI
  React.useEffect(() => {
    if (isAdmin) {
      setSelectedUserId(users[0]?.id ?? currentUserId)
    } else {
      setSelectedUserId(currentUserId)
    }
  }, [isAdmin, users, currentUserId])
  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12)
      setCurrentYear((y) => y - 1)
    } else {
      setCurrentMonth((m) => m - 1)
    }
  }
  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1)
      setCurrentYear((y) => y + 1)
    } else {
      setCurrentMonth((m) => m + 1)
    }
  }
  const currentBudgets = budgets
    .filter((b) => b.month === currentMonth && b.year === currentYear)
    .filter((b) =>
      isAdmin
        ? filterUser === 'all' || b.userId === filterUser
        : b.userId === currentUserId,
    )
  const expenseCategories = categories.filter((c) => 
    c.type === 'expense' && 
    (isAdmin ? c.userId === selectedUserId : c.userId === currentUserId)
  )
  const resetForm = () => {
    setEditingBudget(null)
    setFormCategory('')
    setFormLimit('')
    setSelectedUserId(isAdmin ? users[0]?.id ?? currentUserId : currentUserId)
  }

  const handleDeleteBudget = async (id: string) => {
    const confirmed = await confirmDelete('budget')
    if (!confirmed) return

    onDeleteBudget(id)
    showDeletedToast('Deleted!', 'Your budget has been deleted.')
    window.dispatchEvent(new CustomEvent('admin:data-changed'))
  }

  const handleAddSubmit = () => {
    if (!formCategory || !formLimit) return

    const baseBudgetData = {
      categoryId: formCategory,
      limitAmount: parseFloat(formLimit),
      month: currentMonth,
      year: currentYear,
    }

    const budgetData = isAdmin
      ? {
          ...baseBudgetData,
          userId: selectedUserId || currentUserId,
        }
      : {
          ...baseBudgetData,
          userId: currentUserId,
        }

    if (editingBudget) {
      onUpdateBudget(editingBudget.id, budgetData)
      showSavedToast('Budget updated')
    } else {
      onAddBudget(budgetData)
      showSavedToast('Budget added')
    }
    window.dispatchEvent(new CustomEvent('admin:data-changed'))
    setIsModalOpen(false)
    resetForm()
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isAdmin ? 'All Budgets' : 'Monthly Budgets'}
          </h1>
          <p className="text-slate-500 mt-1">
            {isAdmin
              ? "View all users' budget limits and spending."
              : 'Set limits and track your spending.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <>
              <select
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white"
              >
                <option value="all">All Users</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.username || u.name}
                  </option>
                ))}
              </select>
              
            </>
          )}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium transition-colors shadow-sm"
          >
            <PlusIcon className="w-5 h-5" />
            Add Budget
          </button>
        </div>
      </div>

      {/* Month Selector */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <button
          onClick={handlePrevMonth}
          className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-semibold text-slate-900 min-w-[150px] text-center">
          {monthNames[currentMonth - 1]} {currentYear}
        </h2>
        <button
          onClick={handleNextMonth}
          className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
        >
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>

      {currentBudgets.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed">
          <TargetIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-1">
            No budgets found
          </h3>
          <p className="text-slate-500 mb-4">
            {isAdmin
              ? 'No users have budgets set for this month.'
              : "You haven't set any budgets for this month yet."}
          </p>
          {!isAdmin && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-emerald-600 font-medium hover:text-emerald-700"
            >
              Create your first budget
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentBudgets.map((budget, idx) => {
            const category = categories.find((c) => c.id === budget.categoryId)
            // Calculate spent
            const spent = transactions
              .filter((t) => {
                const d = new Date(t.date)
                return (
                  t.categoryId === budget.categoryId &&
                  t.userId === budget.userId &&
                  t.transactionType === 'expense' &&
                  d.getMonth() + 1 === currentMonth &&
                  d.getFullYear() === currentYear
                )
              })
              .reduce((sum, t) => sum + t.amount, 0)
            const percent = Math.min((spent / budget.limitAmount) * 100, 100)
            const remaining = budget.limitAmount - spent
            const colorClass =
              percent > 90
                ? 'bg-rose-500'
                : percent > 75
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
            const textColorClass =
              percent > 90
                ? 'text-rose-600'
                : percent > 75
                  ? 'text-amber-600'
                  : 'text-emerald-600'
            return (
              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.95,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                transition={{
                  delay: idx * 0.1,
                }}
                key={budget.id}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <TargetIcon className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {category?.name}
                      </h3>
                      {isAdmin && (
                        <span className="text-xs text-slate-400">
                          {getUserName(budget.userId)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-medium px-2.5 py-1 rounded-full bg-slate-50 ${textColorClass}`}
                    >
                      {percent.toFixed(0)}% Used
                    </span>
                    {(isAdmin || budget.userId === currentUserId) && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingBudget(budget)
                            setFormCategory(budget.categoryId)
                            setFormLimit(budget.limitAmount.toString())
                            if (isAdmin) {
                              setSelectedUserId(budget.userId)
                            }
                            setIsModalOpen(true)
                          }}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <Edit2Icon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteBudget(budget.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                        >
                          <Trash2Icon className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-500">
                      Spent:{' '}
                      <span className="font-medium text-slate-900">
                        ${spent.toFixed(2)}
                      </span>
                    </span>
                    <span className="text-slate-500">
                      Limit:{' '}
                      <span className="font-medium text-slate-900">
                        ${budget.limitAmount.toFixed(2)}
                      </span>
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{
                        width: 0,
                      }}
                      animate={{
                        width: `${percent}%`,
                      }}
                      transition={{
                        duration: 1,
                        delay: 0.2 + idx * 0.1,
                      }}
                      className={`h-full rounded-full ${colorClass}`}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <p className="text-sm text-slate-500">
                    {remaining >= 0 ? (
                      <>
                        {isAdmin
                          ? getUserName(budget.userId) + ' has'
                          : 'You have'}{' '}
                        <span className={`font-semibold ${textColorClass}`}>
                          ${remaining.toFixed(2)}
                        </span>{' '}
                        left for this month.
                      </>
                    ) : (
                      <>
                        {isAdmin
                          ? getUserName(budget.userId) + ' is'
                          : 'You are'}{' '}
                        <span className="font-semibold text-rose-600">
                          ${Math.abs(remaining).toFixed(2)}
                        </span>{' '}
                        over budget!
                      </>
                    )}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          resetForm()
        }}
        title={editingBudget ? 'Edit Budget' : 'Create Budget'}
        footer={
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false)
                resetForm()
              }}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddSubmit}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium transition-colors"
            >
              {editingBudget ? 'Update' : 'Save'} Budget
            </button>
          </div>
        }
      >
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleAddSubmit(); }}>
          {isAdmin && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                User
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.username || u.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Category
            </label>
            <select
              value={formCategory}
              onChange={(e) => setFormCategory(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white"
            >
              <option value="">Select an expense category...</option>
              {expenseCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Monthly Limit ($)
            </label>
            <input
              type="number"
              step="10"
              value={formLimit}
              onChange={(e) => setFormLimit(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            />
          </div>
          <div className="p-3 bg-blue-50 text-blue-700 rounded-lg text-sm">
            This budget will be created for{' '}
            <strong>
              {monthNames[currentMonth - 1]} {currentYear}
            </strong>
            .
          </div>
        </form>
      </Modal>
    </motion.div>
  )
}
