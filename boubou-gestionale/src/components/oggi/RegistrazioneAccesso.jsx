import { useState, useEffect, useMemo } from 'react'
import Badge from '../ui/Badge'
import { useClienti } from '../../hooks/useClienti'
import { useAccessi } from '../../hooks/useAccessi'
import { subscribeCani } from '../../firebase/firestore'
import { scalaCreditiFIFO } from '../../utils/logicaFIFO'
import { calcolaCrediti, determinaTipoGiornata } from '../../utils/calcoloCrediti'
import { addAccesso, deleteAccesso } from '../../firebase/firestore'

const ORARI_DEFAULT = { intera: { ingresso: '08:30', uscita: '17:30' }, mattina: { ingresso: '08:30', uscita: '13:00' }, pomeriggio: { ingresso: '13:00', uscita: '17:30' } }

export default function RegistrazioneAccesso() {
  const oggi = new Date().toISOString().slice(0, 10)
  const { clienti } = useClienti()
  const { accessi, loading: loadingAccessi } = useAccessi()

  const [ricercaCliente, setRicercaCliente] = useState('')
  const [clienteId, setClienteId] = useState('')
  const [caniDisponibili, setCaniDisponibili] = useState([])
  const [caniSelezionati, setCaniSelezionati] = useState([])
  const [tipoGiornata, setTipoGiornata] = useState('intera')
  const [orarioIngresso, setOrarioIngresso] = useState('08:30')
  const [orarioUscita, setOrarioUscita] = useState('17:30')
  const [piscina, setPiscina] = useState(false)
  const [note, setNote] = useState('')
  const [creditiEffettivi, setCreditiEffettivi] = useState(0)
  const [agevolazione, setAgevolazione] = useState(false)
  const [noteAgevolazione, setNoteAgevolazione] = useState('')
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState('')

  const clienteFiltrati = clienti.filter((c) =>
    c.nome?.toLowerCase().includes(ricercaCliente.toLowerCase())
  )
  const clienteSelezionato = clienti.find((c) => c.id === clienteId)

  useEffect(() => {
    if (!clienteId) { setCaniDisponibili([]); return }
    const unsub = subscribeCani(clienteId, setCaniDisponibili)
    return unsub
  }, [clienteId])

  const creditiCalcolati = useMemo(() => {
    const tipo = determinaTipoGiornata(orarioIngresso, orarioUscita) || tipoGiornata
    return calcolaCrediti({
      tipoGiornata: tipo,
      numCani: caniSelezionati.length,
      piscina,
      orarioIngresso,
      orarioUscita,
    })
  }, [tipoGiornata, caniSelezionati, piscina, orarioIngresso, orarioUscita])

  useEffect(() => {
    setCreditiEffettivi(creditiCalcolati)
    setAgevolazione(false)
    setNoteAgevolazione('')
  }, [creditiCalcolati])

  function selezionaTipo(tipo) {
    setTipoGiornata(tipo)
    setOrarioIngresso(ORARI_DEFAULT[tipo].ingresso)
    setOrarioUscita(ORARI_DEFAULT[tipo].uscita)
  }

  function toggleCane(cane) {
    setCaniSelezionati((prev) =>
      prev.find((c) => c.caneId === cane.id)
        ? prev.filter((c) => c.caneId !== cane.id)
        : [...prev, { caneId: cane.id, nome: cane.nome }]
    )
  }

  function selezionaCliente(c) {
    setClienteId(c.id)
    setRicercaCliente(c.nome)
    setCaniSelezionati([])
  }

  async function handleSalva(e) {
    e.preventDefault()
    if (!clienteId || caniSelezionati.length === 0) return
    setSaving(true)
    try {
      const { scaleDaPacchetti, creditiNonCoperti } = await scalaCreditiFIFO(clienteId, creditiEffettivi)
      const tipoRilevato = determinaTipoGiornata(orarioIngresso, orarioUscita) || tipoGiornata
      await addAccesso({
        clienteId,
        data: oggi,
        cani: caniSelezionati,
        tipoGiornata: tipoRilevato,
        orarioIngresso,
        orarioUscita,
        piscina,
        creditiCalcolati,
        creditiEffettivi,
        agevolazione,
        noteAgevolazione,
        scaleDaPacchetti,
      })
      setFeedback(creditiNonCoperti > 0 ? `Accesso salvato. Attenzione: ${creditiNonCoperti} crediti non coperti!` : 'Accesso salvato!')
      setClienteId('')
      setRicercaCliente('')
      setCaniSelezionati([])
      setPiscina(false)
      setNote('')
      setTimeout(() => setFeedback(''), 3000)
    } catch (err) {
      setFeedback('Errore nel salvataggio. Riprova.')
    }
    setSaving(false)
  }

  const accessiOggi = accessi.filter((a) => a.data === oggi)

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <h1 className="text-xl font-bold text-gray-900">Oggi</h1>
        <p className="text-sm text-gray-500">{new Date().toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <form onSubmit={handleSalva} className="p-4 space-y-4">
          {/* Selezione cliente */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
            <input
              value={ricercaCliente}
              onChange={(e) => { setRicercaCliente(e.target.value); setClienteId('') }}
              placeholder="Cerca cliente…"
              className="input-field"
              autoComplete="off"
            />
            {ricercaCliente && !clienteId && clienteFiltrati.length > 0 && (
              <div className="absolute z-10 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg mt-1 max-h-48 overflow-y-auto">
                {clienteFiltrati.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => selezionaCliente(c)}
                    className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm"
                  >
                    {c.nome}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selezione cani */}
          {clienteId && caniDisponibili.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cani presenti</label>
              <div className="flex flex-wrap gap-2">
                {caniDisponibili.map((c) => {
                  const sel = caniSelezionati.some((s) => s.caneId === c.id)
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => toggleCane(c)}
                      className={`px-4 py-2 rounded-xl border text-sm font-medium transition-colors ${
                        sel ? 'bg-primary text-white border-primary' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {c.nome}
                    </button>
                  )
                })}
              </div>
              {clienteId && caniDisponibili.length === 0 && (
                <p className="text-sm text-gray-400">Nessun cane registrato per questo cliente</p>
              )}
            </div>
          )}

          {/* Tipo giornata */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo giornata</label>
            <div className="grid grid-cols-3 gap-2">
              {['intera', 'mattina', 'pomeriggio'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => selezionaTipo(t)}
                  className={`py-3 rounded-xl border text-sm font-medium transition-colors ${
                    tipoGiornata === t
                      ? 'bg-primary text-white border-primary'
                      : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Orari */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ingresso</label>
              <input type="time" value={orarioIngresso} onChange={(e) => setOrarioIngresso(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Uscita</label>
              <input type="time" value={orarioUscita} onChange={(e) => setOrarioUscita(e.target.value)} className="input-field" />
            </div>
          </div>

          {/* Piscina */}
          <label className="flex items-center gap-3 cursor-pointer bg-blue-50 rounded-xl px-4 py-3">
            <input
              type="checkbox"
              checked={piscina}
              onChange={(e) => setPiscina(e.target.checked)}
              className="w-5 h-5 text-primary rounded"
            />
            <span className="text-sm font-medium text-gray-700">Piscina (+{caniSelezionati.length >= 2 ? 4 : 3} cr)</span>
          </label>

          {/* Riquadro crediti */}
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
                value={creditiEffettivi}
                onChange={(e) => {
                  const v = parseInt(e.target.value) || 0
                  setCreditiEffettivi(v)
                  setAgevolazione(v !== creditiCalcolati)
                }}
                className="w-20 border border-primary/40 rounded-lg px-2 py-1 text-center font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            {agevolazione && (
              <input
                value={noteAgevolazione}
                onChange={(e) => setNoteAgevolazione(e.target.value)}
                placeholder="Motivo agevolazione…"
                className="mt-2 w-full text-sm border border-primary/30 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
            <input value={note} onChange={(e) => setNote(e.target.value)} className="input-field" placeholder="Facoltative" />
          </div>

          {feedback && (
            <p className={`text-sm font-medium text-center ${feedback.includes('Attenzione') ? 'text-warning' : 'text-success'}`}>
              {feedback}
            </p>
          )}

          <button
            type="submit"
            disabled={saving || !clienteId || caniSelezionati.length === 0}
            className="w-full bg-primary text-white py-3.5 rounded-xl font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 text-base"
          >
            {saving ? 'Salvataggio…' : 'Salva accesso'}
          </button>
        </form>

        {/* Accessi di oggi */}
        {accessiOggi.length > 0 && (
          <div className="px-4 pb-6">
            <h3 className="font-semibold text-gray-700 mb-3">Accessi di oggi ({accessiOggi.length})</h3>
            <div className="space-y-2">
              {accessiOggi.map((a) => {
                const cl = clienti.find((c) => c.id === a.clienteId)
                return (
                  <div key={a.id} className="bg-white border border-gray-200 rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{cl?.nome || '—'}</p>
                      <p className="text-xs text-gray-500">
                        {a.cani?.map((c) => c.nome).join(', ')} · {a.orarioIngresso}–{a.orarioUscita}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="default">{a.creditiEffettivi} cr</Badge>
                      <button
                        onClick={async () => {
                          if (!window.confirm('Eliminare questo accesso?')) return
                          await deleteAccesso(a.id)
                        }}
                        className="text-gray-300 hover:text-danger transition-colors text-lg"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
