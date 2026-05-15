/**
 * Hardcoded employers, industries, and role titles for Frame 1 work experience (search / dropdowns).
 */
import { ROLES_BY_FUNCTIONAL_AREA, ROLE_OTHER } from './rolesByFunctionalArea.js'

const EXTRA_ROLES = [
  'Graduate Trainee',
  'Management Trainee',
  'Intern',
  'Senior Executive',
  'Assistant Manager',
  'Deputy Manager',
  'Zonal Manager',
  'Regional Head',
  'Chief of Staff',
  'Office Administrator',
  'Executive Assistant',
  'Back-office Analyst',
  'KPO Analyst',
  'Research Associate',
  'Policy Analyst',
  'Credit Manager',
  'Branch Head',
  'Store Operations Lead',
  'Plant Supervisor',
  'QA Lead',
  'Scrum Master',
  'Delivery Manager',
  'Engagement Manager',
  'Practice Lead',
  'Enterprise Architect',
  'Data Engineer',
  'Full Stack Developer',
  'Frontend Developer',
  'Backend Developer',
  'Mobile Developer',
  'Site Reliability Engineer',
  'Customer Support Lead',
  'Inside Sales Representative',
  'Key Account Executive',
  'Merchandiser',
  'Visual Merchandiser',
  'HR Generalist',
  'Talent Partner',
  'L&D Executive',
  'Payroll Specialist',
  'Finance Controller',
  'Tax Manager',
  'Internal Auditor',
  // Junior / tier-2–3 city common titles
  'Office Boy / Peon',
  'Office Assistant',
  'Record Clerk',
  'Data Entry Operator (DEO)',
  'Computer Operator',
  'Typist',
  'Receptionist',
  'Telecaller / BPO Executive',
  'Customer Care Executive',
  'Helpdesk Executive',
  'Field Boy',
  'Delivery Boy / Rider',
  'Warehouse Helper',
  'Packer',
  'Loader',
  'Security Guard (Industrial)',
  'Housekeeping Supervisor',
  'Pantry Boy',
  'DTP Operator',
  'Cashier',
  'Billing Executive',
  'Counter Sales Executive',
  'Shop Floor Assistant',
  'Retail Sales Associate',
  'Showroom Sales Executive',
  'Distributor Salesman',
  'Route Salesman',
  'Medical Representative (MR)',
  'Pharmacy Assistant',
  'Lab Assistant',
  'Nursing Assistant',
  'ASHA / Community Health Worker',
  'Anganwadi Worker',
  'Panchayat Secretary Assistant',
  'Ration Shop Operator',
  'Agriculture Field Assistant',
  'Mandi Clerk',
  'Cold Storage Operator',
  'Tailor / Stitching Unit Worker',
  'Beautician Assistant',
  'Salon Trainee',
  'Hotel Front Office Assistant',
  'Housekeeping Room Boy',
  'Kitchen Helper / Commis',
  'Waiter / Steward',
  'Travel Desk Assistant',
  'Ticket Booking Agent',
  'Real Estate Broker Assistant',
  'Site Supervisor (Civil)',
  'Junior Surveyor',
  'Auto Mechanic Helper',
  'Electrician Helper',
  'AC Technician Trainee',
  'CNC Operator Trainee',
  'Machine Operator',
  'Quality Checker',
  'Production Helper',
  'Assembly Line Operator',
  'Store Keeper Assistant',
  'Dispatch Clerk',
  'Purchase Assistant',
  'Accounts Assistant',
  'Tally Operator',
  'GST Return Filer (Junior)',
  'Banking Correspondent (BC) Agent',
  'Collection Agent',
  'Loan Processing Assistant',
  'Insurance POSP',
  'Mutual Fund Distributor (Junior)',
  'GST Billing Clerk',
  'School Clerk',
  'Tuition Centre Coordinator',
  'Computer Institute Faculty (Basic)',
  'Librarian Assistant',
  'Data Annotation Associate',
  'Content Moderator (Junior)',
  'Social Media Executive (Junior)',
  'Digital Marketing Trainee',
  'SEO Trainee',
  'Telesales Executive',
  'Lead Generation Executive',
  'Field Marketing Promoter',
  'Brand Promoter',
  'MIS Executive (Junior)',
  'Excel Reporting Assistant',
]

/** @type {string[]} */
export const WORK_EMPLOYERS = [
  ...new Set([
    'Google',
    'Microsoft',
    'Amazon',
    'Meta',
    'Apple',
    'Goldman Sachs',
    'JP Morgan',
    'Morgan Stanley',
    'HDFC Bank',
    'ICICI Bank',
    'Axis Bank',
    'Kotak Mahindra Bank',
    'Yes Bank',
    'IndusInd Bank',
    'SBI',
    'PNB',
    'Bank of Baroda',
    'TCS',
    'Infosys',
    'Wipro',
    'HCL Technologies',
    'Tech Mahindra',
    'Cognizant',
    'Accenture',
    'Capgemini',
    'Deloitte',
    'EY',
    'KPMG',
    'PwC',
    'McKinsey & Company',
    'BCG',
    'Bain & Company',
    'Genpact',
    'EXL Service',
    'WNS Global',
    'Mphasis',
    'LTIMindtree',
    'Mindtree',
    'Larsen & Toubro',
    'Reliance Industries',
    'Adani Group',
    'Tata Group',
    'Mahindra & Mahindra',
    'Maruti Suzuki',
    'Hyundai Motor India',
    'Samsung India',
    'LG Electronics India',
    'HUL',
    'ITC Limited',
    'Nestlé India',
    'Britannia Industries',
    'Dabur India',
    'Asian Paints',
    'Berger Paints',
    'Pidilite Industries',
    'Zomato',
    'Swiggy',
    'Flipkart',
    'Myntra',
    'Nykaa',
    'Razorpay',
    'PhonePe',
    'Paytm',
    'Ola',
    'Uber',
    'Apna',
    'Apna Advantage',
    'Naukri',
    'LinkedIn',
    'X',
    'Twitter',
    'Facebook',
    'Instagram',
    'YouTube',
    'Goldman Sachs',
    'JP Morgan',
    'HDFC Bank',
    'Axis Bank',
    'Kotak Mahindra Bank',
    'Yes Bank',
    'IndusInd Bank',
    'SBI',
    'PNB',
    'Bank of Baroda',
    'ICICI Bank',
    'MakeMyTrip',
    'IndiGo',
    'Air India',
    'Dr. Reddy’s Laboratories',
    'Sun Pharmaceutical',
    'Cipla',
    'Biocon',
    'Apollo Hospitals',
    'Max Healthcare',
    'Fortis Healthcare',
    'Practo',
    'PharmEasy',
    '1mg',
    'BYJU’S',
    'Unacademy',
    'Vedantu',
    'UpGrad',
    'Freshworks',
    'Zoho Corporation',
    'Postman',
    'CRED',
    'Groww',
    'Zerodha',
    'NSE',
    'BSE',
    'NPCI',
    'Ather Energy',
    'Ola Electric',
    'Bosch India',
    'Siemens India',
    'ABB India',
    'Schneider Electric India',
    'Johnson & Johnson India',
    'P&G India',
    'Coca-Cola India',
    'PepsiCo India',
    'Starbucks India',
    'Titan Company',
    'Lenskart',
    'Boat',
    'Mamaearth',
    'Wakefit',
    'NoBroker',
    'Housing.com',
    'Square Yards',
    'JLL India',
    'CBRE India',
    'Self-employed / Freelance',
    'Early-stage startup (1–50)',
    'Growth-stage startup',
    'Other (type to search)',
  ]),
].sort((a, b) => a.localeCompare(b))

export function searchWorkEmployers(query, limit = 28) {
  const q = String(query || '')
    .trim()
    .toLowerCase()
  if (!q) return WORK_EMPLOYERS.slice(0, limit)
  return WORK_EMPLOYERS.filter((c) => c.toLowerCase().includes(q)).slice(0, limit)
}

export const WORK_INDUSTRIES = [
  'BFSI & Fintech',
  'IT Services & Consulting',
  'Software / SaaS Product',
  'E-commerce & Internet',
  'FMCG & Consumer Goods',
  'Retail & QSR',
  'Healthcare & Pharma',
  'Manufacturing & Industrial',
  'Automotive & EV',
  'Energy & Infrastructure',
  'Telecom & Media',
  'Education & EdTech',
  'Real Estate & PropTech',
  'Logistics & Supply Chain',
  'Hospitality & Travel',
  'Agri & Food processing',
  'Public Sector / PSU',
  'NGO / Development sector',
  'Professional services (non-IT)',
  'Other',
]

export function functionalAreaFromIndustry(industry) {
  const t = String(industry || '').trim()
  if (!t || t === 'Other') return 'General Management'
  if (/BFSI|Fintech/i.test(t)) return 'Banking & Insurance'
  if (/IT Services|Software|SaaS/i.test(t)) return 'IT'
  if (/E-commerce|Internet/i.test(t)) return 'E-commerce'
  if (/FMCG|Consumer|Retail|QSR/i.test(t)) return 'Retail Management'
  if (/Healthcare|Pharma/i.test(t)) return 'Healthcare Management'
  if (/Manufacturing|Industrial|Automotive|EV|Energy|Infrastructure/i.test(t)) return 'Operations'
  if (/Telecom|Media/i.test(t)) return 'Marketing'
  if (/Education|EdTech/i.test(t)) return 'General Management'
  if (/Real Estate|PropTech/i.test(t)) return 'Sales'
  if (/Logistics|Supply Chain/i.test(t)) return 'SCM'
  if (/Hospitality|Travel/i.test(t)) return 'Operations'
  if (/Agri|Food processing/i.test(t)) return 'Operations'
  if (/Public Sector|PSU/i.test(t)) return 'General Management'
  if (/NGO|Development/i.test(t)) return 'General Management'
  if (/Professional services/i.test(t)) return 'Consulting'
  return 'General Management'
}

export function searchIndustries(query, limit = 24) {
  const q = String(query || '')
    .trim()
    .toLowerCase()
  if (!q) return WORK_INDUSTRIES
  const m = WORK_INDUSTRIES.filter((o) => o.toLowerCase().includes(q))
  return m.length ? m : WORK_INDUSTRIES
}

/** True when value matches a curated industry option (case-insensitive). */
export function isListedIndustry(value) {
  const t = String(value ?? '')
    .trim()
    .toLowerCase()
  if (!t) return false
  return WORK_INDUSTRIES.some((o) => o.toLowerCase() === t)
}

function flattenRoleTitles() {
  const set = new Set()
  for (const arr of Object.values(ROLES_BY_FUNCTIONAL_AREA)) {
    for (const r of arr) {
      if (r && r !== ROLE_OTHER) set.add(r)
    }
  }
  for (const r of EXTRA_ROLES) set.add(r)
  set.add(ROLE_OTHER)
  return [...set].sort((a, b) => a.localeCompare(b))
}

export const ALL_WORK_ROLE_TITLES = flattenRoleTitles()

export function searchWorkRoles(query, limit = 40) {
  const q = String(query || '')
    .trim()
    .toLowerCase()
  if (!q) return ALL_WORK_ROLE_TITLES.slice(0, limit)
  return ALL_WORK_ROLE_TITLES.filter((r) => r.toLowerCase().includes(q)).slice(0, limit)
}

export function expBandFromTotalMonths(totalMonths) {
  const t = Math.max(0, Math.floor(Number(totalMonths) || 0))
  if (t <= 0) return '0-1'
  if (t < 12) return '0-1'
  if (t < 36) return '1-3'
  if (t < 72) return '3-6'
  return '6+'
}
