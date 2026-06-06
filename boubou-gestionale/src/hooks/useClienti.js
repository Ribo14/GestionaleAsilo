import { useState, useEffect } from 'react'
import { subscribeClienti, addCliente, updateCliente, deleteCliente } from '../firebase/firestore'

export function useClienti() {
  const [clienti, setClienti] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = subscribeClienti((data) => {
      setClienti(data)
      setLoading(false)
    })
    return unsub
  }, [])

  return { clienti, loading, addCliente, updateCliente, deleteCliente }
}
