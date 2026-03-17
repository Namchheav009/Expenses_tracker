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
  createdAt: string
}

export interface User {
  id: string
  name: string
  email: string
  role?: 'admin' | 'user'
  username?: string
  isActive?: boolean
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
      'Total Income: $2,950. Total Expenses: $1,420. Top expense categories: Rent ($600), Food ($320), Shopping ($180).',
    aiResult:
      'Great job this month! You saved over 50% of your income. \n\n• Your food expenses were slightly higher than average. Consider meal prepping to reduce dining out costs.\n• You have a healthy balance in your ABA account. Consider moving some of this to a high-yield savings account.\n• Your transport costs are well optimized.',
    createdAt: getRecentDate(15),
  },
  {
    id: 'ana_2',
    userId: USER_ID,
    month: CURRENT_MONTH,
    year: CURRENT_YEAR,
    summaryText:
      'Total Income: $2,950. Total Expenses: $934.20. Top expense categories: Rent ($600), Food ($109), Shopping ($120.50).',
    aiResult:
      'You are on track to meet your savings goals this month. \n\n• You are currently under budget for Food & Dining. Keep it up!\n• Entertainment expenses are rising compared to last week. Keep an eye on weekend spending.\n• Consider setting up an emergency fund with your extra Wing balance.',
    createdAt: getRecentDate(2),
  },
]
