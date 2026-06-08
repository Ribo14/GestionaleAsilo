import { increment } from 'firebase/firestore'
import { getPacchettiAttivi, updatePacchetto } from '../firebase/firestore'

export async function scalaCreditiFIFO(clienteId, creditiDaScalare) {
  const pacchetti = await getPacchettiAttivi(clienteId)

  let rimanenti = creditiDaScalare
  const scaleDaPacchetti = []

  for (const p of pacchetti) {
    if (rimanenti <= 0) break
    const daScalare = Math.min(rimanenti, p.creditiResidui)
    scaleDaPacchetti.push({
      pacchettoId: p.id,
      crediti: daScalare,
      valoreCreditoEuro: p.valoreCreditoEuro,
    })
    await updatePacchetto(clienteId, p.id, {
      creditiResidui: p.creditiResidui - daScalare,
    })
    rimanenti -= daScalare
  }

  return { scaleDaPacchetti, creditiNonCoperti: rimanenti }
}

export async function ripristinaCreditiFIFO(clienteId, scaleDaPacchetti) {
  for (const scala of scaleDaPacchetti) {
    await updatePacchetto(clienteId, scala.pacchettoId, {
      creditiResidui: increment(scala.crediti),
    })
  }
}
