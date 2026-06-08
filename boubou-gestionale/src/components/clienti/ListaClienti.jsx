import { useState } from 'react'
import Badge from '../ui/Badge'
import Modal from '../ui/Modal'
import FormCliente from './FormCliente'
import SchedaCliente from './SchedaCliente'
import { useClienti } from '../../hooks/useClienti'
import { usePacchetti } from '../../hooks/usePacchetti'

function RigaCliente({ cliente, onClick }) {
  const { creditiDisponibili } = usePacchetti(cliente.id)
  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-xl p-4 cursor-pointer hover:border-primary/50 hover:shadow-sm transition-all"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-gray-900">{cliente.nome}</p>
          {cliente.telefono && <p className="text-sm text-gray-500 mt-0.5">{cliente.telefono}</p>}
        </div>
        <Badge variant={creditiDisponibili > 5 ? 'default' : creditiDisponibili > 0 ? 'warning' : 'gray'}>
          {creditiDisponibili} cr
        </Badge>
      </div>
    </div>
  )
}

export default function ListaClienti() {
  const { clienti, loading, addCliente, updateCliente, deleteCliente } = useClienti()
  const [ricerca, setRicerca] = useState('')
  const [mostraForm, setMostraForm] = useState(false)
  const [clienteSelezionato, setClienteSelezionato] = useState(null)
  const [clienteModifica, setClienteModifica] = useState(null)

  const filtrati = clienti.filter((c) =>
    c.nome?.toLowerCase().includes(ricerca.toLowerCase())
  )

  async function handleSalva(form) {
    if (clienteModifica) {
      await updateCliente(clienteModifica.id, form)
      if (clienteSelezionato?.id === clienteModifica.id) {
        setClienteSelezionato({ ...clienteModifica, ...form })
      }
    } else {
      await addCliente(form)
    }
    setMostraForm(false)
    setClienteModifica(null)
  }

  async function handleElimina(cliente) {
    if (!window.confirm(`Eliminare il cliente ${cliente.nome}?`)) return
    await deleteCliente(cliente.id)
    setClienteSelezionato(null)
  }

  if (clienteSelezionato) {
    return (
      <>
        <SchedaCliente
          cliente={clienteSelezionato}
          onBack={() => setClienteSelezionato(null)}
          onModifica={(c) => { setClienteModifica(c); setMostraForm(true) }}
          onElimina={handleElimina}
        />
        {mostraForm && (
          <Modal
            titolo="Modifica cliente"
            onClose={() => { setMostraForm(false); setClienteModifica(null) }}
          >
            <FormCliente
              cliente={clienteModifica}
              onSalva={handleSalva}
              onAnnulla={() => { setMostraForm(false); setClienteModifica(null) }}
            />
          </Modal>
        )}
      </>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-gray-900">Clienti</h1>
          <button
            onClick={() => { setClienteModifica(null); setMostraForm(true) }}
            className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors"
          >
            + Nuovo
          </button>
        </div>
        <input
          value={ricerca}
          onChange={(e) => setRicerca(e.target.value)}
          placeholder="Cerca per nome…"
          className="input-field"
        />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {loading && <p className="text-center text-gray-400 pt-8">Caricamento…</p>}
        {!loading && filtrati.length === 0 && (
          <p className="text-center text-gray-400 pt-8">
            {ricerca ? 'Nessun risultato' : 'Nessun cliente ancora'}
          </p>
        )}
        {filtrati.map((c) => (
          <RigaCliente key={c.id} cliente={c} onClick={() => setClienteSelezionato(c)} />
        ))}
      </div>

      {mostraForm && (
        <Modal
          titolo={clienteModifica ? 'Modifica cliente' : 'Nuovo cliente'}
          onClose={() => { setMostraForm(false); setClienteModifica(null) }}
        >
          <FormCliente
            cliente={clienteModifica}
            onSalva={handleSalva}
            onAnnulla={() => { setMostraForm(false); setClienteModifica(null) }}
          />
        </Modal>
      )}
    </div>
  )
}
