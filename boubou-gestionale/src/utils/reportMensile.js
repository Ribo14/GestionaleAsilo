export function calcolaReportCliente(cliente, accessi, pacchetti) {
  const accessiCliente = accessi.filter((a) => a.clienteId === cliente.id)

  // Raggruppa per pacchetto
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
      perPacchetto[scala.pacchettoId].subtotaleEuro += scala.crediti * scala.valoreCreditoEuro
    }
  }

  // Sezione pagamento giornaliero
  let creditiGiornalieriTotali = 0
  let importoGiornalieroTotale = 0
  let importoGiornalieroPagato = 0
  let importoGiornalieroNonPagato = 0

  for (const acc of accessiCliente) {
    if (acc.pagamentoGiornaliero) {
      const pg = acc.pagamentoGiornaliero
      creditiGiornalieriTotali += pg.crediti || 0
      importoGiornalieroTotale += pg.importo || 0
      if (pg.pagato) {
        importoGiornalieroPagato += pg.importo || 0
      } else {
        importoGiornalieroNonPagato += pg.importo || 0
      }
    }
  }

  const righeRiepilogo = Object.values(perPacchetto)
  const totaleCreditiUsati = righeRiepilogo.reduce((s, r) => s + r.creditiUsati, 0) + creditiGiornalieriTotali
  const totaleEuro = righeRiepilogo.reduce((s, r) => s + r.subtotaleEuro, 0) + importoGiornalieroTotale

  return {
    cliente,
    accessi: accessiCliente,
    righeRiepilogo,
    totaleCreditiUsati,
    totaleEuro,
    haGiornaliero: creditiGiornalieriTotali > 0,
    creditiGiornalieriTotali,
    importoGiornalieroTotale,
    importoGiornalieroPagato,
    importoGiornalieroNonPagato,
  }
}

export function formatData(data) {
  if (!data) return ''
  const [y, m, d] = data.split('-')
  return `${d}-${m}-${y}`
}

export function nomeMese(mese, anno) {
  return new Date(anno, mese - 1, 1).toLocaleDateString('it-IT', {
    month: 'long',
    year: 'numeric',
  })
}
