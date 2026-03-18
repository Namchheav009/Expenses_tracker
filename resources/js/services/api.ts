import axios from 'axios'

const API_BASE_URL = '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false,
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      // Redirect to the SPA login page (root) rather than the Laravel session-based login
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

// Categories API
export const categoriesApi = {
  index: () => api.get('/categories'),
  store: (data: any) => api.post('/categories', data),
  show: (id: number | string) => api.get(`/categories/${id}`),
  update: (id: number | string, data: any) => api.put(`/categories/${id}`, data),
  destroy: (id: number | string) => api.delete(`/categories/${id}`),
}

// Wallets API
export const walletsApi = {
  index: () => api.get('/wallets'),
  store: (data: any) => api.post('/wallets', data),
  show: (id: number | string) => api.get(`/wallets/${id}`),
  update: (id: number | string, data: any) => api.put(`/wallets/${id}`, data),
  destroy: (id: number | string) => api.delete(`/wallets/${id}`),
}

// Transactions API
export const transactionsApi = {
  index: () => api.get('/transactions'),
  store: (data: any) => api.post('/transactions', data),
  show: (id: number | string) => api.get(`/transactions/${id}`),
  update: (id: number | string, data: any) => api.put(`/transactions/${id}`, data),
  destroy: (id: number | string) => api.delete(`/transactions/${id}`),
}

// Budgets API
export const budgetsApi = {
  index: () => api.get('/budgets'),
  store: (data: any) => api.post('/budgets', data),
  show: (id: number | string) => api.get(`/budgets/${id}`),
  update: (id: number | string, data: any) => api.put(`/budgets/${id}`, data),
  destroy: (id: number | string) => api.delete(`/budgets/${id}`),
}

// AI Analysis API
export const aiAnalysesApi = {
  index: () => api.get('/ai-analyses'),
  store: (data: any) => api.post('/ai-analyses', data),
}

// Admin API
export const adminApi = {
  stats: () => api.get('/admin/stats'),
  users: () => api.get('/admin/users'),
  createUser: (data: any) => api.post('/admin/users', data),
  updateUser: (id: string | number, data: any) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id: string | number) => api.delete(`/admin/users/${id}`),
  updateUserPassword: (id: string | number, password: string) => api.put(`/admin/users/${id}/password`, { password }),
  updateUserRole: (id: string | number, role: 'admin' | 'user') => api.put(`/admin/users/${id}/role`, { role }),
  updateUserStatus: (id: string | number, isActive: boolean) => api.put(`/admin/users/${id}/status`, { is_active: isActive }),
  activityLogs: () => api.get('/admin/activity-logs'),
  // Admin transaction management
  transactions: () => api.get('/admin/transactions'),
  createTransaction: (data: any) => api.post('/admin/transactions', data),
  updateTransaction: (id: string | number, data: any) => api.put(`/admin/transactions/${id}`, data),
  deleteTransaction: (id: string | number) => api.delete(`/admin/transactions/${id}`),
  // Admin wallet management
  wallets: () => api.get('/admin/wallets'),
  createWallet: (data: any) => api.post('/admin/wallets', data),
  updateWallet: (id: string | number, data: any) => api.put(`/admin/wallets/${id}`, data),
  deleteWallet: (id: string | number) => api.delete(`/admin/wallets/${id}`),
}

export default api
