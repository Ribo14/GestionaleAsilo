import { useState, useEffect } from 'react'
import { subscribeAccessi, addAccesso, deleteAccesso } from '../firebase/firestore'

export function useAccessi(clienteId = null) {
  const [accessi, setAccessi] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = subscribeAccessi(
      (data) => {
        setAccessi(data)
        setLoading(false)
      },
      clienteId ? { clienteId } : {}
    )
    return unsub
  }, [clienteId])

  return { accessi, loading, addAccesso, deleteAccesso }
}
