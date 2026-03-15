import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  PlusIcon,
  FilterIcon,
  Edit2Icon,
  Trash2Icon,
} from 'lucide-react'
import type { Transaction, Category, Wallet } from '../data/mockData'
import { Modal } from '../Components/Modal'
interface TransactionsProps {
  transactions: Transaction[]
  categories: Category[]
  wallets: Wallet[]
  onAddTransaction: (txn: Omit<Transaction, 'id' | 'createdAt'>) => void
  onDeleteTransaction: (id: string) => void
}
export function Transactions({
  transactions,
  categories,
  wallets,
  onAddTransaction,
  onDeleteTransaction,
}: TransactionsProps) {
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>(
    'all',
  )
  const [isModalOpen, setIsModalOpen] = useState(false)
  // Form State
  const [formType, setFormType] = useState<'income' | 'expense'>('expense')
  const [formTitle, setFormTitle] = useState('')
  const [formAmount, setFormAmount] = useState('')
  const [formCategory, setFormCategory] = useState('')
  const [formWallet, setFormWallet] = useState('')
  const [formDate, setFormDate] = useState(
    new Date().toISOString().split('T')[0],
  )
  const [formNote, setFormNote] = useState('')
  const filteredTransactions = transactions
    .filter((t) => filterType === 'all' || t.transactionType === filterType)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formTitle || !formAmount || !formCategory || !formWallet) return
    onAddTransaction({
      userId: 'user_123',
      title: formTitle,
      amount: parseFloat(formAmount),
      transactionType: formType,
      categoryId: formCategory,
      walletId: formWallet,
      date: formDate,
      note: formNote,
    })
    setIsModalOpen(false)
    // Reset form
    setFormTitle('')
    setFormAmount('')
    setFormNote('')
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
          <h1 className="text-2xl font-bold text-slate-900">Transactions</h1>
          <p className="text-slate-500 mt-1">
            Manage your daily income and expenses.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors shadow-sm"
        >
          <PlusIcon className="w-5 h-5" />
          Add Transaction
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg text-slate-600">
          <FilterIcon className="w-4 h-4" />
          <span className="text-sm font-medium">Filter by:</span>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          {(['all', 'income', 'expense'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md capitalize transition-colors ${filterType === type ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Title</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Wallet</th>
                <th className="px-6 py-4 font-medium text-right">Amount</th>
                <th className="px-6 py-4 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    No transactions found.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((txn, idx) => {
                  const category = categories.find(
                    (c) => c.id === txn.categoryId,
                  )
                  const wallet = wallets.find((w) => w.id === txn.walletId)
                  const isIncome = txn.transactionType === 'income'
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
                      key={txn.id}
                      className="hover:bg-slate-50 transition-colors group"
                    >
                      <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">
                        {new Date(txn.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-900">
                          {txn.title}
                        </p>
                        {txn.note && (
                          <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[200px]">
                            {txn.note}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${isIncome ? 'bg-emerald-500' : 'bg-rose-500'}`}
                          />
                          <span className="text-sm text-slate-700">
                            {category?.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {wallet?.name}
                      </td>
                      <td
                        className={`px-6 py-4 text-right font-medium whitespace-nowrap ${isIncome ? 'text-emerald-600' : 'text-slate-900'}`}
                      >
                        {isIncome ? '+' : '-'}${txn.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
                            <Edit2Icon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteTransaction(txn.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
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

      {/* Add Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Transaction"
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
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors"
            >
              Save Transaction
            </button>
          </div>
        }
      >
        <form className="space-y-4">
          {/* Type Toggle */}
          <div className="flex p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => setFormType('expense')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${formType === 'expense' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setFormType('income')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${formType === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Income
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="e.g. Lunch at Cafe"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Amount ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={formAmount}
                onChange={(e) => setFormAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Category
              </label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
              >
                <option value="">Select...</option>
                {categories
                  .filter((c) => c.type === formType)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Wallet
              </label>
              <select
                value={formWallet}
                onChange={(e) => setFormWallet(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
              >
                <option value="">Select...</option>
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Note (Optional)
            </label>
            <textarea
              rows={2}
              value={formNote}
              onChange={(e) => setFormNote(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
            />
          </div>
        </form>
      </Modal>
    </motion.div>
  )
}
