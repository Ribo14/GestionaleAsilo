import { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import LoginScreen from './components/auth/LoginScreen'
import ListaClienti from './components/clienti/ListaClienti'
import RegistrazioneAccesso from './components/oggi/RegistrazioneAccesso'
import ReportMensile from './components/report/ReportMensile'
import Impostazioni from './components/Impostazioni'
import BottomNav from './components/ui/BottomNav'

const TABS_DESKTOP = [
  { id: 'clienti', label: 'Clienti', icon: '👥' },
  { id: 'oggi', label: 'Ingressi', icon: '🏠' },
  { id: 'report', label: 'Report', icon: '📊' },
]

export default function App() {
  const { autenticato, loading, errore, login, logout, cambiaPassword } = useAuth()
  const [tab, setTab] = useState('clienti')
  const [mostraImpostazioni, setMostraImpostazioni] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-light">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!autenticato) {
    return <LoginScreen onLogin={login} errore={errore} />
  }

  return (
    <div className="flex h-screen bg-neutral overflow-hidden">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex flex-col w-56 bg-white border-r border-gray-200 shrink-0">
        <div className="px-4 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <img src="/Logo_asilo.PNG" alt="Boubou" className="w-10 h-10 rounded-xl object-contain" />
            <div>
              <p className="font-bold text-gray-900 text-sm">Boubou Camp</p>
              <p className="text-xs text-gray-500">Gestionale</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {TABS_DESKTOP.map((t) => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setMostraImpostazioni(false) }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                tab === t.id && !mostraImpostazioni
                  ? 'bg-primary-light text-primary-dark'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-100">
          <button
            onClick={() => setMostraImpostazioni(true)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              mostraImpostazioni ? 'bg-primary-light text-primary-dark' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span>⚙️</span>
            Impostazioni
          </button>
        </div>
      </aside>

      {/* Contenuto principale */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header mobile */}
        <header className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shrink-0">
          <img src="/Logo_asilo.PNG" alt="Boubou" className="w-8 h-8 rounded-lg object-contain" />
          <p className="font-bold text-gray-900">Boubou Camp</p>
          <button
            onClick={() => setMostraImpostazioni((v) => !v)}
            className="text-gray-500 text-xl"
          >
            ⚙️
          </button>
        </header>

        <div className="flex-1 overflow-hidden">
          {mostraImpostazioni ? (
            <Impostazioni
              onCambiaPassword={cambiaPassword}
              onLogout={logout}
            />
          ) : tab === 'clienti' ? (
            <ListaClienti />
          ) : tab === 'oggi' ? (
            <RegistrazioneAccesso />
          ) : (
            <ReportMensile />
          )}
        </div>

        {/* Bottom nav mobile */}
        {!mostraImpostazioni && (
          <div className="pb-16 md:pb-0" />
        )}
      </main>

      <BottomNav tab={tab} onChange={(t) => { setTab(t); setMostraImpostazioni(false) }} />
    </div>
  )
}
