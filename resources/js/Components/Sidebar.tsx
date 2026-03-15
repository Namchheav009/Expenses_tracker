
import {
  LayoutDashboardIcon,
  ArrowLeftRightIcon,
  WalletIcon,
  TagIcon,
  TargetIcon,
  BrainIcon,
  LogOutIcon,
} from 'lucide-react'
interface SidebarProps {
  currentPage: string
  setCurrentPage: (page: string) => void
}
export function Sidebar({ currentPage, setCurrentPage }: SidebarProps) {
  const navItems = [
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
  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex flex-col w-20 lg:w-64 bg-slate-900 text-slate-300 transition-all duration-300 ease-in-out border-r border-slate-800">
      {/* Logo Area */}
      <div className="flex items-center justify-center lg:justify-start h-16 px-0 lg:px-6 border-b border-slate-800">
        <div className="flex items-center gap-3 text-white">
          <div className="p-1.5 bg-emerald-500 rounded-lg">
            <WalletIcon className="w-5 h-5 text-white" />
          </div>
          <span className="hidden lg:block text-xl font-bold tracking-tight">
            FinTrack
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = currentPage === item.id
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center justify-center lg:justify-start gap-3 px-3 py-3 rounded-lg transition-colors group ${isActive ? 'bg-slate-800 text-white relative' : 'hover:bg-slate-800/50 hover:text-white'}`}
            >
              {isActive && (
                <div className="absolute left-0 top-2 bottom-2 w-1 bg-emerald-500 rounded-r-full" />
              )}
              <Icon
                className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-emerald-500' : 'text-slate-400 group-hover:text-slate-300'}`}
              />
              <span className="hidden lg:block font-medium">{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* User Area */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center justify-center lg:justify-start gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0 border border-slate-600">
            <span className="text-sm font-medium text-white">JD</span>
          </div>
          <div className="hidden lg:block flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">John Doe</p>
            <p className="text-xs text-slate-400 truncate">john@example.com</p>
          </div>
          <button className="hidden lg:flex p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            <LogOutIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
