import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Wallet as WalletIcon, Eye as EyeIcon, EyeOff as EyeOffIcon, AlertCircle as AlertCircleIcon, LogIn as LogInIcon } from 'lucide-react'

import InputError from '@/Components/InputError'
import api from '@/services/api'

export default function Login({
  status,
  canResetPassword = false,
  onSwitchToRegister,
  onLoginSuccess,
}: {
  status?: string
  canResetPassword?: boolean
  onSwitchToRegister?: () => void
  onLoginSuccess?: () => void
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [checkingEmail, setCheckingEmail] = useState(false)
  const [emailExists, setEmailExists] = useState<boolean | null>(null)
  const [error, setError] = useState('')

  const checkEmailExists = async (value: string) => {
    if (!value) {
      setEmailExists(null)
      return
    }

    setCheckingEmail(true)
    try {
      const response = await api.get('/check-email', {
        params: { email: value.trim() },
      })

      const exists = response.data?.exists === true
      setEmailExists(exists)

      if (!exists) {
        setError('No account associated with this email.')
      }
    } catch (err) {
      // Ignore validation check failures; server may be down.
    } finally {
      setCheckingEmail(false)
    }
  }

  // Clear any server session cookies so the frontend can use token auth cleanly
  useEffect(() => {
    const clearCookie = (name: string) => {
      document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT;`
    }

    clearCookie('laravel_session')
    clearCookie('XSRF-TOKEN')
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (emailExists === false) {
      setError('No account associated with this email.')
      return
    }

    setIsLoading(true)
    setError('')

    console.log('Login submit', { email, password, remember })

    try {
      const response = await api.post('/login', {
        email,
        password,
        remember,
      })

      console.log('Login response', response)

      const token = response.data?.token
      if (token) {
        localStorage.setItem('auth_token', token)
        // Call success callback instead of direct redirect
        onLoginSuccess?.()
        return
      }

      setError('Login succeeded but no token was returned.')
    } catch (err: any) {
      console.error('Login error', err)
      const response = err?.response
      if (response?.data?.errors) {
        setError(response.data.errors.email || response.data.errors.password || response.data.errors.general || 'Login failed.')
      } else if (response?.data?.message) {
        setError(response.data.message)
      } else {
        setError('Unable to connect to the server.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {status && (
        <div className="mb-4 rounded-lg bg-green-50 border border-green-200 p-4">
          <div className="flex">
            <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{status}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setError('')
            }}
            placeholder="you@example.com"
            className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError('')
              }}
              placeholder="Enter your password"
              className="w-full px-4 py-2.5 pr-11 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
            >
              {showPassword ? (
                <EyeOffIcon className="w-4 h-4" />
              ) : (
                <EyeIcon className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember"
              name="remember"
              type="checkbox"
              checked={remember}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              onChange={(e) => setRemember(e.target.checked)}
            />
            <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
              Remember me
            </label>
          </div>

          {canResetPassword && (
            <a
              href="/forgot-password"
              className="text-sm text-blue-600 hover:text-blue-500 font-medium transition-colors duration-200"
            >
              Forgot password?
            </a>
          )}
        </div>

        {error && (
          <motion.div
            initial={{
              opacity: 0,
              y: -5,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700"
          >
            <AlertCircleIcon className="w-4 h-4 flex-shrink-0" />
            {error}
          </motion.div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-400 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing in...
            </>
          ) : (
            <>
              <LogInIcon className="w-5 h-5" />
              Sign In
            </>
          )}
        </button>

        <div className="text-center">
          <span className="text-sm text-gray-600">Don't have an account? </span>
          <button
            type="button"
            onClick={() => onSwitchToRegister?.()}
            className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
          >
            Sign up here
          </button>
        </div>
      </form>
    </>
  )
}
