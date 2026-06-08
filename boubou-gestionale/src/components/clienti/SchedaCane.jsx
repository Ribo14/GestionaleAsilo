import { useState } from "react";

const RAZZE = [
  "Meticcio",
  "Affenpinscher",
  "Akita Inu",
  "Alano",
  "Alaskan Malamute",
  "American Bully",
  "American Staffordshire Terrier",
  "Barboncino",
  "Basenji",
  "Basset Hound",
  "Beagle",
  "Bearded Collie",
  "Berger Blanc Suisse",
  "Bichon Frisé",
  "Bloodhound",
  "Border Collie",
  "Border Terrier",
  "Boston Terrier",
  "Bouvier des Flandres",
  "Boxer",
  "Bracco Italiano",
  "Bulldog Francese",
  "Bulldog Inglese",
  "Bullmastiff",
  "Cairn Terrier",
  "Cane Corso",
  "Cane da Pastore di Bergamo",
  "Cavalier King Charles Spaniel",
  "Chihuahua",
  "Chow Chow",
  "Cirneco dell'Etna",
  "Cocker Spaniel Americano",
  "Cocker Spaniel Inglese",
  "Collie",
  "Dalmata",
  "Dobermann",
  "Dogo Argentino",
  "Dogue de Bordeaux",
  "English Setter",
  "Flat Coated Retriever",
  "Fox Terrier",
  "Golden Retriever",
  "Gordon Setter",
  "Greyhound",
  "Groenendael",
  "Husky Siberiano",
  "Irish Setter",
  "Irish Wolfhound",
  "Jack Russell Terrier",
  "Labrador Retriever",
  "Lagotto Romagnolo",
  "Leonberger",
  "Lhasa Apso",
  "Lupo Cecoslovacco",
  "Lupo di Saarloos",
  "Malinois",
  "Maltese",
  "Mastiff",
  "Mastino Napoletano",
  "Mastino Tibetano",
  "Pastore Australiano",
  "Pastore Belga",
  "Pastore Catalano",
  "Pastore della Brie",
  "Pastore della Piccardia",
  "Pastore di Beauce",
  "Pastore di Maremma e Abruzzo",
  "Pastore Scozzese",
  "Pastore Tedesco",
  "Pechinese",
  "Perro de Presa Canario",
  "Piccolo Levriero Italiano",
  "Pinscher Nano",
  "Pinscher Medio",
  "Pointer",
  "Pomerania",
  "Pug (Carlino)",
  "Rhodesian Ridgeback",
  "Rottweiler",
  "Saint Bernard",
  "Saluki",
  "Samoiedo",
  "Schnauzer Gigante",
  "Schnauzer Medio",
  "Schnauzer Nano",
  "Scottish Terrier",
  "Segugio Italiano",
  "Shar Pei",
  "Shiba Inu",
  "Shih Tzu",
  "Siberian Husky",
  "Spinone Italiano",
  "Spitz Tedesco",
  "Springer Spaniel Inglese",
  "Staffordshire Bull Terrier",
  "Terranova",
  "Tervueren",
  "Volpino Italiano",
  "Weimaraner",
  "Welsh Corgi Pembroke",
  "West Highland White Terrier",
  "Whippet",
  "Yorkshire Terrier",
];

const VUOTO = {
  nome: "",
  razza: "",
  eta: "",
  sterilizzato: false,
  note: "",
  veterinario: { nome: "", telefono: "", indirizzo: "" },
};

export default function SchedaCane({ cane, onSalva, onAnnulla, onElimina }) {
  const [form, setForm] = useState(
    cane
      ? { ...cane, veterinario: { ...cane.veterinario } }
      : { ...VUOTO, veterinario: { ...VUOTO.veterinario } },
  );
  const [saving, setSaving] = useState(false);
  const [suggestioniRazza, setSuggestioniRazza] = useState([]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setVet = (k) => (e) =>
    setForm((f) => ({
      ...f,
      veterinario: { ...f.veterinario, [k]: e.target.value },
    }));

  function onRazzaChange(e) {
    const val = e.target.value;
    setForm((f) => ({ ...f, razza: val }));
    if (val.length >= 2) {
      const lower = val.toLowerCase();
      setSuggestioniRazza(
        RAZZE.filter((r) => r.toLowerCase().includes(lower)).slice(0, 8),
      );
    } else {
      setSuggestioniRazza([]);
    }
  }

  function selezionaRazza(razza) {
    setForm((f) => ({ ...f, razza }));
    setSuggestioniRazza([]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.nome.trim()) return;
    setSaving(true);
    await onSalva(form);
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome *
          </label>
          <input
            value={form.nome}
            onChange={set("nome")}
            required
            className="input-field"
          />
        </div>
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Razza
          </label>
          <input
            value={form.razza}
            onChange={onRazzaChange}
            onBlur={() => setTimeout(() => setSuggestioniRazza([]), 150)}
            className="input-field"
            autoComplete="off"
          />
          {suggestioniRazza.length > 0 && (
            <div className="absolute z-10 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg mt-1 max-h-48 overflow-y-auto">
              {suggestioniRazza.map((r) => (
                <button
                  key={r}
                  type="button"
                  onMouseDown={() => selezionaRazza(r)}
                  className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm"
                >
                  {r}
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Età (anni)
          </label>
          <input
            type="number"
            min="0"
            max="30"
            value={form.eta}
            onChange={set("eta")}
            className="input-field"
          />
        </div>
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={form.sterilizzato}
          onChange={(e) =>
            setForm((f) => ({ ...f, sterilizzato: e.target.checked }))
          }
          className="w-4 h-4 text-primary rounded"
        />
        <span className="text-sm text-gray-700">Sterilizzato/a</span>
      </label>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Note
        </label>
        <textarea
          value={form.note}
          onChange={set("note")}
          rows={2}
          className="input-field resize-none"
        />
      </div>
      <div className="border-t pt-4">
        <p className="text-sm font-semibold text-gray-600 mb-3">Veterinario</p>
        <div className="space-y-2">
          <input
            value={form.veterinario.nome}
            onChange={setVet("nome")}
            className="input-field"
            placeholder="Nome veterinario"
          />
          <input
            value={form.veterinario.telefono}
            onChange={setVet("telefono")}
            className="input-field"
            placeholder="Telefono"
          />
          <input
            value={form.veterinario.indirizzo}
            onChange={setVet("indirizzo")}
            className="input-field"
            placeholder="Indirizzo"
          />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        {cane && onElimina && (
          <button
            type="button"
            onClick={onElimina}
            className="px-4 py-2.5 text-danger border border-danger rounded-xl hover:bg-red-50 transition-colors text-sm font-medium"
          >
            Elimina
          </button>
        )}
        <button
          type="button"
          onClick={onAnnulla}
          className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-xl hover:bg-gray-50 transition-colors font-medium"
        >
          Annulla
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex-1 bg-primary text-white py-2.5 rounded-xl hover:bg-primary-dark transition-colors font-medium disabled:opacity-50"
        >
          {saving ? "Salvataggio…" : "Salva"}
        </button>
      </div>
    </form>
  );
}
