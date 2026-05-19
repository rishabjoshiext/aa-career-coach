import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

const A4_W_MM = 210
const A4_H_MM = 297
/** Logical CSS width of report (matches pdfStyles.css) */
const REPORT_W_PX = 794
/** A4 height at 96dpi — slice threshold for multi-page export */
const REPORT_PAGE_H_PX = 1123
const CAPTURE_SCALE = 2

/**
 * Capture full report document and slice into A4 pages only when content overflows.
 * @param {jsPDF} pdf
 * @param {HTMLElement} docEl
 */
async function addDocumentToPdf(pdf, docEl) {
  if (!docEl) throw new Error('Missing report document element')

  const canvas = await html2canvas(docEl, {
    scale: CAPTURE_SCALE,
    backgroundColor: '#faf9f4',
    useCORS: true,
    logging: false,
    width: docEl.offsetWidth,
    height: docEl.offsetHeight,
    windowWidth: docEl.offsetWidth,
    windowHeight: docEl.offsetHeight,
    onclone: (_doc, cloned) => {
      cloned.style.transform = 'none'
      cloned.style.position = 'relative'
      cloned.style.left = '0'
      cloned.style.top = '0'
    },
  })

  const pageSliceH = Math.round(REPORT_PAGE_H_PX * CAPTURE_SCALE)
  const totalH = canvas.height
  const totalW = canvas.width
  let offsetY = 0
  let pageIndex = 0

  while (offsetY < totalH) {
    const sliceH = Math.min(pageSliceH, totalH - offsetY)
    const sliceCanvas = document.createElement('canvas')
    sliceCanvas.width = totalW
    sliceCanvas.height = sliceH
    const ctx = sliceCanvas.getContext('2d')
    ctx.drawImage(canvas, 0, offsetY, totalW, sliceH, 0, 0, totalW, sliceH)

    const imgData = sliceCanvas.toDataURL('image/png', 1.0)
    const ratio = sliceH / totalW
    let targetW = A4_W_MM
    let targetH = targetW * ratio
    if (targetH > A4_H_MM) {
      targetH = A4_H_MM
      targetW = targetH / ratio
    }
    const offsetX = (A4_W_MM - targetW) / 2
    const offsetYMm = (A4_H_MM - targetH) / 2

    if (pageIndex > 0) pdf.addPage()
    pdf.addImage(imgData, 'PNG', offsetX, offsetYMm, targetW, targetH, undefined, 'FAST')

    offsetY += pageSliceH
    pageIndex += 1
  }
}

/**
 * Export Career Transformation Pass from hidden report DOM (single flow, auto-paginated).
 * @param {{ rootEl: HTMLElement, fileName: string }} opts
 */
export async function downloadCareerReportPdf({ rootEl, fileName }) {
  if (!rootEl) throw new Error('Report container not mounted')

  const docEl = rootEl.querySelector('[data-report-document]')
  if (!docEl) throw new Error('Report document not found')

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  await addDocumentToPdf(pdf, docEl)
  pdf.save(fileName)
}

export { REPORT_W_PX, REPORT_PAGE_H_PX }
