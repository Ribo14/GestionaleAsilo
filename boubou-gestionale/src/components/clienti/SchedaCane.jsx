import { useState } from 'react'

const VUOTO = {
  nome: '', razza: '', eta: '', sterilizzato: false, note: '',
  veterinario: { nome: '', telefono: '', indirizzo: '' },
}

export default function SchedaCane({ cane, onSalva, onAnnulla, onElimina }) {
  const [form, setForm] = useState(cane ? { ...cane, veterinario: { ...cane.veterinario } } : { ...VUOTO, veterinario: { ...VUOTO.veterinario } })
  const [saving, setSaving] = useState(false)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const setVet = (k) => (e) => setForm((f) => ({ ...f, veterinario: { ...f.veterinario, [k]: e.target.value } }))

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.nome.trim()) return
    setSaving(true)
    await onSalva(form)
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
          <input value={form.nome} onChange={set('nome')} required className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Razza</label>
          <input value={form.razza} onChange={set('razza')} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Età (anni)</label>
          <input type="number" min="0" max="30" value={form.eta} onChange={set('eta')} className="input-field" />
        </div>
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={form.sterilizzato}
          onChange={(e) => setForm((f) => ({ ...f, sterilizzato: e.target.checked }))}
          className="w-4 h-4 text-primary rounded"
        />
        <span className="text-sm text-gray-700">Sterilizzato/a</span>
      </label>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
        <textarea value={form.note} onChange={set('note')} rows={2} className="input-field resize-none" />
      </div>
      <div className="border-t pt-4">
        <p className="text-sm font-semibold text-gray-600 mb-3">Veterinario</p>
        <div className="space-y-2">
          <input value={form.veterinario.nome} onChange={setVet('nome')} className="input-field" placeholder="Nome veterinario" />
          <input value={form.veterinario.telefono} onChange={setVet('telefono')} className="input-field" placeholder="Telefono" />
          <input value={form.veterinario.indirizzo} onChange={setVet('indirizzo')} className="input-field" placeholder="Indirizzo" />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        {cane && onElimina && (
          <button type="button" onClick={onElimina} className="px-4 py-2.5 text-danger border border-danger rounded-xl hover:bg-red-50 transition-colors text-sm font-medium">
            Elimina
          </button>
        )}
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
