import { useState, useEffect } from 'react'
import {
  subscribePacchetti,
  addPacchetto,
  updatePacchetto,
} from '../firebase/firestore'

export function usePacchetti(clienteId) {
  const [pacchetti, setPacchetti] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!clienteId) return
    const unsub = subscribePacchetti(clienteId, (data) => {
      setPacchetti(data)
      setLoading(false)
    })
    return unsub
  }, [clienteId])

  const creditiDisponibili = pacchetti.reduce((s, p) => s + (p.creditiResidui || 0), 0)

  return { pacchetti, loading, creditiDisponibili, addPacchetto, updatePacchetto }
}
