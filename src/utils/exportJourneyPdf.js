import html2canvas from 'html2canvas'

/** Apply print-safe styles on the cloned DOM so html2canvas renders readable text and cards. */
function prepareJourneyClone(doc, cloned) {
  cloned.style.transform = 'none'
  cloned.style.transformOrigin = '0 0'

  cloned.querySelectorAll('[data-journey-milestone]').forEach((tile) => {
    tile.classList.remove('milestone-tile-skeleton')
    tile.classList.add('milestone-tile-reveal')
    tile.style.opacity = '1'
    tile.style.pointerEvents = 'auto'
    tile.style.background = '#232323'
    tile.style.borderColor = 'rgba(255,255,255,0.22)'
    const inner = tile.querySelector('.milestone-tile-inner')
    if (inner instanceof HTMLElement) {
      inner.style.opacity = '1'
    }
    tile.querySelectorAll('[class*="text-"]').forEach((el) => {
      if (!(el instanceof HTMLElement)) return
      el.style.opacity = '1'
      const computed = doc.defaultView?.getComputedStyle(el)
      const color = computed?.color || ''
      if (color.includes('rgba') && /rgba\([^)]+,\s*0\.[0-3]\)/.test(color)) {
        el.style.color = '#FAF9F4'
      }
    })
  })

  cloned.querySelectorAll('svg text').forEach((el) => {
    if (el instanceof SVGElement) el.setAttribute('fill', 'rgba(255,255,255,0.75)')
  })
}

export async function captureJourneyElement(element) {
  if (!element) throw new Error('No journey canvas element to capture')

  const width = element.scrollWidth || element.offsetWidth
  const height = element.scrollHeight || element.offsetHeight

  return html2canvas(element, {
    backgroundColor: '#0C0C0C',
    scale: 2,
    useCORS: true,
    logging: false,
    width,
    height,
    windowWidth: width,
    windowHeight: height,
    onclone: prepareJourneyClone,
  })
}
