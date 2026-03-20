export type TransactionType = 'income' | 'expense'

export interface Category {
  id: string
  userId: string
  name: string
  type: TransactionType
}

export interface Wallet {
  id: string
  userId: string
  name: string
  balance: number
}

export interface Transaction {
  id: string
  userId: string
  walletId: string
  categoryId: string
  title: string
  amount: number
  transactionType: TransactionType
  date: string
  note: string
  createdAt: string
}

export interface Budget {
  id: string
  userId: string
  categoryId: string
  limitAmount: number
  month: number
  year: number
}

export interface AIAnalysis {
  id: string
  userId: string
  month: number
  year: number
  summaryText: string
  aiResult: string
  confidenceScore: number
  analysisType: 'monthly' | 'weekly' | 'alert' | 'quarterly'
  recommendations: {
    category: string
    priority: 'high' | 'medium' | 'low'
    title: string
    description: string
    estimatedSavings?: number
  }[]
  transactionSummary: {
    totalIncome: number
    totalExpenses: number
    netSavings: number
    averageTransaction: number
    topCategories: { name: string; amount: number; percentage: number }[]
  }
  budgetInsights: {
    categoryId: string
    categoryName: string
    budgeted: number
    spent: number
    status: 'on-track' | 'warning' | 'over-budget'
    percentageUsed: number
  }[]
  spendingMetrics: {
    savingsRate: number
    incomeStability: number
    expenseVariance: number
    budgetAdherence: number
  }
  trends: {
    name: string
    direction: 'up' | 'down' | 'stable'
    percentageChange: number
    timeframe: string
  }[]
  alerts: {
    severity: 'critical' | 'warning' | 'info'
    message: string
    actionRequired: boolean
  }[]
  createdAt: string
}

export interface User {
  id: string
  name: string
  email: string
  role?: 'admin' | 'user'
  username?: string
  isActive?: boolean
  dateJoined?: string
}

const USER_ID = 'user_123'
const CURRENT_YEAR = new Date().getFullYear()
const CURRENT_MONTH = new Date().getMonth() + 1

// Helper to generate recent dates
const getRecentDate = (daysAgo: number) => {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return date.toISOString().split('T')[0]
}

export const mockCategories: Category[] = [
  { id: 'cat_1', userId: USER_ID, name: 'Food & Dining', type: 'expense' },
  { id: 'cat_2', userId: USER_ID, name: 'Transport', type: 'expense' },
  { id: 'cat_3', userId: USER_ID, name: 'Rent', type: 'expense' },
  { id: 'cat_4', userId: USER_ID, name: 'Salary', type: 'income' },
  { id: 'cat_5', userId: USER_ID, name: 'Shopping', type: 'expense' },
  { id: 'cat_6', userId: USER_ID, name: 'Entertainment', type: 'expense' },
  { id: 'cat_7', userId: USER_ID, name: 'Utilities', type: 'expense' },
  { id: 'cat_8', userId: USER_ID, name: 'Freelance', type: 'income' },
  { id: 'cat_9', userId: USER_ID, name: 'Gifts', type: 'expense' },
  { id: 'cat_10', userId: USER_ID, name: 'Healthcare', type: 'expense' },
]

export const mockWallets: Wallet[] = [
  { id: 'wal_1', userId: USER_ID, name: 'Cash', balance: 450.0 },
  { id: 'wal_2', userId: USER_ID, name: 'ABA Bank', balance: 2340.5 },
  { id: 'wal_3', userId: USER_ID, name: 'Acleda Bank', balance: 1890.0 },
  { id: 'wal_4', userId: USER_ID, name: 'Wing', balance: 320.75 },
]

export const mockTransactions: Transaction[] = [
  {
    id: 'txn_1',
    userId: USER_ID,
    walletId: 'wal_2',
    categoryId: 'cat_4',
    title: 'Monthly Salary',
    amount: 2500,
    transactionType: 'income',
    date: getRecentDate(14),
    note: 'Tech Corp Salary',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'txn_2',
    userId: USER_ID,
    walletId: 'wal_2',
    categoryId: 'cat_3',
    title: 'Apartment Rent',
    amount: 600,
    transactionType: 'expense',
    date: getRecentDate(13),
    note: 'November Rent',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'txn_3',
    userId: USER_ID,
    walletId: 'wal_1',
    categoryId: 'cat_1',
    title: 'Brown Coffee',
    amount: 4.5,
    transactionType: 'expense',
    date: getRecentDate(12),
    note: 'Morning coffee',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'txn_4',
    userId: USER_ID,
    walletId: 'wal_4',
    categoryId: 'cat_2',
    title: 'PassApp Ride',
    amount: 3.0,
    transactionType: 'expense',
    date: getRecentDate(12),
    note: 'To office',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'txn_5',
    userId: USER_ID,
    walletId: 'wal_2',
    categoryId: 'cat_7',
    title: 'Electric Bill',
    amount: 45.2,
    transactionType: 'expense',
    date: getRecentDate(10),
    note: 'EDC Bill',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'txn_6',
    userId: USER_ID,
    walletId: 'wal_3',
    categoryId: 'cat_8',
    title: 'Upwork Project',
    amount: 450,
    transactionType: 'income',
    date: getRecentDate(8),
    note: 'Website design',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'txn_7',
    userId: USER_ID,
    walletId: 'wal_2',
    categoryId: 'cat_5',
    title: 'Aeon Mall Shopping',
    amount: 120.5,
    transactionType: 'expense',
    date: getRecentDate(7),
    note: 'Groceries and clothes',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'txn_8',
    userId: USER_ID,
    walletId: 'wal_1',
    categoryId: 'cat_1',
    title: 'Lunch at Tube Cafe',
    amount: 6.0,
    transactionType: 'expense',
    date: getRecentDate(6),
    note: '',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'txn_9',
    userId: USER_ID,
    walletId: 'wal_2',
    categoryId: 'cat_6',
    title: 'Legend Cinema',
    amount: 15.0,
    transactionType: 'expense',
    date: getRecentDate(5),
    note: 'Movie night',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'txn_10',
    userId: USER_ID,
    walletId: 'wal_4',
    categoryId: 'cat_2',
    title: 'Tada Ride',
    amount: 2.5,
    transactionType: 'expense',
    date: getRecentDate(4),
    note: 'To mall',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'txn_11',
    userId: USER_ID,
    walletId: 'wal_1',
    categoryId: 'cat_1',
    title: 'Street Food',
    amount: 5.0,
    transactionType: 'expense',
    date: getRecentDate(3),
    note: 'Dinner',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'txn_12',
    userId: USER_ID,
    walletId: 'wal_2',
    categoryId: 'cat_10',
    title: 'Pharmacy',
    amount: 25.0,
    transactionType: 'expense',
    date: getRecentDate(2),
    note: 'Vitamins',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'txn_13',
    userId: USER_ID,
    walletId: 'wal_2',
    categoryId: 'cat_1',
    title: 'Dinner at Malis',
    amount: 85.0,
    transactionType: 'expense',
    date: getRecentDate(1),
    note: 'Anniversary dinner',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'txn_14',
    userId: USER_ID,
    walletId: 'wal_1',
    categoryId: 'cat_1',
    title: 'Coffee',
    amount: 3.5,
    transactionType: 'expense',
    date: getRecentDate(0),
    note: '',
    createdAt: new Date().toISOString(),
  },
]

export const mockBudgets: Budget[] = [
  {
    id: 'bud_1',
    userId: USER_ID,
    categoryId: 'cat_1',
    limitAmount: 300,
    month: CURRENT_MONTH,
    year: CURRENT_YEAR,
  },
  {
    id: 'bud_2',
    userId: USER_ID,
    categoryId: 'cat_2',
    limitAmount: 80,
    month: CURRENT_MONTH,
    year: CURRENT_YEAR,
  },
  {
    id: 'bud_3',
    userId: USER_ID,
    categoryId: 'cat_5',
    limitAmount: 150,
    month: CURRENT_MONTH,
    year: CURRENT_YEAR,
  },
  {
    id: 'bud_4',
    userId: USER_ID,
    categoryId: 'cat_6',
    limitAmount: 100,
    month: CURRENT_MONTH,
    year: CURRENT_YEAR,
  },
  {
    id: 'bud_5',
    userId: USER_ID,
    categoryId: 'cat_7',
    limitAmount: 60,
    month: CURRENT_MONTH,
    year: CURRENT_YEAR,
  },
]

export const mockAnalyses: AIAnalysis[] = [
  {
    id: 'ana_1',
    userId: USER_ID,
    month: CURRENT_MONTH - 1 === 0 ? 12 : CURRENT_MONTH - 1,
    year: CURRENT_MONTH - 1 === 0 ? CURRENT_YEAR - 1 : CURRENT_YEAR,
    summaryText:
      'Total Income: $2,950. Total Expenses: $1,420. Net Savings: $1,530 (51.9% savings rate). Top expense categories: Rent ($600), Food ($320), Shopping ($180).',
    aiResult:
      'Excellent financial performance! You saved over 50% of your income this month. Your budgeting discipline is outstanding. Consider investing surplus funds or building a larger emergency fund.',
    confidenceScore: 0.95,
    analysisType: 'monthly',
    recommendations: [
      {
        category: 'Savings',
        priority: 'high',
        title: 'Move to High-Yield Account',
        description: 'Your ABA Bank balance of $2,340 is earning minimal interest. Move a portion to a high-yield savings account.',
        estimatedSavings: 45,
      },
      {
        category: 'Food & Dining',
        priority: 'medium',
        title: 'Reduce Dining Out Frequency',
        description: 'Your food expenses are 7% higher than average. Consider meal prepping to reduce dining out by 20%.',
        estimatedSavings: 64,
      },
      {
        category: 'Entertainment',
        priority: 'low',
        title: 'Bundle Subscriptions',
        description: 'You could save by bundling entertainment subscriptions.',
        estimatedSavings: 15,
      },
    ],
    transactionSummary: {
      totalIncome: 2950,
      totalExpenses: 1420,
      netSavings: 1530,
      averageTransaction: 142,
      topCategories: [
        { name: 'Rent', amount: 600, percentage: 42.3 },
        { name: 'Food & Dining', amount: 320, percentage: 22.5 },
        { name: 'Shopping', amount: 180, percentage: 12.7 },
        { name: 'Transport', amount: 120, percentage: 8.5 },
        { name: 'Utilities', amount: 75, percentage: 5.3 },
      ],
    },
    budgetInsights: [
      {
        categoryId: 'cat_1',
        categoryName: 'Food & Dining',
        budgeted: 300,
        spent: 285,
        status: 'on-track',
        percentageUsed: 95,
      },
      {
        categoryId: 'cat_2',
        categoryName: 'Transport',
        budgeted: 80,
        spent: 65,
        status: 'on-track',
        percentageUsed: 81,
      },
      {
        categoryId: 'cat_5',
        categoryName: 'Shopping',
        budgeted: 150,
        spent: 180,
        status: 'over-budget',
        percentageUsed: 120,
      },
      {
        categoryId: 'cat_6',
        categoryName: 'Entertainment',
        budgeted: 100,
        spent: 78,
        status: 'on-track',
        percentageUsed: 78,
      },
    ],
    spendingMetrics: {
      savingsRate: 51.9,
      incomeStability: 0.98,
      expenseVariance: 0.34,
      budgetAdherence: 0.89,
    },
    trends: [
      {
        name: 'Food Expenses',
        direction: 'up',
        percentageChange: 12,
        timeframe: 'vs last month',
      },
      {
        name: 'Income',
        direction: 'stable',
        percentageChange: 0,
        timeframe: 'vs last month',
      },
      {
        name: 'Savings Rate',
        direction: 'up',
        percentageChange: 8,
        timeframe: 'vs last 3 months',
      },
    ],
    alerts: [
      {
        severity: 'warning',
        message: 'Shopping budget exceeded by 20%. Review purchases this month.',
        actionRequired: false,
      },
      {
        severity: 'info',
        message: 'Your savings rate is in the top 15% of users.',
        actionRequired: false,
      },
    ],
    createdAt: getRecentDate(45),
  },
  {
    id: 'ana_2',
    userId: USER_ID,
    month: CURRENT_MONTH,
    year: CURRENT_YEAR,
    summaryText:
      'Total Income: $2,950. Total Expenses: $934.20. Net Savings: $2,015.80 (68.3% savings rate). Top expense categories: Rent ($600), Food ($109), Shopping ($120.50).',
    aiResult:
      'Outstanding month! Your spending is well-controlled and you are exceeding savings targets. The significant reduction in discretionary spending shows great financial discipline. Maintain this momentum!',
    confidenceScore: 0.92,
    analysisType: 'monthly',
    recommendations: [
      {
        category: 'Savings',
        priority: 'high',
        title: 'Emergency Fund Boost',
        description: 'Your emergency fund should cover 6 months of expenses. Current savings allow you to build this rapidly.',
        estimatedSavings: 120,
      },
      {
        category: 'Investment',
        priority: 'high',
        title: 'Start Investment Portfolio',
        description: 'With consistent high savings, consider investing in index funds or mutual funds for long-term growth.',
        estimatedSavings: 250,
      },
      {
        category: 'Food & Dining',
        priority: 'low',
        title: 'Maintain Current Spending',
        description: 'Your food spending is optimal. Keep up the good meal planning habits!',
        estimatedSavings: 0,
      },
    ],
    transactionSummary: {
      totalIncome: 2950,
      totalExpenses: 934.2,
      netSavings: 2015.8,
      averageTransaction: 93.42,
      topCategories: [
        { name: 'Rent', amount: 600, percentage: 64.2 },
        { name: 'Food & Dining', amount: 109, percentage: 11.7 },
        { name: 'Shopping', amount: 120.5, percentage: 12.9 },
        { name: 'Transport', amount: 5.5, percentage: 0.6 },
        { name: 'Healthcare', amount: 25, percentage: 2.7 },
      ],
    },
    budgetInsights: [
      {
        categoryId: 'cat_1',
        categoryName: 'Food & Dining',
        budgeted: 300,
        spent: 109,
        status: 'on-track',
        percentageUsed: 36,
      },
      {
        categoryId: 'cat_2',
        categoryName: 'Transport',
        budgeted: 80,
        spent: 5.5,
        status: 'on-track',
        percentageUsed: 7,
      },
      {
        categoryId: 'cat_5',
        categoryName: 'Shopping',
        budgeted: 150,
        spent: 120.5,
        status: 'on-track',
        percentageUsed: 80,
      },
      {
        categoryId: 'cat_6',
        categoryName: 'Entertainment',
        budgeted: 100,
        spent: 0,
        status: 'on-track',
        percentageUsed: 0,
      },
      {
        categoryId: 'cat_7',
        categoryName: 'Utilities',
        budgeted: 60,
        spent: 45.2,
        status: 'on-track',
        percentageUsed: 75,
      },
    ],
    spendingMetrics: {
      savingsRate: 68.3,
      incomeStability: 0.99,
      expenseVariance: 0.18,
      budgetAdherence: 0.95,
    },
    trends: [
      {
        name: 'Food Expenses',
        direction: 'down',
        percentageChange: -62,
        timeframe: 'vs last month',
      },
      {
        name: 'Total Expenses',
        direction: 'down',
        percentageChange: -34,
        timeframe: 'vs last month',
      },
      {
        name: 'Savings Rate',
        direction: 'up',
        percentageChange: 32,
        timeframe: 'vs last month',
      },
    ],
    alerts: [
      {
        severity: 'info',
        message: 'Food & Dining budget utilization dropped to 36%. Great cost control!',
        actionRequired: false,
      },
      {
        severity: 'info',
        message: 'Your savings goals are on track. Maintain current spending habits.',
        actionRequired: false,
      },
    ],
    createdAt: getRecentDate(5),
  },
  {
    id: 'ana_3',
    userId: USER_ID,
    month: CURRENT_MONTH - 2 === 0 ? 12 : CURRENT_MONTH - 2,
    year: CURRENT_MONTH - 2 === 0 ? CURRENT_YEAR - 1 : CURRENT_YEAR,
    summaryText:
      'Total Income: $2,750. Total Expenses: $1,680. Net Savings: $1,070 (38.9% savings rate). Top expense categories: Rent ($600), Food ($420), Entertainment ($180).',
    aiResult:
      'Good month overall with stable income and controlled expenses. However, food expenses spiked this month. Your entertainment spending is slightly elevated. Focus on meal prepping next month to reduce dining costs.',
    confidenceScore: 0.88,
    analysisType: 'monthly',
    recommendations: [
      {
        category: 'Food & Dining',
        priority: 'high',
        title: 'Create Meal Plan',
        description: 'Food spending jumped 31% this month. Create a weekly meal plan to reduce restaurant visits.',
        estimatedSavings: 140,
      },
      {
        category: 'Entertainment',
        priority: 'medium',
        title: 'Cancel Unused Subscriptions',
        description: 'Review streaming and entertainment subscriptions for unused services.',
        estimatedSavings: 50,
      },
      {
        category: 'Shopping',
        priority: 'low',
        title: 'Plan Major Purchases',
        description: 'Consider creating a wish list and waiting 30 days before making purchases.',
        estimatedSavings: 30,
      },
    ],
    transactionSummary: {
      totalIncome: 2750,
      totalExpenses: 1680,
      netSavings: 1070,
      averageTransaction: 168,
      topCategories: [
        { name: 'Rent', amount: 600, percentage: 35.7 },
        { name: 'Food & Dining', amount: 420, percentage: 25.0 },
        { name: 'Entertainment', amount: 180, percentage: 10.7 },
        { name: 'Shopping', amount: 250, percentage: 14.9 },
        { name: 'Transport', amount: 150, percentage: 8.9 },
      ],
    },
    budgetInsights: [
      {
        categoryId: 'cat_1',
        categoryName: 'Food & Dining',
        budgeted: 300,
        spent: 420,
        status: 'over-budget',
        percentageUsed: 140,
      },
      {
        categoryId: 'cat_2',
        categoryName: 'Transport',
        budgeted: 80,
        spent: 150,
        status: 'over-budget',
        percentageUsed: 188,
      },
      {
        categoryId: 'cat_5',
        categoryName: 'Shopping',
        budgeted: 150,
        spent: 250,
        status: 'over-budget',
        percentageUsed: 167,
      },
      {
        categoryId: 'cat_6',
        categoryName: 'Entertainment',
        budgeted: 100,
        spent: 180,
        status: 'over-budget',
        percentageUsed: 180,
      },
    ],
    spendingMetrics: {
      savingsRate: 38.9,
      incomeStability: 0.95,
      expenseVariance: 0.52,
      budgetAdherence: 0.65,
    },
    trends: [
      {
        name: 'Food Expenses',
        direction: 'up',
        percentageChange: 31,
        timeframe: 'vs last month',
      },
      {
        name: 'Entertainment Spending',
        direction: 'up',
        percentageChange: 45,
        timeframe: 'vs 2 months ago',
      },
      {
        name: 'Budget Adherence',
        direction: 'down',
        percentageChange: -15,
        timeframe: 'vs last month',
      },
    ],
    alerts: [
      {
        severity: 'critical',
        message: 'Transport budget exceeded by 88%! Review transportation expenses.',
        actionRequired: true,
      },
      {
        severity: 'warning',
        message: 'Multiple budget categories over limit. Food & Dining 40% over budget.',
        actionRequired: true,
      },
      {
        severity: 'warning',
        message: 'Shopping expenses 67% over budget. Consider implementing a purchase freeze.',
        actionRequired: false,
      },
    ],
    createdAt: getRecentDate(75),
  },
  {
    id: 'ana_4',
    userId: USER_ID,
    month: 1,
    year: CURRENT_YEAR,
    summaryText:
      'Quarterly Analysis: Total Income: $8,650. Total Expenses: $4,034.20. Net Savings: $4,615.80 (53.4% quarterly savings rate). Q1 showed strong financial discipline.',
    aiResult:
      'Q1 2026 Performance: Your quarterly savings rate of 53.4% exceeds the average by 25%. Your income has remained stable while you have successfully controlled expenses in 9 out of 10 budget categories. Your emergency fund is building well.',
    confidenceScore: 0.96,
    analysisType: 'quarterly',
    recommendations: [
      {
        category: 'Investment',
        priority: 'high',
        title: 'Initiate Retirement Planning',
        description: 'With consistent high savings, start or increase contributions to retirement accounts.',
        estimatedSavings: 400,
      },
      {
        category: 'Goal Setting',
        priority: 'high',
        title: 'Set Long-term Financial Goals',
        description: 'With your strong savings rate, define goals for house down payment, vehicle, or education.',
        estimatedSavings: 0,
      },
      {
        category: 'Risk Management',
        priority: 'medium',
        title: 'Review Insurance Coverage',
        description: 'Ensure adequate health and life insurance coverage given your income level.',
        estimatedSavings: 0,
      },
    ],
    transactionSummary: {
      totalIncome: 8650,
      totalExpenses: 4034.2,
      netSavings: 4615.8,
      averageTransaction: 129.5,
      topCategories: [
        { name: 'Rent', amount: 1800, percentage: 44.6 },
        { name: 'Food & Dining', amount: 714, percentage: 17.7 },
        { name: 'Shopping', amount: 550, percentage: 13.6 },
        { name: 'Entertainment', amount: 258, percentage: 6.4 },
        { name: 'Utilities', amount: 120, percentage: 3.0 },
      ],
    },
    budgetInsights: [
      {
        categoryId: 'cat_1',
        categoryName: 'Food & Dining',
        budgeted: 900,
        spent: 714,
        status: 'on-track',
        percentageUsed: 79,
      },
      {
        categoryId: 'cat_2',
        categoryName: 'Transport',
        budgeted: 240,
        spent: 215,
        status: 'on-track',
        percentageUsed: 90,
      },
      {
        categoryId: 'cat_5',
        categoryName: 'Shopping',
        budgeted: 450,
        spent: 550,
        status: 'warning',
        percentageUsed: 122,
      },
      {
        categoryId: 'cat_6',
        categoryName: 'Entertainment',
        budgeted: 300,
        spent: 258,
        status: 'on-track',
        percentageUsed: 86,
      },
    ],
    spendingMetrics: {
      savingsRate: 53.4,
      incomeStability: 0.97,
      expenseVariance: 0.28,
      budgetAdherence: 0.91,
    },
    trends: [
      {
        name: 'Quarterly Savings vs Goal',
        direction: 'up',
        percentageChange: 7,
        timeframe: 'Above 50% target',
      },
      {
        name: 'Budget Adherence',
        direction: 'stable',
        percentageChange: 0,
        timeframe: 'Consistent quarter',
      },
      {
        name: 'Income Stability',
        direction: 'up',
        percentageChange: 2,
        timeframe: 'Very reliable',
      },
    ],
    alerts: [
      {
        severity: 'info',
        message: 'Q1 Performance: You are tracking well toward annual savings goals.',
        actionRequired: false,
      },
      {
        severity: 'info',
        message: 'Projected annual savings: $18,463. Consider financial milestones planning.',
        actionRequired: false,
      },
    ],
    createdAt: getRecentDate(90),
  },
  {
    id: 'ana_5',
    userId: USER_ID,
    month: CURRENT_MONTH,
    year: CURRENT_YEAR,
    summaryText:
      'Weekly Flash Analysis: Current week expenses: $334.20. Weekly rate projection: $1,336.80/month.',
    aiResult:
      'This week you are tracking slightly above your typical weekly average. Monitor weekend spending to stay on track for the month.',
    confidenceScore: 0.82,
    analysisType: 'weekly',
    recommendations: [
      {
        category: 'Spending Control',
        priority: 'medium',
        title: 'Weekend Spending Analysis',
        description: 'Review weekend transactions to identify discretionary spending patterns.',
        estimatedSavings: 50,
      },
    ],
    transactionSummary: {
      totalIncome: 0,
      totalExpenses: 334.2,
      netSavings: -334.2,
      averageTransaction: 55.7,
      topCategories: [
        { name: 'Food & Dining', amount: 109, percentage: 32.6 },
        { name: 'Shopping', amount: 120.5, percentage: 36.0 },
        { name: 'Transport', amount: 5.5, percentage: 1.6 },
        { name: 'Healthcare', amount: 25, percentage: 7.5 },
        { name: 'Utilities', amount: 45.2, percentage: 13.5 },
      ],
    },
    budgetInsights: [
      {
        categoryId: 'cat_1',
        categoryName: 'Food & Dining',
        budgeted: 68,
        spent: 109,
        status: 'warning',
        percentageUsed: 160,
      },
    ],
    spendingMetrics: {
      savingsRate: 0,
      incomeStability: 0.0,
      expenseVariance: 0.45,
      budgetAdherence: 0.72,
    },
    trends: [
      {
        name: 'Daily Average Spending',
        direction: 'stable',
        percentageChange: 0,
        timeframe: 'This week',
      },
    ],
    alerts: [
      {
        severity: 'warning',
        message: 'Food & Dining 60% over weekly budget. Pace spending for end of month.',
        actionRequired: false,
      },
    ],
    createdAt: getRecentDate(1),
  },
]
