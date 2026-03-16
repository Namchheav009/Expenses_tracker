export default function Login() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2 text-slate-900">
          Expense Tracker
        </h1>
        <p className="text-center text-slate-600 mb-8">
          Please log in to continue.
        </p>
        <div className="text-center">
          <button
            type="button"
            onClick={() => (window.location.href = '/app-login')}
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    </div>
  )
}
