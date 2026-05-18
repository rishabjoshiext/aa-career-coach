/** ODL partner university catalogue (shared by Frame 7 pickers). */

export const PREFERRED_PARTNER_UNIVERSITIES = [
  'Lovely Professional University',
  'Amity University',
  'Shoolini University',
  'Vivekananda Global University',
  'Manipal University Jaipur',
  'Chandigarh University',
  'D Y Patil University',
]

export const ONLINE_PARTNER_UNIVERSITIES = [
  'Lovely Professional University',
  'Amity University',
  'Chandigarh University',
  'Vivekananda Global University',
  'Manipal University Jaipur',
  'Shoolini University',
  'Jain University',
  'Dr. D. Y. Patil Vidyapeeth',
  'D Y Patil University',
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
  vgu: 'Vivekananda Global University',
  'vivekananda global university (vgu)': 'Vivekananda Global University',
  'dy patil mumbai': 'DY Patil University Mumbai',
  'd y patil mumbai': 'DY Patil University Mumbai',
  'd y patil university': 'D Y Patil University',
  'dy patil university': 'D Y Patil University',
  'dr d y patil vidyapeeth': 'Dr. D. Y. Patil Vidyapeeth',
  'jain (deemed) university': 'Jain University',
  lpu: 'Lovely Professional University',
}

function norm(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[.,]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

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

export function resolvePreferredName(name) {
  return resolveToCatalogueName(name) || name
}
