import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import { db } from './config'

// ── Auth ────────────────────────────────────────────────────────────────────

export async function getPasswordHash() {
  const ref = doc(db, 'config', 'auth')
  const snap = await getDoc(ref)
  return snap.exists() ? snap.data().passwordHash : null
}

export async function setPasswordHash(hash) {
  await setDoc(doc(db, 'config', 'auth'), { passwordHash: hash })
}

// ── Clienti ─────────────────────────────────────────────────────────────────

export function subscribeClienti(callback) {
  const q = query(collection(db, 'clienti'), orderBy('nome'))
  return onSnapshot(q, (snap) =>
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  )
}

export async function addCliente(data) {
  return addDoc(collection(db, 'clienti'), { ...data, createdAt: serverTimestamp() })
}

export async function updateCliente(id, data) {
  return updateDoc(doc(db, 'clienti', id), data)
}

export async function deleteCliente(id) {
  return deleteDoc(doc(db, 'clienti', id))
}

// ── Cani ────────────────────────────────────────────────────────────────────

export function subscribeCani(clienteId, callback) {
  const q = query(collection(db, 'clienti', clienteId, 'cani'), orderBy('nome'))
  return onSnapshot(q, (snap) =>
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  )
}

export async function addCane(clienteId, data) {
  return addDoc(collection(db, 'clienti', clienteId, 'cani'), data)
}

export async function updateCane(clienteId, caneId, data) {
  return updateDoc(doc(db, 'clienti', clienteId, 'cani', caneId), data)
}

export async function deleteCane(clienteId, caneId) {
  return deleteDoc(doc(db, 'clienti', clienteId, 'cani', caneId))
}

// ── Pacchetti ────────────────────────────────────────────────────────────────

export function subscribePacchetti(clienteId, callback) {
  const q = query(
    collection(db, 'clienti', clienteId, 'pacchetti'),
    orderBy('dataAcquisto')
  )
  return onSnapshot(q, (snap) =>
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  )
}

export async function addPacchetto(clienteId, data) {
  return addDoc(collection(db, 'clienti', clienteId, 'pacchetti'), data)
}

export async function updatePacchetto(clienteId, pacchettoId, data) {
  return updateDoc(doc(db, 'clienti', clienteId, 'pacchetti', pacchettoId), data)
}

export async function getPacchettiAttivi(clienteId) {
  const q = query(
    collection(db, 'clienti', clienteId, 'pacchetti'),
    where('creditiResidui', '>', 0),
    orderBy('creditiResidui'),
    orderBy('dataAcquisto')
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

// ── Accessi ──────────────────────────────────────────────────────────────────

export function subscribeAccessi(callback, filters = {}) {
  let q = query(collection(db, 'accessi'), orderBy('data', 'desc'))
  if (filters.clienteId) {
    q = query(
      collection(db, 'accessi'),
      where('clienteId', '==', filters.clienteId),
      orderBy('data', 'desc')
    )
  }
  return onSnapshot(q, (snap) =>
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  )
}

export async function getAccessiMese(anno, mese) {
  const from = `${anno}-${String(mese).padStart(2, '0')}-01`
  const to = `${anno}-${String(mese).padStart(2, '0')}-31`
  const q = query(
    collection(db, 'accessi'),
    where('data', '>=', from),
    where('data', '<=', to),
    orderBy('data')
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function addAccesso(data) {
  return addDoc(collection(db, 'accessi'), { ...data, createdAt: serverTimestamp() })
}

export async function updateAccesso(id, data) {
  return updateDoc(doc(db, 'accessi', id), data)
}

export async function deleteAccesso(id) {
  return deleteDoc(doc(db, 'accessi', id))
}
