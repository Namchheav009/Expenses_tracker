import { useState, useEffect } from 'react'
import { Sidebar } from '@/Components/Sidebar'
import { Dashboard } from './Dashboard'
import { Transactions } from './Transactions'
import { Wallets } from './Wallets'
import { Categories } from './Categories'
import { Budgets } from './Budgets'
import { AIAnalysis } from './AIAnalysis'
import Login from './Login'
import {
  mockTransactions,
  mockWallets,
  mockCategories,
  mockBudgets,
  mockAnalyses,
} from '@/data/mockData'
import type {
  Transaction,
  Wallet,
  Category,
  Budget,
  AIAnalysis as AIAnalysisType,
} from '@/data/mockData'
import {
  categoriesApi,
  walletsApi,
  transactionsApi,
  budgetsApi,
} from '@/services/api'

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [transactions, setTransactions] =
    useState<Transaction[]>(mockTransactions)
  const [wallets, setWallets] = useState<Wallet[]>(mockWallets)
  const [categories, setCategories] = useState<Category[]>(mockCategories)
  const [budgets, setBudgets] = useState<Budget[]>(mockBudgets)
  const [analyses, setAnalyses] = useState<AIAnalysisType[]>(mockAnalyses)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Check authentication and fetch data on component mount
  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      const token = localStorage.getItem('auth_token')
      
      if (!token) {
        setIsAuthenticated(false)
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setIsAuthenticated(true)
        
        const [catRes, walletRes, txnRes, budgetRes] = await Promise.all([
          categoriesApi.index(),
          walletsApi.index(),
          transactionsApi.index(),
          budgetsApi.index(),
        ])

        console.log('API Responses:', { catRes, walletRes, txnRes, budgetRes })

        // Normalize categories
        setCategories(
          (catRes.data?.data || catRes.data || mockCategories).map((c: any) => ({
            ...c,
            id: String(c.id),
            userId: String(c.user_id),
            type: c.type || 'expense',
          }))
        )
        // Normalize wallets
        setWallets(
          (walletRes.data?.data || walletRes.data || mockWallets).map((w: any) => ({
            ...w,
            id: String(w.id),
            userId: String(w.user_id),
            balance: Number(w.balance),
          }))
        )
        // Normalize transactions
        setTransactions(
          (txnRes.data?.data || txnRes.data || mockTransactions).map((t: any) => ({
            ...t,
            id: String(t.id),
            userId: String(t.user_id),
            walletId: String(t.wallet_id),
            categoryId: String(t.category_id),
            amount: Number(t.amount),
            transactionType: t.transaction_type || t.transactionType || 'expense',
            date: t.transaction_date || t.date || '',
            createdAt: t.created_at || t.createdAt || '',
          }))
        )
        // Normalize budgets
        setBudgets(
          (budgetRes.data?.data || budgetRes.data || mockBudgets).map((b: any) => ({
            ...b,
            id: String(b.id),
            userId: String(b.user_id),
            categoryId: String(b.category_id),
            limitAmount: Number(b.amount || b.limitAmount),
            month: Number(b.month),
            year: Number(b.year),
          }))
        )
        setError(null)
      } catch (err: any) {
        console.error('Error fetching data:', err.message, err.response?.data)
        
        // Use mock data as fallback
        setCategories(mockCategories)
        setWallets(mockWallets)
        setTransactions(mockTransactions)
        setBudgets(mockBudgets)
        
        // If 401, user is not authenticated
        if (err.response?.status === 401) {
          localStorage.removeItem('auth_token')
          setIsAuthenticated(false)
          setError('Session expired. Please login again.')
        } else {
          setError(`Connection issue: ${err.message}. Using sample data for now.`)
        }
      } finally {
        setLoading(false)
      }
    }

    checkAuthAndFetchData()
  }, [])

  const handleAddTransaction = async (txn: Omit<Transaction, 'id' | 'createdAt'>) => {
    try {
      const response = await transactionsApi.store(txn)
      const newTxn = response.data
      setTransactions((prev) => [...prev, newTxn])
      
      // Update wallet balance
      setWallets((prev) =>
        prev.map((w) => {
          if (w.id === txn.walletId) {
            return {
              ...w,
              balance:
                txn.transactionType === 'income'
                  ? w.balance + txn.amount
                  : w.balance - txn.amount,
            }
          }
          return w
        }),
      )
    } catch (err) {
      console.error('Error adding transaction:', err)
      setError('Failed to add transaction')
    }
  }

  const handleDeleteTransaction = async (id: string) => {
    try {
      const txn = transactions.find((t) => t.id === id)
      if (!txn) return
      
      await transactionsApi.destroy(id)
      
      setWallets((prev) =>
        prev.map((w) => {
          if (w.id === txn.walletId) {
            return {
              ...w,
              balance:
                txn.transactionType === 'income'
                  ? w.balance - txn.amount
                  : w.balance + txn.amount,
            }
          }
          return w
        }),
      )
      setTransactions((prev) => prev.filter((t) => t.id !== id))
    } catch (err) {
      console.error('Error deleting transaction:', err)
      setError('Failed to delete transaction')
    }
  }

  const handleAddWallet = async (wallet: Omit<Wallet, 'id'>) => {
    try {
      const response = await walletsApi.store(wallet)
      const newWallet = response.data
      setWallets((prev) => [...prev, newWallet])
    } catch (err) {
      console.error('Error adding wallet:', err)
      setError('Failed to add wallet')
    }
  }

  const handleAddCategory = async (category: Omit<Category, 'id'>) => {
    try {
      const response = await categoriesApi.store(category)
      const newCategory = response.data
      setCategories((prev) => [...prev, newCategory])
    } catch (err) {
      console.error('Error adding category:', err)
      setError('Failed to add category')
    }
  }

  const handleAddBudget = async (budget: Omit<Budget, 'id'>) => {
    try {
      const response = await budgetsApi.store(budget)
      const newBudget = response.data
      setBudgets((prev) => [...prev, newBudget])
    } catch (err) {
      console.error('Error adding budget:', err)
      setError('Failed to add budget')
    }
  }

  const handleGenerateAnalysis = () => {
    const newAnalysis: AIAnalysisType = {
      id: `ana_${Date.now()}`,
      userId: 'user_123',
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      summaryText: `Just analyzed ${transactions.length} recent transactions across ${wallets.length} wallets.`,
      aiResult:
        'Based on your latest data, you are managing your expenses well. \n\n• Keep monitoring your discretionary spending.\n• Your recent budget additions look solid.\n• Consider reviewing your subscriptions next month.',
      createdAt: new Date().toISOString(),
    }
    setAnalyses((prev) => [newAnalysis, ...prev])
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard
            transactions={transactions}
            wallets={wallets}
            budgets={budgets}
            categories={categories}
          />
        )
      case 'transactions':
        return (
          <Transactions
            transactions={transactions}
            categories={categories}
            wallets={wallets}
            onAddTransaction={handleAddTransaction}
            onDeleteTransaction={handleDeleteTransaction}
          />
        )
      case 'wallets':
        return <Wallets wallets={wallets} onAddWallet={handleAddWallet} />
      case 'categories':
        return (
          <Categories
            categories={categories}
            onAddCategory={handleAddCategory}
          />
        )
      case 'budgets':
        return (
          <Budgets
            budgets={budgets}
            categories={categories}
            transactions={transactions}
            onAddBudget={handleAddBudget}
          />
        )
      case 'ai-analysis':
        return (
          <AIAnalysis analyses={analyses} onGenerate={handleGenerateAnalysis} />
        )
      default:
        return (
          <Dashboard
            transactions={transactions}
            wallets={wallets}
            budgets={budgets}
            categories={categories}
          />
        )
    }
  }

  if (!isAuthenticated) {
    return <Login />
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main className="flex-1 ml-20 lg:ml-64 p-4 md:p-8 overflow-x-hidden">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-600">Loading...</p>
            </div>
          </div>
        )}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
            <button
              onClick={() => setError('')}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Dismiss
            </button>
          </div>
        )}
        {!loading && renderPage()}
      </main>
    </div>
  )
}
