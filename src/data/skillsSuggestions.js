/**
 * Hardcoded skill suggestions and search catalog for Frame 1 (no API).
 */

/** Generic skills many freshers / early-career profiles can claim */
export const GENERIC_FRESHER_SKILLS = [
  'Microsoft Excel (basics)',
  'Email & professional communication',
  'Presentation tools (PowerPoint / Google Slides)',
  'Research & report writing',
  'Team collaboration',
  'Time management & prioritisation',
]

const ROLE_RULES = [
  {
    re: /software|developer|engineer|fullstack|frontend|backend|react|angular|vue|node|java|python|devops|qa|test|sre|data engineer|ml|ai|product|designer|ui|ux|web/i,
    skills: [
      'Git basics',
      'REST APIs (awareness)',
      'SQL basics',
      'Agile / Scrum awareness',
      'Debugging & troubleshooting',
      'Code review practices',
    ],
  },
  {
    re: /sales|business development|bd|account executive|bdr|sdr|tele/i,
    skills: [
      'Prospecting & cold outreach',
      'CRM hygiene (Salesforce / Zoho awareness)',
      'Pitch & objection handling',
      'Pipeline tracking',
      'Negotiation basics',
      'Territory / beat planning',
    ],
  },
  {
    re: /finance|account|audit|fp&a|treasury|tax|controller|analyst/i,
    skills: [
      'Excel modelling',
      'Tally / accounting basics',
      'Variance analysis',
      'Invoice & vendor reconciliation',
      'GST / compliance awareness',
      'Management reporting',
    ],
  },
  {
    re: /hr|talent|recruit|people|payroll|l&d/i,
    skills: [
      'Scheduling interviews',
      'ATS basics',
      'Employee onboarding coordination',
      'HRMS data entry',
      'Policy communication',
      'Offer documentation',
    ],
  },
  {
    re: /market|brand|growth|seo|content|social|digital/i,
    skills: [
      'Campaign tracking',
      'Google Analytics awareness',
      'Content calendars',
      'A/B testing mindset',
      'Creative briefing',
      'Budget tracking',
    ],
  },
  {
    re: /operations|supply|logistics|procurement|warehouse|plant/i,
    skills: [
      'SOP adherence',
      'Inventory checks',
      'Vendor follow-ups',
      'Shift planning',
      'Safety checklist',
      'Dispatch coordination',
    ],
  },
  {
    re: /customer|support|success|helpdesk|call.?centre|bpo/i,
    skills: [
      'Ticket handling',
      'Empathetic communication',
      'Escalation protocols',
      'Knowledge base usage',
      'CSAT focus',
      'Multichannel support',
    ],
  },
]

const EXTRA_CATALOG = [
  'TypeScript',
  'React',
  'Angular',
  'Vue.js',
  'Node.js',
  'UI/UX design',
  'Full-stack development',
  'Web development',
  'Cloud fundamentals (AWS/Azure/GCP awareness)',
  'Cybersecurity awareness',
  'Power BI',
  'Tableau',
  'Python scripting',
  'Stakeholder management',
  'Problem solving',
  'Documentation',
]

function uniqSorted(list) {
  return [...new Set(list.map((x) => String(x || '').trim()).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b),
  )
}

/** @param {Record<string, unknown>} s profile draft */
export function suggestedSkillChipsForProfile(s) {
  const role = String(s?.role || '').trim()
  const exp = s?.exp
  const isFresher = exp === 'fresher' || !exp || exp === ''
  if (isFresher || !role) return [...GENERIC_FRESHER_SKILLS]
  const rl = role.toLowerCase()
  for (const rule of ROLE_RULES) {
    if (rule.re.test(rl)) return [...rule.skills]
  }
  return [
    ...GENERIC_FRESHER_SKILLS.slice(0, 3),
    'Stakeholder communication',
    'Process adherence',
    'Data accuracy',
  ]
}

function allCatalogEntries() {
  const out = [...GENERIC_FRESHER_SKILLS, ...EXTRA_CATALOG]
  for (const r of ROLE_RULES) out.push(...r.skills)
  return uniqSorted(out)
}

export const SKILL_SEARCH_CATALOG = allCatalogEntries()

/** @param {string} query */
export function searchSkillCatalog(query, limit = 40) {
  const q = String(query || '')
    .trim()
    .toLowerCase()
  if (!q) return SKILL_SEARCH_CATALOG.slice(0, limit)
  return SKILL_SEARCH_CATALOG.filter((x) => x.toLowerCase().includes(q)).slice(0, limit)
}
