import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  WalletIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  TargetIcon,
  ArrowUpRightIcon,
  ArrowDownRightIcon,
} from 'lucide-react'
import { StatCard } from '../Components/StatCard'
import type { Transaction, Wallet, Budget, Category } from '../data/mockData'
interface DashboardProps {
  transactions: Transaction[]
  wallets: Wallet[]
  budgets: Budget[]
  categories: Category[]
}
export function Dashboard({
  transactions,
  wallets,
  budgets,
  categories,
}: DashboardProps) {
  // Calculate Stats
  const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0)
  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()
  const thisMonthTxns = transactions.filter((t) => {
    const d = new Date(t.date)
    return d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear
  })
  const monthlyIncome = thisMonthTxns
    .filter((t) => t.transactionType === 'income')
    .reduce((sum, t) => sum + t.amount, 0)
  const monthlyExpenses = thisMonthTxns
    .filter((t) => t.transactionType === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)
  const totalBudgetLimit = budgets.reduce((sum, b) => sum + b.limitAmount, 0)
  const budgetUsagePercent =
    totalBudgetLimit > 0 ? (monthlyExpenses / totalBudgetLimit) * 100 : 0
  // Chart Data (Last 14 days)
  const chartData = useMemo(() => {
    const data = []
    for (let i = 13; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      const dayExpenses = transactions
        .filter((t) => t.date === dateStr && t.transactionType === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)
      data.push({
        name: `${d.getMonth() + 1}/${d.getDate()}`,
        amount: dayExpenses,
      })
    }
    return data
  }, [transactions])
  // Recent Transactions
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6)
  // Top Budgets
  const topBudgets = budgets.slice(0, 4).map((budget) => {
    const category = categories.find((c) => c.id === budget.categoryId)
    const spent = thisMonthTxns
      .filter(
        (t) =>
          t.categoryId === budget.categoryId && t.transactionType === 'expense',
      )
      .reduce((sum, t) => sum + t.amount, 0)
    const percent = Math.min((spent / budget.limitAmount) * 100, 100)
    return {
      ...budget,
      categoryName: category?.name || 'Unknown',
      spent,
      percent,
    }
  })
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Dashboard Overview
        </h1>
        <p className="text-slate-500 mt-1">
          Welcome back! Here's your financial summary.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Balance"
          value={`$${totalBalance.toLocaleString('en-US', {
            minimumFractionDigits: 2,
          })}`}
          icon={WalletIcon}
          colorClass="bg-blue-100 text-blue-600"
          delay={0.1}
        />
        <StatCard
          title="Monthly Income"
          value={`$${monthlyIncome.toLocaleString('en-US', {
            minimumFractionDigits: 2,
          })}`}
          icon={TrendingUpIcon}
          trend="up"
          trendValue="+12.5%"
          colorClass="bg-emerald-100 text-emerald-600"
          delay={0.2}
        />
        <StatCard
          title="Monthly Expenses"
          value={`$${monthlyExpenses.toLocaleString('en-US', {
            minimumFractionDigits: 2,
          })}`}
          icon={TrendingDownIcon}
          trend="down"
          trendValue="-4.2%"
          colorClass="bg-rose-100 text-rose-600"
          delay={0.3}
        />
        <StatCard
          title="Budget Usage"
          value={`${budgetUsagePercent.toFixed(1)}%`}
          icon={TargetIcon}
          colorClass={
            budgetUsagePercent > 80
              ? 'bg-amber-100 text-amber-600'
              : 'bg-emerald-100 text-emerald-600'
          }
          delay={0.4}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
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
            delay: 0.5,
          }}
          className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-slate-900 mb-6">
            Spending Trend (Last 14 Days)
          </h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 10,
                  left: -20,
                  bottom: 0,
                }}
              >
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: '#64748b',
                    fontSize: 12,
                  }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: '#64748b',
                    fontSize: 12,
                  }}
                  tickFormatter={(val: number) => `$${val}`}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                  formatter={(value: any) => [
                    `$${typeof value === 'number' ? value.toFixed(2) : value}`,
                    'Spent',
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorAmount)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Budget Overview */}
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
            delay: 0.6,
          }}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-slate-900 mb-6">
            Budget Overview
          </h2>
          <div className="space-y-6">
            {topBudgets.map((budget, idx) => (
              <div key={budget.id}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-slate-700">
                    {budget.categoryName}
                  </span>
                  <span className="text-slate-500">
                    ${budget.spent.toFixed(0)} / ${budget.limitAmount}
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{
                      width: 0,
                    }}
                    animate={{
                      width: `${budget.percent}%`,
                    }}
                    transition={{
                      duration: 1,
                      delay: 0.8 + idx * 0.1,
                    }}
                    className={`h-full rounded-full ${budget.percent > 90 ? 'bg-rose-500' : budget.percent > 75 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Transactions List */}
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
          delay: 0.7,
        }}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
      >
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-900">
            Recent Transactions
          </h2>
        </div>
        <div className="divide-y divide-slate-100">
          {recentTransactions.map((txn, idx) => {
            const category = categories.find((c) => c.id === txn.categoryId)
            const isIncome = txn.transactionType === 'income'
            return (
              <motion.div
                initial={{
                  opacity: 0,
                  x: -20,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  delay: 0.8 + idx * 0.05,
                }}
                key={txn.id}
                className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-2 rounded-full ${isIncome ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}
                  >
                    {isIncome ? (
                      <ArrowUpRightIcon className="w-5 h-5" />
                    ) : (
                      <ArrowDownRightIcon className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{txn.title}</p>
                    <p className="text-sm text-slate-500">
                      {category?.name} •{' '}
                      {new Date(txn.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div
                  className={`font-semibold ${isIncome ? 'text-emerald-600' : 'text-slate-900'}`}
                >
                  {isIncome ? '+' : '-'}${txn.amount.toFixed(2)}
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    </motion.div>
  )
}
