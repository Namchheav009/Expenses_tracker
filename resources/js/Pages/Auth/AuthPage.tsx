import { useState } from 'react'
import Login from './Login'
import Register from './Register'
import { showSavedToast } from '@/Components/confirmDelete'

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')

  const handleLoginSuccess = () => {
    showSavedToast('Login successful')
    setTimeout(() => {
      window.location.href = '/'
    }, 800)
  }

  const handleRegisterSuccess = () => {
    showSavedToast('Registration successful')
    setTimeout(() => {
      window.location.href = '/'
    }, 800)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">Expense Tracker</h1>
          <p className="mt-2 text-sm text-gray-600">Manage your finances with ease</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors duration-200 ${
                mode === 'login'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors duration-200 ${
                mode === 'register'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form Content */}
          <div className="p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 text-center">
                {mode === 'login' ? 'Welcome back!' : 'Join us today'}
              </h2>
              <p className="mt-2 text-sm text-gray-600 text-center">
                {mode === 'login'
                  ? 'Sign in to access your expense tracker'
                  : 'Create your account to get started'
                }
              </p>
            </div>

            {mode === 'login' ? (
              <Login
                onSwitchToRegister={() => setMode('register')}
                onLoginSuccess={handleLoginSuccess}
              />
            ) : (
              <Register
                onSwitchToLogin={() => setMode('login')}
                onRegisterSuccess={handleRegisterSuccess}
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            By continuing, you agree to our{' '}
            <a href="#" className="text-blue-600 hover:text-blue-500 font-medium">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-blue-600 hover:text-blue-500 font-medium">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
