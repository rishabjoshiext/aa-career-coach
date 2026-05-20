/**
 * Allowed function areas for Potential Career Destinations (Frame 2).
 * Frame 1 roles / industries must resolve into one of these before showing cards.
 */

export const ALLOWED_CAREER_AREAS = [
  'Product',
  'IT',
  'Software Development',
  'Operations',
  'Supply Chain Management',
  'Marketing',
  'Data Science',
  'Business Analytics',
  'Customer Success',
  'HR',
  'Finance',
  'Banking & Insurance',
  'Project Management',
  'Healthcare Management',
  'Retail Management',
  'E-commerce',
  'Digital Marketing',
  'Education',
  'Education & Teaching',
  'Academic Research',
  'Content & Creative Writing',
  'Journalism & Media',
  'Psychology & Counselling',
  'Sociology & Social Work',
  'Economics & Research',
  'Fine Arts & Design',
  'Music & Performing Arts',
  'Public Relations & Comms',
  'Hospitality Management',
  'Strategy',
  'Consulting',
  'Human Resources',
  'UI/UX',
  'AI & ML',
  'Cloud & DevOps',
  'Cybersecurity',
  'Risk Management',
  'Legal & Compliance',
  'Other',
]

export const CAREER_AREA_ID_SET = new Set(ALLOWED_CAREER_AREAS)

/** Frame 1 `s.func` / rolesByFunctionalArea keys → destination area (JSON-backed where possible). */
export const FRAME1_FUNC_TO_CAREER_AREA = {
  Finance: 'Finance',
  HR: 'HR',
  Marketing: 'Marketing',
  Sales: 'Other',
  Operations: 'Operations',
  IT: 'IT',
  Product: 'Product',
  Strategy: 'Strategy',
  SCM: 'Supply Chain Management',
  'Customer Success': 'Customer Success',
  'Business Analytics': 'Business Analytics',
  Consulting: 'Consulting',
  'Data Science': 'Data Science',
  'AI & ML': 'AI & ML',
  'Digital Marketing': 'Digital Marketing',
  'E-commerce': 'Marketing',
  'Healthcare Management': 'Operations',
  'Banking & Insurance': 'Banking & Insurance',
  'Project Management': 'Project Management',
  Entrepreneurship: 'Strategy',
  'General Management': 'Strategy',
  'Quality Management': 'Operations',
  'Retail Management': 'Operations',
  'International Business': 'Operations',
  'Business Development': 'Marketing',
  'Legal & Compliance': 'Legal & Compliance',
  'Risk Management': 'Risk Management',
  'Sustainability & ESG': 'Other',
  'UI/UX': 'UI/UX',
  Cybersecurity: 'Cybersecurity',
  'Cloud & DevOps': 'Cloud & DevOps',
  'Education & Teaching': 'Education & Teaching',
  'Academic Research': 'Academic Research',
  'Content & Creative Writing': 'Content & Creative Writing',
  'Journalism & Media': 'Journalism & Media',
  'Psychology & Counselling': 'Psychology & Counselling',
  'Sociology & Social Work': 'Sociology & Social Work',
  'Economics & Research': 'Economics & Research',
  'Fine Arts & Design': 'Fine Arts & Design',
  'Music & Performing Arts': 'Music & Performing Arts',
  'Public Relations & Comms': 'Public Relations & Comms',
  Other: 'Other',
}

/** Legacy fasttrack / inference ids → allowed career area. */
export const LEGACY_TO_CAREER_AREA = {
  SCM: 'Supply Chain Management',
  Sales: 'Other',
  'E-commerce': 'Marketing',
  'Healthcare Management': 'Operations',
  'Retail Management': 'Operations',
  'Digital Marketing': 'Digital Marketing',
  'Human Resources': 'Human Resources',
  'Banking & Insurance': 'Banking & Insurance',
  'Project Management': 'Project Management',
  'Hospitality Management': 'Hospitality Management',
  'Software Development': 'Software Development',
  'Supply Chain Management': 'Supply Chain Management',
  'Business Analytics': 'Business Analytics',
  'Customer Success': 'Customer Success',
  'Data Science': 'Data Science',
  'AI & ML': 'AI & ML',
  'Cloud & DevOps': 'Cloud & DevOps',
  Cybersecurity: 'Cybersecurity',
  'Risk Management': 'Risk Management',
  'Legal & Compliance': 'Legal & Compliance',
  'Sustainability & ESG': 'Other',
  Consulting: 'Consulting',
  Strategy: 'Strategy',
  Education: 'Education',
  'Education & Teaching': 'Education & Teaching',
  'Academic Research': 'Academic Research',
  'Content & Creative Writing': 'Content & Creative Writing',
  'Journalism & Media': 'Journalism & Media',
  'Psychology & Counselling': 'Psychology & Counselling',
  'Sociology & Social Work': 'Sociology & Social Work',
  'Economics & Research': 'Economics & Research',
  'Fine Arts & Design': 'Fine Arts & Design',
  'Music & Performing Arts': 'Music & Performing Arts',
  'Public Relations & Comms': 'Public Relations & Comms',
  Product: 'Product',
  IT: 'IT',
  Finance: 'Finance',
  HR: 'HR',
  Marketing: 'Marketing',
  Operations: 'Operations',
  'UI/UX': 'UI/UX',
  Other: 'Other',
}

/**
 * @param {string | null | undefined} raw
 * @returns {string | null}
 */
export function clampToCareerArea(raw) {
  const t = String(raw || '').trim()
  if (!t) return null
  if (CAREER_AREA_ID_SET.has(t)) return t
  if (FRAME1_FUNC_TO_CAREER_AREA[t]) return FRAME1_FUNC_TO_CAREER_AREA[t]
  if (LEGACY_TO_CAREER_AREA[t]) return LEGACY_TO_CAREER_AREA[t]
  return null
}

const TEXT_RULES = [
  { id: 'Banking & Insurance', keys: ['nbfc', 'insurance', 'actuar', 'underwrit', 'relationship manager (bank'] },
  { id: 'Finance', keys: ['financ', 'account', 'audit', 'fp&a', 'treasury', 'tax ', 'cfo', 'controller'] },
  { id: 'Human Resources', keys: ['human resources', 'hrbp', 'talent management', 'organizational development'] },
  { id: 'HR', keys: ['hr ', 'human', 'people', 'talent', 'payroll', 'recruit', 'l&d', 'learning', 'compensation', 'benefits'] },
  { id: 'Digital Marketing', keys: ['digital marketing', 'sem ', 'ppc', 'seo', 'affiliate', 'email marketing', 'social media manager'] },
  {
    id: 'Other',
    keys: [
      'sales executive',
      'sales manager',
      'area sales',
      'regional sales',
      'inside sales',
      'field sales',
      ' bdr',
      ' sdr',
      'business development',
      'account executive',
      'key account manager',
      'territory sales',
      'pre-sales',
      'presales',
      'telesales',
      'channel sales',
      'sales consultant',
      'sales representative',
    ],
  },
  { id: 'Marketing', keys: ['marketing', 'brand', 'growth marketing', 'performance marketing', 'content marketing', 'marketing manager'] },
  { id: 'Supply Chain Management', keys: ['supply chain', 'logistics', 'scm', 'procurement', 'warehouse', 'fulfillment'] },
  {
    id: 'Software Development',
    keys: [
      'software developer',
      'software engineer',
      'software dev',
      'full stack',
      'fullstack',
      'frontend',
      'backend',
      'sde ',
      ' sde',
      'sde i',
      'sde ii',
      'sdet',
      'programmer',
      'mobile developer',
      'android developer',
      'ios developer',
      'web developer',
      'java developer',
      'python developer',
      'react ',
      'node.js',
    ],
  },
  { id: 'Project Management', keys: ['project manager', 'scrum master', 'pmo', 'program manager', 'agile coach'] },
  { id: 'Product', keys: ['product manager', 'product owner', 'apm', 'cpo', 'head of product', 'group product', 'product lead'] },
  { id: 'Operations', keys: ['operations manager', 'operations executive', 'process excellence', 'vendor operations', 'plant manager', 'manufacturing'] },
  { id: 'Business Analytics', keys: ['data analyst', 'business analyst', 'bi developer', 'reporting analyst', 'mis ', 'tableau', 'powerbi'] },
  { id: 'Data Science', keys: ['data scientist', 'data science', 'analytics engineer', 'nlp', 'computer vision'] },
  { id: 'AI & ML', keys: ['ai engineer', 'ml engineer', 'genai', 'llm', 'deep learning', 'applied scientist'] },
  { id: 'Cloud & DevOps', keys: ['devops', 'sre', 'cloud architect', 'platform engineer', 'kubernetes', 'terraform'] },
  { id: 'Cybersecurity', keys: ['cybersecurity', 'security analyst', 'pen test', 'ciso', 'soc '] },
  { id: 'IT', keys: ['it support', 'systems admin', 'network engineer', 'helpdesk', 'infrastructure'] },
  { id: 'Customer Success', keys: ['customer success', 'csm', 'client success', 'implementation consultant', 'renewal'] },
  { id: 'Consulting', keys: ['consultant', 'consulting', 'advisory', 'management consulting'] },
  { id: 'Strategy', keys: ['strategy', 'corporate strategy', 'chief of staff', 'bizops'] },
  { id: 'UI/UX', keys: ['ui/ux', 'ux designer', 'ui designer', 'product designer', 'ux researcher'] },
  {
    id: 'Education & Teaching',
    keys: [
      'school teacher',
      'primary teacher',
      'secondary teacher',
      'teaching assistant',
      'tutor',
      'edtech faculty',
      'curriculum designer',
      'academic coordinator',
      'principal',
      'vice principal',
      'corporate trainer',
      'training manager',
    ],
  },
  {
    id: 'Academic Research',
    keys: ['research assistant', 'research scholar', 'research fellow', 'postdoctoral', 'postdoc', 'lab assistant', 'thesis', 'publication'],
  },
  {
    id: 'Content & Creative Writing',
    keys: ['content writer', 'copywriter', 'scriptwriter', 'creative writer', 'technical writer', 'editorial', 'ghostwriter', 'blogger'],
  },
  {
    id: 'Journalism & Media',
    keys: ['journalist', 'reporter', 'news anchor', 'photojournalist', 'broadcast', 'media producer', 'sub-editor', 'correspondent'],
  },
  {
    id: 'Psychology & Counselling',
    keys: ['psychologist', 'counsellor', 'counselor', 'therapist', 'mental health', 'clinical psych', 'school counsellor'],
  },
  {
    id: 'Sociology & Social Work',
    keys: ['social worker', 'ngo program', 'community development', 'sociologist', 'field officer (ngo)', 'livelihood'],
  },
  {
    id: 'Economics & Research',
    keys: ['economist', 'economic research', 'policy analyst', 'macro research', 'econometrics'],
  },
  {
    id: 'Fine Arts & Design',
    keys: ['fine artist', 'illustrator', 'animator', 'art director', 'visual artist', 'sculptor', 'gallery', 'fashion design'],
  },
  {
    id: 'Music & Performing Arts',
    keys: ['musician', 'music teacher', 'performing artist', 'choreographer', 'theatre', 'voice coach', 'sound engineer (music)'],
  },
  {
    id: 'Public Relations & Comms',
    keys: ['public relations', 'pr manager', 'communications manager', 'corporate communications', 'media relations', 'spokesperson'],
  },
  { id: 'Education', keys: ['professor', 'lecturer', 'dean', 'faculty'] },
  { id: 'Hospitality Management', keys: ['hotel', 'hospitality', 'f&b', 'front office', 'housekeeping manager'] },
  { id: 'Risk Management', keys: ['risk analyst', 'risk management', 'fraud analyst', 'grc'] },
  { id: 'Legal & Compliance', keys: ['legal', 'compliance', 'paralegal', 'company secretary', 'dpo'] },
  { id: 'Other', keys: ['other', 'generalist', 'administrator', 'executive assistant'] },
]

/**
 * Keyword inference → allowed career area (JSON-backed catalog).
 * @param {string} raw
 * @returns {string | null}
 */
export function inferCareerAreaFromText(raw) {
  const s = String(raw || '').toLowerCase()
  if (!s.trim()) return null
  for (const r of TEXT_RULES) {
    if (r.keys.some((k) => s.includes(k.trim()))) {
      const mapped = clampToCareerArea(r.id)
      if (mapped) return mapped
    }
  }
  return null
}
