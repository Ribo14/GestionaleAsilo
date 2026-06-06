import { useState } from 'react'

const VUOTO = { nome: '', telefono: '', email: '', note: '' }

export default function FormCliente({ cliente, onSalva, onAnnulla }) {
  const [form, setForm] = useState(cliente ? { ...cliente } : { ...VUOTO })
  const [saving, setSaving] = useState(false)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.nome.trim()) return
    setSaving(true)
    await onSalva(form)
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nome e cognome *</label>
        <input
          value={form.nome}
          onChange={set('nome')}
          required
          className="input-field"
          placeholder="Es. Rossella Luglietti"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Telefono</label>
        <input value={form.telefono} onChange={set('telefono')} className="input-field" placeholder="333 1234567" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input type="email" value={form.email} onChange={set('email')} className="input-field" placeholder="email@esempio.com" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
        <textarea value={form.note} onChange={set('note')} rows={2} className="input-field resize-none" />
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onAnnulla} className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-xl hover:bg-gray-50 transition-colors font-medium">
          Annulla
        </button>
        <button type="submit" disabled={saving} className="flex-1 bg-primary text-white py-2.5 rounded-xl hover:bg-primary-dark transition-colors font-medium disabled:opacity-50">
          {saving ? 'Salvataggio…' : 'Salva'}
        </button>
      </div>
    </form>
  )
}
