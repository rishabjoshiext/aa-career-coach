/**
 * Curated domain progression ladders + JSON category ladders.
 * @module journey/roleLadders
 */

import mappingDoc from '../data/potential_career_mapping.json'
import { stemTiersForTarget } from './seniority.js'

/** @typedef {{ id: string, name: string, roles: string[], meta?: object[] }} CareerLadder */

const LEVEL_RANK = {
  fresher: 0,
  entry: 0,
  intermediate: 1,
  mid: 2,
  senior: 3,
  super_senior: 4,
}

/** Curated ladders — industry-standard progressions (India + global hiring norms). */
export const CURATED_LADDERS = {
  software_engineering: {
    id: 'software_engineering',
    name: 'Software Development',
    roles: [
      'Associate Software Engineer',
      'Software Engineer',
      'Software Engineer II',
      'Senior Software Engineer',
      'Staff Engineer',
      'Tech Lead',
      'Engineering Manager',
      'Senior Engineering Manager',
      'Director of Engineering',
      'VP Engineering',
    ],
  },
  product: {
    id: 'product',
    name: 'Product',
    roles: [
      'Associate Product Manager',
      'Product Manager',
      'Senior Product Manager',
      'Group Product Manager',
      'Principal Product Manager',
      'Director of Product',
      'VP of Product',
      'Chief Product Officer',
    ],
  },
  sales: {
    id: 'sales',
    name: 'Sales',
    roles: [
      'Sales Trainee',
      'BDR / SDR',
      'Inside Sales Representative',
      'Sales Executive',
      'Business Development Executive',
      'Account Manager',
      'Key Account Manager',
      'Sales Manager',
      'Regional Sales Manager',
      'National Sales Head',
      'VP Sales',
    ],
  },
  marketing: {
    id: 'marketing',
    name: 'Marketing',
    roles: [
      'Marketing Executive',
      'Marketing Specialist',
      'Marketing Manager',
      'Senior Marketing Manager',
      'Brand Manager',
      'Marketing Director',
      'VP Marketing',
    ],
  },
  finance: {
    id: 'finance',
    name: 'Finance',
    roles: [
      'Finance Executive',
      'Accounts Executive',
      'Senior Accountant',
      'Accounts Manager',
      'Finance Manager',
      'Senior Finance Manager',
      'Finance Director',
      'CFO',
    ],
  },
  banking_insurance: {
    id: 'banking_insurance',
    name: 'Banking & Insurance',
    roles: [
      'Relationship Manager (Retail Banking)',
      'Credit Analyst',
      'Account Manager',
      'Underwriter',
      'Branch Manager',
      'Insurance Manager',
      'Wealth Manager',
      'Regional Banking Manager',
      'VP / Zonal Head (BFSI)',
    ],
  },
  operations: {
    id: 'operations',
    name: 'Operations',
    roles: [
      'Operations Executive',
      'Operations Analyst',
      'Operations Manager',
      'Process Improvement Manager',
      'Business Operations Manager',
      'Senior Operations Manager',
      'Operations Strategy Manager',
      'Operations Director',
      'VP Operations',
      'Chief Operating Officer (COO)',
    ],
  },
  data_science: {
    id: 'data_science',
    name: 'Data Science',
    roles: [
      'Data Analyst',
      'Junior Data Scientist',
      'Data Scientist',
      'Senior Data Scientist',
      'Lead Data Scientist',
      'Data Science Manager',
      'Head of Data Science',
    ],
  },
  business_analytics: {
    id: 'business_analytics',
    name: 'Business Analytics',
    roles: [
      'Business Analyst',
      'Senior Business Analyst',
      'Analytics Manager',
      'Senior Analytics Manager',
      'Director of Analytics',
      'VP Analytics',
    ],
  },
  hr: {
    id: 'hr',
    name: 'HR',
    roles: [
      'HR Executive',
      'HR Generalist',
      'HR Business Partner',
      'Senior HR Business Partner',
      'HR Manager',
      'Senior HR Manager',
      'HR Director',
      'Chief Human Resources Officer',
    ],
  },
  consulting: {
    id: 'consulting',
    name: 'Consulting',
    roles: [
      'Business Analyst (Consulting)',
      'Associate Consultant',
      'Consultant',
      'Senior Consultant',
      'Manager',
      'Senior Manager',
      'Principal',
      'Partner',
    ],
  },
  ui_ux: {
    id: 'ui_ux',
    name: 'UI/UX',
    roles: [
      'UI Designer',
      'UX Designer',
      'Product Designer',
      'Senior Product Designer',
      'Design Lead',
      'Design Manager',
      'Head of Design',
    ],
  },
  cloud_devops: {
    id: 'cloud_devops',
    name: 'Cloud & DevOps',
    roles: [
      'DevOps Engineer',
      'Cloud Engineer',
      'Senior DevOps Engineer',
      'Site Reliability Engineer (SRE)',
      'Cloud Architect',
      'DevOps Manager',
      'Head of Cloud & DevOps',
    ],
  },
  project_management: {
    id: 'project_management',
    name: 'Project Management',
    roles: [
      'Project Coordinator',
      'Scrum Master',
      'Project Manager',
      'Senior Project Manager',
      'Program Manager',
      'Director of Program Management',
      'VP Program Management',
    ],
  },
  customer_success: {
    id: 'customer_success',
    name: 'Customer Success',
    roles: [
      'Customer Support Executive',
      'Customer Success Associate',
      'Customer Success Manager',
      'Senior Customer Success Manager',
      'Director of Customer Success',
      'VP Customer Success',
    ],
  },
}

/** Category name → curated ladder id when JSON order is flat / cross-level. */
export const CATEGORY_TO_CURATED = {
  Product: 'product',
  'Software Development': 'software_engineering',
  IT: 'software_engineering',
  Marketing: 'marketing',
  Sales: 'sales',
  'Digital Marketing': 'marketing',
  Finance: 'finance',
  'Banking & Insurance': 'banking_insurance',
  Operations: 'operations',
  'Supply Chain Management': 'operations',
  'Data Science': 'data_science',
  'Business Analytics': 'business_analytics',
  'AI & ML': 'data_science',
  HR: 'hr',
  'Human Resources': 'hr',
  Consulting: 'consulting',
  Strategy: 'consulting',
  'UI/UX': 'ui_ux',
  'Cloud & DevOps': 'cloud_devops',
  Cybersecurity: 'cloud_devops',
  'Project Management': 'project_management',
  'Customer Success': 'customer_success',
  Education: 'operations',
  'Hospitality Management': 'operations',
  'Risk Management': 'finance',
  'Legal & Compliance': 'finance',
  Other: 'sales',
}

function flattenCategories(nodes, out = []) {
  if (!nodes) return out
  for (const node of nodes) {
    if (!node || typeof node !== 'object') continue
    if (Array.isArray(node.categories)) flattenCategories(node.categories, out)
    if (node.name && Array.isArray(node.roles)) {
      out.push({ name: String(node.name).trim(), roles: node.roles })
    }
  }
  return out
}

function sortRolesByLevel(roles) {
  return [...roles].sort((a, b) => {
    const ra = LEVEL_RANK[a.level] ?? 2
    const rb = LEVEL_RANK[b.level] ?? 2
    if (ra !== rb) return ra - rb
    const ta = a.timeline?.traditional ?? 5
    const tb = b.timeline?.traditional ?? 5
    return ta - tb
  })
}

/** @type {Map<string, CareerLadder>} */
let categoryLaddersCache = null

/** @returns {Map<string, CareerLadder>} */
export function getCategoryLaddersFromMapping() {
  if (categoryLaddersCache) return categoryLaddersCache
  categoryLaddersCache = new Map()
  const cats = flattenCategories(mappingDoc.categories)
  for (const cat of cats) {
    const sorted = sortRolesByLevel(cat.roles)
    categoryLaddersCache.set(cat.name, {
      id: cat.name.toLowerCase().replace(/\s+/g, '_'),
      name: cat.name,
      roles: sorted.map((r) => String(r.title || '').trim()).filter(Boolean),
      meta: sorted,
    })
  }
  return categoryLaddersCache
}

/** @returns {CareerLadder[]} */
export function getAllLadders() {
  const curated = Object.values(CURATED_LADDERS)
  const fromJson = [...getCategoryLaddersFromMapping().values()]
  return [...curated, ...fromJson]
}

/**
 * Prefer curated ladder for category when available; else JSON-sorted titles.
 * @param {string} [categoryName]
 * @returns {CareerLadder | null}
 */
function uniqueRoleTitles(roles) {
  const seen = new Set()
  const out = []
  for (const r of roles) {
    const t = String(r || '').trim()
    const k = t.toLowerCase()
    if (!k || seen.has(k)) continue
    seen.add(k)
    out.push(t)
  }
  return out
}

export function getLadderForCategory(categoryName) {
  const name = String(categoryName || '').trim()
  if (!name) return null
  const jsonLad = getCategoryLaddersFromMapping().get(name)
  const curatedId = CATEGORY_TO_CURATED[name]
  const curated = curatedId ? CURATED_LADDERS[curatedId] : null

  if (curated && jsonLad) {
    return {
      id: curated.id,
      name,
      roles: uniqueRoleTitles([...curated.roles, ...jsonLad.roles]),
      meta: jsonLad.meta,
    }
  }
  if (curated) return { ...curated, name }
  return jsonLad || null
}

/**
 * @param {string} targetRole
 * @returns {string}
 */
export function extractRoleStem(targetRole) {
  const t = String(targetRole || '').trim()
  const drop = [
    'manager',
    'director',
    'head',
    'lead',
    'executive',
    'analyst',
    'specialist',
    'associate',
    'senior',
    'principal',
    'vp',
    'chief',
    'officer',
    'engineer',
    'developer',
    'consultant',
    'coordinator',
    'administrator',
  ]
  let words = t
    .replace(/[()]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
  words = words.filter((w) => !drop.includes(w.toLowerCase()))
  if (!words.length) return t.split(/\s+/)[0] || 'Professional'
  return words.slice(0, 2).join(' ')
}

/**
 * Synthetic ladder when roles are not in catalog — keeps title family consistent.
 * @param {string} stem
 * @param {string} targetRole
 * @param {number} steps
 * @returns {string[]}
 */
export function buildStemLadder(stem, targetRole, steps = 8) {
  const target = String(targetRole || '').trim()
  const tierLabels = stemTiersForTarget(targetRole).map((t) => t.label)
  const out = tierLabels.slice(0, Math.max(steps - 1, 1)).map((tier) => `${stem} ${tier}`)
  if (!out.some((r) => r.toLowerCase() === target.toLowerCase())) out.push(target)
  return [...new Set(out)]
}

export { LEVEL_RANK }
