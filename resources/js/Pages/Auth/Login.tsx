import { useEffect, useState } from 'react'

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
  const [processing, setProcessing] = useState(false)
  const [checkingEmail, setCheckingEmail] = useState(false)
  const [emailExists, setEmailExists] = useState<boolean | null>(null)
  const [errors, setErrors] = useState<{
    email?: string
    password?: string
    general?: string
  }>({})

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
        setErrors((prev) => ({
          ...prev,
          email: 'No account associated with this email.',
        }))
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

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (emailExists === false) {
      setErrors({ email: 'No account associated with this email.' })
      return
    }

    setProcessing(true)
    setErrors({})

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

      setErrors({ general: 'Login succeeded but no token was returned.' })
    } catch (err: any) {
      console.error('Login error', err)
      const response = err?.response
      if (response?.data?.errors) {
        setErrors(response.data.errors)
      } else if (response?.data?.message) {
        setErrors({ general: response.data.message })
      } else {
        setErrors({ general: 'Unable to connect to the server.' })
      }
    } finally {
      setProcessing(false)
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

      {errors.general && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-4">
          <div className="flex">
            <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{errors.general}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={submit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
            </div>
            <input
              id="email"
              type="email"
              name="email"
              value={email}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              placeholder="Enter your email"
              autoComplete="username"
              autoFocus
              onChange={(e) => {
                setEmail(e.target.value)
                setEmailExists(null)
                setErrors((prev) => ({ ...prev, email: undefined }))
              }}
              onBlur={() => checkEmailExists(email)}
            />
          </div>
          <InputError message={errors.email} className="mt-2" />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={password}
              className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              placeholder="Enter your password"
              autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10a9.96 9.96 0 011.175-4.75m1.75 1.75A7.963 7.963 0 003.8 9.5C3.9 12.5 6.5 15 9.5 15a7.963 7.963 0 003.25-.6m3.75-6.9a7.963 7.963 0 011.65 4.75 9.96 9.96 0 01-1.175 4.75M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10a9.962 9.962 0 011.175-4.75M22.825 12.675A9.96 9.96 0 0021.65 7.925M3.27 3.27l17.46 17.46" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.88 9.88a3 3 0 014.24 4.24" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.88 9.88L3.27 3.27" />
                </svg>
              )}
            </button>
          </div>
          <InputError message={errors.password} className="mt-2" />
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

        <button
          type="submit"
          disabled={processing}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {processing ? (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing in...
            </div>
          ) : (
            'Sign In'
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
