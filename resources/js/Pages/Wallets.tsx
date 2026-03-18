import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  PlusIcon,
  BanknoteIcon,
  BuildingIcon,
  SmartphoneIcon,
  MoreVerticalIcon,
  Edit2Icon,
  Trash2Icon,
} from 'lucide-react'
import type { Wallet, User } from '../data/mockData'
import { Modal } from '../Components/Modal'
import { confirmDelete, showDeletedToast, showSavedToast } from '../Components/confirmDelete'
import React from 'react'

interface WalletsProps {
  wallets: Wallet[]
  onAddWallet: (wallet: Omit<Wallet, 'id'>) => void
  onUpdateWallet: (id: string, wallet: Omit<Wallet, 'id'>) => void
  onDeleteWallet: (id: string) => void
  isAdmin?: boolean
  users?: User[]
  currentUserId?: string
}

export function Wallets({
  wallets,
  onAddWallet,
  onUpdateWallet,
  onDeleteWallet,
  isAdmin = false,
  users = [],
  currentUserId = '',
}: WalletsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [name, setName] = useState('')
  const [balance, setBalance] = useState('')
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null)
  const [selectedUserId, setSelectedUserId] = useState<string>(currentUserId)

  // Ensure admin starts with a valid user selected
  useEffect(() => {
    if (isAdmin) {
      setSelectedUserId(users[0]?.id ?? currentUserId)
    } else {
      setSelectedUserId(currentUserId)
    }
  }, [isAdmin, users, currentUserId])

  const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0)

  const getUserName = (userId: string) => {
    const user = users.find((u) => u.id === userId)
    return user?.username || user?.name || userId
  }

  // Group wallets by user for admin view
  const walletsByUser = isAdmin
    ? wallets.reduce<Record<string, Wallet[]>>((acc, w) => {
        if (!acc[w.userId]) acc[w.userId] = []
        acc[w.userId].push(w)
        return acc
      }, {})
    : {
        all: wallets.filter((w) => w.userId === currentUserId),
      }

  const getWalletIcon = (name: string) => {
    const lower = name.toLowerCase()
    if (lower.includes('cash')) return BanknoteIcon
    if (lower.includes('wing') || lower.includes('app')) return SmartphoneIcon
    return BuildingIcon
  }

  const getWalletColor = (index: number) => {
    const colors = [
      'bg-blue-500',
      'bg-emerald-500',
      'bg-purple-500',
      'bg-amber-500',
      'bg-rose-500',
    ]
    return colors[index % colors.length]
  }

  const resetForm = () => {
    setEditingWallet(null)
    setName('')
    setBalance('')
    if (isAdmin) {
      setSelectedUserId(users[0]?.id ?? currentUserId)
    } else {
      setSelectedUserId(currentUserId)
    }
  }

  const handleDeleteWallet = async (id: string) => {
    const confirmed = await confirmDelete('wallet')
    if (!confirmed) return

    onDeleteWallet(id)
    showDeletedToast('Deleted!', 'Your wallet has been deleted.')
    window.dispatchEvent(new CustomEvent('admin:data-changed'))
  }

  const handleAddSubmit = async () => {
    if (!name || !balance) return
    const walletData = {
      userId: isAdmin ? selectedUserId : currentUserId,
      name,
      balance: parseFloat(balance),
    }
    try {
      if (editingWallet) {
        await onUpdateWallet(editingWallet.id, walletData)
        showSavedToast('Wallet updated')
      } else {
        await onAddWallet(walletData)
        showSavedToast('Wallet added')
      }
      window.dispatchEvent(new CustomEvent('admin:data-changed'))
      setIsModalOpen(false)
      resetForm()
    } catch (err) {
      console.error('Error saving wallet:', err)
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
          <h1 className="text-2xl font-bold text-slate-900">
            Wallets & Accounts
          </h1>
          <p className="text-slate-500 mt-1">
            {isAdmin ? "All users' wallets — " : ''}Total Balance:{' '}
            <span className="font-semibold text-slate-900">
              $
              {totalBalance.toLocaleString('en-US', {
                minimumFractionDigits: 2,
              })}
            </span>
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium transition-colors shadow-sm"
        >
          <PlusIcon className="w-5 h-5" />
          Add Wallet
        </button>
      </div>

      {isAdmin ? (
        // Admin view: grouped by user
        <div className="space-y-8">
          {Object.entries(walletsByUser).map(([userId, userWallets]) => {
            const userBalance = userWallets.reduce((s, w) => s + w.balance, 0)
            return (
              <div key={userId}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-medium text-slate-600">
                    {getUserName(userId).substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">
                      {getUserName(userId)}
                    </h2>
                    <p className="text-xs text-slate-500">
                      Balance: $
                      {userBalance.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userWallets.map((wallet, idx) => {
                    const Icon = getWalletIcon(wallet.name)
                    const topColor = getWalletColor(idx)
                    return (
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
                          delay: idx * 0.1,
                        }}
                        key={wallet.id}
                        className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative group cursor-pointer hover:shadow-md transition-shadow"
                      >
                        <div
                          className={`absolute top-0 left-0 right-0 h-1.5 ${topColor}`}
                        />
                        <div className="p-6">
                          <div className="flex justify-between items-start mb-6">
                            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                              <Icon className="w-6 h-6 text-slate-700" />
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => {
                                  setEditingWallet(wallet)
                                  setName(wallet.name)
                                  setBalance(wallet.balance.toString())
                                  setSelectedUserId(wallet.userId)
                                  setIsModalOpen(true)
                                }}
                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                              >
                                <Edit2Icon className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteWallet(wallet.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                              >
                                <Trash2Icon className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-500 mb-1">
                              {wallet.name}
                            </p>
                            <h3 className="text-3xl font-bold text-slate-900">
                              $
                              {wallet.balance.toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                              })}
                            </h3>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        // Normal user view
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {walletsByUser['all']?.map((wallet, idx) => {
            const Icon = getWalletIcon(wallet.name)
            const topColor = getWalletColor(idx)
            return (
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
                  delay: idx * 0.1,
                }}
                key={wallet.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative group cursor-pointer hover:shadow-md transition-shadow"
              >
                <div
                  className={`absolute top-0 left-0 right-0 h-1.5 ${topColor}`}
                />
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <Icon className="w-6 h-6 text-slate-700" />
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingWallet(wallet)
                          setName(wallet.name)
                          setBalance(wallet.balance.toString())
                          setIsModalOpen(true)
                        }}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      >
                        <Edit2Icon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteWallet(wallet.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                      >
                        <Trash2Icon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">
                      {wallet.name}
                    </p>
                    <h3 className="text-3xl font-bold text-slate-900">
                      $
                      {wallet.balance.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                      })}
                    </h3>
                  </div>
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
        title={editingWallet ? 'Edit Wallet' : 'Add New Wallet'}
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
              {editingWallet ? 'Update' : 'Create'} Wallet
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
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.username || user.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Wallet Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Savings Account"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Initial Balance ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            />
          </div>
        </form>
      </Modal>
    </motion.div>
  )
}
