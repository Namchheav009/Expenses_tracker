import React, { Fragment } from 'react'
import {
  LayoutDashboardIcon,
  ArrowLeftRightIcon,
  WalletIcon,
  TagIcon,
  TargetIcon,
  BrainIcon,
  LogOutIcon,
  UsersIcon,
  ShieldCheckIcon,
} from 'lucide-react'
import { User } from '../data/mockData'

interface SidebarProps {
  currentPage: string
  setCurrentPage: (page: string) => void
  currentUser: User
  onLogout: () => void
}

export function Sidebar({
  currentPage,
  setCurrentPage,
  currentUser,
  onLogout,
}: SidebarProps) {
  const isAdmin = currentUser.role === 'admin'

  const adminNavItems = [
    {
      id: 'admin',
      label: 'Admin Panel',
      icon: ShieldCheckIcon,
    },
    {
      id: 'users',
      label: 'Users',
      icon: UsersIcon,
    },
    {
      id: 'transactions',
      label: 'All Transactions',
      icon: ArrowLeftRightIcon,
    },
    {
      id: 'wallets',
      label: 'All Wallets',
      icon: WalletIcon,
    },
    {
      id: 'categories',
      label: 'All Categories',
      icon: TagIcon,
    },
    {
      id: 'budgets',
      label: 'All Budgets',
      icon: TargetIcon,
    },
  ]

  const userNavItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboardIcon,
    },
    {
      id: 'transactions',
      label: 'Transactions',
      icon: ArrowLeftRightIcon,
    },
    {
      id: 'wallets',
      label: 'Wallets',
      icon: WalletIcon,
    },
    {
      id: 'categories',
      label: 'Categories',
      icon: TagIcon,
    },
    {
      id: 'budgets',
      label: 'Budgets',
      icon: TargetIcon,
    },
    {
      id: 'ai-analysis',
      label: 'AI Analysis',
      icon: BrainIcon,
    },
  ]

  const navItems = isAdmin ? adminNavItems : userNavItems
  const initials = currentUser.name.substring(0, 2).toUpperCase()

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex flex-col w-20 lg:w-64 bg-slate-900 text-slate-300 transition-all duration-300 ease-in-out border-r border-slate-800">
      {/* Logo Area */}
      <div className="flex items-center justify-center lg:justify-start h-16 px-0 lg:px-6 border-b border-slate-800">
        <div className="flex items-center gap-3 text-white">
          <div
            className={`p-1.5 rounded-lg ${
              isAdmin ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
          >
            {isAdmin ? (
              <ShieldCheckIcon className="w-5 h-5 text-white" />
            ) : (
              <WalletIcon className="w-5 h-5 text-white" />
            )}
          </div>
          <span className="hidden lg:block text-xl font-bold tracking-tight">
            {isAdmin ? 'FinTrack Admin' : 'FinTrack'}
          </span>
        </div>
      </div>

      {/* Role Badge */}
      {isAdmin && (
        <div className="px-3 pt-4 pb-2 hidden lg:block">
          <div className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <ShieldCheckIcon className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
              Admin Mode
            </span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item, idx) => {
          const isActive = currentPage === item.id
          const Icon = item.icon
          const isAdminCoreItem = isAdmin && idx < 2
          return (
            <Fragment key={item.id}>
              {isAdmin && idx === 2 && (
                <div className="pt-3 pb-1 px-3 hidden lg:block">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
                    User Data
                  </span>
                </div>
              )}
              <button
                onClick={() => setCurrentPage(item.id)}
                className={`w-full flex items-center justify-center lg:justify-start gap-3 px-3 py-3 rounded-lg transition-colors group ${
                  isActive
                    ? 'bg-slate-800 text-white relative'
                    : 'hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                {isActive && (
                  <div
                    className={`absolute left-0 top-2 bottom-2 w-1 rounded-r-full ${
                      isAdminCoreItem
                        ? 'bg-amber-500'
                        : isAdmin
                        ? 'bg-blue-500'
                        : 'bg-emerald-500'
                    }`}
                  />
                )}
                <Icon
                  className={`w-5 h-5 flex-shrink-0 ${
                    isActive
                      ? isAdminCoreItem
                        ? 'text-amber-500'
                        : isAdmin
                        ? 'text-blue-500'
                        : 'text-emerald-500'
                      : 'text-slate-400 group-hover:text-slate-300'
                  }`}
                />
                <span className="hidden lg:block font-medium">{item.label}</span>
              </button>
            </Fragment>
          )
        })}
      </nav>

      {/* User Area */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center justify-center lg:justify-start gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border ${
              isAdmin
                ? 'bg-amber-500/20 border-amber-500/30'
                : 'bg-slate-700 border-slate-600'
            }`}
          >
            <span
              className={`text-sm font-medium ${
                isAdmin ? 'text-amber-400' : 'text-white'
              }`}
            >
              {initials}
            </span>
          </div>
          <div className="hidden lg:block flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-white truncate">
                {currentUser.name}
              </p>
              {isAdmin && (
                <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded uppercase">
                  Admin
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 truncate">{currentUser.email}</p>
          </div>
          <button
            onClick={onLogout}
            className="hidden lg:flex p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Sign Out"
          >
            <LogOutIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
