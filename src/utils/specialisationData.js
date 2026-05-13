/** Frame 7 “recommended specialisation” — OpenAI + fallback; degrees locked to approved online catalogue. */

import { buildFallbackOnlineCollegePicks } from './onlinePartnerUniversities.js'

/** Only these programme families may be recommended (exact labels for UI + validation). */
export const ONLINE_DEGREE_OPTIONS = [
  'Online MBA',
  'Online MCA',
  'Online MA',
  'Online MCom',
  'Online BBA',
  'Online BCA',
  'Online BA',
  'Online BCom',
]

const DEGREE_SET = new Set(ONLINE_DEGREE_OPTIONS)

function stripJsonFence(text) {
  const t = String(text || '').trim()
  const m = t.match(/^```(?:json)?\s*([\s\S]*?)```$/i)
  return m ? m[1].trim() : t
}

function parseGrowth(g) {
  const n = parseInt(String(g || '').replace(/[^\d]/g, ''), 10)
  return Number.isFinite(n) ? n : 32
}

/** Normalise model output to exactly one catalogue degree, or null. */
export function normalizeAllowedDegree(input) {
  const s = String(input || '')
    .trim()
    .replace(/\s+/g, ' ')
  if (DEGREE_SET.has(s)) return s
  const sl = s.toLowerCase()
  for (const d of ONLINE_DEGREE_OPTIONS) {
    if (d.toLowerCase() === sl) return d
  }
  return null
}

/**
 * If the model returned a single "title" like "Online MBA — Finance & Accounting",
 * split into catalogue degree + track when the prefix matches an allowed degree.
 */
export function parseDisplayTitleToDegreeTrack(title) {
  const t = String(title || '').trim()
  if (!t) return null
  for (const deg of ONLINE_DEGREE_OPTIONS) {
    const pref = deg.toLowerCase()
    const tl = t.toLowerCase()
    if (!tl.startsWith(pref)) continue
    const after = t.slice(deg.length).trim()
    const m = after.match(/^[-–—]\s*(.+)$/)
    if (!m?.[1]?.trim()) continue
    return { degree: deg, specializationTrack: m[1].trim() }
  }
  return null
}

function normTrack(s) {
  const t = String(s || '').trim()
  if (t.length < 3 || t.length > 80) return ''
  return t
}

export function isValidSpecPayload(o) {
  if (!o || typeof o !== 'object') return false
  if (typeof o.title !== 'string' || !o.title.trim()) return false
  const sub = (typeof o.subtitle === 'string' && o.subtitle.trim()) || (typeof o.sub === 'string' && o.sub.trim())
  if (!sub) return false
  if (!Array.isArray(o.chips) || o.chips.length < 2) return false
  if (!Array.isArray(o.curriculum) || o.curriculum.length < 3) return false
  if (!Array.isArray(o.outcomes) || o.outcomes.length < 2) return false
  if (typeof o.anchorUni !== 'string' || !o.anchorUni.trim()) return false
  const parsed = parseDisplayTitleToDegreeTrack(o.title)
  return Boolean(parsed)
}

export function normalizeSpecPayload(raw) {
  try {
    const o = typeof raw === 'string' ? JSON.parse(stripJsonFence(raw)) : raw
    if (!o || typeof o !== 'object') return null

    let degree = normalizeAllowedDegree(o.degree)
    let specializationTrack = normTrack(
      o.specializationTrack || o.specialisationTrack || o.track || o.focus || o.stream,
    )

    if (!degree || !specializationTrack) {
      const parsed = parseDisplayTitleToDegreeTrack(o.title)
      if (parsed) {
        degree = degree || parsed.degree
        specializationTrack = specializationTrack || parsed.specializationTrack
      }
    }

    if (!degree || !specializationTrack) return null

    const title = `${degree} — ${specializationTrack}`

    const subtitle =
      (typeof o.subtitle === 'string' && o.subtitle.trim()) ||
      (typeof o.sub === 'string' && o.sub.trim()) ||
      'Bridges all critical education and skill gaps identified in your profile.'

    const merged = {
      ...o,
      title,
      subtitle,
    }

    if (!isValidSpecPayload(merged)) return null

    return {
      title: merged.title.trim(),
      subtitle: merged.subtitle.trim(),
      chips: merged.chips.map(String).filter(Boolean).slice(0, 8),
      curriculum: merged.curriculum.map(String).filter(Boolean).slice(0, 10),
      outcomes: merged.outcomes.map(String).filter(Boolean).slice(0, 8),
      anchorUni: merged.anchorUni.trim(),
      jobs: String(merged.jobs || '').trim() || '—',
      growth: String(merged.growth || '').trim() || '—',
      gap: String(merged.gap || '').trim() || '—',
      demandPct: Math.min(95, Math.max(45, Math.round(Number(merged.demandPct) || 72))),
    }
  } catch {
    return null
  }
}

function combinedHints(destinationTitle, card, profile) {
  const dest = String(destinationTitle || '').toLowerCase()
  const desc = String(card?.desc || '').toLowerCase()
  const spec = String(profile?.spec || '').toLowerCase()
  const func = String(profile?.func || '').toLowerCase()
  const dream = String(profile?.dRole || '').toLowerCase()
  const edu = String(profile?.edu || '').trim()
  return { raw: `${dest} ${desc} ${spec} ${func} ${dream}`, edu }
}

/**
 * Deterministic mapping to one allowed degree + track (no random / no out-of-catalogue names).
 */
export function inferFallbackDegreeTrack(destinationTitle, card, profile = {}) {
  const { raw, edu } = combinedHints(destinationTitle, card, profile)

  if (/software|developer|engineer|devops|full[\s-]?stack|backend|frontend|sre|cloud\s*arch|\.net|java\s*dev|python\s*dev/.test(raw)) {
    if (edu === '12') return { degree: 'Online BCA', specializationTrack: 'Software & IT Applications' }
    if (edu === 'UG') return { degree: 'Online MCA', specializationTrack: 'Software Engineering & Systems' }
    return { degree: 'Online MCA', specializationTrack: 'Advanced Computing & Cloud' }
  }

  if (/data\s*science|machine\s*learning|\bml\b|ai\b|analytics|bi\b|business\s*analyst|data\s*analyst/.test(raw)) {
    if (edu === '12') return { degree: 'Online BCA', specializationTrack: 'Data Analytics & Business Tools' }
    return { degree: 'Online MCA', specializationTrack: 'Data Science & Intelligent Systems' }
  }

  if (/finance|account|audit|tax|fp&a|controller|treasury|bookkeeping|ca\b|cfo/.test(raw)) {
    if (/(assistant|executive|junior|clerk|accounts\s*payable)/.test(raw) && edu !== 'PG') {
      return { degree: 'Online BCom', specializationTrack: 'Accounting & Corporate Taxation' }
    }
    return { degree: 'Online MBA', specializationTrack: 'Finance & Accounting' }
  }

  if (/commerce|b\.?com|mcom|banking\s*operations|credit\s*analyst/.test(raw)) {
    return { degree: 'Online MCom', specializationTrack: 'Commerce, Banking & Corporate Law' }
  }

  if (/hr\b|human\s*resource|people\s*partner|talent|recruit|l&d|payroll/.test(raw)) {
    return { degree: 'Online MBA', specializationTrack: 'HR & Organisational Development' }
  }

  if (/market|brand|growth|performance|seo|content\s*strateg|digital\s*media|social\s*media|advert/.test(raw)) {
    return { degree: 'Online MBA', specializationTrack: 'Marketing & Brand Strategy' }
  }

  if (/product\s*manager|\bpm\b|program\s*management|roadmap|discovery/.test(raw)) {
    return { degree: 'Online MBA', specializationTrack: 'Strategy & Product Leadership' }
  }

  if (/operations|supply\s*chain|logistics|procurement|warehouse/.test(raw)) {
    return { degree: 'Online BBA', specializationTrack: 'Operations & Supply Chain' }
  }

  if (/sales|business\s*development|\bbd\b|account\s*manager|revenue/.test(raw)) {
    return { degree: 'Online BBA', specializationTrack: 'Sales & Business Development' }
  }

  if (/content|journalism|media|communication|pr\b|copywriter|editor/.test(raw)) {
    return { degree: 'Online MA', specializationTrack: 'Communication & Digital Media' }
  }

  if (/teacher|education|academic|instructional/.test(raw)) {
    return { degree: 'Online MA', specializationTrack: 'Education Studies & Pedagogy' }
  }

  if (/design|ux\b|ui\b|graphic|visual/.test(raw)) {
    return { degree: 'Online MA', specializationTrack: 'Design & User Research' }
  }

  if (/legal|compliance|company\s*secretary|regulatory/.test(raw)) {
    return { degree: 'Online MBA', specializationTrack: 'Business Law & Compliance' }
  }

  if (edu === '12') {
    return { degree: 'Online BBA', specializationTrack: 'General Management & Employability' }
  }
  if (edu === 'UG') {
    return { degree: 'Online MBA', specializationTrack: 'Management & Leadership' }
  }
  return { degree: 'Online MBA', specializationTrack: 'Executive Management & Strategy' }
}

function curriculumForDegree(degree, track) {
  const t = track.toLowerCase()
  if (degree === 'Online MBA') {
    if (t.includes('finance')) {
      return [
        'Managerial Economics & Decision Analysis',
        'Financial Reporting & Analysis',
        'Corporate Finance & Valuation',
        'Taxation, GST & Regulatory Compliance',
        'Risk, Audit & Internal Controls',
        'MIS, Budgeting & Performance Dashboards',
      ]
    }
    if (t.includes('market')) {
      return [
        'Marketing Strategy & Customer Insight',
        'Brand Architecture & Positioning',
        'Digital Acquisition & Funnel Analytics',
        'Pricing, Packaging & Go-to-Market',
        'Stakeholder Communication & Storytelling',
        'Capstone: Growth initiative',
      ]
    }
    return [
      'Organisational Behaviour & Leadership',
      'Operations & Quality Management',
      'Financial Acumen for Managers',
      'Strategy & Competitive Advantage',
      'Business Analytics Essentials',
      'Capstone: Integrated business project',
    ]
  }
  if (degree === 'Online MCA') {
    return [
      'Discrete Structures & Algorithms',
      'Database Systems & SQL at scale',
      'Software Engineering & Architecture',
      'Cloud, DevOps & Security basics',
      'Elective aligned to your target JD',
      'Major project / portfolio milestone',
    ]
  }
  if (degree === 'Online MA') {
    return [
      'Research Methods & Academic Writing',
      'Core discipline seminars',
      'Digital communication & narrative',
      'Policy / industry context (India)',
      'Dissertation or applied project',
    ]
  }
  if (degree === 'Online MCom') {
    return [
      'Advanced Financial Accounting',
      'Corporate Law & Governance',
      'Indirect & Direct Taxation',
      'Banking, Markets & Treasury overview',
      'Research methods in commerce',
    ]
  }
  if (degree === 'Online BBA') {
    return [
      'Principles of Management & Economics',
      'Marketing & Consumer Behaviour',
      'Financial Accounting Fundamentals',
      'HR & Organisational Basics',
      'Business Communication & Presentations',
    ]
  }
  if (degree === 'Online BCA') {
    return [
      'Programming & Problem Solving',
      'Data Structures fundamentals',
      'Database Management Systems',
      'Web / application basics',
      'Professional skills lab',
    ]
  }
  if (degree === 'Online BA') {
    return [
      'Foundations in chosen humanities discipline',
      'Reading, writing & argumentation',
      'Indian society / policy context',
      'Digital literacy & research',
    ]
  }
  if (degree === 'Online BCom') {
    return [
      'Financial Accounting I & II',
      'Business Mathematics & Statistics',
      'Corporate Accounting & Reporting',
      'GST & Income Tax fundamentals',
      'Computer applications in commerce',
    ]
  }
  return [
    'Core modules mapped to your destination role',
    'Applied project with mentor review',
    'Communication & interview readiness',
  ]
}

function chipsForTrack(track) {
  const t = track.toLowerCase()
  if (t.includes('finance') || t.includes('account')) {
    return ['Financial Modelling', 'Corporate Taxation', 'SAP Basics', 'MIS & Power BI']
  }
  if (t.includes('market') || t.includes('brand')) {
    return ['Customer insight', 'Campaign analytics', 'Brand positioning', 'Stakeholder reporting']
  }
  if (t.includes('data') || t.includes('analytics')) {
    return ['SQL & databases', 'Statistics for business', 'Dashboarding', 'Python basics']
  }
  if (t.includes('software') || t.includes('computing') || t.includes('systems')) {
    return ['Programming practice', 'Version control', 'APIs & integration', 'Cloud awareness']
  }
  if (t.includes('hr') || t.includes('organisational')) {
    return ['Talent lifecycle', 'Labour law overview', 'Performance systems', 'People analytics intro']
  }
  if (t.includes('commerce') || t.includes('banking')) {
    return ['Advanced accounting', 'Banking operations', 'Corporate law', 'Excel for finance']
  }
  if (t.includes('communication') || t.includes('media')) {
    return ['Narrative & editing', 'Digital channels', 'Research methods', 'Portfolio piece']
  }
  return ['UGC-aligned online track', 'Weekend-friendly pacing', 'Counsellor-mapped milestones', 'Interview-ready portfolio']
}

export function buildFallbackSpec(destinationTitle, card, profile = {}) {
  const dest = String(destinationTitle || 'your goal').trim() || 'your goal'
  const g = parseGrowth(card?.growth)
  const jobs = card?.jobs ? String(card.jobs) : '10,000+'
  const demandPct = Math.min(88, Math.max(55, 62 + (g % 12)))

  const { degree, specializationTrack } = inferFallbackDegreeTrack(dest, card, profile)
  const title = `${degree} — ${specializationTrack}`

  const curriculum = curriculumForDegree(degree, specializationTrack)
  const chips = chipsForTrack(specializationTrack)

  const outcomes = [
    `Stronger credential fit toward ${dest}`,
    'Structured narrative for interviews and referrals',
    'Stackable skills aligned to live job postings in India',
  ]

  return {
    title,
    subtitle: 'Bridges all critical education and skill gaps identified in your profile.',
    chips,
    curriculum,
    outcomes,
    anchorUni: buildFallbackOnlineCollegePicks(dest, title)[0] || 'Amity University',
    jobs,
    growth: card?.growth ? String(card.growth) : `+${g}%`,
    gap: card?.naukri ? 'Supply vs postings varies by quarter' : 'Varies by metro and seniority',
    demandPct,
  }
}

export async function fetchSpecialisationWithOpenAI({ destinationTitle, industryLabel, card, profile }) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  if (!apiKey) return null

  const dest = String(destinationTitle || '').trim() || 'Target role'
  const ind = industryLabel || 'General'
  const desc = card?.desc ? String(card.desc) : ''
  const jobs = card?.jobs ? String(card.jobs) : ''
  const growth = card?.growth ? String(card.growth) : ''

  const edu = profile?.edu != null ? String(profile.edu) : ''
  const spec = profile?.spec != null ? String(profile.spec) : ''
  const role = profile?.role != null ? String(profile.role) : ''
  const func = profile?.func != null ? String(profile.func) : ''
  const dream = profile?.dRole != null ? String(profile.dRole) : ''

  const degreeList = ONLINE_DEGREE_OPTIONS.map((d) => `- "${d}"`).join('\n')

  const prompt = `Return ONLY valid JSON (no markdown). India higher-ed + career context.

Destination role: ${dest}
Industry: ${ind}
Destination card description: ${desc}
Catalog job volume text: ${jobs}
Catalog growth text: ${growth}

Profile hints (may be empty):
- Highest formal education level key: ${edu || 'unknown'} (e.g. 12 = Class 12, UG, PG)
- Current / last specialisation field: ${spec || '—'}
- Current role title: ${role || '—'}
- Function: ${func || '—'}
- Dream / target role text: ${dream || '—'}

CRITICAL — degree choice:
- You MUST set "degree" to EXACTLY one of these strings (copy verbatim, including the word "Online"):
${degreeList}
- Do NOT output any other programme name (no PGDM, MSc, Executive PG, PhD, diplomas not in the list, etc.).
- Pick the single best-matching option for closing skill/education gaps toward "${dest}" given the profile hints.
- "specializationTrack" is a short focus label (plain English, 3–10 words) after the degree — e.g. "Finance & Accounting" for Online MBA. No second degree name in this field.

Return JSON with this shape:
{
  "degree": "<one string from the allowed list exactly>",
  "specializationTrack": "<focus stream only>",
  "subtitle": "Bridges all critical education and skill gaps identified in your profile." (or very similar cautious wording),
  "chips": 3–5 short skill/tool tags aligned to the track (not generic filler),
  "curriculum": 5–7 module titles appropriate to the chosen degree level,
  "outcomes": 3–5 bullets starting with action verbs,
  "anchorUni": one well-known Indian university that commonly offers this online/ODL format (real name),
  "jobs": reuse "${jobs}" if sensible else a conservative aggregate like "8,000+",
  "growth": reuse "${growth}" if sensible else "+30%",
  "gap": one short line about supply vs demand — not alarmist,
  "demandPct": integer 55–88 for a progress bar
}

Tone: professional, not hype.`

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
    return normalizeSpecPayload(text)
  } catch {
    return null
  }
}
