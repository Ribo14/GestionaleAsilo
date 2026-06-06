import { useState } from 'react'
import Badge from '../ui/Badge'
import CreditiBar from '../ui/CreditiBar'
import Modal from '../ui/Modal'
import { PREZZI_PACCHETTI } from '../../utils/calcoloCrediti'

const TIPI = [
  { value: 'singolo', label: 'Singolo (1 credito) — 5,00 €/cr' },
  { value: '50', label: 'Pacchetto 50 crediti — 4,50 €/cr' },
  { value: '100', label: 'Pacchetto 100 crediti — 4,25 €/cr' },
  { value: '200', label: 'Pacchetto 200 crediti — 3,75 €/cr' },
]

function FormPacchetto({ onSalva, onAnnulla }) {
  const oggi = new Date().toISOString().slice(0, 10)
  const [form, setForm] = useState({
    tipo: '100',
    dataAcquisto: oggi,
    pagato: true,
    metodoPagamento: 'contanti',
    note: '',
  })

  const set = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    const info = PREZZI_PACCHETTI[form.tipo]
    await onSalva({
      ...form,
      creditiTotali: info.crediti,
      creditiResidui: info.crediti,
      valoreCreditoEuro: info.valoreCreditoEuro,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo pacchetto</label>
        <select value={form.tipo} onChange={set('tipo')} className="input-field">
          {TIPI.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Data acquisto</label>
        <input type="date" value={form.dataAcquisto} onChange={set('dataAcquisto')} className="input-field" />
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={form.pagato} onChange={set('pagato')} className="w-4 h-4 text-primary rounded" />
        <span className="text-sm text-gray-700">Pagato</span>
      </label>
      {form.pagato && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Metodo pagamento</label>
          <div className="flex gap-2">
            {['contanti', 'bonifico'].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setForm((f) => ({ ...f, metodoPagamento: m }))}
                className={`flex-1 py-2 rounded-xl border text-sm font-medium transition-colors ${
                  form.metodoPagamento === m
                    ? 'bg-primary text-white border-primary'
                    : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
        <input value={form.note} onChange={set('note')} className="input-field" />
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onAnnulla} className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-xl hover:bg-gray-50 transition-colors font-medium">
          Annulla
        </button>
        <button type="submit" className="flex-1 bg-primary text-white py-2.5 rounded-xl hover:bg-primary-dark transition-colors font-medium">
          Aggiungi
        </button>
      </div>
    </form>
  )
}

export default function GestionePacchetti({ clienteId, pacchetti, onAggiungi, onAggiorna }) {
  const [mostraForm, setMostraForm] = useState(false)

  async function handleSalva(data) {
    await onAggiungi(clienteId, data)
    setMostraForm(false)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-700">Pacchetti crediti</h3>
        <button
          onClick={() => setMostraForm(true)}
          className="text-primary text-sm font-medium hover:underline"
        >
          + Nuovo
        </button>
      </div>

      {pacchetti.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-4">Nessun pacchetto</p>
      )}

      {pacchetti.map((p) => (
        <div
          key={p.id}
          className={`rounded-xl border p-4 space-y-2 ${
            !p.pagato ? 'bg-red-50 border-red-300' : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="font-medium text-gray-800">
                {p.tipo === 'singolo' ? 'Singolo' : `Pacchetto ${p.tipo} crediti`}
              </span>
              <span className="text-sm text-gray-500 ml-2">@ {p.valoreCreditoEuro?.toFixed(2)} €/cr</span>
            </div>
            <div className="flex gap-1.5 flex-wrap justify-end">
              {!p.pagato && <Badge variant="danger">Non pagato</Badge>}
              {p.pagato && <Badge variant="success">{p.metodoPagamento}</Badge>}
            </div>
          </div>
          <CreditiBar residui={p.creditiResidui} totali={p.creditiTotali} />
          <p className="text-xs text-gray-400">
            Acquistato il {p.dataAcquisto}
            {p.note && ` — ${p.note}`}
          </p>
          {!p.pagato && (
            <button
              onClick={() => onAggiorna(clienteId, p.id, { pagato: true, metodoPagamento: 'contanti' })}
              className="text-xs text-primary font-medium hover:underline"
            >
              Segna come pagato
            </button>
          )}
        </div>
      ))}

      {mostraForm && (
        <Modal titolo="Nuovo pacchetto" onClose={() => setMostraForm(false)}>
          <FormPacchetto onSalva={handleSalva} onAnnulla={() => setMostraForm(false)} />
        </Modal>
      )}
    </div>
  )
}
