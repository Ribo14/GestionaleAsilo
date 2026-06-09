import { useState, useEffect, useMemo } from 'react'
import Badge from '../ui/Badge'
import Modal from '../ui/Modal'
import FormModificaAccesso from './FormModificaAccesso'
import { useClienti } from '../../hooks/useClienti'
import { useAccessi } from '../../hooks/useAccessi'
import { subscribeCani, updateAccesso, addAccesso, deleteAccesso, getPacchettiAttivi } from '../../firebase/firestore'
import { scalaCreditiFIFO, ripristinaCreditiFIFO } from '../../utils/logicaFIFO'
import { calcolaCrediti, determinaTipoGiornata, VALORE_CREDITO_GIORNALIERO } from '../../utils/calcoloCrediti'
import { formatData } from '../../utils/reportMensile'

const ORARI_DEFAULT = {
  intera: { ingresso: '08:30', uscita: '17:30' },
  mattina: { ingresso: '08:30', uscita: '13:00' },
  pomeriggio: { ingresso: '13:00', uscita: '17:30' },
}

export default function RegistrazioneAccesso() {
  const oggi = new Date().toISOString().slice(0, 10)
  const { clienti } = useClienti()
  const { accessi } = useAccessi()

  const [dataSelezionata, setDataSelezionata] = useState(oggi)
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
  const [accessoModifica, setAccessoModifica] = useState(null)

  // Pay-daily states
  const [pacchettiAttivi, setPacchettiAttivi] = useState([])
  const [pacchettiLoaded, setPacchettiLoaded] = useState(false)
  const [sceltaGiornaliero, setSceltaGiornaliero] = useState('misto')
  const [pagGiornaliero, setPagGiornaliero] = useState({ pagato: false, metodoPagamento: 'contanti' })

  const clienteFiltrati = clienti.filter((c) =>
    c.nome?.toLowerCase().includes(ricercaCliente.toLowerCase())
  )

  useEffect(() => {
    if (!clienteId) { setCaniDisponibili([]); return }
    const unsub = subscribeCani(clienteId, setCaniDisponibili)
    return unsub
  }, [clienteId])

  useEffect(() => {
    if (!clienteId) { setPacchettiAttivi([]); setPacchettiLoaded(false); return }
    setPacchettiLoaded(false)
    getPacchettiAttivi(clienteId).then((p) => { setPacchettiAttivi(p); setPacchettiLoaded(true) })
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

  // Pay-daily derived values
  const creditiResiduiTotali = pacchettiAttivi.reduce((s, p) => s + (p.creditiResidui || 0), 0)
  const isPuramenteGiornaliero = pacchettiLoaded && creditiResiduiTotali === 0
  const needsScelta = pacchettiLoaded && creditiResiduiTotali > 0 && creditiResiduiTotali < creditiEffettivi
  const showPagamentoGiornaliero = isPuramenteGiornaliero || needsScelta

  const creditiGiornalieriCalcolati = needsScelta && sceltaGiornaliero === 'misto'
    ? creditiEffettivi - creditiResiduiTotali
    : creditiEffettivi
  const importoGiornaliero = creditiGiornalieriCalcolati * VALORE_CREDITO_GIORNALIERO

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
    setSceltaGiornaliero('misto')
    setPagGiornaliero({ pagato: false, metodoPagamento: 'contanti' })
    setPacchettiLoaded(false)
  }

  async function handleSalva(e) {
    e.preventDefault()
    if (!clienteId || caniSelezionati.length === 0) return
    setSaving(true)
    try {
      let scaleDaPacchetti = []
      let pagamentoGiornalieroData = null
      let feedbackMsg = 'Accesso salvato!'
      const tipoRilevato = determinaTipoGiornata(orarioIngresso, orarioUscita) || tipoGiornata

      if (isPuramenteGiornaliero || (needsScelta && sceltaGiornaliero === 'tutto')) {
        pagamentoGiornalieroData = {
          crediti: creditiEffettivi,
          importo: creditiEffettivi * VALORE_CREDITO_GIORNALIERO,
          pagato: pagGiornaliero.pagato,
          metodoPagamento: pagGiornaliero.metodoPagamento,
        }
      } else if (needsScelta && sceltaGiornaliero === 'misto') {
        const risultato = await scalaCreditiFIFO(clienteId, creditiResiduiTotali)
        scaleDaPacchetti = risultato.scaleDaPacchetti
        const creditiGiornalieri = creditiEffettivi - creditiResiduiTotali
        pagamentoGiornalieroData = {
          crediti: creditiGiornalieri,
          importo: creditiGiornalieri * VALORE_CREDITO_GIORNALIERO,
          pagato: pagGiornaliero.pagato,
          metodoPagamento: pagGiornaliero.metodoPagamento,
        }
      } else {
        const { scaleDaPacchetti: s, creditiNonCoperti } = await scalaCreditiFIFO(clienteId, creditiEffettivi)
        scaleDaPacchetti = s
        if (creditiNonCoperti > 0) {
          feedbackMsg = `Accesso salvato. Attenzione: ${creditiNonCoperti} crediti non coperti!`
        }
      }

      const accessoData = {
        clienteId,
        data: dataSelezionata,
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
      }
      if (pagamentoGiornalieroData) accessoData.pagamentoGiornaliero = pagamentoGiornalieroData

      await addAccesso(accessoData)
      setFeedback(feedbackMsg)
      setClienteId('')
      setRicercaCliente('')
      setCaniSelezionati([])
      setPiscina(false)
      setNote('')
      setPacchettiLoaded(false)
      setTimeout(() => setFeedback(''), 3000)
    } catch {
      setFeedback('Errore nel salvataggio. Riprova.')
    }
    setSaving(false)
  }

  async function handleModificaSalva(dati) {
    try {
      const vecchiCrediti = accessoModifica.creditiEffettivi ?? 0
      let scaleDaPacchetti = accessoModifica.scaleDaPacchetti || []
      let avviso = ''

      if (dati.pagamentoGiornaliero) {
        const isPuroDailyAccesso = scaleDaPacchetti.length === 0
        let updatedPagGiorn = dati.pagamentoGiornaliero
        if (isPuroDailyAccesso && dati.creditiEffettivi !== vecchiCrediti) {
          updatedPagGiorn = {
            ...updatedPagGiorn,
            crediti: dati.creditiEffettivi,
            importo: dati.creditiEffettivi * VALORE_CREDITO_GIORNALIERO,
          }
        }
        await updateAccesso(accessoModifica.id, { ...dati, pagamentoGiornaliero: updatedPagGiorn })
        setAccessoModifica(null)
        return
      }

      if (dati.creditiEffettivi !== vecchiCrediti) {
        await ripristinaCreditiFIFO(accessoModifica.clienteId, scaleDaPacchetti)
        const risultato = await scalaCreditiFIFO(accessoModifica.clienteId, dati.creditiEffettivi)
        scaleDaPacchetti = risultato.scaleDaPacchetti
        if (risultato.creditiNonCoperti > 0) {
          avviso = `Aggiornato. Attenzione: ${risultato.creditiNonCoperti} crediti non coperti!`
        }
      }

      await updateAccesso(accessoModifica.id, { ...dati, scaleDaPacchetti })
      setAccessoModifica(null)

      if (avviso) {
        setFeedback(avviso)
        setTimeout(() => setFeedback(''), 4000)
      }
    } catch {
      setFeedback('Errore nel salvataggio. Riprova.')
      setTimeout(() => setFeedback(''), 3000)
    }
  }

  const accessiGiorno = accessi.filter((a) => a.data === dataSelezionata)
  const isOggi = dataSelezionata === oggi

  return (
    <>
      <div className="flex flex-col h-full">
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <h1 className="text-xl font-bold text-gray-900">Ingressi</h1>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Selettore data */}
          <div className="px-4 pt-4">
            <div className="flex items-center gap-3 bg-primary-light rounded-xl px-4 py-3">
              <span className="text-sm font-medium text-primary-dark">Data ingresso</span>
              <input
                type="date"
                value={dataSelezionata}
                onChange={(e) => setDataSelezionata(e.target.value)}
                className="ml-auto border border-primary/30 rounded-lg px-2 py-1 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {!isOggi && (
                <button
                  onClick={() => setDataSelezionata(oggi)}
                  className="text-xs text-primary font-medium hover:underline whitespace-nowrap"
                >
                  Oggi
                </button>
              )}
            </div>
          </div>

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
              <span className="text-sm font-medium text-gray-700">
                Piscina (+{caniSelezionati.length >= 2 ? 4 : 3} cr)
              </span>
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

            {/* Sezione pagamento giornaliero */}
            {clienteId && showPagamentoGiornaliero && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
                <p className="text-sm font-semibold text-amber-800">Pagamento giornaliero</p>

                {needsScelta && (
                  <div className="space-y-2">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="sceltaGiornaliero"
                        value="misto"
                        checked={sceltaGiornaliero === 'misto'}
                        onChange={() => setSceltaGiornaliero('misto')}
                        className="mt-0.5 accent-amber-600"
                      />
                      <span className="text-sm text-amber-900">
                        Usa {creditiResiduiTotali} cr dal pacchetto + paga {creditiEffettivi - creditiResiduiTotali} cr giornalieri
                        {' → '}<strong>{((creditiEffettivi - creditiResiduiTotali) * VALORE_CREDITO_GIORNALIERO).toFixed(2)} €</strong>
                      </span>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="sceltaGiornaliero"
                        value="tutto"
                        checked={sceltaGiornaliero === 'tutto'}
                        onChange={() => setSceltaGiornaliero('tutto')}
                        className="mt-0.5 accent-amber-600"
                      />
                      <span className="text-sm text-amber-900">
                        Paga tutto come giornaliero
                        {' → '}<strong>{(creditiEffettivi * VALORE_CREDITO_GIORNALIERO).toFixed(2)} €</strong>
                      </span>
                    </label>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-sm text-amber-700">Da pagare</span>
                  <span className="text-lg font-bold text-amber-900">{importoGiornaliero.toFixed(2)} €</span>
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pagGiornaliero.pagato}
                    onChange={(e) => setPagGiornaliero((p) => ({ ...p, pagato: e.target.checked }))}
                    className="w-5 h-5 rounded accent-amber-600"
                  />
                  <span className="text-sm font-medium text-amber-800">Pagato</span>
                </label>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-amber-700">Metodo</span>
                  <select
                    value={pagGiornaliero.metodoPagamento}
                    onChange={(e) => setPagGiornaliero((p) => ({ ...p, metodoPagamento: e.target.value }))}
                    className="flex-1 border border-amber-200 rounded-lg px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    <option value="contanti">Contanti</option>
                    <option value="bonifico">Bonifico</option>
                  </select>
                </div>
              </div>
            )}

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

          {/* Accessi del giorno selezionato */}
          {accessiGiorno.length > 0 && (
            <div className="px-4 pb-6">
              <h3 className="font-semibold text-gray-700 mb-3">
                {isOggi ? `Accessi di oggi (${accessiGiorno.length})` : `Accessi del ${formatData(dataSelezionata)} (${accessiGiorno.length})`}
              </h3>
              <div className="space-y-2">
                {accessiGiorno.map((a) => {
                  const cl = clienti.find((c) => c.id === a.clienteId)
                  const pg = a.pagamentoGiornaliero
                  return (
                    <div key={a.id} className={`border rounded-xl p-3 flex items-center justify-between gap-2 ${pg ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-200'}`}>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="font-medium text-gray-800 text-sm">{cl?.nome || '—'}</p>
                          {pg && <span className="text-xs bg-amber-100 text-amber-700 font-medium px-1.5 py-0.5 rounded-full">Giornaliero</span>}
                        </div>
                        <p className="text-xs text-gray-500">
                          {a.cani?.map((c) => c.nome).join(', ')} · {a.orarioIngresso}–{a.orarioUscita}
                        </p>
                        {pg && (
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-xs font-semibold text-amber-800">{pg.importo?.toFixed(2)} €</span>
                            <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${pg.pagato ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                              {pg.pagato ? 'Pagato' : 'Da pagare'}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="default">{a.creditiEffettivi} cr</Badge>
                        <button
                          onClick={() => setAccessoModifica(a)}
                          className="text-xs text-gray-500 hover:text-gray-700 font-medium"
                        >
                          Modifica
                        </button>
                        <button
                          onClick={async () => {
                            if (!window.confirm('Eliminare questo accesso?')) return
                            await ripristinaCreditiFIFO(a.clienteId, a.scaleDaPacchetti || [])
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

      {accessoModifica && (
        <Modal
          titolo={`Modifica — ${clienti.find((c) => c.id === accessoModifica.clienteId)?.nome || ''}`}
          onClose={() => setAccessoModifica(null)}
        >
          <FormModificaAccesso
            accesso={accessoModifica}
            onSalva={handleModificaSalva}
            onAnnulla={() => setAccessoModifica(null)}
          />
        </Modal>
      )}
    </>
  )
}
