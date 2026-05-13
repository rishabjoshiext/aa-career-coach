/**
 * Online / ODL partner universities (India) — display pool for Frame 7.
 * Picks are constrained to this list; OpenAI ranks up to 5 per destination.
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

function stripJsonFence(text) {
  const t = String(text || '').trim()
  const m = t.match(/^```(?:json)?\s*([\s\S]*?)```$/i)
  return m ? m[1].trim() : t
}

function norm(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[.,]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
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

function hashStr(s) {
  let h = 0
  for (let i = 0; i < s.length; i += 1) h = (h << 5) - h + s.charCodeAt(i)
  return Math.abs(h)
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

export async function fetchOnlineCollegePicksWithOpenAI({ destinationTitle, industryLabel, card, programmeTitle }) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  if (!apiKey) return null

  const dest = String(destinationTitle || '').trim() || 'Target role'
  const ind = industryLabel || 'General'
  const prog = String(programmeTitle || '').trim()
  const desc = card?.desc ? String(card.desc) : ''
  const list = ONLINE_PARTNER_UNIVERSITIES.map((u, i) => `${i + 1}. ${u}`).join('\n')

  const prompt = `You help Indian working professionals pick online / ODL universities.

Target career role: ${dest}
Industry / function: ${ind}
Recommended programme (title): ${prog}
Role context: ${desc}

Allowed universities (use EXACT spelling from this list only — no other institutions):
${list}

Return ONLY valid JSON: { "onlineCollegePicks": [ "...", ... ] }
Rules:
- Exactly 5 university names, each string MUST match one line from the allowed list exactly (character-for-character as listed).
- Order by best fit for strong ONLINE degrees toward "${dest}" (reputation, programme breadth, placement support for that track).
- Do not invent rankings; ordering is your expert judgement among ONLY these names.

JSON only, no markdown.`

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
        temperature: 0.2,
      }),
    })
    if (!resp.ok) return null
    const data = await resp.json()
    const text = data?.output_text || ''
    if (!text) return null
    const o = JSON.parse(stripJsonFence(text))
    if (!o || !Array.isArray(o.onlineCollegePicks)) return null
    const resolved = []
    for (const raw of o.onlineCollegePicks) {
      const c = resolveToCatalogueName(String(raw))
      if (c && !resolved.includes(c)) resolved.push(c)
      if (resolved.length >= 5) break
    }
    return resolved.length >= 3 ? resolved : null
  } catch {
    return null
  }
}
