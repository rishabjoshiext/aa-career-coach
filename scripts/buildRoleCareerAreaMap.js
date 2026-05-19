/**
 * Regenerate src/data/roleCareerAreaMap.js from workExperienceData.js section comments.
 * Run: node scripts/buildRoleCareerAreaMap.js
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { ROLES_BY_FUNCTIONAL_AREA } from '../src/data/rolesByFunctionalArea.js'
import { FRAME1_FUNC_TO_CAREER_AREA } from '../src/data/potentialCareerAreas.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const src = fs.readFileSync(path.join(root, 'src/data/workExperienceData.js'), 'utf8')

const SECTION_TO_AREA = {
  'ENTRY LEVEL / FRESHER / TRAINEE': 'Other',
  'C-SUITE / FOUNDERS': 'Strategy',
  'GENERAL CORPORATE HIERARCHY': 'Strategy',
  'SOFTWARE ENGINEERING / SDE': 'Software Development',
  'DATA / ANALYTICS / AI': 'Data Science',
  'CLOUD / DEVOPS / INFRA': 'Cloud & DevOps',
  CYBERSECURITY: 'Cybersecurity',
  'PRODUCT MANAGEMENT': 'Product',
  'DESIGN & UX': 'UI/UX',
  MARKETING: 'Marketing',
  SALES: 'Other',
  'CUSTOMER SUCCESS / SUPPORT': 'Customer Success',
  'PROJECT & PROGRAM MANAGEMENT': 'Project Management',
  'CONSULTING & STRATEGY': 'Consulting',
  'HUMAN RESOURCES': 'HR',
  'FINANCE & ACCOUNTING': 'Finance',
  'CA / CS / CMA / LEGAL-FINANCE': 'Finance',
  'LEGAL & COMPLIANCE': 'Legal & Compliance',
  'BANKING & FINANCIAL SERVICES': 'Banking & Insurance',
  INSURANCE: 'Banking & Insurance',
  'OPERATIONS & SUPPLY CHAIN': 'Operations',
  'ENGINEERING / MANUFACTURING': 'Operations',
  'IT OPERATIONS': 'IT',
  'AGILE & DELIVERY': 'Project Management',
  'ACADEMIA & RESEARCH': 'Education',
  'EDUCATION (K12 / SCHOOL / COACHING)': 'Education',
  'ACADEMIC COUNSELLOR / COUNSELLOR': 'Education',
  EDTECH: 'Education',
  'HEALTHCARE / CLINICAL': 'Healthcare Management',
  'PHARMA / CLINICAL RESEARCH': 'Healthcare Management',
  'REAL ESTATE': 'Operations',
  'MEDIA / JOURNALISM': 'Marketing',
  'LOGISTICS / SUPPLY / DELIVERY': 'Supply Chain Management',
  'RETAIL / TRADE / FMCG FIELD': 'Retail Management',
  'HOSPITALITY / F&B': 'Hospitality Management',
  'GOVERNMENT / CIVIL SERVICES': 'Other',
  'TIER 2–3 CITY / JUNIOR ROLES': 'Operations',
  'AGRICULTURE / AGRITECH': 'Operations',
  'FINANCE / BROKING / CAPITAL MARKETS': 'Finance',
  'FREELANCE / INDEPENDENT': 'Other',
  'OTHER SPECIALIZED ROLES': 'Other',
}

function normalizeSectionLabel(raw) {
  return String(raw || '')
    .replace(/^[\s─\-–]+|[\s─\-–]+$/g, '')
    .trim()
}

const map = {}
let currentArea = 'Other'

for (const line of src.split('\n')) {
  const sec = line.match(/\/\*\s*(.+?)\s*\*\//)
  if (sec && sec[1].includes('──')) {
    const label = normalizeSectionLabel(sec[1])
    currentArea = SECTION_TO_AREA[label] || 'Other'
    continue
  }
  const role = line.match(/^\s*'([^']+)',\s*$/)
  if (role) map[role[1]] = currentArea
}

for (const [func, roles] of Object.entries(ROLES_BY_FUNCTIONAL_AREA)) {
  const area = FRAME1_FUNC_TO_CAREER_AREA[func] || 'Other'
  for (const title of roles) {
    if (title.includes('Other (describe')) continue
    if (!map[title]) map[title] = area
  }
}

const out = `/**
 * Role title → Frame 2 career area (from workExperienceData.js sections + rolesByFunctionalArea).
 * Regenerate: node scripts/buildRoleCareerAreaMap.js
 */
export const ROLE_TITLE_TO_CAREER_AREA = ${JSON.stringify(map, null, 2)}

export function careerAreaFromWorkRoleTitle(roleTitle) {
  const raw = String(roleTitle || '').trim()
  if (!raw) return null
  if (ROLE_TITLE_TO_CAREER_AREA[raw]) return ROLE_TITLE_TO_CAREER_AREA[raw]
  const norm = raw.toLowerCase().replace(/\\s+/g, ' ')
  for (const [title, area] of Object.entries(ROLE_TITLE_TO_CAREER_AREA)) {
    if (title.toLowerCase().replace(/\\s+/g, ' ') === norm) return area
  }
  return null
}
`

fs.writeFileSync(path.join(root, 'src/data/roleCareerAreaMap.js'), out)
console.log(`Wrote ${Object.keys(map).length} role → career area mappings`)
