/**
 * upGrad programme + partner university recommendations for Frame 7.
 */
import { colleges, masters, doctorate, certificates } from '../data/upgradcourses.js'
import {
  PREFERRED_PARTNER_UNIVERSITIES,
  ONLINE_PARTNER_UNIVERSITIES,
  resolveToCatalogueName,
} from './partnerUniversityCatalog.js'

const TIER_PROGRAMS = {
  doctorate: { label: 'Doctorate', programs: doctorate },
  masters: { label: "Master's", programs: masters },
  certificates: { label: 'Certificates & executive', programs: certificates },
}

const COLLEGE_BY_ID = Object.fromEntries(colleges.map((c) => [c.id, c]))

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

/** True when profile highest education is post-graduate. */
export function profileIsPostgraduate(profile = {}) {
  const eduMax = String(profile.eduMax || '').trim()
  if (eduMax === 'postgraduate') return true
  if (!eduMax && String(profile.edu || '').trim() === 'PG') return true
  return false
}

function queryTokens(destinationTitle, programmeTitle, profile = {}) {
  const raw = [
    destinationTitle,
    programmeTitle,
    profile.spec,
    profile.func,
    profile.role,
    profile.dRole,
  ]
    .filter(Boolean)
    .join(' ')
  return [...new Set(norm(raw).split(/\s+/).filter((w) => w.length > 2))]
}

function scoreProgramme(program, tokens) {
  const blob = norm(
    `${program.name} ${program.shortName} ${program.field} ${program.credential} ${program.universityLabel} ${(program.tags || []).join(' ')}`,
  )
  let score = 0
  for (const tok of tokens) {
    if (blob.includes(tok)) score += 3
  }
  if (/mba|management|leadership/.test(blob) && tokens.some((t) => /manager|management|lead|director|head/.test(t))) {
    score += 4
  }
  if (/data|analytics|science|ai|machine/.test(blob) && tokens.some((t) => /data|analyst|science|ai|ml|intelligence/.test(t))) {
    score += 4
  }
  if (/finance|account|commerce/.test(blob) && tokens.some((t) => /finance|account|commerce|bank/.test(t))) {
    score += 4
  }
  if (/market|brand|communication/.test(blob) && tokens.some((t) => /market|brand|communication|content/.test(t))) {
    score += 4
  }
  if (program.isExecutive) score += 1
  return score
}

function sortPrograms(list, tokens, key) {
  const tie = hashStr(key)
  return [...list].sort((a, b) => {
    const ds = scoreProgramme(b, tokens) - scoreProgramme(a, tokens)
    if (ds !== 0) return ds
    return (hashStr(a.id) % 97) - (hashStr(b.id) % 97) - (tie % 11)
  })
}

function tierOrderForProfile(profile) {
  if (profileIsPostgraduate(profile)) {
    return ['doctorate', 'masters', 'certificates']
  }
  return ['masters', 'certificates']
}

/**
 * Ranked upGrad programmes — doctorate first for post-graduates, then master's.
 * @returns {{ tier: string, tierLabel: string, programs: object[] }[]}
 */
export function buildUpgradProgrammeSections(destinationTitle, programmeTitle, profile = {}, limits = {}) {
  const tokens = queryTokens(destinationTitle, programmeTitle, profile)
  const key = `${destinationTitle}|${programmeTitle}|${profile.eduMax || profile.edu}`
  const maxPerTier = limits.maxPerTier ?? 6
  const maxTotal = limits.maxTotal ?? 12

  const sections = []
  let remaining = maxTotal

  for (const tier of tierOrderForProfile(profile)) {
    if (remaining <= 0) break
    const meta = TIER_PROGRAMS[tier]
    if (!meta?.programs?.length) continue

    const take = Math.min(maxPerTier, remaining)
    const ranked = sortPrograms(meta.programs, tokens, `${key}|${tier}`).slice(0, take)
    if (!ranked.length) continue

    sections.push({
      tier,
      tierLabel: meta.label,
      programs: ranked.map((p) => ({
        ...p,
        tier,
        tierLabel: meta.label,
        relevanceScore: scoreProgramme(p, tokens),
        collegeNames: (p.university || [])
          .map((id) => COLLEGE_BY_ID[id]?.name)
          .filter(Boolean),
      })),
    })
    remaining -= ranked.length
  }

  return sections
}

/** Flat list of recommended programmes (tier order preserved). */
export function buildUpgradProgrammePicks(destinationTitle, programmeTitle, profile = {}, maxCount = 10) {
  const sections = buildUpgradProgrammeSections(destinationTitle, programmeTitle, profile, {
    maxPerTier: maxCount,
    maxTotal: maxCount,
  })
  const out = []
  for (const sec of sections) {
    for (const p of sec.programs) {
      if (out.length >= maxCount) return out
      out.push(p)
    }
  }
  return out
}

function universityNamesFromProgram(program) {
  const names = new Set()
  for (const id of program.university || []) {
    const c = COLLEGE_BY_ID[id]
    if (c?.name) names.add(c.name)
  }
  const label = String(program.universityLabel || '')
  for (const pref of PREFERRED_PARTNER_UNIVERSITIES) {
    if (norm(label).includes(norm(pref)) || norm(pref).split(' ').every((w) => w.length > 3 && norm(label).includes(w))) {
      const resolved = resolveToCatalogueName(pref) || pref
      names.add(resolved)
    }
  }
  return [...names]
}

function matchesCatalogueUni(programUniName, catalogueName) {
  const a = norm(programUniName)
  const b = norm(catalogueName)
  if (!a || !b) return false
  if (a === b || a.includes(b) || b.includes(a)) return true
  const words = b.split(' ').filter((w) => w.length > 3)
  return words.filter((w) => a.includes(w)).length >= 2
}

/**
 * Universities: preferred partners with matching upGrad programmes first, then other matches, then catalogue fill.
 */
export function buildCollegePicksWithUpgrad(destinationTitle, programmeTitle, profile = {}, maxCount = 10) {
  const programmes = buildUpgradProgrammePicks(destinationTitle, programmeTitle, profile, 12)
  const seen = new Set()
  const out = []

  const addUni = (name) => {
    const resolved = resolveToCatalogueName(name) || name
    if (!resolved || seen.has(resolved)) return
    seen.add(resolved)
    out.push(resolved)
  }

  for (const pref of PREFERRED_PARTNER_UNIVERSITIES) {
    const hasCourse = programmes.some((p) => {
      const names = universityNamesFromProgram(p)
      return names.some((n) => matchesCatalogueUni(n, pref)) || matchesCatalogueUni(p.universityLabel, pref)
    })
    if (hasCourse) addUni(pref)
  }

  for (const pref of PREFERRED_PARTNER_UNIVERSITIES) {
    if (out.length >= maxCount) break
    if (!seen.has(resolveToCatalogueName(pref) || pref)) addUni(pref)
  }

  for (const p of programmes) {
    if (out.length >= maxCount) break
    for (const name of universityNamesFromProgram(p)) {
      if (out.length >= maxCount) break
      const cat = resolveToCatalogueName(name)
      if (cat && ONLINE_PARTNER_UNIVERSITIES.includes(cat)) addUni(cat)
    }
  }

  const key = `${destinationTitle}|${programmeTitle}`
  const start = hashStr(key) % ONLINE_PARTNER_UNIVERSITIES.length
  for (let i = 0; i < ONLINE_PARTNER_UNIVERSITIES.length && out.length < maxCount; i += 1) {
    addUni(ONLINE_PARTNER_UNIVERSITIES[(start + i) % ONLINE_PARTNER_UNIVERSITIES.length])
  }

  return out.slice(0, maxCount)
}
