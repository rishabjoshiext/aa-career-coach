/**
 * Hardcoded specialization options per UG / PG degree (each list ends with "Other").
 * Keep keys aligned with DEGREES_UG / DEGREES_PG in frame1Education.js.
 */

function withOther(specs) {
  const s = [...specs]
  if (!s.includes('Other')) s.push('Other')
  return s
}

/* ─── UG buckets ─── */
const UG_COMMERCE = withOther([
  'Financial Accounting',
  'Taxation & GST',
  'Auditing & Assurance',
  'Corporate Accounting',
  'Cost & Management Accounting',
  'Banking & Credit',
  'Insurance & Risk',
  'Investment & Securities',
  'Business Law & Compliance',
])

const UG_MANAGEMENT = withOther([
  'Marketing',
  'Human Resources',
  'Finance',
  'Operations & SCM',
  'Business Analytics',
  'Strategy & Consulting skills',
  'International Business',
  'Entrepreneurship & Start-ups',
])

const UG_ENGINEERING = withOther([
  'Computer Science / IT',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electrical Engineering',
  'Chemical / Process Engineering',
  'Instrumentation & Control',
  'Industrial / Production',
  'Aerospace / Automobile',
])

const UG_BSC_GENERAL = withOther([
  'Physics',
  'Chemistry',
  'Mathematics',
  'Life Sciences / Biology',
  'Environmental Science',
  'Statistics & Data Science',
  'Materials Science',
])

const UG_AGRI = withOther([
  'Agronomy & Crop Science',
  'Plant Breeding & Genetics',
  'Soil Science & Water Management',
  'Agribusiness & Marketing',
  'Animal Husbandry & Veterinary basics',
  'Horticulture & Floriculture',
  'Extension & Rural development',
])

const UG_ARTS = withOther([
  'Literature & Languages',
  'History & Culture',
  'Political Science & Public Policy',
  'Sociology & Social work foundations',
  'Psychology',
  'Philosophy',
  'Economics (Arts stream)',
])

const UG_LAW = withOther([
  'Criminal law & Criminology',
  'Corporate & Commercial law',
  'Constitutional & Administrative law',
  'IPR & Technology law',
  'Dispute resolution & Litigation',
  'Labour & Employment law',
])

const UG_MEDICAL_CLINICAL = withOther([
  'General Medicine orientation',
  'Surgery & allied surgical fields',
  'Paediatrics & Child health',
  'Obstetrics & Gynaecology',
  'Community & Public health',
  'Pathology & Laboratory medicine',
  'Radiology & Imaging',
  'Psychiatry & Mental health',
])

const UG_DENTAL = withOther([
  'Oral medicine & Diagnosis',
  'Conservative dentistry & Endodontics',
  'Prosthodontics & Crown-bridge',
  'Orthodontics',
  'Periodontics',
  'Oral surgery',
  'Community dentistry',
])

const UG_AYUSH = withOther([
  'Kayachikitsa / General practice',
  'Panchakarma & Spa therapy',
  'Dravyaguna / Pharmacology',
  'Shalya / Surgery (Ayurveda)',
  'Striroga & Prasuti',
  'Yoga therapy & Lifestyle',
])

const UG_UNANI = withOther([
  'Ilmul Advia (Pharmacy)',
  'Moalijat (General medicine)',
  'Jarahat (Surgery)',
  'Amraz-e Niswan',
  'Amraz-e Atfal',
])

const UG_PHYSIO = withOther([
  'Musculoskeletal & Sports',
  'Neurological rehabilitation',
  'Cardio-pulmonary rehab',
  'Community rehabilitation',
  'Paediatric physiotherapy',
  'Research & Academia',
])

const UG_NURSING = withOther([
  'Medical-surgical nursing',
  'Paediatric nursing',
  'Obstetric & midwifery',
  'Community health nursing',
  'Psychiatric nursing',
  'Critical care & ICU',
])

const UG_MLT = withOther([
  'Clinical biochemistry',
  'Haematology & Blood banking',
  'Microbiology & Serology',
  'Histopathology & Cytopathology',
  'Immunology',
])

const UG_PHARM = withOther([
  'Pharmaceutics & Formulation',
  'Pharmacology',
  'Pharmacognosy & Phytochemistry',
  'Pharmaceutical chemistry',
  'QA / QC & Regulatory affairs',
  'Clinical pharmacy & Hospital practice',
])

const UG_PHARMD = withOther([
  'Clinical pharmacy',
  'Hospital & Community practice',
  'Pharmacotherapeutics',
  'Drug information & Research',
  'Regulatory & Clinical trials support',
])

const UG_BCA_IT = withOther([
  'Software development',
  'Web & Mobile applications',
  'Databases & Backend systems',
  'Networking & Systems admin',
  'Cybersecurity basics',
  'Data structures & Algorithms',
])

const UG_DESIGN_VISUAL = withOther([
  'Graphic & Communication design',
  'UI / UX & Product design',
  'Interior & Spatial design',
  'Fashion & Textile design',
  'Animation & Motion graphics',
  'Industrial / Product form design',
])

const UG_JOURNALISM_MEDIA = withOther([
  'Print & Digital journalism',
  'Broadcast & AV production',
  'Advertising & Brand communication',
  'PR & Corporate communication',
  'Media research & Analytics',
  'Content & Social media',
])

const UG_ARCH = withOther([
  'Architectural design & Studios',
  'Urban design & Planning',
  'Landscape architecture',
  'Building services & Sustainability',
  'Heritage & Conservation',
])

const UG_HOSPITALITY = withOther([
  'Front office & Rooms division',
  'Food production & Kitchen',
  'Food & Beverage service',
  'Housekeeping & Facility ops',
  'Events & Banquets',
  'Revenue & Sales',
])

const UG_TOURISM = withOther([
  'Tour operations & Itinerary design',
  'Travel agency & Ticketing',
  'Destination marketing',
  'Airline & Airport services',
  'Sustainable & Adventure tourism',
])

const UG_EDUCATION = withOther([
  'Primary education pedagogy',
  'Secondary subject specialization',
  'Educational psychology',
  'ICT in education',
  'Inclusive & Special education',
])

const UG_SOCIAL_WORK = withOther([
  'Community development',
  'Medical & Psychiatric social work',
  'Child & Women welfare',
  'CSR & Livelihoods',
  'Criminology & Correctional services',
])

const UG_LIBRARY = withOther([
  'Academic & University libraries',
  'Digital libraries & Repositories',
  'Knowledge management',
  'Classification & Cataloguing',
])

const UG_ECONOMICS = withOther([
  'Microeconomics & Markets',
  'Macroeconomics & Policy',
  'Econometrics & Quant methods',
  'Development economics',
  'International trade & Finance',
])

const UG_AVIATION = withOther([
  'Flying / Pilot training track',
  'Airport & Ground operations',
  'Aviation safety & Security',
  'Air traffic & Navigation services',
  'Aircraft maintenance orientation',
])

const UG_VOC = withOther([
  'Sector-specific technical skills',
  'Industry apprenticeship track',
  'Applied lab & Workshop practice',
  'Employability & Soft skills',
])

const UG_BACHELOR_GENERIC = withOther([
  'Liberal arts & Interdisciplinary',
  'Sciences orientation',
  'Professional skills mix',
  'Undecided / Exploring',
])

const UG_NATUROPATHY = withOther([
  'Naturopathic diet & Nutrition',
  'Yoga therapy & Lifestyle medicine',
  'Manipulative therapies',
  'Hydrotherapy & Spa sciences',
  'Research in integrative health',
])

const UG_INTERIOR = withOther([
  'Residential interior design',
  'Commercial & Retail spaces',
  'Lighting & Material specification',
  '3D visualization & CAD',
])

const UG_SPORTS_ED = withOther([
  'Sports coaching & Training methodology',
  'Sports science & Biomechanics',
  'Sports management & Events',
  'Yoga & Fitness instruction',
  'Officiating & Rules',
])

const UG_OTHER = withOther([
  'Interdisciplinary',
  'Self-defined / Mixed field',
  'Career pathway not listed',
])

const ugPairs = [
  ...['B.Com', 'B.Com (Hons.)', 'BAF', 'BBE', 'Bachelor of Banking and Insurance', 'Bachelor of Financial Management'].map((d) => [
    d,
    UG_COMMERCE,
  ]),
  ...['BBA', 'BBA (Hons.)', 'BBM', 'BBM (Hons.)', 'BMS'].map((d) => [d, UG_MANAGEMENT]),
  ...['BE/BTech', 'BASc', 'B.FTech', 'Bachelor of Aircraft Maintenance Engineering', 'Dual Degree (BE/BTech + ME/ M.Tech)'].map((d) => [
    d,
    UG_ENGINEERING,
  ]),
  ...['B.Sc', 'B.Sc (Hons.)'].map((d) => [d, UG_BSC_GENERAL]),
  ...['Bachelor of Science in Agriculture', 'Bachelor of Agriculture', 'Bachelor of Rural Studies'].map((d) => [d, UG_AGRI]),
  ...['B.A', 'B.A (Hons.)'].map((d) => [d, UG_ARTS]),
  ...['LLB', 'LLB (Hons.)'].map((d) => [d, UG_LAW]),
  ...['MBBS'].map((d) => [d, UG_MEDICAL_CLINICAL]),
  ...['BDS'].map((d) => [d, UG_DENTAL]),
  ...['BAMS', 'BHMS'].map((d) => [d, UG_AYUSH]),
  ...['Bachelor of Unani Medicine and Surgery'].map((d) => [d, UG_UNANI]),
  ...['Bachelor of Physiotherapy'].map((d) => [d, UG_PHYSIO]),
  ...['Bachelor of Science in Nursing'].map((d) => [d, UG_NURSING]),
  ...['Bachelor of Medical Laboratory Technology'].map((d) => [d, UG_MLT]),
  ...['B.Pharm', 'B.Pharm (Hons.)'].map((d) => [d, UG_PHARM]),
  ...['Pharm.D'].map((d) => [d, UG_PHARMD]),
  ...['BCA'].map((d) => [d, UG_BCA_IT]),
  ...['B.Design', 'BFA', 'Bachelor of Visual Arts'].map((d) => [d, UG_DESIGN_VISUAL]),
  ...[
    'Bachelor of Arts in Journalism and Mass Communication',
    'Bachelor of Arts in Mass Media and Communication',
    'Bachelor of Journalism and Mass Communication',
    'Bachelor of Mass Media',
  ].map((d) => [d, UG_JOURNALISM_MEDIA]),
  ...['B.Arch'].map((d) => [d, UG_ARCH]),
  ...['BHM', 'Bachelor of Hotel Management and Catering Technology'].map((d) => [d, UG_HOSPITALITY]),
  ...['Bachelor of Tourism Studies', 'Bachelor of Travel and Tourism Management'].map((d) => [d, UG_TOURISM]),
  ...['B.Ed', 'Bachelor of Elementary Education'].map((d) => [d, UG_EDUCATION]),
  ...['Bachelor of Social Work'].map((d) => [d, UG_SOCIAL_WORK]),
  ...['Bachelor of Library and Information Science'].map((d) => [d, UG_LIBRARY]),
  ...['Bachelor of Economics'].map((d) => [d, UG_ECONOMICS]),
  ...['Bachelor of Aviation'].map((d) => [d, UG_AVIATION]),
  ...['Bachelor of Interior Design'].map((d) => [d, UG_INTERIOR]),
  ...['Bachelor of Physical Education', 'BPA'].map((d) => [d, UG_SPORTS_ED]),
  ...['Bachelor of Naturopathy and Yogic Sciences'].map((d) => [d, UG_NATUROPATHY]),
  ...['B.Voc'].map((d) => [d, UG_VOC]),
  ...['Bachelor'].map((d) => [d, UG_BACHELOR_GENERIC]),
  ...['Other'].map((d) => [d, UG_OTHER]),
]

/** @type {Record<string, string[]>} */
export const UG_DEGREE_TO_SPECIALIZATIONS = Object.fromEntries(ugPairs)

/* ─── PG buckets ─── */
const PG_MBA = withOther([
  'Finance & Corporate banking',
  'Marketing & Brand management',
  'HR & Talent management',
  'Operations & SCM',
  'Strategy & General management',
  'Business analytics & Data-driven decisions',
  'Consulting & Problem solving',
])

const PG_MTECH = withOther([
  'Structural / Civil advanced',
  'Thermal & Fluid systems',
  'Manufacturing & Automation',
  'VLSI & Embedded systems',
  'Communications & Signal processing',
  'Power systems & Energy',
  'Computer science & AI applications',
])

const PG_MCA = withOther([
  'Software engineering',
  'Data science & ML engineering',
  'Cloud & DevOps',
  'Cybersecurity',
  'Enterprise systems & ERP',
])

const PG_MCOM = withOther([
  'Advanced financial accounting',
  'Corporate finance & Valuation',
  'Tax policy & Research',
  'Banking & Risk management',
  'International finance',
])

const PG_MA_ARTS = withOther([
  'Literature & Cultural studies',
  'Political science & Governance',
  'Sociology & Development',
  'Psychology & Counselling',
  'Economics (PG research)',
])

const PG_LLM = withOther([
  'Corporate & M&A law',
  'IPR & Technology law',
  'Constitutional & Human rights',
  'Criminal justice & Criminology',
  'International law & Trade law',
])

const PG_MD = withOther([
  'General medicine',
  'Paediatrics',
  'Orthopaedics',
  'Radiology',
  'Pathology',
  'Psychiatry',
  'Community medicine',
])

const PG_MDS = withOther([
  'Oral & Maxillofacial surgery',
  'Prosthodontics',
  'Orthodontics',
  'Periodontics',
  'Conservative dentistry',
])

const PG_MPHARM = withOther([
  'Pharmaceutics & NDDS',
  'Pharmacology & Toxicology',
  'Pharmaceutical analysis',
  'Clinical research & Trials',
  'Regulatory affairs & QA',
])

const PG_MSC = withOther([
  'Pure sciences research',
  'Applied chemistry / Physics',
  'Biotechnology & Life sciences',
  'Environmental science',
  'Statistics & Data science',
])

const PG_MSW = withOther([
  'Clinical social work',
  'Community organisation',
  'CSR & Development projects',
  'Policy & Advocacy',
])

const PG_MHA_MH = withOther([
  'Hospital operations & Quality',
  'Health economics & Insurance',
  'Healthcare IT & Analytics',
  'Public health programme management',
])

const PG_MJMC = withOther([
  'Digital media & Journalism',
  'Strategic communication',
  'Media research & Audience insights',
  'Crisis & Corporate PR',
])

const PG_MLIB = withOther([
  'Digital libraries & Repositories',
  'Information architecture',
  'Research support & Scholarly comms',
])

const PG_MED = withOther([
  'Curriculum & Instructional design',
  'Educational leadership',
  'EdTech & Learning sciences',
  'Assessment & Evaluation',
])

const PG_MPA = withOther([
  'Public policy analysis',
  'Governance & Administration',
  'Urban & Local government',
  'Non-profit & Development sector',
])

const PG_MFA = withOther([
  'Studio practice & Fine arts',
  'Art direction & Visual narrative',
  'Curatorial studies',
])

const PG_MDES = withOther([
  'Product design strategy',
  'Service design',
  'Interaction & UX research',
])

const PG_MPHIL_PHD = withOther([
  'Thesis-defined specialization',
  'Interdisciplinary research',
  'Teaching & Academia track',
])

const PG_CA_CS_CMA = withOther([
  'Financial reporting & Ind AS',
  'Direct & Indirect taxation',
  'Audit & Assurance',
  'Corporate law & Compliance',
  'Cost & Management accounting',
  'Treasury & Risk',
])

const PG_DM_MCH = withOther([
  'Super-specialty clinical focus',
  'Academic & Research surgery',
  'Minimal access & Advanced procedures',
])

const PG_PGDM = PG_MBA

const PG_PGP = withOther([
  'General management immersion',
  'Leadership & Decision sciences',
  'Sector-specific management (e.g. Retail, BFSI)',
])

const PG_PG_DIP_BANK = withOther([
  'Retail & Branch banking',
  'Credit appraisal & Risk',
  'Treasury & Forex',
  'Digital banking & Payments',
])

const PG_M_TOURISM = withOther([
  'Destination management',
  'Hospitality strategy',
  'Sustainable tourism policy',
])

const PG_M_PSY = withOther([
  'Clinical psychology',
  'Organisational / IO psychology',
  'Counselling & Therapy',
  'Neuropsychology',
])

const PG_M_PT = withOther([
  'Neurological rehab',
  'Sports & Orthopaedic rehab',
  'Cardiopulmonary rehab',
])

const PG_M_MUS = withOther([
  'Performance specialization',
  'Composition & Arranging',
  'Musicology & Ethnomusicology',
])

const PG_M_PLAN = withOther([
  'Urban & Regional planning',
  'Transport & Infrastructure planning',
  'Environmental planning',
])

const PG_M_VOC = withOther(['Advanced sector skills', 'Industry project track'])

const PG_M_ARCH = withOther([
  'Urban design & Housing',
  'Sustainable architecture',
  'Landscape & Infrastructure',
])

const PG_MASTER_GENERIC = withOther([
  'Interdisciplinary PG',
  'Research-oriented track',
  'Professional practice mix',
])

const PG_OTHER = withOther([
  'Interdisciplinary',
  'Self-defined PG focus',
  'Not listed — describe in notes',
])

const pgPairs = [
  ...['MBA', 'MBA(executive)', 'Master of Management Studies'].map((d) => [d, PG_MBA]),
  ...['ME/M.Tech', 'Dual Degree (BE/BTech + ME/ M.Tech)'].map((d) => [d, PG_MTECH]),
  ...['MCA', 'Master of Computer Management'].map((d) => [d, PG_MCA]),
  ...['M.Com'].map((d) => [d, PG_MCOM]),
  ...['M.A', 'M.A (Hons.)'].map((d) => [d, PG_MA_ARTS]),
  ...['LLM'].map((d) => [d, PG_LLM]),
  ...['MD'].map((d) => [d, PG_MD]),
  ...['Master of Dental Surgery'].map((d) => [d, PG_MDS]),
  ...['M.Pharm'].map((d) => [d, PG_MPHARM]),
  ...['M.Sc'].map((d) => [d, PG_MSC]),
  ...['Master of Social Work'].map((d) => [d, PG_MSW]),
  ...['Master of Health Administration', 'Master of Hospital Administration'].map((d) => [d, PG_MHA_MH]),
  ...['Master of Journalism and Mass Communication'].map((d) => [d, PG_MJMC]),
  ...['Master of Library and Information Science', 'Master of Library Science'].map((d) => [d, PG_MLIB]),
  ...['M.Ed', 'Doctor of Education'].map((d) => [d, PG_MED]),
  ...['Master of Public Administration'].map((d) => [d, PG_MPA]),
  ...['MFA'].map((d) => [d, PG_MFA]),
  ...['M.Des'].map((d) => [d, PG_MDES]),
  ...['M.Phil', 'PhD'].map((d) => [d, PG_MPHIL_PHD]),
  ...['Chartered Accountant (CA)', 'CS', 'ICWA (CMA)'].map((d) => [d, PG_CA_CS_CMA]),
  ...['DM', 'MCh'].map((d) => [d, PG_DM_MCH]),
  ...['PGDM'].map((d) => [d, PG_PGDM]),
  ...['PGP'].map((d) => [d, PG_PGP]),
  ...['Post Graduate Diploma in Banking'].map((d) => [d, PG_PG_DIP_BANK]),
  ...['Master of Tourism and Travel Management'].map((d) => [d, PG_M_TOURISM]),
  ...['Master of Psychology'].map((d) => [d, PG_M_PSY]),
  ...['Master of Physical Therapy', 'Master of Physiotherapy'].map((d) => [d, PG_M_PT]),
  ...['M.Mus.'].map((d) => [d, PG_M_MUS]),
  ...['M.Plan'].map((d) => [d, PG_M_PLAN]),
  ...['M.Voc'].map((d) => [d, PG_M_VOC]),
  ...['M.Arch'].map((d) => [d, PG_M_ARCH]),
  ...['Master of Human Resource Management'].map((d) => [d, PG_MBA]),
  ...['Master of Physical Education'].map((d) => [d, withOther(['Sports pedagogy', 'Sports science', 'Administration & Events'])]),
  ...['PG Diploma'].map((d) => [d, PG_MASTER_GENERIC]),
  ...['Master'].map((d) => [d, PG_MASTER_GENERIC]),
  ...['other'].map((d) => [d, PG_OTHER]),
]

/** @type {Record<string, string[]>} */
export const PG_DEGREE_TO_SPECIALIZATIONS = Object.fromEntries(pgPairs)

const UG_FALLBACK = withOther(['General', 'Interdisciplinary', 'Undecided'])
const PG_FALLBACK = withOther(['General', 'Interdisciplinary', 'Undecided'])

/** @param {string} degree */
export function specializationsForUgDegree(degree) {
  const d = String(degree || '').trim()
  if (!d) return UG_FALLBACK
  return UG_DEGREE_TO_SPECIALIZATIONS[d] || UG_FALLBACK
}

/** @param {string} degree */
export function specializationsForPgDegree(degree) {
  const d = String(degree || '').trim()
  if (!d) return PG_FALLBACK
  return PG_DEGREE_TO_SPECIALIZATIONS[d] || PG_FALLBACK
}
