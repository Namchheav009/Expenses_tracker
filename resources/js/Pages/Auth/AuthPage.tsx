import { useState } from 'react'
import { motion } from 'framer-motion'
import { Wallet as WalletIcon } from 'lucide-react'
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
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-[45%] bg-slate-900 relative overflow-hidden flex-col justify-between p-12">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="p-2 bg-emerald-500 rounded-xl">
              <WalletIcon className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">
              FinTrack
            </span>
          </div>

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.2,
            }}
          >
            <h1 className="text-4xl font-bold text-white leading-tight mb-4">
              Take control of
              <br />
              your finances.
            </h1>
            <p className="text-slate-400 text-lg max-w-md leading-relaxed">
              Track expenses, manage budgets, and get AI-powered insights — all
              in one place.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            delay: 0.5,
          }}
          className="relative z-10"
        >
          <svg
            viewBox="0 0 400 300"
            className="w-full h-auto max-w-sm"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Shadow/Ground */}
            <path
              d="M 50 240 Q 100 260 200 260 Q 300 260 350 240"
              fill="#f5b8a8"
              opacity="0.6"
            />

            {/* Grid Background */}
            <g stroke="#4b5563" strokeWidth="1.5" opacity="0.3">
              <line x1="80" y1="100" x2="80" y2="200" />
              <line x1="130" y1="80" x2="130" y2="200" />
              <line x1="180" y1="80" x2="180" y2="200" />
              <line x1="230" y1="80" x2="230" y2="200" />
              <line x1="280" y1="90" x2="280" y2="200" />
              <line x1="330" y1="110" x2="330" y2="200" />
              <line x1="50" y1="120" x2="360" y2="120" />
              <line x1="50" y1="160" x2="360" y2="160" />
              <line x1="50" y1="200" x2="360" y2="200" />
            </g>

            {/* Money Bag */}
            <motion.g
              initial={{ y: 0 }}
              animate={{ y: -8 }}
              transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
            >
              {/* Bag */}
              <ellipse cx="120" cy="180" rx="35" ry="40" fill="#c85a2f" />
              <path
                d="M 85 180 Q 85 150 120 140 Q 155 150 155 180"
                fill="#d97c3f"
              />
              {/* Bag String */}
              <path d="M 100 140 Q 95 120 120 110 Q 145 120 140 140" fill="#8b3e1f" />
              {/* Crown */}
              <circle cx="120" cy="105" r="8" fill="#f4b941" />
              <path d="M 112 105 L 108 96 L 120 91 L 132 96 L 128 105" fill="#f4b941" />
              {/* Dollar Sign */}
              <text x="120" y="188" fontSize="28" fontWeight="bold" fill="#f4b941" textAnchor="middle">
                $
              </text>
            </motion.g>

            {/* Clock */}
            <motion.g
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, linear: true }}
              style={{ transformOrigin: '240px 140px' }}
            >
              {/* Clock Circle Outer */}
              <circle cx="240" cy="140" r="55" fill="#e8f4f8" stroke="#e85d3f" strokeWidth="8" />
              {/* Clock Circle Inner */}
              <circle cx="240" cy="140" r="45" fill="white" />
              {/* Hour Markers */}
              <circle cx="240" cy="100" r="2" fill="#1f3a52" />
              <circle cx="280" cy="140" r="2" fill="#1f3a52" />
              <circle cx="240" cy="180" r="2" fill="#1f3a52" />
              <circle cx="200" cy="140" r="2" fill="#1f3a52" />
              {/* Clock Hands */}
              <line
                x1="240"
                y1="140"
                x2="240"
                y2="115"
                stroke="#1f3a52"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <line
                x1="240"
                y1="140"
                x2="260"
                y2="140"
                stroke="#1f3a52"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <circle cx="240" cy="140" r="4" fill="#1f3a52" />
            </motion.g>

            {/* Upward Arrow */}
            <motion.g
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: -20, opacity: 1 }}
              transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
            >
              <path
                d="M 310 160 L 340 120 L 335 120 L 335 100 L 345 100 L 345 120 L 340 120"
                fill="#2563eb"
              />
            </motion.g>

            {/* Dollar Bill */}
            <motion.g
              initial={{ rotate: 0 }}
              animate={{ rotate: -5 }}
              transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
              style={{ transformOrigin: '300px 200px' }}
            >
              <rect x="280" y="185" width="40" height="22" rx="2" fill="#22c55e" />
              <rect x="282" y="187" width="36" height="18" rx="1" fill="#86efac" />
              <circle cx="300" cy="196" r="5" fill="#22c55e" />
              <text x="300" y="200" fontSize="7" fontWeight="bold" fill="#22c55e" textAnchor="middle">
                $
              </text>
            </motion.g>

            {/* Coins Stack */}
            <motion.g
              initial={{ scale: 1 }}
              animate={{ scale: 1.1 }}
              transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
              style={{ transformOrigin: '160px 210px' }}
            >
              <ellipse cx="160" cy="205" rx="12" ry="6" fill="#f4b941" />
              <rect x="148" y="200" width="24" height="8" fill="#f4b941" />
              <ellipse cx="160" cy="200" rx="12" ry="6" fill="#fcd34d" />

              <ellipse cx="175" cy="215" rx="10" ry="5" fill="#f4b941" />
              <rect x="165" y="210" width="20" height="8" fill="#f4b941" />
              <ellipse cx="175" cy="210" rx="10" ry="5" fill="#fcd34d" />

              <ellipse cx="145" cy="215" rx="10" ry="5" fill="#f4b941" />
              <rect x="135" y="210" width="20" height="8" fill="#f4b941" />
              <ellipse cx="145" cy="210" rx="10" ry="5" fill="#fcd34d" />
            </motion.g>

            {/* Decorative Sparkles */}
            <motion.circle
              cx="80" cy="120"
              r="3"
              fill="#2563eb"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
            />
            <motion.circle
              cx="320" cy="100"
              r="2.5"
              fill="#f59e0b"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
            />
            <motion.circle
              cx="350" cy="140"
              r="2"
              fill="#8b5cf6"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
            />
            <motion.circle
              cx="60" cy="160"
              r="2"
              fill="#ec4899"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.9 }}
            />
          </svg>
        </motion.div>
      </div>

      {/* Right Panel — Auth Forms */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="p-2 bg-emerald-500 rounded-xl">
              <WalletIcon className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">
              FinTrack
            </span>
          </div>

          {/* Auth Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setMode('login')}
                className={`flex-1 px-6 py-4 text-center font-medium transition-all duration-200 ${
                  mode === 'login'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setMode('register')}
                className={`flex-1 px-6 py-4 text-center font-medium transition-all duration-200 ${
                  mode === 'register'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Form Content */}
            <div className="p-8">
              <motion.div
                key={mode}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
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
              </motion.div>
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
        </motion.div>
      </div>
    </div>
  )
}
