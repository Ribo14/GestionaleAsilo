import { useState } from 'react'
import Badge from '../ui/Badge'
import CreditiBar from '../ui/CreditiBar'
import Modal from '../ui/Modal'
import { PREZZI_PACCHETTI } from '../../utils/calcoloCrediti'
import { formatData } from '../../utils/reportMensile'

const TIPI = [
  { value: '10', label: 'Pacchetto 10 crediti — 5,00 €/cr' },
  { value: '50', label: 'Pacchetto 50 crediti — 4,50 €/cr' },
  { value: '100', label: 'Pacchetto 100 crediti — 4,25 €/cr' },
  { value: '200', label: 'Pacchetto 200 crediti — 3,75 €/cr' },
]

function FormPacchetto({ pacchetto, onSalva, onAnnulla }) {
  const oggi = new Date().toISOString().slice(0, 10)
  const isModifica = !!pacchetto

  const [form, setForm] = useState({
    tipo: pacchetto?.tipo ?? '100',
    dataAcquisto: pacchetto?.dataAcquisto ?? oggi,
    pagato: pacchetto?.pagato ?? true,
    metodoPagamento: pacchetto?.metodoPagamento ?? 'contanti',
    note: pacchetto?.note ?? '',
  })

  const set = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    const info = PREZZI_PACCHETTI[form.tipo]
    const datiBase = {
      ...form,
      creditiTotali: info.crediti,
      valoreCreditoEuro: info.valoreCreditoEuro,
    }
    if (isModifica) {
      // In modifica, aggiorna creditiResidui solo se cambia il tipo
      const creditiResidui = form.tipo !== pacchetto.tipo
        ? info.crediti
        : pacchetto.creditiResidui
      await onSalva({ ...datiBase, creditiResidui })
    } else {
      await onSalva({ ...datiBase, creditiResidui: info.crediti })
    }
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
          {isModifica ? 'Salva' : 'Aggiungi'}
        </button>
      </div>
    </form>
  )
}

export default function GestionePacchetti({ clienteId, pacchetti, onAggiungi, onAggiorna, onElimina }) {
  const [mostraForm, setMostraForm] = useState(false)
  const [pacchettoModifica, setPacchettoModifica] = useState(null)

  async function handleSalva(data) {
    if (pacchettoModifica) {
      await onAggiorna(clienteId, pacchettoModifica.id, data)
      setPacchettoModifica(null)
    } else {
      await onAggiungi(clienteId, data)
    }
    setMostraForm(false)
  }

  async function handleElimina(p) {
    if (!window.confirm(`Eliminare il pacchetto da ${p.creditiTotali} crediti?`)) return
    await onElimina(clienteId, p.id)
  }

  function apriModifica(p) {
    setPacchettoModifica(p)
    setMostraForm(true)
  }

  function chiudiForm() {
    setMostraForm(false)
    setPacchettoModifica(null)
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
                Pacchetto {p.tipo} crediti
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
            Acquistato il {formatData(p.dataAcquisto)}
            {p.note && ` — ${p.note}`}
          </p>
          <div className="flex items-center justify-between pt-1">
            {!p.pagato ? (
              <button
                onClick={() => onAggiorna(clienteId, p.id, { pagato: true, metodoPagamento: 'contanti' })}
                className="text-xs text-primary font-medium hover:underline"
              >
                Segna come pagato
              </button>
            ) : (
              <span />
            )}
            <div className="flex gap-3">
              <button
                onClick={() => apriModifica(p)}
                className="text-xs text-gray-500 hover:text-gray-700 font-medium"
              >
                Modifica
              </button>
              <button
                onClick={() => handleElimina(p)}
                className="text-xs text-danger hover:text-red-700 font-medium"
              >
                Elimina
              </button>
            </div>
          </div>
        </div>
      ))}

      {mostraForm && (
        <Modal
          titolo={pacchettoModifica ? 'Modifica pacchetto' : 'Nuovo pacchetto'}
          onClose={chiudiForm}
        >
          <FormPacchetto
            pacchetto={pacchettoModifica}
            onSalva={handleSalva}
            onAnnulla={chiudiForm}
          />
        </Modal>
      )}
    </div>
  )
}
