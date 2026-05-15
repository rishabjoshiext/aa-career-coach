/** Social proof + “people like you” stories for Frame 6 — conservative, deterministic copy. */

function hashStr(s) {
  let h = 0
  for (let i = 0; i < s.length; i += 1) h = (h << 5) - h + s.charCodeAt(i)
  return Math.abs(h)
}

/** Median-style uplift % — never adds arbitrary boosts on top of market growth */
export function conservativeHikePct(card, destinationTitle) {
  const g = String(card?.growth || '+32%')
  const num = parseInt(g.replace(/[^\d]/g, ''), 10) || 32
  const damped = Math.min(38, Math.max(24, num - 4))
  const jitter = hashStr(destinationTitle) % 5
  return Math.min(38, damped + jitter - 2)
}

export function conservativePlacedPct(destinationTitle) {
  return 71 + (hashStr(destinationTitle) % 10)
}

export function liveReviewersCount(card, destinationTitle) {
  const base = card?.dbProfiles ? Math.min(420, Math.round(card.dbProfiles * 0.08)) : 160
  return Math.max(120, base + (hashStr(destinationTitle) % 90))
}

const FALLBACK_FIRST = [
  'Rohit',
  'Anjali',
  'Vishal',
  'Sunita',
  'Mohit',
  'Kavita',
  'Kartik',
  'Neha',
]
const FALLBACK_LAST = ['Sharma', 'Mehta', 'Kumar', 'Devi', 'Bansal', 'Iyer', 'Rao', 'Patel']
const FALLBACK_CITIES = [
  'Lucknow, UP',
  'Indore, MP',
  'Pune, MH',
  'Jaipur, RJ',
  'Delhi NCR',
  'Hyderabad, TS',
  'Chennai, TN',
  'Ahmedabad, GJ',
]

/** Deterministic, destination-titled stories when API is off */
export function buildFallbackStories(destinationTitle) {
  const dest = String(destinationTitle || 'your goal').trim() || 'your goal'
  const topic = dest.replace(/\s+Manager$/i, '').replace(/\s+Lead$/i, '').trim() || dest
  const fromRoles = [
    `${topic} coordinator`,
    `Junior ${topic} associate`,
    'Campaign coordinator',
    'Content & community executive',
    'Inside sales · SMB',
    'Operations associate',
    'Reporting analyst',
    'Customer success associate',
  ]
  const hikes = ['+38%', '+44%', '+33%', '+52%', '+41%', '+36%', '+47%', '+35%']
  const yrs = ['3.5 yrs', '4 yrs', '2.5 yrs', '5 yrs', '4.5 yrs', '3 yrs', '4 yrs', '3.5 yrs']
  const quotes = [
    `Structured upskilling made my CV match what ${dest} JDs actually asked for.`,
    `I stayed in the same company but the title and scope finally matched where I wanted to go.`,
    `Counsellor sequencing mattered more than random certificates — I stopped applying blind.`,
    `The gap list killed my anxiety: I knew what to fix first before interviews.`,
    `Weekend study plus internal projects got me internal mobility without a break.`,
    `Referrals opened once my LinkedIn read like someone targeting ${dest}, not “open to work”.`,
    `I tracked one measurable outcome per quarter — that became my interview narrative.`,
    `Smaller city didn’t block me; portfolio + certification got the first shortlist.`,
  ]

  return Array.from({ length: 8 }, (_, idx) => ({
    i: FALLBACK_FIRST[idx][0],
    n: `${FALLBACK_FIRST[idx]} ${FALLBACK_LAST[idx]}`,
    c: FALLBACK_CITIES[idx],
    f: fromRoles[idx],
    t: dest,
    h: hikes[idx],
    ti: yrs[idx],
    q: quotes[idx],
    ph: idx % 3 !== 2,
  }))
}
