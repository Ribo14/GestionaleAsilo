import { useState } from 'react'
import { useClienti } from '../../hooks/useClienti'
import { getAccessiMese } from '../../firebase/firestore'
import { calcolaReportCliente, nomeMese } from '../../utils/reportMensile'
import ExportPDF from './ExportPDF'

export default function ReportMensile() {
  const now = new Date()
  const [anno, setAnno] = useState(now.getFullYear())
  const [mese, setMese] = useState(now.getMonth() + 1)
  const [clienteFiltro, setClienteFiltro] = useState('tutti')
  const [dati, setDati] = useState(null)
  const [loading, setLoading] = useState(false)

  const { clienti } = useClienti()

  async function caricaReport() {
    setLoading(true)
    const accessi = await getAccessiMese(anno, mese)
    const reports = clienti
      .filter((c) => accessi.some((a) => a.clienteId === c.id))
      .filter((c) => clienteFiltro === 'tutti' || c.id === clienteFiltro)
      .map((c) => calcolaReportCliente(c, accessi, []))
      .filter((r) => r.accessi.length > 0)
    setDati(reports)
    setLoading(false)
  }

  const mesiOptions = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: new Date(2024, i, 1).toLocaleDateString('it-IT', { month: 'long' }),
  }))

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <h1 className="text-xl font-bold text-gray-900">Report mensile</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Filtri */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mese</label>
              <select value={mese} onChange={(e) => setMese(Number(e.target.value))} className="input-field">
                {mesiOptions.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Anno</label>
              <input
                type="number"
                value={anno}
                onChange={(e) => setAnno(Number(e.target.value))}
                min="2024"
                max="2030"
                className="input-field"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
            <select value={clienteFiltro} onChange={(e) => setClienteFiltro(e.target.value)} className="input-field">
              <option value="tutti">Tutti i clienti</option>
              {clienti.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>
          <button
            onClick={caricaReport}
            disabled={loading}
            className="w-full bg-primary text-white py-2.5 rounded-xl font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {loading ? 'Caricamento…' : 'Genera report'}
          </button>
        </div>

        {/* Risultati */}
        {dati && (
          <>
            {dati.length === 0 ? (
              <p className="text-center text-gray-400 py-8">Nessun accesso nel periodo selezionato</p>
            ) : (
              <>
                <div id="report-pdf-content" className="space-y-4">
                  {dati.map((r) => (
                    <div key={r.cliente.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                      <div className="bg-primary-light px-4 py-3 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-primary-dark">{r.cliente.nome}</p>
                          <p className="text-xs text-primary-dark/70">{nomeMese(mese, anno)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-primary-dark">{r.totaleEuro.toFixed(2)} €</p>
                          <p className="text-xs text-primary-dark/70">{r.totaleCreditiUsati} crediti</p>
                        </div>
                      </div>

                      {r.righeRiepilogo.length > 0 && (
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Riepilogo per pacchetto</p>
                          {r.righeRiepilogo.map((riga) => (
                            <div key={riga.pacchettoId} className="flex justify-between text-sm py-0.5">
                              <span className="text-gray-600">{riga.creditiUsati} cr × {riga.valoreCreditoEuro?.toFixed(2)} €</span>
                              <span className="font-medium text-gray-800">{riga.subtotaleEuro.toFixed(2)} €</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="px-4 py-3">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Dettaglio giornate</p>
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-xs text-gray-500 border-b border-gray-100">
                              <th className="text-left py-1">Data</th>
                              <th className="text-left py-1">Cani</th>
                              <th className="text-left py-1">Orario</th>
                              <th className="text-right py-1">Cr</th>
                            </tr>
                          </thead>
                          <tbody>
                            {r.accessi.map((a) => (
                              <tr key={a.id} className="border-b border-gray-50">
                                <td className="py-1.5 text-gray-700">{a.data}</td>
                                <td className="py-1.5 text-gray-600 text-xs">{a.cani?.map((c) => c.nome).join(', ')}</td>
                                <td className="py-1.5 text-gray-600 text-xs">{a.orarioIngresso}–{a.orarioUscita}</td>
                                <td className="py-1.5 text-right font-medium text-gray-800">{a.creditiEffettivi}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
                <ExportPDF mese={mese} anno={anno} />
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
