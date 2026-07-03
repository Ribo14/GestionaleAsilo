import { useState } from 'react'

export default function LoginScreen({ onLogin, errore }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email || !password) return
    setLoading(true)
    await onLogin(email, password)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-primary-light flex flex-col items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm text-center space-y-6">
        <img
          src="/Logo_asilo.PNG"
          alt="Boubou Camp"
          className="w-24 h-24 object-contain mx-auto rounded-xl"
        />
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Boubou Camp</h1>
          <p className="text-sm text-gray-500 mt-1">Gestionale Asilo Diurno</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            autoComplete="username"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
            autoFocus
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoComplete="current-password"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
          />
          {errore && (
            <p className="text-danger text-sm">{errore}</p>
          )}
          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? 'Accesso…' : 'Accedi'}
          </button>
        </form>
      </div>
    </div>
  )
}
