import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  TargetIcon,
} from 'lucide-react'
import type { Budget, Category, Transaction } from '../data/mockData'
import { Modal } from '../Components/Modal'
interface BudgetsProps {
  budgets: Budget[]
  categories: Category[]
  transactions: Transaction[]
  onAddBudget: (budget: Omit<Budget, 'id'>) => void
}
export function Budgets({
  budgets,
  categories,
  transactions,
  onAddBudget,
}: BudgetsProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1)
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formCategory, setFormCategory] = useState('')
  const [formLimit, setFormLimit] = useState('')
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
  const currentBudgets = budgets.filter(
    (b) => b.month === currentMonth && b.year === currentYear,
  )
  const expenseCategories = categories.filter((c) => c.type === 'expense')
  const handleAddSubmit = () => {
    if (!formCategory || !formLimit) return
    onAddBudget({
      userId: 'user_123',
      categoryId: formCategory,
      limitAmount: parseFloat(formLimit),
      month: currentMonth,
      year: currentYear,
    })
    setIsModalOpen(false)
    setFormCategory('')
    setFormLimit('')
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
          <h1 className="text-2xl font-bold text-slate-900">Monthly Budgets</h1>
          <p className="text-slate-500 mt-1">
            Set limits and track your spending.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium transition-colors shadow-sm"
        >
          <PlusIcon className="w-5 h-5" />
          Add Budget
        </button>
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
            No budgets set
          </h3>
          <p className="text-slate-500 mb-4">
            You haven't set any budgets for this month yet.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-emerald-600 font-medium hover:text-emerald-700"
          >
            Create your first budget
          </button>
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
                    <h3 className="font-semibold text-slate-900">
                      {category?.name}
                    </h3>
                  </div>
                  <span
                    className={`text-sm font-medium px-2.5 py-1 rounded-full bg-slate-50 ${textColorClass}`}
                  >
                    {percent.toFixed(0)}% Used
                  </span>
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
                        You have{' '}
                        <span className={`font-semibold ${textColorClass}`}>
                          ${remaining.toFixed(2)}
                        </span>{' '}
                        left for this month.
                      </>
                    ) : (
                      <>
                        You are{' '}
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
        onClose={() => setIsModalOpen(false)}
        title="Create Budget"
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddSubmit}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium transition-colors"
            >
              Save Budget
            </button>
          </div>
        }
      >
        <div className="space-y-4">
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
        </div>
      </Modal>
    </motion.div>
  )
}
