/** Map recommended degree + track → skills list from Skillsandgap.js */

import degreeSkills from './Skillsandgap.js'

const TRACK_HINTS = [
  [/finance|accounting|fp&a|treasury|audit|tax(ation)?/i, 'Finance'],
  [/marketing|brand|growth|seo|digital\s*media/i, 'Marketing'],
  [/hr|human\s*resource|people|talent|payroll|organisational/i, 'Human Resource Management'],
  [/operation|supply\s*chain|logistics|procurement/i, 'Operations'],
  [/business\s*analytics|data\s*analytics|analytics/i, 'Business Analytics'],
  [/software|it\s*application|programming|developer|engineering\s*&\s*systems/i, 'Software Engineering'],
  [/data\s*science|machine\s*learning|intelligent\s*systems|ai\b/i, 'Data Science & AI'],
  [/cyber|security/i, 'Cyber Security'],
  [/cloud|devops/i, 'Cloud Computing'],
  [/full[\s-]?stack/i, 'Full Stack Development'],
  [/mobile\s*app/i, 'Mobile Application Development'],
  [/commerce|banking|corporate\s*law/i, 'Accounting & Finance'],
  [/communication|journalism|media/i, 'Journalism & Mass Communication'],
  [/education|pedagogy/i, 'General'],
  [/design|ux|user\s*research/i, 'General'],
  [/international\s*business|global\s*trade/i, 'International Business'],
  [/entrepreneur|startup/i, 'Entrepreneurship'],
  [/healthcare|hospital|clinical/i, 'Healthcare Management'],
  [/sales|business\s*development/i, 'Business Administration'],
  [/management|leadership|strategy|executive|employability/i, 'General'],
]

function normalizeTrack(s) {
  return String(s || '').trim().toLowerCase()
}

/**
 * Resolve specialization key inside degreeSkills[degree].
 * Falls back to "General" when track is unknown.
 */
export function resolveSkillsSpecKey(degree, specializationTrack) {
  const degreeData = degreeSkills[degree]
  if (!degreeData) return 'General'

  const track = normalizeTrack(specializationTrack)
  if (!track) return 'General'

  for (const [re, key] of TRACK_HINTS) {
    if (re.test(track) && degreeData[key]) return key
  }

  for (const key of Object.keys(degreeData)) {
    if (key === 'General') continue
    const k = key.toLowerCase()
    if (track.includes(k) || k.includes(track.slice(0, Math.min(14, track.length)))) {
      return key
    }
  }

  return 'General'
}

/** @returns {{ skill: string, subtext: string }[]} */
export function getDegreeSkills(degree, specializationTrack) {
  const degreeData = degreeSkills[degree]
  if (!degreeData) {
    const fallback = degreeSkills['Online BBA']
    return fallback?.General ?? []
  }
  const key = resolveSkillsSpecKey(degree, specializationTrack)
  return degreeData[key] ?? degreeData.General ?? []
}
