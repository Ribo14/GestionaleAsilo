export function calcolaReportCliente(cliente, accessi, pacchetti) {
  const accessiCliente = accessi.filter((a) => a.clienteId === cliente.id)

  // raggruppa per pacchetto
  const perPacchetto = {}
  for (const acc of accessiCliente) {
    for (const scala of acc.scaleDaPacchetti || []) {
      if (!perPacchetto[scala.pacchettoId]) {
        perPacchetto[scala.pacchettoId] = {
          pacchettoId: scala.pacchettoId,
          valoreCreditoEuro: scala.valoreCreditoEuro,
          creditiUsati: 0,
          subtotaleEuro: 0,
        }
      }
      perPacchetto[scala.pacchettoId].creditiUsati += scala.crediti
      perPacchetto[scala.pacchettoId].subtotaleEuro +=
        scala.crediti * scala.valoreCreditoEuro
    }
  }

  const righeRiepilogo = Object.values(perPacchetto)
  const totaleCreditiUsati = righeRiepilogo.reduce((s, r) => s + r.creditiUsati, 0)
  const totaleEuro = righeRiepilogo.reduce((s, r) => s + r.subtotaleEuro, 0)

  return {
    cliente,
    accessi: accessiCliente,
    righeRiepilogo,
    totaleCreditiUsati,
    totaleEuro,
  }
}

export function nomeMese(mese, anno) {
  return new Date(anno, mese - 1, 1).toLocaleDateString('it-IT', {
    month: 'long',
    year: 'numeric',
  })
}
