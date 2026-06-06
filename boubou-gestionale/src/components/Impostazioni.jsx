import { useState } from 'react'

export default function Impostazioni({ onCambiaPassword, onLogout }) {
  const [vecchia, setVecchia] = useState('')
  const [nuova, setNuova] = useState('')
  const [conferma, setConferma] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (nuova !== conferma) { setMsg('Le password non coincidono'); return }
    if (nuova.length < 4) { setMsg('La password deve essere di almeno 4 caratteri'); return }
    setLoading(true)
    const res = await onCambiaPassword(vecchia, nuova)
    if (res.ok) {
      setMsg('Password aggiornata con successo')
      setVecchia(''); setNuova(''); setConferma('')
    } else {
      setMsg(res.errore)
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <h1 className="text-xl font-bold text-gray-900">Impostazioni</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Cambia password</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password attuale</label>
              <input type="password" value={vecchia} onChange={(e) => setVecchia(e.target.value)} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nuova password</label>
              <input type="password" value={nuova} onChange={(e) => setNuova(e.target.value)} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Conferma nuova password</label>
              <input type="password" value={conferma} onChange={(e) => setConferma(e.target.value)} className="input-field" required />
            </div>
            {msg && (
              <p className={`text-sm ${msg.includes('successo') ? 'text-success' : 'text-danger'}`}>{msg}</p>
            )}
            <button type="submit" disabled={loading} className="w-full bg-primary text-white py-2.5 rounded-xl font-medium hover:bg-primary-dark transition-colors disabled:opacity-50">
              {loading ? 'Aggiornamento…' : 'Aggiorna password'}
            </button>
          </form>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="font-semibold text-gray-800 mb-1">Info app</h2>
          <p className="text-sm text-gray-500">Boubou Camp Gestionale v1.0.0</p>
          <p className="text-xs text-gray-400 mt-1">Asilo Diurno per Cani</p>
        </div>

        <button
          onClick={onLogout}
          className="w-full border border-danger text-danger py-2.5 rounded-xl font-medium hover:bg-red-50 transition-colors"
        >
          Esci
        </button>
      </div>
    </div>
  )
}
