export const VALORE_CREDITO_GIORNALIERO = 5

export const TARIFFE = {
  giornataIntera: { primo: 7, secondo: 5 },
  mezzaGiornata: { primo: 5, secondo: 3 },
}

export const PREZZI_PACCHETTI = {
  '10': { crediti: 10, valoreCreditoEuro: 5.0 },
  '50': { crediti: 50, valoreCreditoEuro: 4.5 },
  '100': { crediti: 100, valoreCreditoEuro: 4.25 },
  '200': { crediti: 200, valoreCreditoEuro: 3.75 },
}

export function determinaTipoGiornata(orarioIngresso, orarioUscita) {
  if (!orarioIngresso || !orarioUscita) return null
  const [hI, mI] = orarioIngresso.split(':').map(Number)
  const [hU, mU] = orarioUscita.split(':').map(Number)
  const minutiIngresso = hI * 60 + mI
  const minutiUscita = hU * 60 + mU

  // Mattina: uscita entro le 13:30
  if (minutiUscita <= 13 * 60 + 30) return 'mattina'
  // Pomeriggio: ingresso dalle 12:30 in poi
  if (minutiIngresso >= 12 * 60 + 30) return 'pomeriggio'
  // Altrimenti giornata intera
  return 'intera'
}

export function calcolaExtraOrario(orarioIngresso, orarioUscita, tipoGiornata) {
  if (!orarioIngresso || !orarioUscita) return 0
  const [hI, mI] = orarioIngresso.split(':').map(Number)
  const [hU, mU] = orarioUscita.split(':').map(Number)
  const minutiIngresso = hI * 60 + mI
  const minutiUscita = hU * 60 + mU

  let minutiAnticipo = 0
  let minutiPosticipo = 0

  if (tipoGiornata === 'intera' || tipoGiornata === 'mattina') {
    // Standard ingresso 08:30
    minutiAnticipo = Math.max(0, 8 * 60 + 30 - minutiIngresso)
  }
  if (tipoGiornata === 'intera' || tipoGiornata === 'pomeriggio') {
    // Standard uscita 17:30
    minutiPosticipo = Math.max(0, minutiUscita - (17 * 60 + 30))
  }

  const maxExtra = Math.max(minutiAnticipo, minutiPosticipo)
  if (maxExtra === 0) return 0
  if (maxExtra <= 30) return 1
  return 2
}

export function calcolaCrediti({ tipoGiornata, numCani, piscina, orarioIngresso, orarioUscita }) {
  if (!tipoGiornata || numCani < 1) return 0

  const tariffe = tipoGiornata === 'intera' ? TARIFFE.giornataIntera : TARIFFE.mezzaGiornata

  let crediti = tariffe.primo
  if (numCani >= 2) crediti += tariffe.secondo

  // Extra orario
  crediti += calcolaExtraOrario(orarioIngresso, orarioUscita, tipoGiornata)

  // Piscina
  if (piscina) {
    crediti += numCani >= 2 ? 4 : 3
  }

  return crediti
}
