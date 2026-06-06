import { useState } from 'react'

export default function ExportPDF({ mese, anno }) {
  const [loading, setLoading] = useState(false)

  async function handleExport() {
    setLoading(true)
    try {
      const { default: jsPDF } = await import('jspdf')
      const { default: html2canvas } = await import('html2canvas')

      const element = document.getElementById('report-pdf-content')
      if (!element) return

      const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#ffffff' })
      const imgData = canvas.toDataURL('image/png')

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width

      let y = 0
      const pageHeight = pdf.internal.pageSize.getHeight()

      while (y < pdfHeight) {
        if (y > 0) pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, -y, pdfWidth, pdfHeight)
        y += pageHeight
      }

      const nomeMese = new Date(anno, mese - 1, 1).toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })
      pdf.save(`Report_BoubouCamp_${nomeMese.replace(' ', '_')}.pdf`)
    } catch (err) {
      console.error(err)
      alert('Errore durante la generazione del PDF')
    }
    setLoading(false)
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="w-full bg-primary text-white py-3 rounded-xl font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
    >
      {loading ? 'Generazione PDF…' : '📄 Scarica PDF'}
    </button>
  )
}
