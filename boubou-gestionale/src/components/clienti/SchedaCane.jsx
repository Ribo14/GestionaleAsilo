import { useState } from "react";

const RAZZE = [
  "Affenpinscher",
  "Airedale Terrier",
  "Akita",
  "Akita Americano",
  "Alano",
  "Alaskan Malamute",
  "Alpenländische Dachsbracke",
  "American Staffordshire Terrier",
  "American Water Spaniel",
  "Anglo-Français de Petite Vénerie",
  "Ariégeois",
  "Australian Cattle Dog",
  "Australian Silky Terrier",
  "Australian Stumpy Tail Cattle Dog",
  "Australian Terrier",
  "Azawakh",
  "Barbet",
  "Barbone",
  "Basenji",
  "Basset Artésien Normand",
  "Basset Bleu de Gascogne",
  "Basset Fauve de Bretagne",
  "Basset Hound",
  "Bassotto",
  "Bayerischer Gebirgsschweisshund",
  "Beagle",
  "Beagle-Harrier",
  "Bearded Collie",
  "Bedlington Terrier",
  "Bichon Havanais",
  "Bichon à poil frisé",
  "Billy",
  "Black and Tan Coonhound",
  "Bobtail",
  "Bolognese",
  "Border Collie",
  "Border Terrier",
  "Boston Terrier",
  "Bouledogue Francese",
  "Bovaro del Bernese",
  "Bovaro dell'Appenzell",
  "Bovaro dell'Entlebuch",
  "Bovaro delle Ardenne",
  "Bovaro delle Fiandre",
  "Boxer",
  "Bracco d'Ariège",
  "Bracco d'Auvergne",
  "Bracco del Borbonese",
  "Bracco di Burgos",
  "Bracco francese tipo Gascogne",
  "Bracco francese tipo Pirenei",
  "Bracco Italiano",
  "Bracco Portoghese",
  "Bracco Saint Germain",
  "Bracco Slovacco a pelo duro",
  "Bracco Tedesco a pelo duro",
  "Bracco Tedesco a pelo raso",
  "Bracco Ungherese",
  "Bracco Ungherese a pelo duro",
  "Briquet Griffon Vendéen",
  "Broholmer",
  "Bull Terrier",
  "Bull Terrier Miniature",
  "Bulldog",
  "Bullmastiff",
  "Cairn Terrier",
  "Canaan Dog",
  "Canadian Eskimo Dog",
  "Cane Corso",
  "Cane da ferma Boemo a pelo ruvido",
  "Cane da ferma tedesco a pelo lungo",
  "Cane da ferma tedesco a pelo ruvido",
  "Cane da Montagna dei Pirenei",
  "Cane da orso della Carelia",
  "Cane da pastore australiano",
  "Cane da pastore australiano Kelpie",
  "Cane da pastore belga",
  "Cane da pastore bergamasco",
  "Cane da pastore catalano",
  "Cane da pastore croato",
  "Cane da pastore del Caucaso",
  "Cane da pastore dell'Asia centrale",
  "Cane da pastore della Russia meridionale",
  "Cane da pastore dei Pirenei a faccia rasa",
  "Cane da pastore dei Pirenei a pelo lungo",
  "Cane da pastore di Beauce",
  "Cane da pastore di Brie",
  "Cane da pastore di Ciarplanina",
  "Cane da pastore di Karst",
  "Cane da pastore di Piccardia",
  "Cane da pastore di Tatra",
  "Cane da pastore di Vallée",
  "Cane da pastore Kangal",
  "Cane da pastore mallorquín",
  "Cane da pastore maremmano abruzzese",
  "Cane da pastore olandese",
  "Cane da pastore scozzese a pelo corto",
  "Cane da pastore scozzese a pelo lungo",
  "Cane da pastore tedesco",
  "Cane da Serra di Estrela",
  "Cane dei Faraoni",
  "Cane dell'Atlas",
  "Cane lupo Cecoslovacco",
  "Cane lupo di Saarloos",
  "Cane nudo peruviano",
  "Cão da Serra de Aires",
  "Cão de Água Português",
  "Cão de Castro Laboreiro",
  "Cão de Fila de São Miguel",
  "Carlino",
  "Cavalier King Charles Spaniel",
  "Chesapeake Bay Retriever",
  "Chien de Saint Hubert",
  "Chihuahua",
  "Chin",
  "Chinese Crested Dog",
  "Chow Chow",
  "Ciobănesc de Bucovina",
  "Cirneco dell'Etna",
  "Clumber Spaniel",
  "Cocker Spaniel Americano",
  "Cocker Spaniel Inglese",
  "Coton de Tuléar",
  "Curly Coated Retriever",
  "Dalmata",
  "Dandie Dinmont Terrier",
  "Cane da fattoria danese-svedese",
  "Deerhound",
  "Dobermann",
  "Dogo Argentino",
  "Dogue de Bordeaux",
  "Drever",
  "Dunker",
  "Dutch Smoushond",
  "English Foxhound",
  "English Toy Terrier",
  "Épagneul bleu de Picardie",
  "Épagneul breton",
  "Épagneul Français",
  "Épagneul Pont-Audemer",
  "Eurasier",
  "Field Spaniel",
  "Fila Brasileiro",
  "Finnish Lapphund",
  "Foxhound Americano",
  "Foxhound Inglese",
  "Foxterrier a pelo liscio",
  "Foxterrier a pelo ruvido",
  "Pointer tedesco",
  "Spitz Tedesco",
  "Galgo Español",
  "Golden Retriever",
  "Gordon Setter",
  "Grand Basset Griffon Vendéen",
  "Grand Bleu de Gascogne",
  "Grand Griffon Vendéen",
  "Grande Cane Svizzero",
  "Griffon Belge",
  "Griffon Bruxellois",
  "Griffon d'Arrêt à Poil Dur Korthals",
  "Griffon Fauve de Bretagne",
  "Griffon Nivernais",
  "Hovawart",
  "Husky Siberiano",
  "Irish Red and White Setter",
  "Irish Setter",
  "Irish Terrier",
  "Irish Water Spaniel",
  "Irish Wolfhound",
  "Jack Russell Terrier",
  "Keeshond",
  "Kerry Blue Terrier",
  "King Charles Spaniel",
  "Komondor",
  "Kooikerhondje",
  "Korea Jindo Dog",
  "Kuvasz",
  "Labrador Retriever",
  "Lagotto Romagnolo",
  "Lakeland Terrier",
  "Lapphund Finlandese",
  "Lapphund Svedese",
  "Leonberger",
  "Levriero Afghan",
  "Levriero Arabo",
  "Levriero Ibizenko",
  "Levriero Italiano",
  "Levriero Polacco",
  "Levriero Russo",
  "Lhasa Apso",
  "Löwchen",
  "Magyar Agar",
  "Maltese",
  "Manchester Terrier",
  "Mastiff",
  "Mastino Napoletano",
  "Mastino Tibetano",
  "Meticcio",
  "Miniature Pinscher",
  "Mudi",
  "Münsterländer Grande",
  "Münsterländer Piccolo",
  "Newfoundland",
  "Norfolk Terrier",
  "Norwegian Buhund",
  "Norwegian Elkhound grigio",
  "Norwegian Elkhound nero",
  "Norwegian Lundehund",
  "Norwich Terrier",
  "Nova Scotia Duck Tolling Retriever",
  "Otterhound",
  "Papillon",
  "Pastore Australiano Miniatura",
  "Pastore della Serra da Estrela",
  "Perdiguero de Burgos",
  "Perro de Agua Español",
  "Perro de Presa Canario",
  "Perro de Presa Mallorquín",
  "Petit Basset Griffon Vendéen",
  "Phalène",
  "Pinscher",
  "Pointer",
  "Pointer Inglese",
  "Poitevin",
  "Porcelaine",
  "Podenco Canario",
  "Podenco Ibicenco",
  "Podengo Portoghese",
  "Puli",
  "Pumi",
  "Retriever a pelo piatto",
  "Retriever della baia di Chesapeake",
  "Rhodesian Ridgeback",
  "Rottweiler",
  "Russell Terrier",
  "Saarlooswolfhond",
  "Saint Bernard",
  "Samoiedo",
  "Schipperke",
  "Schnauzer Gigante",
  "Schnauzer Miniature",
  "Schnauzer Standard",
  "Scottish Terrier",
  "Sealyham Terrier",
  "Segugio austriaco a pelo liscio",
  "Segugio austriaco a pelo ruvido",
  "Segugio bosniaco a pelo ruvido",
  "Segugio della Bosnia",
  "Segugio del Montenegro",
  "Segugio della Serbia",
  "Segugio della Transilvania",
  "Segugio dell'Istria a pelo duro",
  "Segugio dell'Istria a pelo raso",
  "Segugio di Posavac",
  "Segugio Ellenico",
  "Segugio Greco",
  "Segugio Italiano a pelo forte",
  "Segugio Italiano a pelo raso",
  "Segugio Macedone",
  "Segugio Polacco",
  "Segugio Slovacco",
  "Segugio Svizzero bernese",
  "Segugio Svizzero bruno",
  "Segugio Svizzero giurassiano",
  "Segugio Svizzero Lucernese",
  "Segugio Svizzero nano",
  "Segugio Tedesco",
  "Setter Irlandese",
  "Shar Pei",
  "Shetland Sheepdog",
  "Shiba Inu",
  "Shih Tzu",
  "Skye Terrier",
  "Sloughi",
  "Soft Coated Wheaten Terrier",
  "Spaniel di Sussex",
  "Spaniel Olandese di Drent",
  "Spaniel Tedesco",
  "Spitz Finlandese",
  "Spitz Italiano",
  "Spitz Giapponese",
  "Stabyhoun",
  "Staffordshire Bull Terrier",
  "Tai",
  "Taiwan Dog",
  "Terrier Brasiliano",
  "Terrier Boemo",
  "Terrier Giapponese",
  "Terrier Nero Russo",
  "Thai Bangkaew Dog",
  "Thai Ridgeback",
  "Tibetan Spaniel",
  "Tibetan Terrier",
  "Tornjak",
  "Tosa",
  "Värmlandsstövare",
  "Västgötaspets",
  "Vizsla",
  "Volpino Italiano",
  "Weimaraner",
  "Welsh Corgi Cardigan",
  "Welsh Corgi Pembroke",
  "Welsh Springer Spaniel",
  "Welsh Terrier",
  "West Highland White Terrier",
  "Westfälische Dachsbracke",
  "Whippet",
  "Wetterhoun",
  "Xoloitzcuintle",
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
