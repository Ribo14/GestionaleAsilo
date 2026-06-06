# Gestionale Asilo Boubou Camp — Documento di Progetto

## 1. Contesto e obiettivo

Web app gestionale per l'asilo diurno per cani del centro cinofilo **Boubou Camp**.
L'app è ad uso esclusivo della responsabile dell'asilo e deve permettere di:
- Gestire i clienti (tesserati) e i loro cani
- Tracciare gli accessi giornalieri all'asilo
- Gestire i pacchetti crediti acquistati e scalare i crediti utilizzati
- Generare report mensili esportabili in PDF

---

## 2. Stack tecnologico

| Componente | Scelta | Motivazione |
|---|---|---|
| Framework | React (Vite) | Componenti riutilizzabili, ecosistema maturo |
| Styling | Tailwind CSS | Mobile-first rapido, design system consistente |
| Database | Firebase Firestore | Cloud, gratuito per volumi piccoli, sync multi-device |
| Autenticazione | Password locale (hash SHA-256 in Firestore) | Unica utente, semplicità |
| Export PDF | jsPDF + html2canvas | Generazione PDF client-side |
| Deploy | Netlify | Static hosting, CI/CD da GitHub |
| Lingua UI | Italiano |  |

### Note Firebase
- Piano **Spark (gratuito)**: 1 GB storage, 50.000 letture/giorno, 20.000 scritture/giorno — ampiamente sufficiente
- I dati sono sincronizzati in tempo reale su tutti i dispositivi (smartphone + desktop)
- Backup automatico disponibile dalla console Firebase

---

## 3. Autenticazione

- Schermata di login con campo password all'avvio dell'app
- La password è hashata con SHA-256 e salvata in Firestore (documento `config/auth`)
- Nessuna sessione permanente: login richiesto ad ogni apertura dell'app (o con timeout configurabile, es. 8 ore)
- Possibilità di cambiare password dall'interno dell'app (sezione Impostazioni)
- Nessun sistema di recupero password (unica utente, può reimpostare direttamente da Firebase console se necessario)

---

## 4. Design e UI

### Palette colori
| Token | Valore | Uso |
|---|---|---|
| `--color-primary` | `#008c95` | Teal principale (brand Boubou) |
| `--color-primary-dark` | `#006970` | Hover, accenti |
| `--color-primary-light` | `#e0f5f6` | Sfondi sezioni, badge |
| `--color-danger` | `#dc2626` | Pacchetti non pagati, errori |
| `--color-warning` | `#f59e0b` | Crediti in esaurimento |
| `--color-success` | `#16a34a` | Pacchetti pagati, conferme |
| `--color-neutral` | `#f8fafc` | Sfondi neutri |

### Tipografia
- Font: **Inter** (Google Fonts) — moderno, leggibile su mobile
- Testo base: 16px
- Titoli sezione: 20-24px bold

### Logo
- File: `Logo_asilo.jpeg` nella cartella `/public/`
- Mostrato nella schermata di login e nell'header dell'app

### Layout
- **Mobile-first**: layout a colonna singola su smartphone
- **Desktop**: layout a due colonne dove utile (lista clienti + dettaglio)
- Bottom navigation bar su mobile con 3 tab principali
- Sidebar su desktop

### Stile componenti
- Card con border-radius 16px e ombra leggera
- Bottoni primari teal con testo bianco
- Input con bordo sottile, focus ring teal
- Transizioni smooth (200ms ease)

---

## 5. Struttura di navigazione

```
App
├── 🔐 Login
└── App (autenticata)
    ├── 👥 Clienti          (tab 1 — default)
    │   ├── Lista clienti
    │   └── Scheda cliente
    │       ├── Info cliente
    │       ├── Profili cani
    │       ├── Pacchetti crediti
    │       └── Storico accessi
    ├── 🏠 Oggi             (tab 2)
    │   └── Registrazione accessi del giorno
    ├── 📊 Report           (tab 3)
    │   └── Riepilogo mensile + export PDF
    └── ⚙️ Impostazioni     (icona header)
        └── Cambio password
```

---

## 6. Modello dati (Firestore)

### Collezione `clienti`
```json
{
  "id": "uuid",
  "nome": "Rossella Luglietti",
  "telefono": "333 1234567",
  "email": "rossella@email.com",
  "note": "",
  "createdAt": "timestamp"
}
```

### Collezione `cani` (sottocollezione di `clienti`)
```json
{
  "id": "uuid",
  "clienteId": "uuid",
  "nome": "Diana",
  "razza": "Labrador",
  "eta": 3,
  "sterilizzato": true,
  "note": "Allergica al pollo",
  "veterinario": {
    "nome": "Dr. Bianchi",
    "telefono": "02 1234567",
    "indirizzo": "Via Roma 1, Milano"
  }
}
```

### Collezione `pacchetti` (sottocollezione di `clienti`)
```json
{
  "id": "uuid",
  "clienteId": "uuid",
  "tipo": "100",
  "creditiTotali": 100,
  "creditiResidui": 64,
  "valoreCreditoEuro": 4.25,
  "pagato": true,
  "metodoPagamento": "bonifico",
  "dataAcquisto": "2025-10-15",
  "note": ""
}
```

**Valori possibili `tipo`:**
- `"singolo"` → 1 credito alla volta, valore 5,00€
- `"50"` → 50 crediti, valore 4,50€
- `"100"` → 100 crediti, valore 4,25€
- `"200"` → 200 crediti, valore 3,75€

**Logica FIFO:** i crediti vengono scalati dal pacchetto con `dataAcquisto` più antica che ha ancora `creditiResidui > 0`.

### Collezione `accessi`
```json
{
  "id": "uuid",
  "clienteId": "uuid",
  "data": "2025-10-16",
  "cani": [
    { "caneId": "uuid", "nome": "Diana" },
    { "caneId": "uuid", "nome": "Skyler" }
  ],
  "tipoGiornata": "intera",
  "orarioIngresso": "08:30",
  "orarioUscita": "17:30",
  "anticipoMinuti": 0,
  "posticipoPagante": false,
  "piscina": false,
  "creditiCalcolati": 12,
  "creditiEffettivi": 12,
  "agevolazione": false,
  "noteAgevolazione": "",
  "scaleDaPacchetti": [
    { "pacchettoId": "uuid", "crediti": 12, "valoreCreditoEuro": 4.25 }
  ],
  "createdAt": "timestamp"
}
```

---

## 7. Tariffario e calcolo crediti

### Regole di base
| Servizio | 1° cane | 2° cane |
|---|---|---|
| Giornata intera (8.30–17.30) | 7 cr | 5 cr |
| Mezza giornata (8.30–13.00 o 13.00–17.30) | 5 cr | 3 cr |

### Extra orario
| Anticipo/posticipo | Crediti aggiuntivi |
|---|---|
| Entro 30 minuti | +1 cr (totale, non per cane) |
| Oltre 30 minuti | +2 cr (totale, non per cane) |

### Piscina
| Cani che usufruiscono | Crediti aggiuntivi |
|---|---|
| 1 cane | +3 cr |
| 2 cani | +4 cr |

### Calcolo automatico (proposta app)
1. L'app determina `tipoGiornata` dall'orario ingresso/uscita
2. Somma crediti base in base al numero di cani presenti
3. Aggiunge extra orario se applicabile
4. Aggiunge crediti piscina se selezionato
5. Mostra il totale nel campo `creditiEffettivi` — **modificabile manualmente**
6. Al salvataggio, scala i crediti dal/dai pacchetti attivi (logica FIFO)

### Agevolazioni
- Il campo `creditiEffettivi` è sempre editabile prima del salvataggio
- Se modificato manualmente rispetto al calcolato, `agevolazione = true`
- Campo `noteAgevolazione` per annotare il motivo

---

## 8. Scheda Cliente — dettaglio UI

### Header scheda
- Nome cliente + contatti
- Badge "Crediti disponibili: XX" (totale crediti residui su tutti i pacchetti attivi)

### Sezione Cani
- Lista card per ogni cane con: nome, razza, età, sterilizzato (badge), note, veterinario
- Bottone "Aggiungi cane"
- Tap su cane → modale di dettaglio/modifica

### Sezione Pacchetti
- Lista pacchetti in ordine cronologico (più vecchio in cima)
- Per ogni pacchetto:
  - Tipo pacchetto + valore credito
  - Barra di avanzamento crediti residui/totali
  - Badge metodo pagamento (contanti / bonifico)
  - **Se non pagato → sfondo rosso** (`--color-danger` con opacity 10%, bordo rosso)
  - Data acquisto
- Bottone "Nuovo pacchetto" → modale con:
  - Selezione tipo pacchetto (dropdown con valori automatici)
  - Data acquisto
  - Pagato? (toggle) → se sì: metodo (contanti / bonifico)
  - Note

### Sezione Storico accessi
- Lista accessi in ordine cronologico inverso
- Per ogni accesso: data, cani, orario, crediti usati, crediti residui post-accesso
- Filtro per mese

---

## 9. Schermata "Oggi"

- Data odierna precompilata
- Selezione rapida cliente (ricerca per nome)
- Selezione cani del cliente presenti oggi (checkbox multipla)
- Tipo giornata: Intera / Mattina / Pomeriggio (3 bottoni grandi, mobile-friendly)
- Orario ingresso e uscita (time picker)
- Toggle "Orario anticipato/posticipato" con campo minuti
- Toggle "Piscina"
- **Riquadro crediti calcolati** (aggiornato in tempo reale) con campo editabile per agevolazione
- Note facoltative
- Bottone "Salva accesso"
- Lista degli accessi già registrati oggi (in basso)

---

## 10. Report mensile

### Filtri
- Selezione mese + anno
- Selezione cliente (tutti o singolo)

### Contenuto report per ogni cliente
- Nome cliente
- Per ogni pacchetto utilizzato nel mese:
  - Crediti usati × valore unitario = subtotale €
- Totale crediti usati nel mese
- **Totale € dovuto** (somma dei subtotali)
- Dettaglio giornate (tabella: data, cani, orario, crediti)

### Export PDF
- Bottone "Scarica PDF"
- Layout ottimizzato per stampa A4
- Logo Boubou Camp in intestazione
- Un cliente per pagina (o separatore visivo netto)

---

## 11. Impostazioni

- Cambio password (inserisci password attuale → nuova password → conferma)
- Info app (versione)

---

## 12. Struttura del progetto (cartelle)

```
boubou-gestionale/
├── public/
│   └── Logo_asilo.jpeg
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   └── LoginScreen.jsx
│   │   ├── clienti/
│   │   │   ├── ListaClienti.jsx
│   │   │   ├── SchedaCliente.jsx
│   │   │   ├── FormCliente.jsx
│   │   │   ├── SchedaCane.jsx
│   │   │   └── GestionePacchetti.jsx
│   │   ├── oggi/
│   │   │   └── RegistrazioneAccesso.jsx
│   │   ├── report/
│   │   │   ├── ReportMensile.jsx
│   │   │   └── ExportPDF.jsx
│   │   └── ui/
│   │       ├── BottomNav.jsx
│   │       ├── Modal.jsx
│   │       ├── Badge.jsx
│   │       └── CreditiBar.jsx
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useClienti.js
│   │   ├── useAccessi.js
│   │   └── usePacchetti.js
│   ├── utils/
│   │   ├── calcoloCrediti.js
│   │   ├── logicaFIFO.js
│   │   └── reportMensile.js
│   ├── firebase/
│   │   ├── config.js
│   │   └── firestore.js
│   ├── App.jsx
│   └── main.jsx
├── .env                    ← variabili Firebase (non committare)
├── .gitignore
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## 13. Variabili d'ambiente (.env)

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

Da configurare anche in Netlify → Site settings → Environment variables.

---

## 14. Deploy su Netlify

1. Push del progetto su GitHub (repository privato)
2. Collegare il repo a Netlify
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Aggiungere le variabili d'ambiente Firebase in Netlify
6. Deploy automatico ad ogni push su `main`

---

## 15. Priorità di sviluppo (ordine consigliato)

| Fase | Funzionalità |
|---|---|
| 1 | Setup Firebase + autenticazione password |
| 2 | CRUD clienti e cani |
| 3 | Gestione pacchetti crediti (con logica FIFO e stato pagamento) |
| 4 | Registrazione accessi + calcolo crediti automatico |
| 5 | Vista "Oggi" |
| 6 | Report mensile |
| 7 | Export PDF |
| 8 | Rifinitura UI/UX mobile + test su smartphone |

---

*Documento generato il 06/06/2026 — Gestionale Asilo Boubou Camp*
