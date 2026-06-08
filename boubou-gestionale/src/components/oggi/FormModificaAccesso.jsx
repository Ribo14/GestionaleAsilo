import { useState, useEffect, useMemo } from 'react'
import { calcolaCrediti, determinaTipoGiornata } from '../../utils/calcoloCrediti'

const ORARI_DEFAULT = {
  intera: { ingresso: '08:30', uscita: '17:30' },
  mattina: { ingresso: '08:30', uscita: '13:00' },
  pomeriggio: { ingresso: '13:00', uscita: '17:30' },
}

export default function FormModificaAccesso({ accesso, onSalva, onAnnulla }) {
  const [form, setForm] = useState({
    tipoGiornata: accesso.tipoGiornata ?? 'intera',
    orarioIngresso: accesso.orarioIngresso ?? '08:30',
    orarioUscita: accesso.orarioUscita ?? '17:30',
    piscina: accesso.piscina ?? false,
    creditiEffettivi: accesso.creditiEffettivi ?? 0,
    agevolazione: accesso.agevolazione ?? false,
    noteAgevolazione: accesso.noteAgevolazione ?? '',
    note: accesso.note ?? '',
  })

  const set = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  const creditiCalcolati = useMemo(() => {
    const tipo = determinaTipoGiornata(form.orarioIngresso, form.orarioUscita) || form.tipoGiornata
    return calcolaCrediti({
      tipoGiornata: tipo,
      numCani: accesso.cani?.length ?? 1,
      piscina: form.piscina,
      orarioIngresso: form.orarioIngresso,
      orarioUscita: form.orarioUscita,
    })
  }, [form.tipoGiornata, form.piscina, form.orarioIngresso, form.orarioUscita, accesso.cani])

  useEffect(() => {
    setForm((f) => ({ ...f, creditiEffettivi: creditiCalcolati, agevolazione: false, noteAgevolazione: '' }))
  }, [creditiCalcolati])

  function selezionaTipo(tipo) {
    setForm((f) => ({
      ...f,
      tipoGiornata: tipo,
      orarioIngresso: ORARI_DEFAULT[tipo].ingresso,
      orarioUscita: ORARI_DEFAULT[tipo].uscita,
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    await onSalva({ ...form, creditiCalcolati })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Tipo giornata</label>
        <div className="grid grid-cols-3 gap-2">
          {['intera', 'mattina', 'pomeriggio'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => selezionaTipo(t)}
              className={`py-3 rounded-xl border text-sm font-medium transition-colors ${
                form.tipoGiornata === t
                  ? 'bg-primary text-white border-primary'
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ingresso</label>
          <input type="time" value={form.orarioIngresso} onChange={set('orarioIngresso')} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Uscita</label>
          <input type="time" value={form.orarioUscita} onChange={set('orarioUscita')} className="input-field" />
        </div>
      </div>

      <label className="flex items-center gap-3 cursor-pointer bg-blue-50 rounded-xl px-4 py-3">
        <input
          type="checkbox"
          checked={form.piscina}
          onChange={set('piscina')}
          className="w-5 h-5 text-primary rounded"
        />
        <span className="text-sm font-medium text-gray-700">Piscina</span>
      </label>

      <div className="bg-primary-light rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-primary-dark">Crediti calcolati</span>
          <span className="text-2xl font-bold text-primary">{creditiCalcolati}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Crediti effettivi:</span>
          <input
            type="number"
            min="0"
            value={form.creditiEffettivi}
            onChange={(e) => {
              const v = parseInt(e.target.value) || 0
              setForm((f) => ({ ...f, creditiEffettivi: v, agevolazione: v !== creditiCalcolati }))
            }}
            className="w-20 border border-primary/40 rounded-lg px-2 py-1 text-center font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        {form.agevolazione && (
          <input
            value={form.noteAgevolazione}
            onChange={set('noteAgevolazione')}
            placeholder="Motivo agevolazione…"
            className="mt-2 w-full text-sm border border-primary/30 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary"
          />
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
        <input value={form.note} onChange={set('note')} className="input-field" placeholder="Facoltative" />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onAnnulla}
          className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-xl hover:bg-gray-50 transition-colors font-medium"
        >
          Annulla
        </button>
        <button
          type="submit"
          className="flex-1 bg-primary text-white py-2.5 rounded-xl hover:bg-primary-dark transition-colors font-medium"
        >
          Salva
        </button>
      </div>
    </form>
  )
}
