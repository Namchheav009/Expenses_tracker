import { FormEvent, useState } from 'react'
import InputError from '@/Components/InputError'
import api from '@/services/api'

export default function Register({
  onSwitchToLogin,
  onRegisterSuccess,
}: {
  onSwitchToLogin?: () => void
  onRegisterSuccess?: () => void
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [errors, setErrors] = useState<{
    name?: string
    email?: string
    password?: string
    password_confirmation?: string
    general?: string
  }>({})

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setProcessing(true)
    setErrors({})

    try {
      const response = await api.post('/register', {
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      })

      const token = response.data?.token
      if (token) {
        localStorage.setItem('auth_token', token)
        // Call success callback instead of direct redirect
        onRegisterSuccess?.()
        return
      }

      setErrors({ general: 'Registration succeeded but no token was returned.' })
    } catch (err: any) {
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
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <input
              id="name"
              name="name"
              type="text"
              value={name}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              placeholder="Enter your full name"
              autoComplete="name"
              autoFocus
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <InputError message={errors.name} className="mt-2" />
        </div>

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
              name="email"
              type="email"
              value={email}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              placeholder="Enter your email"
              autoComplete="username"
              onChange={(e) => setEmail(e.target.value)}
              required
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
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              placeholder="Create a password"
              autoComplete="new-password"
              onChange={(e) => setPassword(e.target.value)}
              required
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

        <div>
          <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <input
              id="password_confirmation"
              name="password_confirmation"
              type={showConfirmation ? 'text' : 'password'}
              value={passwordConfirmation}
              className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              placeholder="Confirm your password"
              autoComplete="new-password"
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmation((prev) => !prev)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
              aria-label={showConfirmation ? 'Hide confirmation password' : 'Show confirmation password'}
            >
              {showConfirmation ? (
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
          <InputError message={errors.password_confirmation} className="mt-2" />
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
              Creating account...
            </div>
          ) : (
            'Create Account'
          )}
        </button>

        <div className="text-center">
          <span className="text-sm text-gray-600">Already have an account? </span>
          <button
            type="button"
            onClick={() => onSwitchToLogin?.()}
            className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
          >
            Sign in here
          </button>
        </div>
      </form>
    </>
  )
}
