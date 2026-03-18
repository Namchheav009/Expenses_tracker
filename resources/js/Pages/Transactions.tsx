import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  PlusIcon,
  FilterIcon,
  Edit2Icon,
  Trash2Icon,
} from 'lucide-react'
import type { Transaction, Category, Wallet, User } from '../data/mockData'
import { Modal } from '../Components/Modal'
import { confirmDelete, showDeletedToast, showSavedToast } from '../Components/confirmDelete'
import { adminApi, categoriesApi, walletsApi } from '../services/api'
interface TransactionsProps {
  transactions: Transaction[]
  categories: Category[]
  wallets: Wallet[]
  onAddTransaction: (txn: Omit<Transaction, 'id' | 'createdAt'>) => void
  onUpdateTransaction: (id: string, txn: Omit<Transaction, 'id' | 'createdAt'>) => void
  onDeleteTransaction: (id: string) => void
  isAdmin?: boolean
  users?: User[]
  currentUserId?: string
}
export function Transactions({
  transactions,
  categories,
  wallets,
  onAddTransaction,
  onUpdateTransaction,
  onDeleteTransaction,
  isAdmin = false,
  users = [],
  currentUserId = '',
}: TransactionsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTxn, setEditingTxn] = useState<Transaction | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Admin-specific state
  const [adminTransactions, setAdminTransactions] = useState<Transaction[]>([])
  const [adminCategories, setAdminCategories] = useState<Category[]>([])
  const [adminWallets, setAdminWallets] = useState<Wallet[]>([])
  const [adminUsers, setAdminUsers] = useState<User[]>([])

  // Form State
  const [formType, setFormType] = useState<'income' | 'expense'>('expense')
  const [formTitle, setFormTitle] = useState('')
  const [formAmount, setFormAmount] = useState('')
  const [formCategory, setFormCategory] = useState('')
  const [formWallet, setFormWallet] = useState('')
  const [formUserId, setFormUserId] = useState<string>(users[0]?.id ?? '')
  const [formDate, setFormDate] = useState(
    new Date().toISOString().split('T')[0],
  )
  const [formNote, setFormNote] = useState('')

  // Filters
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all')
  const [filterUser, setFilterUser] = useState<string>('all')

  // Fetch admin data when admin
  useEffect(() => {
    if (isAdmin) {
      const fetchAdminData = async () => {
        try {
          setLoading(true)
          setError(null)

          const [txnRes, catRes, walletRes, userRes] = await Promise.all([
            adminApi.transactions(),
            categoriesApi.index(),
            walletsApi.index(),
            adminApi.users(),
          ])

          // Normalize admin transactions
          const normalizedTxns = (txnRes.data?.data || txnRes.data || []).map((t: any) => ({
            id: String(t.id),
            userId: String(t.user_id),
            walletId: String(t.wallet_id),
            categoryId: String(t.category_id),
            amount: Number(t.amount),
            transactionType: t.transaction_type,
            date: t.transaction_date,
            title: t.description || '',
            note: t.note || '',
            createdAt: t.created_at,
          }))

          // Normalize categories
          const normalizedCats = (catRes.data || []).map((c: any) => ({
            id: String(c.id),
            userId: String(c.user_id),
            name: c.name,
            type: c.type,
            color: c.color || '#6B7280',
          }))

          // Normalize wallets
          const normalizedWallets = (walletRes.data || []).map((w: any) => ({
            id: String(w.id),
            userId: String(w.user_id),
            name: w.name,
            balance: Number(w.balance),
            currency: w.currency || 'USD',
          }))

          // Normalize users
          const normalizedUsers = (userRes.data?.data || userRes.data || []).map((u: any) => ({
            id: String(u.id),
            name: u.name,
            username: u.name,
            email: u.email,
            role: u.role || 'user',
            isActive: u.is_active !== undefined ? Boolean(u.is_active) : true,
            dateJoined: u.created_at,
          }))

          setAdminTransactions(normalizedTxns)
          setAdminCategories(normalizedCats)
          setAdminWallets(normalizedWallets)
          setAdminUsers(normalizedUsers)
        } catch (err: any) {
          setError('Failed to load admin data')
          console.error('Error fetching admin data:', err)
        } finally {
          setLoading(false)
        }
      }

      fetchAdminData()
    }
  }, [isAdmin])

  // Keep default form user in sync when users prop changes
  useEffect(() => {
    const currentUsers = isAdmin ? adminUsers : users
    if (isAdmin && currentUsers.length > 0) {
      setFormUserId(currentUsers[0].id)
    } else if (!isAdmin) {
      setFormUserId(currentUserId)
    }
  }, [isAdmin, users, adminUsers, currentUserId])

  // Use admin data if admin, otherwise use props
  const currentTransactions = isAdmin ? adminTransactions : transactions
  const currentCategories = isAdmin ? adminCategories : categories
  const currentWallets = isAdmin ? adminWallets : wallets
  const currentUsers = isAdmin ? adminUsers : users

  const userIdsInTransactions = isAdmin
    ? [...new Set(currentUsers.map((u) => u.id))]
    : []

  const getUserName = (userId: string) => {
    const user = currentUsers.find((u) => u.id === userId)
    return user?.username || user?.name || userId
  }

  // Only show categories/wallets for the selected user when in admin mode
  const selectedUserIdForForm = isAdmin ? formUserId : currentUserId
  const availableCategories = isAdmin
    ? currentCategories.filter((c) => c.userId === selectedUserIdForForm)
    : currentCategories
  const availableWallets = isAdmin
    ? currentWallets.filter((w) => w.userId === selectedUserIdForForm)
    : currentWallets

  // Ensure form selections stay valid when user selection changes
  useEffect(() => {
    if (!isAdmin) return

    if (formCategory && !availableCategories.some((c) => c.id === formCategory)) {
      setFormCategory('')
    }

    if (formWallet && !availableWallets.some((w) => w.id === formWallet)) {
      setFormWallet('')
    }
  }, [formUserId, availableCategories, availableWallets, formCategory, formWallet, isAdmin])

  const filteredTransactions = currentTransactions
    .filter((t) => filterType === 'all' || t.transactionType === filterType)
    .filter((t) =>
      isAdmin
        ? filterUser === 'all' || t.userId === filterUser
        : t.userId === currentUserId,
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const colSpan = 7

  const resetForm = () => {
    setEditingTxn(null)
    setFormType('expense')
    setFormTitle('')
    setFormAmount('')
    setFormCategory('')
    setFormWallet('')
    setFormNote('')
    setFormDate(new Date().toISOString().split('T')[0])
    if (isAdmin) {
      if (filterUser !== 'all') {
        setFormUserId(filterUser)
      } else if (users.length > 0) {
        setFormUserId(users[0].id)
      }
    }
  }

  const handleDeleteTransaction = async (id: string) => {
    const confirmed = await confirmDelete('transaction')
    if (!confirmed) return

    try {
      if (isAdmin) {
        await adminApi.deleteTransaction(id)
        setAdminTransactions((prev) => prev.filter((t) => t.id !== id))
        showDeletedToast('Deleted!', 'Transaction has been deleted.')
        window.dispatchEvent(new CustomEvent('admin:data-changed'))
      } else {
        onDeleteTransaction(id)
      }
    } catch (err: any) {
      setError('Failed to delete transaction')
      console.error('Error deleting transaction:', err)
    }
  }

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formTitle || !formAmount || !formCategory || !formWallet) return

    try {
      const txnData = {
        userId: isAdmin ? formUserId : currentUserId,
        title: formTitle,
        amount: parseFloat(formAmount),
        transactionType: formType,
        categoryId: formCategory,
        walletId: formWallet,
        date: formDate,
        note: formNote,
      }

      if (isAdmin) {
        const apiData = {
          user_id: formUserId,
          wallet_id: formWallet,
          category_id: formCategory,
          amount: parseFloat(formAmount),
          transaction_type: formType,
          description: formTitle,
          transaction_date: formDate,
        }

        if (editingTxn) {
          const response = await adminApi.updateTransaction(editingTxn.id, apiData)
          const updatedTxn = {
            id: String(response.data.data.id),
            userId: String(response.data.data.user_id),
            walletId: String(response.data.data.wallet_id),
            categoryId: String(response.data.data.category_id),
            amount: Number(response.data.data.amount),
            transactionType: response.data.data.transaction_type,
            date: response.data.data.transaction_date,
            title: response.data.data.description || '',
            note: '',
            createdAt: response.data.data.created_at,
          }
          setAdminTransactions(prev => prev.map(t => t.id === editingTxn.id ? updatedTxn : t))
          showSavedToast('Transaction updated')
        } else {
          const response = await adminApi.createTransaction(apiData)
          const newTxn = {
            id: String(response.data.data.id),
            userId: String(response.data.data.user_id),
            walletId: String(response.data.data.wallet_id),
            categoryId: String(response.data.data.category_id),
            amount: Number(response.data.data.amount),
            transactionType: response.data.data.transaction_type,
            date: response.data.data.transaction_date,
            title: response.data.data.description || '',
            note: '',
            createdAt: response.data.data.created_at,
          }
          setAdminTransactions(prev => [newTxn, ...prev])
          showSavedToast('Transaction added')
        }
        window.dispatchEvent(new CustomEvent('admin:data-changed'))
      } else {
        if (editingTxn) {
          onUpdateTransaction(editingTxn.id, txnData)
          showSavedToast('Transaction updated')
        } else {
          onAddTransaction(txnData)
          showSavedToast('Transaction added')
        }
        window.dispatchEvent(new CustomEvent('admin:data-changed'))
      }

      setIsModalOpen(false)
      resetForm()
    } catch (err: any) {
      setError('Failed to save transaction')
      console.error('Error saving transaction:', err)
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Transactions</h1>
          <p className="text-slate-500 mt-1">
            {isAdmin
              ? "View and manage all users' transactions."
              : 'Manage your daily income and expenses.'}
          </p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setIsModalOpen(true)
          }}
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
          <span className="text-sm font-medium">Filter:</span>
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

        {isAdmin && userIdsInTransactions.length > 1 && (
          <div className="flex flex-col gap-2">
            <select
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
            >
              <option value="all">All Users</option>
              {userIdsInTransactions.map((uid) => (
                <option key={uid} value={uid}>
                  {getUserName(uid)}
                </option>
              ))}
            </select>
            {filterUser !== 'all' && (
              <div className="text-xs text-slate-500">
                When adding / editing a transaction, categories & wallets will default to those owned by <span className="font-medium">{getUserName(filterUser)}</span>.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
                <th className="px-6 py-4 font-medium">Owner</th>
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
                    colSpan={colSpan}
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    No transactions found.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((txn, idx) => {
                  const category = currentCategories.find(
                    (c) => c.id === txn.categoryId,
                  )
                  const wallet = currentWallets.find((w) => w.id === txn.walletId)
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
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                          <span className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-medium text-slate-600">
                            {getUserName(txn.userId)
                              .substring(0, 2)
                              .toUpperCase()}
                          </span>
                          {getUserName(txn.userId)}
                        </span>
                      </td>
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
                            <Edit2Icon className="w-4 h-4" onClick={() => {
                              setEditingTxn(txn)
                              setFormType(txn.transactionType)
                              setFormTitle(txn.title)
                              setFormAmount(txn.amount.toString())
                              setFormCategory(txn.categoryId)
                              setFormWallet(txn.walletId)
                              setFormUserId(txn.userId)
                              setFormDate(txn.date)
                              setFormNote(txn.note || '')
                              setIsModalOpen(true)
                            }} />
                          </button>
                          <button
                            onClick={() => handleDeleteTransaction(txn.id)}
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
        onClose={() => {
          setIsModalOpen(false)
          resetForm()
        }}
        title={editingTxn ? 'Edit Transaction' : 'Add Transaction'}
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setIsModalOpen(false)
                resetForm()
              }}
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

          {isAdmin && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                User
              </label>
              <select
                value={formUserId}
                onChange={(e) => setFormUserId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
              >
                {currentUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.username || user.name}
                  </option>
                ))}
              </select>
            </div>
          )}
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
                {availableCategories
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
                {availableWallets.map((w) => (
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
