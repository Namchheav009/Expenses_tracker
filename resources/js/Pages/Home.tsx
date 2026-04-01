import { useState, useEffect } from 'react'
import { Sidebar } from '@/Components/Sidebar'
import { Dashboard } from './Dashboard'
import { Transactions } from './Transactions'
import { Wallets } from './Wallets'
import { Categories } from './Categories'
import { Budgets } from './Budgets'
import { AIAnalysis } from './AIAnalysis'
import AdminPanel from './AdminPanel'
import { Users } from './Users'
import AuthPage from './Auth/AuthPage'
import {
  mockTransactions,
  mockWallets,
  mockCategories,
  mockBudgets,
  mockAnalyses,
  User,
} from '@/data/mockData'
import type {
  Transaction,
  Wallet,
  Category,
  Budget,
  AIAnalysis as AIAnalysisType,
} from '@/data/mockData'
import api, {
  categoriesApi,
  walletsApi,
  transactionsApi,
  budgetsApi,
  aiAnalysesApi,
  adminApi,
} from '@/services/api'
import { confirmLogout, showSavedToast } from '@/Components/confirmDelete'

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentPage, setCurrentPage] = useState<string>(() => {
    return localStorage.getItem('currentPage') || 'dashboard'
  })
  const [transactions, setTransactions] =
    useState<Transaction[]>(mockTransactions)
  const [wallets, setWallets] = useState<Wallet[]>(mockWallets)
  const [categories, setCategories] = useState<Category[]>(mockCategories)
  const [budgets, setBudgets] = useState<Budget[]>(mockBudgets)
  const [analyses, setAnalyses] = useState<AIAnalysisType[]>(mockAnalyses)
  const [users, setUsers] = useState<User[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const setCurrentPageAndPersist = (page: string) => {
    setCurrentPage(page)
    localStorage.setItem('currentPage', page)
  }

  const normalizeTransaction = (t: any): Transaction => ({
    ...t,
    id: String(t.id),
    userId: String(t.user_id ?? t.userId ?? ''),
    walletId: String(t.wallet_id ?? t.walletId ?? ''),
    categoryId: String(t.category_id ?? t.categoryId ?? ''),
    amount: Number(t.amount),
    transactionType: t.transaction_type || t.transactionType || 'expense',
    date: t.transaction_date || t.date || '',
    createdAt: t.created_at || t.createdAt || '',
    title: t.description || t.title || '',
    note: t.note || '',
  })

  const normalizeWallet = (w: any): Wallet => ({
    ...w,
    id: String(w.id),
    userId: String(w.user_id ?? w.userId ?? ''),
    balance: Number(w.balance),
  })

  const normalizeCategory = (c: any): Category => ({
    ...c,
    id: String(c.id),
    userId: String(c.user_id ?? c.userId ?? ''),
    type: c.type || 'expense',
  })

  const normalizeBudget = (b: any): Budget => ({
    ...b,
    id: String(b.id),
    userId: String(b.user_id ?? b.userId ?? ''),
    categoryId: String(b.category_id ?? b.categoryId ?? ''),
    limitAmount: Number(b.amount ?? b.limitAmount),
    month: Number(b.month),
    year: Number(b.year),
  })

  const normalizeAnalysis = (a: any): AIAnalysisType => ({
    ...a,
    id: String(a.id),
    userId: String(a.user_id ?? a.userId ?? ''),
    month: Number(a.month),
    year: Number(a.year),
    summaryText: a.summary_text ?? a.summaryText ?? '',
    aiResult: a.ai_result ?? a.aiResult ?? '',
    confidenceScore: Number(a.confidence_score ?? a.confidenceScore ?? 0.8),
    analysisType: a.analysis_type ?? a.analysisType ?? 'monthly',
    recommendations: a.recommendations ?? [],
    transactionSummary: a.transaction_summary ?? a.transactionSummary ?? {
      totalIncome: 0,
      totalExpenses: 0,
      netSavings: 0,
      averageTransaction: 0,
      topCategories: [],
    },
    budgetInsights: a.budget_insights ?? a.budgetInsights ?? [],
    spendingMetrics: a.spending_metrics ?? a.spendingMetrics ?? {
      savingsRate: 0,
      incomeStability: 0,
      expenseVariance: 0,
      budgetAdherence: 0,
    },
    trends: a.trends ?? [],
    alerts: a.alerts ?? [],
    createdAt: a.created_at ?? a.createdAt ?? '',
  })

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

        const [userRes, catRes, walletRes, txnRes, budgetRes, analysisRes] = await Promise.all([
          api.get('/user'),
          categoriesApi.index(),
          walletsApi.index(),
          transactionsApi.index(),
          budgetsApi.index(),
          aiAnalysesApi.index(),
        ])

        const currentUser = {
          id: String(userRes.data.id),
          name:
            userRes.data.name ||
            userRes.data.username ||
            userRes.data.email?.split('@')[0] ||
            'You',
          email: userRes.data.email,
          role: userRes.data.role ?? 'user',
        }

        setUser(currentUser)
        setUsers([currentUser])
        setIsAuthenticated(true)

        // If admin, default to admin panel unless user already selected a different page.
        if (currentUser.role === 'admin') {
          const storedPage = localStorage.getItem('currentPage')
          if (!storedPage || storedPage === 'dashboard') {
            setCurrentPageAndPersist('admin')
          }
        } else {
          // Ensure non-admin users don't land on admin pages
          const storedPage = localStorage.getItem('currentPage')
          if (storedPage === 'admin' || storedPage === 'users') {
            setCurrentPageAndPersist('dashboard')
          }
        }

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

        // If admin, load all users for admin data views
        if (currentUser.role === 'admin') {
          try {
            const usersRes = await adminApi.users()
            const normalizedUsers = (usersRes.data?.data || usersRes.data || []).map((u: any) => ({
              ...u,
              id: String(u.id),
              username: u.name || u.email?.split('@')[0] || '',
              name: u.name || u.email?.split('@')[0] || '',
              email: u.email,
              role: u.role || 'user',
              isActive: u.is_active !== undefined ? Boolean(u.is_active) : true,
              dateJoined: u.created_at || new Date().toISOString(),
            }))
            setUsers(normalizedUsers)
          } catch (err) {
            console.error('Failed to load users for admin:', err)
          }
        }
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
          (txnRes.data?.data || txnRes.data || mockTransactions).map((t: any) =>
            normalizeTransaction(t),
          ),
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

        setAnalyses(
          (analysisRes.data?.data || analysisRes.data || mockAnalyses).map((a: any) => normalizeAnalysis(a)),
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
          setUser(null)
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

  const handleLogout = async () => {
    const confirmed = await confirmLogout()
    if (!confirmed) return

    try {
      await api.post('/logout')
    } catch {
      // ignore errors - proceed with clearing locally
    }

    localStorage.removeItem('auth_token')
    showSavedToast('You have been logged out')
    setTimeout(() => {
      window.location.reload()
    }, 700)
  }

  const handleEditUser = (user: User) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === user.id ? { ...u, ...user } : u
      )
    )
  }

  const handleAddTransaction = async (txn: Omit<Transaction, 'id' | 'createdAt'>) => {
    try {
      // Transform to API expected format (snake_case)
      const apiTxn = {
        wallet_id: txn.walletId,
        category_id: txn.categoryId,
        amount: txn.amount,
        transaction_type: txn.transactionType,
        description: txn.title, // API expects 'description', frontend uses 'title'
        note: txn.note,
        transaction_date: txn.date, // API expects 'transaction_date', frontend uses 'date'
      }
      
      // All transactions (including transfers) go through the API
      const response = await transactionsApi.store(apiTxn)
      const newTxn = normalizeTransaction(response.data)
      setTransactions((prev) => [newTxn, ...prev])
      
      // Only update wallet balance for non-transfer transactions
      // Transfer transactions already have their wallet balances updated in Wallets.tsx
      if (txn.categoryId !== 'transfer') {
        setWallets((prev) =>
          prev.map((w) => {
            if (w.id.toString() === txn.walletId.toString()) {
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
      }
    } catch (err: any) {
      const errorMsg = err?.response?.data?.error || err?.message || 'Failed to add transaction'
      console.error('Error adding transaction:', err)
      setError(errorMsg)
    }
  }

  const handleUpdateTransaction = async (id: string, txn: Omit<Transaction, 'id' | 'createdAt'>) => {
    try {
      // Transform to API expected format (snake_case)
      const apiTxn = {
        wallet_id: txn.walletId,
        category_id: txn.categoryId,
        amount: txn.amount,
        transaction_type: txn.transactionType,
        description: txn.title,
        note: txn.note,
        transaction_date: txn.date,
      }
      const response = await transactionsApi.update(id, apiTxn)
      const updatedTxn = normalizeTransaction(response.data)
      setTransactions((prev) => prev.map((t) => (t.id === id ? updatedTxn : t)))
      
      // Skip wallet balance updates for transfer transactions
      if (txn.categoryId === 'transfer') {
        return
      }
      
      // Update wallet balances (revert old transaction impact, apply new impact)
      const originalTxn = transactions.find((t) => t.id === id)
      if (originalTxn) {
        const oldImpact =
          originalTxn.transactionType === 'income'
            ? originalTxn.amount
            : -originalTxn.amount
        const newImpact =
          txn.transactionType === 'income' ? txn.amount : -txn.amount
        const diff = newImpact - oldImpact

        setWallets((prev) =>
          prev.map((w) => {
            const walletId = w.id.toString()
            const oldWalletId = originalTxn.walletId.toString()
            const newWalletId = txn.walletId.toString()

            // Same wallet: just apply the difference
            if (walletId === oldWalletId && walletId === newWalletId) {
              return {
                ...w,
                balance: w.balance + diff,
              }
            }

            // Wallet changed: revert old, apply to new
            if (walletId === oldWalletId) {
              return {
                ...w,
                balance: w.balance - oldImpact,
              }
            }
            if (walletId === newWalletId) {
              return {
                ...w,
                balance: w.balance + newImpact,
              }
            }

            return w
          }),
        )
      }
    } catch (err: any) {
      const errorMsg = err?.response?.data?.error || err?.message || 'Failed to update transaction'
      console.error('Error updating transaction:', err)
      setError(errorMsg)
    }
  }

  const handleDeleteTransaction = async (id: string) => {
    try {
      const txn = transactions.find((t) => t.id === id)
      if (!txn) return
      
      await transactionsApi.destroy(id)
      
      setWallets((prev) =>
        prev.map((w) => {
          if (w.id.toString() === txn.walletId.toString()) {
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
      if (user?.role === 'admin') {
        const response = await adminApi.createWallet({
          user_id: wallet.userId,
          name: wallet.name,
          balance: wallet.balance,
          currency: 'USD',
        })
        const rawWallet = response.data?.data || response.data
        const newWallet = normalizeWallet(rawWallet)
        setWallets((prev) => [...prev, newWallet])
      } else {
        const response = await walletsApi.store({
          ...wallet,
          currency: 'USD',
        })
        const newWallet = normalizeWallet(response.data)
        setWallets((prev) => [...prev, newWallet])
      }
    } catch (err) {
      console.error('Error adding wallet:', err)
      setError('Failed to add wallet')
    }
  }

  const handleUpdateWallet = async (id: string, wallet: Omit<Wallet, 'id'>) => {
    try {
      if (user?.role === 'admin') {
        const response = await adminApi.updateWallet(id, {
          user_id: wallet.userId,
          name: wallet.name,
          balance: wallet.balance,
          currency: 'USD',
        })
        const rawWallet = response.data?.data || response.data
        const updatedWallet = normalizeWallet(rawWallet)
        setWallets((prev) => prev.map((w) => (w.id === id ? updatedWallet : w)))
      } else {
        const response = await walletsApi.update(id, {
          ...wallet,
          currency: 'USD',
        })
        const updatedWallet = normalizeWallet(response.data)
        setWallets((prev) => prev.map((w) => (w.id === id ? updatedWallet : w)))
      }
    } catch (err) {
      console.error('Error updating wallet:', err)
      setError('Failed to update wallet')
    }
  }

  const handleDeleteWallet = async (id: string) => {
    try {
      if (user?.role === 'admin') {
        await adminApi.deleteWallet(id)
      } else {
        await walletsApi.destroy(id)
      }
      setWallets((prev) => prev.filter((w) => w.id !== id))
    } catch (err) {
      console.error('Error deleting wallet:', err)
      setError('Failed to delete wallet')
    }
  }

  const handleAddCategory = async (category: Omit<Category, 'id'>) => {
    try {
      const payload = user?.role === 'admin'
        ? {
            user_id: category.userId,
            name: category.name,
            type: category.type,
          }
        : {
            name: category.name,
            type: category.type,
          }

      const response = await categoriesApi.store(payload)
      const rawCategory = response.data
      const newCategory = normalizeCategory(rawCategory)
      setCategories((prev) => [...prev, newCategory])
    } catch (err) {
      console.error('Error adding category:', err)
      setError('Failed to add category')
    }
  }

  const handleUpdateCategory = async (id: string, category: Omit<Category, 'id'>) => {
    try {
      const payload = user?.role === 'admin'
        ? {
            user_id: category.userId,
            name: category.name,
            type: category.type,
          }
        : {
            name: category.name,
            type: category.type,
          }

      const response = await categoriesApi.update(id, payload)
      const rawCategory = response.data
      const updatedCategory = normalizeCategory(rawCategory)
      setCategories((prev) => prev.map((c) => c.id === id ? updatedCategory : c))
    } catch (err) {
      console.error('Error updating category:', err)
      setError('Failed to update category')
    }
  }

  const handleDeleteCategory = async (id: string) => {
    try {
      await categoriesApi.destroy(id)
      setCategories((prev) => prev.filter((c) => c.id !== id))
    } catch (err) {
      console.error('Error deleting category:', err)
      setError('Failed to delete category')
    }
  }

  const handleAddBudget = async (budget: Omit<Budget, 'id'>) => {
    try {
      const apiBudget = {
        category_id: budget.categoryId,
        amount: budget.limitAmount,
        month: budget.month,
        year: budget.year,
        ...(budget.userId ? { user_id: budget.userId } : {}),
      }
      const response = await budgetsApi.store(apiBudget)
      const newBudget = normalizeBudget(response.data)
      setBudgets((prev) => [...prev, newBudget])
    } catch (err) {
      console.error('Error adding budget:', err)
      setError('Failed to add budget')
    }
  }

  const handleUpdateBudget = async (id: string, budget: Omit<Budget, 'id'>) => {
    try {
      const apiBudget = {
        category_id: budget.categoryId,
        amount: budget.limitAmount,
        month: budget.month,
        year: budget.year,
        ...(budget.userId ? { user_id: budget.userId } : {}),
      }
      const response = await budgetsApi.update(id, apiBudget)
      const updatedBudget = normalizeBudget(response.data)
      setBudgets((prev) => prev.map((b) => (b.id === id ? updatedBudget : b)))
    } catch (err) {
      console.error('Error updating budget:', err)
      setError('Failed to update budget')
    }
  }

  const handleDeleteBudget = async (id: string) => {
    try {
      await budgetsApi.destroy(id)
      setBudgets((prev) => prev.filter((b) => b.id !== id))
    } catch (err) {
      console.error('Error deleting budget:', err)
      setError('Failed to delete budget')
    }
  }

  const handleGenerateAnalysis = async () => {
    const totalIncome = transactions
      .filter((t) => t.transactionType === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
    const totalExpense = transactions
      .filter((t) => t.transactionType === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    const budgetSummaries = budgets.map((b) => {
      const spent = transactions
        .filter((t) => t.transactionType === 'expense')
        .filter((t) => t.categoryId === b.categoryId)
        .reduce((sum, t) => sum + t.amount, 0)
      const percent = b.limitAmount > 0 ? Math.min((spent / b.limitAmount) * 100, 999) : 0
      return {
        categoryId: b.categoryId,
        spent,
        limit: b.limitAmount,
        percent,
      }
    })

    const overBudgetCount = budgetSummaries.filter((b) => b.spent > b.limit).length

    const mostExpensiveCategory = (() => {
      const totals = transactions.reduce<Record<string, number>>((acc, t) => {
        if (t.transactionType !== 'expense') return acc
        const current = acc[t.categoryId] ?? 0
        acc[t.categoryId] = current + t.amount
        return acc
      }, {})

      const entries = Object.entries(totals)
      if (!entries.length) return 'N/A'

      const [topCatId] = entries.sort((a, b) => b[1] - a[1])[0]
      return categories.find((c) => c.id === topCatId)?.name || 'N/A'
    })()

    const summaryText = `In the last ${transactions.length} transactions, you earned $${totalIncome.toFixed(
      2,
    )} and spent $${totalExpense.toFixed(2)}. You have ${budgets.length} budgets, ${overBudgetCount} of which are currently over budget.`

    const aiResult = [
      `• Total income: $${totalIncome.toFixed(2)}`,
      `• Total expenses: $${totalExpense.toFixed(2)}`,
      `• Most expensive category: ${mostExpensiveCategory}`,
      overBudgetCount
        ? `• You are over budget in ${overBudgetCount} category(ies). Consider reviewing those budgets.`
        : '• All budgets are within limits. Great job!',
    ].join('\n\n')

    const newAnalysis: AIAnalysisType = {
      id: `ana_${Date.now()}`,
      userId: user?.id ?? 'unknown',
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      summaryText,
      aiResult,
      createdAt: new Date().toISOString(),
      confidenceScore: 0.85,
      analysisType: 'monthly',
      recommendations: [
        {
          category: 'General',
          priority: overBudgetCount > 0 ? 'high' : 'medium',
          title: overBudgetCount > 0 ? 'Review Over-Budget Categories' : 'Maintain Budget Performance',
          description: overBudgetCount
            ? `You are over budget in ${overBudgetCount} category(ies). Review and adjust spending.`
            : 'All budgets are within limits. Continue current spending habits.',
        },
      ],
      transactionSummary: {
        totalIncome,
        totalExpenses: totalExpense,
        netSavings: totalIncome - totalExpense,
        averageTransaction: transactions.length > 0 ? (totalIncome + totalExpense) / transactions.length : 0,
        topCategories: [],
      },
      budgetInsights: [],
      spendingMetrics: {
        savingsRate: totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0,
        incomeStability: 0.8,
        expenseVariance: 0.5,
        budgetAdherence: budgets.length > 0 ? Math.max(0, 1 - (overBudgetCount / budgets.length) * 0.5) : 1,
      },
      trends: [
        {
          name: 'Total Spending',
          direction: 'stable',
          percentageChange: 0,
          timeframe: 'this month',
        },
      ],
      alerts: overBudgetCount
        ? [
            {
              severity: 'warning' as const,
              message: `You are over budget in ${overBudgetCount} category(ies).`,
              actionRequired: true,
            },
          ]
        : [],
    }

    try {
      const response = await aiAnalysesApi.store({
        month: newAnalysis.month,
        year: newAnalysis.year,
        summary_text: newAnalysis.summaryText,
        ai_result: newAnalysis.aiResult,
      })

      const saved = normalizeAnalysis(response.data)
      setAnalyses((prev) => [saved, ...prev])
    } catch (err) {
      console.error('Error saving analysis:', err)
      setAnalyses((prev) => [newAnalysis, ...prev])
    }
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
            onUpdateTransaction={handleUpdateTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            isAdmin={user?.role === 'admin'}
            users={users}
            currentUserId={user?.id ?? ''}
          />
        )
      case 'wallets':
        return <Wallets wallets={wallets} onAddWallet={handleAddWallet} onUpdateWallet={handleUpdateWallet} onDeleteWallet={handleDeleteWallet} onAddTransaction={handleAddTransaction} isAdmin={user?.role === 'admin'} users={users} currentUserId={user?.id ?? ''} />
      case 'categories':
        return (
          <Categories
            categories={categories}
            onAddCategory={handleAddCategory}
            onUpdateCategory={handleUpdateCategory}
            onDeleteCategory={handleDeleteCategory}
            isAdmin={user?.role === 'admin'}
            users={users}
            currentUserId={user?.id ?? ''}
          />
        )
      case 'budgets':
        return (
          <Budgets
            budgets={budgets}
            categories={categories}
            transactions={transactions}
            onAddBudget={handleAddBudget}
            onUpdateBudget={handleUpdateBudget}
            onDeleteBudget={handleDeleteBudget}
            isAdmin={user?.role === 'admin'}
            users={users}
            currentUserId={user?.id ?? ''}
          />
        )
      case 'ai-analysis':
        return (
          <AIAnalysis analyses={analyses} onGenerate={handleGenerateAnalysis} />
        )
      case 'admin':
        return user?.role === 'admin' ? (
          <AdminPanel
            users={users}
            transactions={transactions}
            wallets={wallets}
            categories={categories}
            budgets={budgets}
            onEditUser={handleEditUser}
          />
        ) : (
          <Dashboard
            transactions={transactions}
            wallets={wallets}
            budgets={budgets}
            categories={categories}
          />
        )
      case 'users':
        return user?.role === 'admin' ? <Users /> : <Dashboard
          transactions={transactions}
          wallets={wallets}
          budgets={budgets}
          categories={categories}
        />
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <AuthPage />
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPageAndPersist}
        currentUser={user ?? { id: '', name: 'Loading...', email: '', role: 'user' }}
        onLogout={handleLogout}
      />
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
