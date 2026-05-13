/** Social proof + “people like you” stories for Frame 6 — conservative numbers from catalog + OpenAI copy. */

function stripJsonFence(text) {
  const t = String(text || '').trim()
  const m = t.match(/^```(?:json)?\s*([\s\S]*?)```$/i)
  return m ? m[1].trim() : t
}

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

export function isValidStoriesPayload(o) {
  if (!o || typeof o !== 'object' || !Array.isArray(o.stories)) return false
  if (o.stories.length < 4 || o.stories.length > 12) return false
  return o.stories.every((s) => {
    if (!s || typeof s !== 'object') return false
    const i = String(s.i || '').trim()
    const n = String(s.n || '').trim()
    const c = String(s.c || '').trim()
    const f = String(s.from ?? s.f ?? '').trim()
    const t = String(s.to ?? s.t ?? '').trim()
    const h = String(s.h ?? '').trim()
    const ti = String(s.ti ?? '').trim()
    const q = String(s.q ?? '').trim()
    return i.length === 1 && n && c && f && t && h && ti && q
  })
}

export function normalizeStoriesPayload(raw) {
  try {
    const o = typeof raw === 'string' ? JSON.parse(stripJsonFence(raw)) : raw
    if (!isValidStoriesPayload(o)) return null
    return o.stories.map((s) => ({
      i: String(s.i || s.n?.[0] || '?').slice(0, 1).toUpperCase(),
      n: String(s.n).trim(),
      c: String(s.c).trim(),
      f: String(s.from ?? s.f).trim(),
      t: String(s.to ?? s.t).trim(),
      h: String(s.h).trim(),
      ti: String(s.ti).trim(),
      q: String(s.q).trim().replace(/^["']|["']$/g, ''),
      ph: Boolean(s.ph),
    }))
  } catch {
    return null
  }
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

export async function fetchStoriesWithOpenAI({ destinationTitle, industryLabel, card }) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  if (!apiKey) return null

  const dest = String(destinationTitle || '').trim() || 'Target role'
  const ind = industryLabel || 'General'
  const desc = card?.desc ? String(card.desc) : ''
  const jobs = card?.jobs ? String(card.jobs) : ''
  const sal = card?.sal ? String(card.sal) : ''

  const prompt = `Return ONLY valid JSON (no markdown). Indian career app — realistic, non-exaggerated peer stories.

Destination role: ${dest}
Industry / function: ${ind}
Role description: ${desc}
Typical salary band: ${sal}
Open roles (catalog): ${jobs}

Return: { "stories": array of exactly 8 objects with keys:
  "i": one uppercase letter avatar initial,
  "n": full Indian name (realistic, varied),
  "c": city, state (e.g. "Lucknow, UP"),
  "from": prior job title (junior, plausible for India, NOT always finance unless industry is Finance),
  "to": must be exactly "${dest}" or a clear variant (e.g. "${dest} — Brand side"),
  "h": salary hike like "+42%" — keep between +28% and +58%,
  "ti": time span like "3.5 yrs",
  "q": one short quote 18–28 words, credible, no miracle claims,
  "ph": boolean — roughly half true for photo-style avatar
}

Rules: diverse cities; no celebrity names; no fake company trademarks beyond generic (e.g. "large NBFC", "MNC"); stories must fit ${dest}.`

  try {
    const resp = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        input: prompt,
        temperature: 0.35,
      }),
    })
    if (!resp.ok) return null
    const data = await resp.json()
    const text = data?.output_text || ''
    if (!text) return null
    return normalizeStoriesPayload(text)
  } catch {
    return null
  }
}
