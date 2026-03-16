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

  // Current month transactions
  const thisMonthTxns = transactions.filter((t) => {
    const d = new Date(t.date)
    return d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear
  })

  // Previous month transactions
  const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1
  const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear
  const prevMonthTxns = transactions.filter((t) => {
    const d = new Date(t.date)
    return d.getMonth() + 1 === prevMonth && d.getFullYear() === prevYear
  })

  const monthlyIncome = thisMonthTxns
    .filter((t) => t.transactionType === 'income')
    .reduce((sum, t) => sum + t.amount, 0)
  const monthlyExpenses = thisMonthTxns
    .filter((t) => t.transactionType === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  // Previous month income/expenses for trend calculation
  const prevMonthlyIncome = prevMonthTxns
    .filter((t) => t.transactionType === 'income')
    .reduce((sum, t) => sum + t.amount, 0)
  const prevMonthlyExpenses = prevMonthTxns
    .filter((t) => t.transactionType === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  // Calculate trends
  const incomeTrend = prevMonthlyIncome > 0
    ? ((monthlyIncome - prevMonthlyIncome) / prevMonthlyIncome) * 100
    : monthlyIncome > 0 ? 100 : 0
  const expenseTrend = prevMonthlyExpenses > 0
    ? ((monthlyExpenses - prevMonthlyExpenses) / prevMonthlyExpenses) * 100
    : monthlyExpenses > 0 ? 100 : 0

  const totalBudgetLimit = budgets.reduce((sum, b) => sum + b.limitAmount, 0)
  const budgetUsagePercent =
    totalBudgetLimit > 0 ? (monthlyExpenses / totalBudgetLimit) * 100 : 0
  // Chart Data (Last 14 days) - simplified and more reliable
  const chartData = useMemo(() => {
    const data = []
    const daysToShow = 14

    const isSameDay = (dateA: string, dateB: string) => {
      const a = new Date(dateA)
      const b = new Date(dateB)
      return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
      )
    }

    for (let i = daysToShow - 1; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      const dayExpenses = transactions
        .filter((t) => isSameDay(t.date, dateStr) && t.transactionType === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)
      const dayIncome = transactions
        .filter((t) => isSameDay(t.date, dateStr) && t.transactionType === 'income')
        .reduce((sum, t) => sum + t.amount, 0)
      data.push({
        name: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        date: dateStr,
        expenses: dayExpenses,
        income: dayIncome,
        net: dayIncome - dayExpenses,
      })
    }
    return data
  }, [transactions])

  // Chart stats
  const totalChartExpenses = chartData.reduce((sum, d) => sum + d.expenses, 0)
  const totalChartIncome = chartData.reduce((sum, d) => sum + d.income, 0)
  const avgDailyExpense = totalChartExpenses / chartData.length
  const maxDailyExpense = Math.max(...chartData.map(d => d.expenses))
  const daysWithTransactions = chartData.filter(d => d.expenses > 0 || d.income > 0).length
  // Recent Transactions - with dynamic filtering and stats
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6)

  // Transaction stats for the dashboard
  const totalTransactions = transactions.length
  const thisMonthTransactionCount = thisMonthTxns.length
  const expenseTransactionCount = thisMonthTxns.filter(t => t.transactionType === 'expense').length
  const incomeTransactionCount = thisMonthTxns.filter(t => t.transactionType === 'income').length
  // Top Budgets - sorted by usage percentage (most critical first)
  const topBudgets = budgets
    .map((budget) => {
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
        remaining: budget.limitAmount - spent,
        status: percent > 100 ? 'over' : percent > 90 ? 'warning' : 'good',
      }
    })
    .sort((a, b) => b.percent - a.percent) // Sort by highest usage first
    .slice(0, 4)
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
          trend={incomeTrend >= 0 ? "up" : "down"}
          trendValue={`${incomeTrend >= 0 ? '+' : ''}${incomeTrend.toFixed(1)}%`}
          colorClass="bg-emerald-100 text-emerald-600"
          delay={0.2}
        />
        <StatCard
          title="Monthly Expenses"
          value={`$${monthlyExpenses.toLocaleString('en-US', {
            minimumFractionDigits: 2,
          })}`}
          icon={TrendingDownIcon}
          trend={expenseTrend <= 0 ? "down" : "up"}
          trendValue={`${expenseTrend >= 0 ? '+' : ''}${expenseTrend.toFixed(1)}%`}
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
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Spending Trend (Last 14 Days)
              </h2>
              <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-600">
                <span>Total Expenses: ${totalChartExpenses.toFixed(2)}</span>
                <span>Total Income: ${totalChartIncome.toFixed(2)}</span>
                <span>Avg Daily: ${avgDailyExpense.toFixed(2)}</span>
                <span>Active Days: {daysWithTransactions}/14</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-500">Peak Day</div>
              <div className="text-lg font-semibold text-slate-900">
                ${maxDailyExpense.toFixed(2)}
              </div>
            </div>
          </div>
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
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
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
                  formatter={(value: any, name: string) => [
                    `$${typeof value === 'number' ? value.toFixed(2) : value}`,
                    name === 'expenses' ? 'Expenses' : name === 'income' ? 'Income' : 'Net',
                  ]}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  stroke="#ef4444"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorExpenses)"
                  name="expenses"
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorIncome)"
                  name="income"
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
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Budget Overview
            </h2>
            <div className="text-sm text-slate-500">
              {budgets.length} active budgets
            </div>
          </div>
          <div className="space-y-6">
            {topBudgets.map((budget, idx) => (
              <div key={budget.id}>
                <div className="flex justify-between items-start text-sm mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-700">
                      {budget.categoryName}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      budget.status === 'over' ? 'bg-rose-100 text-rose-700' :
                      budget.status === 'warning' ? 'bg-amber-100 text-amber-700' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      {budget.status === 'over' ? 'Over Budget' :
                       budget.status === 'warning' ? 'Near Limit' : 'On Track'}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-slate-900 font-medium">
                      ${budget.spent.toFixed(0)} / ${budget.limitAmount}
                    </div>
                    <div className="text-slate-500">
                      {budget.remaining >= 0 ? `$${budget.remaining.toFixed(0)} left` : `$${Math.abs(budget.remaining).toFixed(0)} over`}
                    </div>
                  </div>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{
                      width: 0,
                    }}
                    animate={{
                      width: `${Math.min(budget.percent, 100)}%`,
                    }}
                    transition={{
                      duration: 1,
                      delay: 0.8 + idx * 0.1,
                    }}
                    className={`h-full rounded-full ${
                      budget.status === 'over' ? 'bg-rose-500' :
                      budget.status === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
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
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Recent Transactions
            </h2>
            <div className="flex gap-4 mt-1 text-sm text-slate-600">
              <span>This month: {thisMonthTransactionCount}</span>
              <span>Income: {incomeTransactionCount}</span>
              <span>Expenses: {expenseTransactionCount}</span>
              <span>Total: {totalTransactions}</span>
            </div>
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {recentTransactions.length === 0 ? (
            <div className="px-6 py-12 text-center text-slate-500">
              No transactions yet. Start by adding your first transaction!
            </div>
          ) : (
            recentTransactions.map((txn, idx) => {
              const category = categories.find((c) => c.id === txn.categoryId)
              const wallet = wallets.find((w) => w.id === txn.walletId)
              const isIncome = txn.transactionType === 'income'
              const isRecent = new Date(txn.date).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000 // Last 7 days
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
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-900">{txn.title}</p>
                        {isRecent && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500">
                        {category?.name} • {wallet?.name} •{' '}
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
            })
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
