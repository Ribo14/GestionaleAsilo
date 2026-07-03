import { useState, useEffect, useCallback } from 'react'
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth'
import { auth } from '../firebase/config'

export function useAuth() {
  const [autenticato, setAutenticato] = useState(false)
  const [loading, setLoading] = useState(true)
  const [errore, setErrore] = useState('')

  // Firebase mantiene la sessione in automatico: onAuthStateChanged scatta
  // all'avvio e a ogni login/logout, così sappiamo sempre se c'è un utente.
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setAutenticato(!!user)
      setLoading(false)
    })
    return unsub
  }, [])

  const login = useCallback(async (email, password) => {
    setErrore('')
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password)
      return true
    } catch (e) {
      if (
        e.code === 'auth/invalid-credential' ||
        e.code === 'auth/wrong-password' ||
        e.code === 'auth/user-not-found' ||
        e.code === 'auth/invalid-email'
      ) {
        setErrore('Email o password errati')
      } else if (e.code === 'auth/too-many-requests') {
        setErrore('Troppi tentativi. Riprova tra qualche minuto.')
      } else {
        setErrore('Errore di connessione. Riprova.')
      }
      return false
    }
  }, [])

  const logout = useCallback(async () => {
    await signOut(auth)
  }, [])

  const cambiaPassword = useCallback(async (vecchiaPassword, nuovaPassword) => {
    const user = auth.currentUser
    if (!user) return { ok: false, errore: 'Sessione scaduta, riaccedi' }
    try {
      // Firebase richiede un login recente per cambiare password: ri-autentichiamo
      // con la password attuale prima di aggiornarla.
      const cred = EmailAuthProvider.credential(user.email, vecchiaPassword)
      await reauthenticateWithCredential(user, cred)
      await updatePassword(user, nuovaPassword)
      return { ok: true }
    } catch (e) {
      if (e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential') {
        return { ok: false, errore: 'Password attuale errata' }
      }
      if (e.code === 'auth/weak-password') {
        return { ok: false, errore: 'La nuova password deve avere almeno 6 caratteri' }
      }
      return { ok: false, errore: 'Errore, riprova' }
    }
  }, [])

  return { autenticato, loading, errore, login, logout, cambiaPassword }
}
