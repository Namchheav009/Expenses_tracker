import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PlusIcon, Edit2Icon, Trash2Icon } from 'lucide-react'
import type { Category, User } from '../data/mockData'
import { confirmDelete, showDeletedToast, showSavedToast } from '../Components/confirmDelete'
import React from 'react'

interface CategoriesProps {
  categories: Category[]
  onAddCategory: (category: Omit<Category, 'id'>) => void
  onUpdateCategory: (id: string, category: Omit<Category, 'id'>) => void
  onDeleteCategory: (id: string) => void
  isAdmin?: boolean
  users?: User[]
  currentUserId?: string
}

export function Categories({
  categories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  isAdmin = false,
  users = [],
  currentUserId = '',
}: CategoriesProps) {
  const [filterUser, setFilterUser] = useState<string>('all')
  const [selectedUserId, setSelectedUserId] = useState<string>(currentUserId)

  const getUserName = (userId: string) => {
    const user = users.find((u) => u.id === userId)
    return user?.username || user?.name || userId
  }

  const userIdsInCategories = isAdmin
    ? [...new Set(categories.map((c) => c.userId))]
    : []

  const selectedUserForFilter =
    isAdmin && filterUser !== 'all'
      ? filterUser
      : isAdmin
        ? 'all'
        : currentUserId

  const filteredCategories =
    isAdmin && filterUser !== 'all'
      ? categories.filter((c) => c.userId === filterUser)
      : isAdmin
        ? categories
        : categories.filter((c) => c.userId === currentUserId)

  // If admin is adding a category, use the selected user (or fallback to current user)
  const categoryUserId = isAdmin ? selectedUserId || currentUserId : currentUserId

  const incomes = filteredCategories.filter((c) => c.type === 'income')
  const expenses = filteredCategories.filter((c) => c.type === 'expense')
  const [addingType, setAddingType] = useState<'income' | 'expense' | null>(
    null,
  )
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  // Ensure admin has a valid selected user when opening the add UI
  useEffect(() => {
    if (isAdmin) {
      setSelectedUserId(users[0]?.id ?? currentUserId)
    } else {
      setSelectedUserId(currentUserId)
    }
  }, [isAdmin, users, currentUserId])

  const handleAdd = (type: 'income' | 'expense') => {
    if (!newName.trim()) {
      setAddingType(null)
      return
    }

    onAddCategory({
      userId: categoryUserId,
      name: newName,
      type,
    })
    showSavedToast('Category added')
    window.dispatchEvent(new CustomEvent('admin:data-changed'))
    setNewName('')
    setAddingType(null)
  }

  const handleDeleteCategory = async (id: string) => {
    const confirmed = await confirmDelete('category')
    if (!confirmed) return

    onDeleteCategory(id)
    showDeletedToast('Deleted!', 'Your category has been deleted.')
    window.dispatchEvent(new CustomEvent('admin:data-changed'))
  }
  const renderCategoryList = (
    title: string,
    items: Category[],
    type: 'income' | 'expense',
  ) => (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full ${type === 'income' ? 'bg-emerald-500' : 'bg-rose-500'}`}
          />
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        </div>
        <span className="text-sm font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
          {items.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {items.map((cat, idx) => (
          <motion.div
            initial={{
              opacity: 0,
              x: type === 'income' ? -10 : 10,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              delay: idx * 0.05,
            }}
            key={cat.id}
            className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group"
          >
            {editingId === cat.id ? (
              <div className="flex items-center gap-2 flex-1">
                <input
                  autoFocus
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      onUpdateCategory(cat.id, { userId: cat.userId, name: editingName, type: cat.type })
                      showSavedToast('Category updated')
                      window.dispatchEvent(new CustomEvent('admin:data-changed'))
                      setEditingId(null)
                      setEditingName('')
                    } else if (e.key === 'Escape') {
                      setEditingId(null)
                      setEditingName('')
                    }
                  }}
                  className="flex-1 px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-slate-500"
                />
                <button
                  onClick={() => {
                    onUpdateCategory(cat.id, { userId: cat.userId, name: editingName, type: cat.type })
                    showSavedToast('Category updated')
                    window.dispatchEvent(new CustomEvent('admin:data-changed'))
                    setEditingId(null)
                    setEditingName('')
                  }}
                  className="px-2 py-1 text-xs bg-slate-900 text-white rounded hover:bg-slate-800"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditingId(null)
                    setEditingName('')
                  }}
                  className="px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 rounded"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-medium text-slate-700">{cat.name}</span>
                {isAdmin && (
                  <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded flex-shrink-0">
                    {getUserName(cat.userId)}
                  </span>
                )}
              </div>
            )}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => {
                  setEditingId(cat.id)
                  setEditingName(cat.name)
                }}
                className="p-1.5 text-slate-400 hover:text-blue-600 rounded-md transition-colors"
              >
                <Edit2Icon className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDeleteCategory(cat.id)}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
              >
                <Trash2Icon className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}

        {addingType === type && (
          <motion.div
            initial={{
              opacity: 0,
              height: 0,
            }}
            animate={{
              opacity: 1,
              height: 'auto',
            }}
            className="p-3"
          >
            <div className="flex items-center gap-2">
              <input
                autoFocus
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd(type)}
                placeholder="Category name..."
                className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              />
              <button
                onClick={() => handleAdd(type)}
                className="px-3 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setAddingType(null)
                  setNewName('')
                }}
                className="px-3 py-2 text-slate-500 text-sm font-medium hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {!addingType && (
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={() => setAddingType(type)}
            className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-slate-200 text-slate-500 hover:text-slate-700 hover:border-slate-300 hover:bg-slate-50 rounded-xl font-medium transition-all"
          >
            <PlusIcon className="w-4 h-4" />
            Add {type === 'income' ? 'Income' : 'Expense'} Category
          </button>
        </div>
      )}
    </div>
  )
  return (
    <motion.div
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      className="max-w-5xl mx-auto space-y-6 h-[calc(100vh-8rem)] flex flex-col"
    >
      <div className="mb-4 flex-shrink-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isAdmin ? 'All Categories' : 'Categories'}
          </h1>
          <p className="text-slate-500 mt-1">
            {isAdmin
              ? "View all users' categories."
              : 'Organize your transactions for better tracking.'}
          </p>
        </div>
        {isAdmin && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-500">Filter</span>
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
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-500">Adding for</span>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.username || u.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-0">
        {renderCategoryList('Income Categories', incomes, 'income')}
        {renderCategoryList('Expense Categories', expenses, 'expense')}
      </div>
    </motion.div>
  )
}
