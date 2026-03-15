import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  PlusIcon,
  BanknoteIcon,
  BuildingIcon,
  SmartphoneIcon,
  MoreVerticalIcon,
} from 'lucide-react'
import type { Wallet } from '../data/mockData'
import { Modal } from '../Components/Modal'
interface WalletsProps {
  wallets: Wallet[]
  onAddWallet: (wallet: Omit<Wallet, 'id'>) => void
}
export function Wallets({ wallets, onAddWallet }: WalletsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [name, setName] = useState('')
  const [balance, setBalance] = useState('')
  const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0)
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
  const handleAddSubmit = () => {
    if (!name || !balance) return
    onAddWallet({
      userId: 'user_123',
      name,
      balance: parseFloat(balance),
    })
    setIsModalOpen(false)
    setName('')
    setBalance('')
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
            Total Balance:{' '}
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wallets.map((wallet, idx) => {
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
                  <div
                    className={`p-3 rounded-xl bg-slate-50 border border-slate-100`}
                  >
                    <Icon className="w-6 h-6 text-slate-700" />
                  </div>
                  <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVerticalIcon className="w-5 h-5" />
                  </button>
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

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Wallet"
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
              Create Wallet
            </button>
          </div>
        }
      >
        <div className="space-y-4">
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
        </div>
      </Modal>
    </motion.div>
  )
}
