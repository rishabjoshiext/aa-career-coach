/**
 * Curated role titles per functional area (shortlists for combobox + typeahead).
 * "Other (describe in role)" is always available as a catch-all.
 */
export const ROLE_OTHER = 'Other (describe in role)'

const BASE = ['Analyst', 'Associate', 'Executive', 'Specialist', 'Team Lead', 'Manager']

export const ROLES_BY_FUNCTIONAL_AREA = {
  Finance: ['Financial Analyst', 'FP&A Analyst', 'Management Accountant', 'Treasury Associate', 'Finance Controller', 'Audit Associate', ROLE_OTHER],
  HR: ['HR Executive', 'Talent Acquisition Specialist', 'HRBP', 'L&D Coordinator', 'Payroll Analyst', 'People Ops Associate', ROLE_OTHER],
  Marketing: ['Marketing Executive', 'Growth Associate', 'Brand Manager', 'Performance Marketing Analyst', 'Content Strategist', 'Digital Marketing Specialist', ROLE_OTHER],
  Sales: ['Sales Executive', 'Account Manager', 'BDR', 'SDR', 'Inside Sales', 'Key Account Manager', ROLE_OTHER],
  Operations: ['Operations Executive', 'Process Associate', 'Supply Planner', 'Vendor Manager', 'Ops Analyst', 'Service Delivery Lead', ROLE_OTHER],
  IT: ['Software Engineer', 'IT Support Engineer', 'Systems Analyst', 'QA Engineer', 'DevOps Engineer', 'Business Analyst (IT)', ROLE_OTHER],
  Product: ['Associate PM', 'Product Analyst', 'UX Researcher', 'Technical PM', 'Product Owner', 'Growth PM', ROLE_OTHER],
  Strategy: ['Strategy Associate', 'Corporate Strategy Analyst', 'BizOps Analyst', 'Chief of Staff', 'Market Research Analyst', ROLE_OTHER],
  SCM: ['Procurement Analyst', 'Logistics Coordinator', 'Demand Planner', 'Warehouse Supervisor', 'Import/Export Executive', ROLE_OTHER],
  'Customer Success': ['CS Associate', 'Onboarding Specialist', 'CSM', 'Renewals Manager', 'Support Lead', 'Implementation Consultant', ROLE_OTHER],
  'Business Analytics': ['BI Analyst', 'Reporting Analyst', 'Data Analyst', 'Insights Analyst', 'Metrics Analyst', ROLE_OTHER],
  Consulting: ['Consulting Analyst', 'Associate Consultant', 'Research Associate', 'Transformation Analyst', ROLE_OTHER],
  'Data Science': ['Junior Data Scientist', 'ML Engineer', 'Analytics Engineer', 'Data Science Associate', ROLE_OTHER],
  'AI & ML': ['ML Engineer', 'Applied Scientist', 'AI Product Engineer', 'NLP Engineer', ROLE_OTHER],
  'Digital Marketing': ['SEO Specialist', 'SEM Analyst', 'Social Media Manager', 'Performance Marketer', ROLE_OTHER],
  'E-commerce': ['Catalog Manager', 'E-commerce Executive', 'Marketplace Ops', 'Merchandising Analyst', ROLE_OTHER],
  'Healthcare Management': ['Hospital Ops Executive', 'Healthcare Analyst', 'Quality Coordinator', 'Admin Manager (Healthcare)', ROLE_OTHER],
  'Banking & Insurance': ['Relationship Manager', 'Credit Analyst', 'KYC Analyst', 'Insurance Advisor', 'Branch Operations', ROLE_OTHER],
  'Project Management': ['Project Coordinator', 'Scrum Master', 'PMO Analyst', 'Technical Project Manager', ROLE_OTHER],
  Entrepreneurship: ['Founder’s Office', 'Startup Ops', 'Venture Analyst', 'Growth Hacker', ROLE_OTHER],
  'General Management': ['Management Trainee', 'Chief of Staff', 'Business Manager', 'GM Office', ROLE_OTHER],
  'Quality Management': ['QA Engineer', 'Quality Analyst', 'ISO Coordinator', 'Process Quality Lead', ROLE_OTHER],
  'Retail Management': ['Store Manager', 'Retail Ops Manager', 'Category Manager', 'Area Sales Manager', ROLE_OTHER],
  'International Business': ['Export Executive', 'Trade Compliance Analyst', 'IB Sales', ROLE_OTHER],
  'Business Development': ['BD Executive', 'Partnerships Associate', 'Alliance Manager', 'Pre-Sales Consultant', ROLE_OTHER],
  'Legal & Compliance': ['Legal Associate', 'Compliance Analyst', 'Contract Manager', 'Paralegal', ROLE_OTHER],
  'Risk Management': ['Risk Analyst', 'Credit Risk Associate', 'Operational Risk', 'Fraud Analyst', ROLE_OTHER],
  'Sustainability & ESG': ['ESG Analyst', 'Sustainability Coordinator', 'Climate Risk Analyst', ROLE_OTHER],
  'UI/UX': ['UI Designer', 'UX Designer', 'Product Designer', 'UX Researcher', ROLE_OTHER],
  Cybersecurity: ['Security Analyst', 'SOC Analyst', 'GRC Analyst', 'AppSec Engineer', ROLE_OTHER],
  'Cloud & DevOps': ['Cloud Engineer', 'DevOps Engineer', 'SRE', 'Platform Engineer', ROLE_OTHER],
  Other: ['Generalist', 'Operations Associate', 'Executive Assistant', 'Office Manager', ROLE_OTHER],
}

export function rolesForFunctionalArea(func) {
  const key = String(func || '').trim()
  if (!key) return []
  const list = ROLES_BY_FUNCTIONAL_AREA[key]
  if (list?.length) return list
  return [...BASE, ROLE_OTHER]
}
