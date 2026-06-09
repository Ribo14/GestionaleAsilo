import { useState, useEffect } from 'react'
import Badge from '../ui/Badge'
import Modal from '../ui/Modal'
import SchedaCane from './SchedaCane'
import GestionePacchetti from './GestionePacchetti'
import { subscribeCani, addCane, updateCane, deleteCane, deletePacchetto, updateAccesso, deleteAccesso } from '../../firebase/firestore'
import { formatData } from '../../utils/reportMensile'
import { usePacchetti } from '../../hooks/usePacchetti'
import { useAccessi } from '../../hooks/useAccessi'
import { addPacchetto, updatePacchetto } from '../../firebase/firestore'
import { scalaCreditiFIFO, ripristinaCreditiFIFO } from '../../utils/logicaFIFO'
import { VALORE_CREDITO_GIORNALIERO } from '../../utils/calcoloCrediti'
import FormModificaAccesso from '../oggi/FormModificaAccesso'

function StoricoCane({ cane }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
      {cane.nome}
    </span>
  )
}

export default function SchedaCliente({ cliente, onBack, onModifica, onElimina }) {
  const [cani, setCani] = useState([])
  const [tabAttiva, setTabAttiva] = useState('info')
  const [modaleCane, setModaleCane] = useState(null) // null | 'nuovo' | cane
  const [accessoModifica, setAccessoModifica] = useState(null)
  const [feedbackStorico, setFeedbackStorico] = useState('')

  const { pacchetti, creditiDisponibili } = usePacchetti(cliente.id)
  const { accessi } = useAccessi(cliente.id)

  useEffect(() => {
    const unsub = subscribeCani(cliente.id, setCani)
    return unsub
  }, [cliente.id])

  const accessiOrdinati = [...accessi].sort((a, b) => (b.data || '').localeCompare(a.data || ''))

  const accessiPerMese = accessiOrdinati.reduce((acc, a) => {
    const mese = a.data?.slice(0, 7) || 'sconosciuto'
    if (!acc[mese]) acc[mese] = []
    acc[mese].push(a)
    return acc
  }, {})

  const mesiOrdinati = Object.keys(accessiPerMese).sort((a, b) => b.localeCompare(a))

  async function salvaCane(form) {
    if (modaleCane === 'nuovo') {
      await addCane(cliente.id, form)
    } else {
      await updateCane(cliente.id, modaleCane.id, form)
    }
    setModaleCane(null)
  }

  async function handleModificaAccesso(dati) {
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
        await ripristinaCreditiFIFO(cliente.id, scaleDaPacchetti)
        const risultato = await scalaCreditiFIFO(cliente.id, dati.creditiEffettivi)
        scaleDaPacchetti = risultato.scaleDaPacchetti
        if (risultato.creditiNonCoperti > 0) {
          avviso = `Aggiornato. Attenzione: ${risultato.creditiNonCoperti} crediti non coperti!`
        }
      }
      await updateAccesso(accessoModifica.id, { ...dati, scaleDaPacchetti })
      setAccessoModifica(null)
      if (avviso) {
        setFeedbackStorico(avviso)
        setTimeout(() => setFeedbackStorico(''), 4000)
      }
    } catch {
      setFeedbackStorico('Errore nel salvataggio. Riprova.')
      setTimeout(() => setFeedbackStorico(''), 3000)
    }
  }

  async function handleEliminaAccesso(a) {
    if (!window.confirm('Eliminare questo accesso?')) return
    await ripristinaCreditiFIFO(cliente.id, a.scaleDaPacchetti || [])
    await deleteAccesso(a.id)
  }

  async function eliminaCane() {
    if (!window.confirm(`Eliminare ${modaleCane.nome}?`)) return
    await deleteCane(cliente.id, modaleCane.id)
    setModaleCane(null)
  }

  const TABS = ['info', 'cani', 'pacchetti', 'storico']
  const labelTab = { info: 'Info', cani: `Cani (${cani.length})`, pacchetti: 'Pacchetti', storico: 'Storico' }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={onBack} className="text-primary font-medium text-sm">← Clienti</button>
          <div className="ml-auto flex gap-2">
            <button onClick={() => onModifica(cliente)} className="text-sm text-gray-500 hover:text-gray-700">Modifica</button>
            <button onClick={() => onElimina(cliente)} className="text-sm text-danger hover:text-red-700">Elimina</button>
          </div>
        </div>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{cliente.nome}</h2>
            {cliente.telefono && <p className="text-sm text-gray-500">{cliente.telefono}</p>}
            {cliente.email && <p className="text-sm text-gray-500">{cliente.email}</p>}
          </div>
          <Badge variant="default" className="ml-2 shrink-0">
            {creditiDisponibili} crediti
          </Badge>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-gray-200 bg-white px-2">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTabAttiva(t)}
            className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
              tabAttiva === t
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {labelTab[t]}
          </button>
        ))}
      </div>

      {/* Contenuto */}
      <div className="flex-1 overflow-y-auto p-4">
        {tabAttiva === 'info' && (
          <div className="space-y-2 text-sm text-gray-700">
            {cliente.note ? <p className="bg-gray-50 rounded-xl p-3">{cliente.note}</p> : <p className="text-gray-400">Nessuna nota</p>}
          </div>
        )}

        {tabAttiva === 'cani' && (
          <div className="space-y-3">
            <button
              onClick={() => setModaleCane('nuovo')}
              className="w-full border-2 border-dashed border-primary/40 text-primary rounded-xl py-3 text-sm font-medium hover:bg-primary-light transition-colors"
            >
              + Aggiungi cane
            </button>
            {cani.map((c) => (
              <div
                key={c.id}
                onClick={() => setModaleCane(c)}
                className="bg-white border border-gray-200 rounded-xl p-4 cursor-pointer hover:border-primary/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-800">{c.nome}</span>
                  <div className="flex gap-1.5">
                    {c.sterilizzato && <Badge variant="gray">Sterilizzato</Badge>}
                  </div>
                </div>
                {c.razza && <p className="text-sm text-gray-500 mt-0.5">{c.razza}{c.eta ? ` · ${c.eta} anni` : ''}</p>}
                {c.note && <p className="text-xs text-gray-400 mt-1">{c.note}</p>}
              </div>
            ))}
          </div>
        )}

        {tabAttiva === 'pacchetti' && (
          <GestionePacchetti
            clienteId={cliente.id}
            pacchetti={pacchetti}
            onAggiungi={addPacchetto}
            onAggiorna={updatePacchetto}
            onElimina={deletePacchetto}
          />
        )}

        {tabAttiva === 'storico' && (
          <div className="space-y-4">
            {feedbackStorico && (
              <p className={`text-sm font-medium text-center ${feedbackStorico.includes('Attenzione') ? 'text-warning' : feedbackStorico.includes('Errore') ? 'text-danger' : 'text-success'}`}>
                {feedbackStorico}
              </p>
            )}
            {accessi.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">Nessun accesso registrato</p>
            )}
            {mesiOrdinati.map((mese) => (
              <div key={mese}>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 px-1">
                  {new Date(mese + '-01').toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })}
                </h3>
                <div className="space-y-2">
                  {accessiPerMese[mese].map((a) => {
                    const pg = a.pagamentoGiornaliero
                    return (
                      <div key={a.id} className={`border rounded-xl p-3 ${pg ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-200'}`}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-medium text-gray-800 text-sm">{formatData(a.data)}</span>
                            {pg && <span className="text-xs bg-amber-100 text-amber-700 font-medium px-1.5 py-0.5 rounded-full">Pagamento giornaliero</span>}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge variant="default">{a.creditiEffettivi} cr</Badge>
                            {pg && <span className="text-sm font-semibold text-amber-800">{pg.importo?.toFixed(2)} €</span>}
                            {pg && (
                              <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${pg.pagato ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                                {pg.pagato ? 'Pagato' : 'Da pagare'}
                              </span>
                            )}
                            <button
                              onClick={() => setAccessoModifica(a)}
                              className="text-xs text-gray-500 hover:text-gray-700 font-medium"
                            >
                              Modifica
                            </button>
                            <button
                              onClick={() => handleEliminaAccesso(a)}
                              className="text-gray-300 hover:text-danger transition-colors text-lg leading-none"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-1">
                          {a.cani?.map((c) => <StoricoCane key={c.caneId} cane={c} />)}
                        </div>
                        <p className="text-xs text-gray-500">
                          {a.orarioIngresso}–{a.orarioUscita}
                          {a.piscina && ' · Piscina'}
                          {a.agevolazione && ' · Agevolazione'}
                          {pg && ` · ${pg.metodoPagamento}`}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modaleCane && (
        <Modal
          titolo={modaleCane === 'nuovo' ? 'Nuovo cane' : `Modifica ${modaleCane.nome}`}
          onClose={() => setModaleCane(null)}
        >
          <SchedaCane
            cane={modaleCane === 'nuovo' ? null : modaleCane}
            onSalva={salvaCane}
            onAnnulla={() => setModaleCane(null)}
            onElimina={modaleCane !== 'nuovo' ? eliminaCane : null}
          />
        </Modal>
      )}

      {accessoModifica && (
        <Modal
          titolo={`Modifica accesso — ${formatData(accessoModifica.data)}`}
          onClose={() => setAccessoModifica(null)}
        >
          <FormModificaAccesso
            accesso={accessoModifica}
            onSalva={handleModificaAccesso}
            onAnnulla={() => setAccessoModifica(null)}
          />
        </Modal>
      )}
    </div>
  )
}
