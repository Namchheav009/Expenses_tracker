import { useEffect } from 'react'

// Demo API token for test user (from seeder)
const DEMO_TOKEN = '1|QbRcYy3lYLaDExI5amB6YGT63NDw61Ovu864T3Xrf78036d2'

export default function Login() {
  useEffect(() => {
    // Auto-login with demo token
    localStorage.setItem('auth_token', DEMO_TOKEN)
    // Reload page to trigger auth check in Home component
    window.location.reload()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2 text-slate-900">
          Expense Tracker
        </h1>
        <p className="text-center text-slate-600 mb-8">
          Loading expense tracker...
        </p>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Authenticating...</p>
          </div>
        </div>
      </div>
    </div>
  )
}
