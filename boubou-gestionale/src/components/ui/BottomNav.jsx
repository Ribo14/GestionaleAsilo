const TABS = [
  { id: 'clienti', label: 'Clienti', icon: '👥' },
  { id: 'oggi', label: 'Oggi', icon: '🏠' },
  { id: 'report', label: 'Report', icon: '📊' },
]

export default function BottomNav({ tab, onChange }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex md:hidden z-40">
      {TABS.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`flex-1 flex flex-col items-center py-2 text-xs font-medium transition-colors ${
            tab === t.id ? 'text-primary' : 'text-gray-400'
          }`}
        >
          <span className="text-xl mb-0.5">{t.icon}</span>
          {t.label}
        </button>
      ))}
    </nav>
  )
}
