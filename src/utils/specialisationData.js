/** Frame 7 “recommended specialisation” — deterministic fallbacks; degrees locked to approved online catalogue. */

import { legacyEduFromMax } from '../data/frame1Education.js'
import { buildFallbackOnlineCollegePicks } from './onlinePartnerUniversities.js'

function parseGrowth(g) {
  const n = parseInt(String(g || '').replace(/[^\d]/g, ''), 10)
  return Number.isFinite(n) ? n : 32
}

/** 12th / diploma / ITI → bachelor's; graduate / PG → master's. */
export function profileEduLevel(profile = {}) {
  let eduMax = String(profile.eduMax || '').trim()
  if (!eduMax && profile.edu) {
    if (profile.edu === 'PG') eduMax = 'postgraduate'
    else if (profile.edu === 'UG') eduMax = 'graduate'
    else eduMax = '12_pass'
  }
  if (eduMax === 'graduate' || eduMax === 'postgraduate') return 'master'
  return 'bachelor'
}

export function isBachelorDegree(degree) {
  return /^Online B/i.test(String(degree || ''))
}

export function isMasterDegree(degree) {
  return /^Online M/i.test(String(degree || ''))
}

function combinedHints(destinationTitle, card, profile) {
  const dest = String(destinationTitle || '').toLowerCase()
  const desc = String(card?.desc || '').toLowerCase()
  const spec = String(profile?.spec || '').toLowerCase()
  const func = String(profile?.func || '').toLowerCase()
  const dream = String(profile?.dRole || '').toLowerCase()
  const eduMax = String(profile.eduMax || '').trim()
  const edu = legacyEduFromMax(eduMax) || String(profile.edu || '').trim() || '12'
  const eduLevel = profileEduLevel(profile)
  return { raw: `${dest} ${desc} ${spec} ${func} ${dream}`, edu, eduLevel }
}

function downgradeToBachelor(pick, raw) {
  const { specializationTrack } = pick
  const t = String(specializationTrack || '').toLowerCase()
  if (/software|developer|engineer|devops|cloud|programming|data\s*science|analytics|ai\b|ml\b/.test(raw)) {
    if (/data|analytics|science/.test(t) || /data|analytics|science/.test(raw)) {
      return { degree: 'Online BCA', specializationTrack: 'Data Analytics & Business Tools' }
    }
    return { degree: 'Online BCA', specializationTrack: 'Software & IT Applications' }
  }
  if (/finance|account|audit|tax|commerce|banking|b\.?com/.test(raw)) {
    return { degree: 'Online BCom', specializationTrack: 'Accounting & Corporate Taxation' }
  }
  if (/content|journalism|media|communication|english|history|sociology|psychology/.test(raw)) {
    return { degree: 'Online BA', specializationTrack: 'Communication & Digital Media' }
  }
  if (/operation|supply|sales|market|hr|management/.test(raw)) {
    return { degree: 'Online BBA', specializationTrack: pick.specializationTrack || 'General Management & Employability' }
  }
  return { degree: 'Online BBA', specializationTrack: 'General Management & Employability' }
}

function upgradeToMaster(pick, raw) {
  const t = String(pick.specializationTrack || '').toLowerCase()
  if (/software|developer|engineer|devops|cloud|programming/.test(raw)) {
    return { degree: 'Online MCA', specializationTrack: 'Software Engineering & Systems' }
  }
  if (/data\s*science|machine\s*learning|analytics|ai\b/.test(raw)) {
    return { degree: 'Online MCA', specializationTrack: 'Data Science & Intelligent Systems' }
  }
  if (/finance|account|audit|tax|commerce|banking|b\.?com/.test(raw)) {
    if (/commerce|banking|mcom/.test(raw) || /commerce|banking/.test(t)) {
      return { degree: 'Online MCom', specializationTrack: 'Commerce, Banking & Corporate Law' }
    }
    return { degree: 'Online MBA', specializationTrack: 'Finance & Accounting' }
  }
  if (/content|journalism|media|communication|english|education|design/.test(raw)) {
    return { degree: 'Online MA', specializationTrack: pick.specializationTrack || 'Communication & Digital Media' }
  }
  return { degree: 'Online MBA', specializationTrack: pick.specializationTrack || 'Management & Leadership' }
}

function constrainDegreeLevel(pick, eduLevel, raw) {
  if (eduLevel === 'bachelor' && isMasterDegree(pick.degree)) return downgradeToBachelor(pick, raw)
  if (eduLevel === 'master' && isBachelorDegree(pick.degree)) return upgradeToMaster(pick, raw)
  return pick
}

/**
 * Role-aware degree + track, then constrained by profile:
 * 12th / diploma / ITI → bachelor's only; UG / PG → master's only.
 */
export function inferFallbackDegreeTrack(destinationTitle, card, profile = {}) {
  const { raw, eduLevel } = combinedHints(destinationTitle, card, profile)
  const bachelor = eduLevel === 'bachelor'

  let pick

  if (/software|developer|engineer|devops|full[\s-]?stack|backend|frontend|sre|cloud\s*arch|\.net|java\s*dev|python\s*dev/.test(raw)) {
    pick = bachelor
      ? { degree: 'Online BCA', specializationTrack: 'Software & IT Applications' }
      : { degree: 'Online MCA', specializationTrack: 'Software Engineering & Systems' }
  } else if (/data\s*science|machine\s*learning|\bml\b|ai\b|analytics|bi\b|business\s*analyst|data\s*analyst/.test(raw)) {
    pick = bachelor
      ? { degree: 'Online BCA', specializationTrack: 'Data Analytics & Business Tools' }
      : { degree: 'Online MCA', specializationTrack: 'Data Science & Intelligent Systems' }
  } else if (/finance|account|audit|tax|fp&a|controller|treasury|bookkeeping|ca\b|cfo/.test(raw)) {
    if (/(assistant|executive|junior|clerk|accounts\s*payable)/.test(raw) && bachelor) {
      pick = { degree: 'Online BCom', specializationTrack: 'Accounting & Corporate Taxation' }
    } else {
      pick = bachelor
        ? { degree: 'Online BCom', specializationTrack: 'Accounting & Finance' }
        : { degree: 'Online MBA', specializationTrack: 'Finance & Accounting' }
    }
  } else if (/commerce|b\.?com|mcom|banking\s*operations|credit\s*analyst/.test(raw)) {
    pick = bachelor
      ? { degree: 'Online BCom', specializationTrack: 'Accounting & Finance' }
      : { degree: 'Online MCom', specializationTrack: 'Commerce, Banking & Corporate Law' }
  } else if (/hr\b|human\s*resource|people\s*partner|talent|recruit|l&d|payroll/.test(raw)) {
    pick = bachelor
      ? { degree: 'Online BBA', specializationTrack: 'Human Resource Management' }
      : { degree: 'Online MBA', specializationTrack: 'HR & Organisational Development' }
  } else if (/market|brand|growth|performance|seo|content\s*strateg|digital\s*media|social\s*media|advert/.test(raw)) {
    pick = bachelor
      ? { degree: 'Online BBA', specializationTrack: 'Marketing & Brand Strategy' }
      : { degree: 'Online MBA', specializationTrack: 'Marketing & Brand Strategy' }
  } else if (/product\s*manager|\bpm\b|program\s*management|roadmap|discovery/.test(raw)) {
    pick = bachelor
      ? { degree: 'Online BBA', specializationTrack: 'General Management & Employability' }
      : { degree: 'Online MBA', specializationTrack: 'Strategy & Product Leadership' }
  } else if (/operations|supply\s*chain|logistics|procurement|warehouse/.test(raw)) {
    pick = bachelor
      ? { degree: 'Online BBA', specializationTrack: 'Operations & Supply Chain' }
      : { degree: 'Online MBA', specializationTrack: 'Operations Management' }
  } else if (/sales|business\s*development|\bbd\b|account\s*manager|revenue/.test(raw)) {
    pick = { degree: 'Online BBA', specializationTrack: 'Sales & Business Development' }
  } else if (/content|journalism|media|communication|pr\b|copywriter|editor/.test(raw)) {
    pick = bachelor
      ? { degree: 'Online BA', specializationTrack: 'Communication & Digital Media' }
      : { degree: 'Online MA', specializationTrack: 'Communication & Digital Media' }
  } else if (/teacher|education|academic|instructional/.test(raw)) {
    pick = bachelor
      ? { degree: 'Online BA', specializationTrack: 'Education Studies & Pedagogy' }
      : { degree: 'Online MA', specializationTrack: 'Education Studies & Pedagogy' }
  } else if (/design|ux\b|ui\b|graphic|visual/.test(raw)) {
    pick = bachelor
      ? { degree: 'Online BA', specializationTrack: 'Design & User Research' }
      : { degree: 'Online MA', specializationTrack: 'Design & User Research' }
  } else if (/legal|compliance|company\s*secretary|regulatory/.test(raw)) {
    pick = bachelor
      ? { degree: 'Online BBA', specializationTrack: 'Business Law & Compliance' }
      : { degree: 'Online MBA', specializationTrack: 'Business Law & Compliance' }
  } else if (bachelor) {
    pick = { degree: 'Online BBA', specializationTrack: 'General Management & Employability' }
  } else {
    pick = { degree: 'Online MBA', specializationTrack: 'Management & Leadership' }
  }

  return constrainDegreeLevel(pick, eduLevel, raw)
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
