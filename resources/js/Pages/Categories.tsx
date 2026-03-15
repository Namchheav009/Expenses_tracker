import { useState } from 'react'
import { motion } from 'framer-motion'
import { PlusIcon, Edit2Icon, Trash2Icon } from 'lucide-react'
import type { Category } from '../data/mockData'
interface CategoriesProps {
  categories: Category[]
  onAddCategory: (category: Omit<Category, 'id'>) => void
}
export function Categories({ categories, onAddCategory }: CategoriesProps) {
  const incomes = categories.filter((c) => c.type === 'income')
  const expenses = categories.filter((c) => c.type === 'expense')
  const [addingType, setAddingType] = useState<'income' | 'expense' | null>(
    null,
  )
  const [newName, setNewName] = useState('')
  const handleAdd = (type: 'income' | 'expense') => {
    if (!newName.trim()) {
      setAddingType(null)
      return
    }
    onAddCategory({
      userId: 'user_123',
      name: newName,
      type,
    })
    setNewName('')
    setAddingType(null)
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
            <span className="font-medium text-slate-700">{cat.name}</span>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-1.5 text-slate-400 hover:text-blue-600 rounded-md transition-colors">
                <Edit2Icon className="w-4 h-4" />
              </button>
              <button className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md transition-colors">
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
      <div className="mb-4 flex-shrink-0">
        <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
        <p className="text-slate-500 mt-1">
          Organize your transactions for better tracking.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-0">
        {renderCategoryList('Income Categories', incomes, 'income')}
        {renderCategoryList('Expense Categories', expenses, 'expense')}
      </div>
    </motion.div>
  )
}
