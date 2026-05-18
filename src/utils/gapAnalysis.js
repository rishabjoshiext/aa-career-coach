import { GAPS_BY_ROLE } from './gapsData.js'
import { getDegreePersonalDev } from './degreePersonalDevMap.js'
import { getDegreeSkills, resolveSkillsSpecKey } from './degreeSkillsMap.js'
import { inferFallbackDegreeTrack, profileEduLevel } from './specialisationData.js'

function isAccelDegreeNode(node) {
  const title = String(node?.r || '')
  return (
    Boolean(node?.tag) ||
    /\+\s*degree|\bdegree\b|bba|mba|bca|mca|bcom|mcom|\benrol\b/i.test(title)
  )
}

/** Experience milestones: current role, degree step, then accelerated-path roles. */
export function buildExperienceGapBlock(
  profile = {},
  destinationTitle = 'your goal',
  roleCard = null,
  journey = null,
) {
  const currentRole = String(profile.role || '').trim() || 'Current Role'
  const accelNodes = journey?.nodes?.accel ?? []
  const { degree, specializationTrack } = inferFallbackDegreeTrack(destinationTitle, roleCard, profile)
  const degreeLabel = `${degree} — ${specializationTrack}`

  const items = [
    {
      n: currentRole,
      d: 'You are here — your starting point on the accelerated path.',
      pill: 'qual',
    },
  ]

  let degreeRowAdded = false
  const milestoneRoles = []

  for (const node of accelNodes) {
    if (isAccelDegreeNode(node) && !degreeRowAdded) {
      items.push({
        n: String(node.r || '').trim() || `${degree} (work + study)`,
        d: `Gap: complete ${degreeLabel} to progress through this step.`,
        pill: 'crit',
      })
      degreeRowAdded = true
      continue
    }
    const roleTitle = String(node.r || '').trim()
    if (!roleTitle) continue
    if (isAccelDegreeNode(node)) continue
    milestoneRoles.push(roleTitle)
  }

  if (!degreeRowAdded) {
    items.push({
      n: `${degree} · work + study`,
      d: `Gap: enrol in ${degreeLabel} without a career break.`,
      pill: 'crit',
    })
  }

  for (const roleTitle of milestoneRoles) {
    items.push({
      n: roleTitle,
      d: 'Gap: missing — experience at this role level is not yet on your profile.',
      pill: 'miss',
    })
  }

  return {
    imp: 'Accelerated path · role experience',
    cls: 'amber',
    items,
  }
}

/** Personal development from perdonalDev.js for the recommended degree. */
export function buildPersonalDevGapBlock(profile = {}, destinationTitle = 'your goal', roleCard = null) {
  const dest = String(destinationTitle || 'your goal').trim() || 'your goal'
  const { degree, specializationTrack } = inferFallbackDegreeTrack(dest, roleCard, profile)
  const pdItems = getDegreePersonalDev(degree)

  return {
    imp: `${degree} · personal development`,
    cls: 'green',
    items: pdItems.map(({ skill, subtext }) => ({
      n: skill,
      d: subtext,
    })),
  }
}

function resolveEduMax(profile = {}) {
  let eduMax = String(profile.eduMax || '').trim()
  if (!eduMax && profile.edu) {
    if (profile.edu === 'PG') eduMax = 'postgraduate'
    else if (profile.edu === 'UG') eduMax = 'graduate'
    else eduMax = '12_pass'
  }
  return eduMax
}

/** True when the recommended degree to close gaps is an MBA (not bachelor's / other master's). */
export function shouldShowMbaInvestment(profile = {}, destinationTitle = 'your goal', roleCard = null) {
  if (profileEduLevel(profile) !== 'master') return false
  const track = inferFallbackDegreeTrack(destinationTitle, roleCard, profile)
  return track.degree === 'Online MBA'
}

/** Skills & tools for the recommended degree — heading + subtext only (assess in Frame 4). */
export function buildSkillsGapBlock(profile = {}, destinationTitle = 'your goal', roleCard = null) {
  const dest = String(destinationTitle || 'your goal').trim() || 'your goal'
  const { degree, specializationTrack } = inferFallbackDegreeTrack(dest, roleCard, profile)
  const skillsSpecKey = resolveSkillsSpecKey(degree, specializationTrack)
  const skills = getDegreeSkills(degree, specializationTrack)
  const specNote = skillsSpecKey === 'General' ? 'General track' : skillsSpecKey

  return {
    imp: `${degree} · ${specializationTrack}`,
    cls: 'amber',
    recommendedDegree: degree,
    specializationTrack,
    skillsSpecKey: specNote,
    items: skills.map(({ skill, subtext }) => ({
      n: skill,
      d: subtext,
    })),
  }
}

/**
 * Education gaps from Frame 1 `eduMax` — only the missing qualifications, no extra boilerplate.
 */
export function buildEducationGapBlock(profile = {}, destinationTitle = 'your goal', roleCard = null) {
  const dest = String(destinationTitle || 'your goal').trim() || 'your goal'
  const eduMax = resolveEduMax(profile)
  const suggestsMba = shouldShowMbaInvestment(profile, destinationTitle, roleCard)

  const item = (n, d, pill = 'crit') => ({ n, d, pill, actions: [] })

  let items
  if (eduMax === '10_below') {
    items = [
      item(
        'High School (10th / 12th)',
        'Recognised secondary schooling — often required before graduation programmes and employer shortlists.',
      ),
      item(
        'Graduation (Bachelor\'s degree)',
        `UG degree is a common filter for ${dest} roles beyond entry-level screening.`,
      ),
    ]
  } else if (eduMax === '12_pass' || eduMax === 'diploma' || eduMax === 'iti') {
    items = [
      item(
        'Bachelor\'s degree',
        `Most ${dest} job descriptions expect a recognised bachelor's qualification.`,
      ),
      item(
        'Master\'s degree',
        'Strengthens shortlisting for mid-level and leadership-track postings.',
        'miss',
      ),
    ]
  } else if (eduMax === 'graduate' || eduMax === 'postgraduate') {
    items = [
      item(
        'Master\'s degree',
        `Role-aligned master's helps you compete for ${dest} against candidates with specialised PG credentials.`,
        eduMax === 'postgraduate' ? 'miss' : 'crit',
      ),
      item(
        'PhD / doctoral qualification',
        'Adds depth where research, policy, or senior specialist roles are common.',
        'miss',
      ),
    ]
  } else {
    items = [
      item(
        'Bachelor\'s degree',
        `Complete your highest education details on the profile — most ${dest} roles expect a bachelor's.`,
      ),
      item('Master\'s degree', 'Consider a master\'s aligned to your target role.', 'miss'),
    ]
  }

  return {
    imp: 'Education gaps based on your profile',
    cls: 'red',
    items,
    suggestsMba,
  }
}

/**
 * Full-time vs work+study bands (₹ Lacs) and avg EMI over 24 months.
 * MBA pursuit: 12–25 L full-time · 1–3 L work+study.
 * Bachelor's / other master's: 4–10 L full-time · 1–3 L work+study.
 */
export function buildInvestmentCalc({ mba = false } = {}) {
  const tenureMo = 24
  const ftMinL = mba ? 12 : 4
  const ftMaxL = mba ? 25 : 10
  const wsMinL = 1
  const wsMaxL = 3

  const ftMinR = ftMinL * 100000
  const ftMaxR = ftMaxL * 100000
  const wsMinR = wsMinL * 100000
  const wsMaxR = wsMaxL * 100000

  const ftEmiMin = Math.round(ftMinR / tenureMo)
  const ftEmiMax = Math.round(ftMaxR / tenureMo)
  const ftEmiAvg = Math.round((ftEmiMin + ftEmiMax) / 2)

  const wsEmiMin = Math.round(wsMinR / tenureMo)
  const wsEmiMax = Math.round(wsMaxR / tenureMo)
  const wsEmiAvg = Math.round((wsEmiMin + wsEmiMax) / 2)

  return {
    tenureMo,
    suggestsMba: mba,
    ftMinL,
    ftMaxL,
    ftEmiMin,
    ftEmiMax,
    ftEmiAvg,
    wsMinL,
    wsMaxL,
    wsMinTotal: wsMinR,
    wsMaxTotal: wsMaxR,
    wsEmiMin,
    wsEmiMax,
    wsEmiAvg,
    wsMonthly: wsEmiAvg,
  }
}

/**
 * Deterministic gap set — always themed to `targetRole`,
 * never Finance Manager boilerplate unless targetRole is Finance Manager.
 */
export function buildFallbackGaps(targetRole, card) {
  const role = String(targetRole || 'this role').trim() || 'this role'
  const blurb = (card?.desc && String(card.desc).trim()) || `leading work aligned to ${role}`

  return {
    edu: {
      imp: 'Delays career progression toward this role',
      cls: 'red',
      items: [
        {
          n: `Formal qualification signal for ${role}`,
          d: `Many ${role} job descriptions filter for recognised degrees or diplomas related to: ${blurb.slice(0, 120)}${blurb.length > 120 ? '…' : ''}`,
          w: 'Often a hard filter before interviews',
          pill: 'crit',
          actions: [
            'Shortlist 2 UGC-recognised or industry-accepted programmes that hiring managers in this track mention',
            'Pick a weekend / online mode so you can keep earning while studying',
            'Align electives or projects to outcomes named in recent JDs for this role',
          ],
        },
        {
          n: 'Stackable certification in your domain',
          d: 'Certifications reduce time-to-shortlist when a degree upgrade is not immediately feasible',
          pill: 'miss',
          actions: [
            'Complete one credible certification in the next 6–9 months',
            'Add proof of completion to your resume and LinkedIn Featured section',
          ],
        },
      ],
    },
    skill: {
      imp: 'Costs interview rounds until you demonstrate depth',
      cls: 'amber',
      items: [
        {
          n: `Core toolkit for ${role}`,
          d: `Recruiters expect hands-on proficiency with tools and methods tied to: ${blurb.slice(0, 100)}${blurb.length > 100 ? '…' : ''}`,
          w: 'Frequently tested in practical rounds',
          pill: 'crit',
          actions: [
            'Map the top 5 tools / methods from 20 recent JDs for this title',
            'Build 2 portfolio artefacts (dashboard, campaign, deck, repo) you can walk through live',
          ],
        },
        {
          n: 'Workflow & delivery hygiene',
          d: 'Structured execution, documentation, and stakeholder updates separate senior-ready candidates',
          pill: 'miss',
          actions: ['Adopt a simple weekly outcomes log', 'Practice concise written updates as you would to a hiring manager'],
        },
        {
          n: 'Data literacy for decisions',
          d: 'Most tracks now expect comfort interpreting metrics and running basic analyses',
          pill: 'miss',
          actions: ['Complete a short analytics / spreadsheet modelling module', 'Tie every example to a business metric'],
        },
        {
          n: 'Domain vocabulary in English + Hindi',
          d: 'Panel interviews mix languages; fluency with terms reduces mis-hires signals',
          pill: 'need',
          actions: ['Maintain a 20-term glossary for your target industry', 'Rehearse 60-second stories using those terms'],
        },
        {
          n: 'AI-assisted productivity (where ethical)',
          d: 'Shows you can ship faster without cutting quality — increasingly common expectation',
          pill: 'need',
          actions: ['Pick one vetted workflow (research, drafting, QA) and document before/after time saved'],
        },
      ],
    },
    exp: {
      imp: 'Adds time to promotion or lateral move',
      cls: 'amber',
      items: [
        {
          n: `Ownership breadth expected before ${role}`,
          d: 'Hiring panels look for end-to-end ownership, not only task execution',
          w: 'One of the most common gaps on junior-to-mid profiles',
          pill: 'crit',
          actions: [
            'Identify one initiative you can own metrics for over the next 2 quarters',
            'Ask your manager to sponsor a stretch assignment with a written scope',
          ],
        },
        {
          n: 'Cross-functional collaboration proof',
          d: 'This role coordinates across teams; evidence of that reduces perceived ramp time',
          pill: 'miss',
          actions: ['Volunteer for a pilot involving two departments', 'Capture outcomes in STAR format for interviews'],
        },
        {
          n: 'Stakeholder communication cadence',
          d: 'Regular, calm updates to leadership mirror how the role operates day-to-day',
          pill: 'miss',
          actions: ['Run a monthly digest for your team or leadership', 'Collect one testimonial quote per quarter'],
        },
        {
          n: 'Risk / compliance touchpoints (if relevant)',
          d: 'Even light exposure to approvals, audits, or policy reduces screening friction',
          pill: 'need',
          actions: ['Shadow a compliance or QA review once a quarter', 'Note learnings in your interview stories'],
        },
      ],
    },
    dev: {
      imp: 'Weak inbound and referral flow without visibility',
      cls: 'green',
      items: [
        {
          n: `Profile positioned for ${role}`,
          d: 'Headline, skills, and featured work should match how recruiters search for this title',
          w: 'Low discoverability hurts shortlist rate',
          pill: 'miss',
          actions: [
            'Rewrite headline with role + 2 proof points (metric, scope, tool)',
            'Pin a case study or one-pager that mirrors target JD language',
          ],
        },
        {
          n: 'Referral network in target companies',
          d: 'Warm intros compress hiring cycles versus cold applications alone',
          pill: 'need',
          actions: ['List 15 target employers; request 2 intros per month via mutuals', 'Offer a crisp ask: 15-min context, not a job request'],
        },
        {
          n: 'Community or guild participation',
          d: 'Signals seriousness and surfaces hiring managers organically',
          pill: 'need',
          actions: ['Join one relevant community (Slack, Discord, local chapter)', 'Contribute one insight post monthly'],
        },
        {
          n: 'Interview storytelling practice',
          d: 'Personal development includes rehearsal — reduces nervous drops in senior rounds',
          pill: 'need',
          actions: ['Record 3 stories monthly; trim to 90 seconds each', 'Swap mock interviews with a peer weekly'],
        },
      ],
    },
  }
}

/** Prefer static library when the selected card exactly matches a curated role. */
export function getStaticGapsForRole(roleTitle) {
  const key = String(roleTitle || '').trim()
  if (GAPS_BY_ROLE[key]) return GAPS_BY_ROLE[key]
  return null
}
