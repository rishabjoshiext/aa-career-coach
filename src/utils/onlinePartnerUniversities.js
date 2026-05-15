/**
 * Online / ODL partner universities (India) — display pool for Frame 7.
 * Picks are chosen deterministically from this catalogue (see buildFallbackOnlineCollegePicks).
 */
export const ONLINE_PARTNER_UNIVERSITIES = [
  'Lovely Professional University',
  'Amity University',
  'Chandigarh University',
  'Vivekananda Global University',
  'Manipal University Jaipur',
  'Shoolini University',
  'Jain University',
  'Dr. D. Y. Patil Vidyapeeth',
  'Manipal Academy of Higher Education',
  'Parul University',
  'Sikkim Manipal University',
  'Sharda University',
  'Vignan University',
  'Manav Rachna University',
  'Yenepoya University',
  'UPES',
  'DY Patil University Mumbai',
  'O.P. Jindal Global University',
  'MIT Pune',
  'Mangalayatan University',
]

const ALIASES = {
  'dy patil mumbai': 'DY Patil University Mumbai',
  'd y patil mumbai': 'DY Patil University Mumbai',
  'jain (deemed) university': 'Jain University',
}

function norm(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[.,]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function hashStr(s) {
  let h = 0
  for (let i = 0; i < s.length; i += 1) h = (h << 5) - h + s.charCodeAt(i)
  return Math.abs(h)
}

/**
 * Resolve a free-text pick to exactly one catalogue name, or null.
 */
export function resolveToCatalogueName(pick) {
  const p = norm(pick)
  if (!p) return null
  if (ALIASES[p]) return ALIASES[p]
  for (const c of ONLINE_PARTNER_UNIVERSITIES) {
    const cn = norm(c)
    if (p === cn) return c
    if (p.includes(cn) || cn.includes(p)) return c
  }
  for (const c of ONLINE_PARTNER_UNIVERSITIES) {
    const cn = norm(c)
    const words = cn.split(' ').filter((w) => w.length > 3)
    const pw = p.split(' ')
    const hit = words.filter((w) => pw.some((x) => x.includes(w) || w.includes(x))).length
    if (hit >= 2 && c.length > 8) return c
  }
  return null
}

/** When API is off: stable, role-aware spread from catalogue */
export function buildFallbackOnlineCollegePicks(destinationTitle, programmeTitle) {
  const key = `${destinationTitle}|${programmeTitle || ''}`
  const start = hashStr(key) % ONLINE_PARTNER_UNIVERSITIES.length
  const out = []
  for (let i = 0; i < 5; i += 1) {
    out.push(ONLINE_PARTNER_UNIVERSITIES[(start + i * 3) % ONLINE_PARTNER_UNIVERSITIES.length])
  }
  return [...new Set(out)].slice(0, 5)
}
