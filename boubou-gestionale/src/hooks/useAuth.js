import { useState, useEffect, useCallback } from 'react'
import { getPasswordHash, setPasswordHash } from '../firebase/firestore'

const SESSION_KEY = 'boubou_session'
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000 // 8 ore

async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

export function useAuth() {
  const [autenticato, setAutenticato] = useState(false)
  const [loading, setLoading] = useState(true)
  const [errore, setErrore] = useState('')

  useEffect(() => {
    const session = localStorage.getItem(SESSION_KEY)
    if (session) {
      const { ts } = JSON.parse(session)
      if (Date.now() - ts < SESSION_DURATION_MS) {
        setAutenticato(true)
      } else {
        localStorage.removeItem(SESSION_KEY)
      }
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (password) => {
    setErrore('')
    try {
      const hash = await sha256(password)
      const savedHash = await getPasswordHash()

      if (!savedHash) {
        // Prima volta: salva la password
        await setPasswordHash(hash)
        localStorage.setItem(SESSION_KEY, JSON.stringify({ ts: Date.now() }))
        setAutenticato(true)
        return true
      }

      if (hash === savedHash) {
        localStorage.setItem(SESSION_KEY, JSON.stringify({ ts: Date.now() }))
        setAutenticato(true)
        return true
      }

      setErrore('Password errata')
      return false
    } catch (e) {
      setErrore('Errore di connessione. Riprova.')
      return false
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY)
    setAutenticato(false)
  }, [])

  const cambiaPassword = useCallback(async (vecchiaPassword, nuovaPassword) => {
    const hashVecchia = await sha256(vecchiaPassword)
    const savedHash = await getPasswordHash()
    if (hashVecchia !== savedHash) return { ok: false, errore: 'Password attuale errata' }
    const hashNuova = await sha256(nuovaPassword)
    await setPasswordHash(hashNuova)
    return { ok: true }
  }, [])

  return { autenticato, loading, errore, login, logout, cambiaPassword }
}
