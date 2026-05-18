/**
 * programs.js
 *
 * All upGrad partner programs structured and categorized.
 *
 * Sections:
 *  colleges      — unique institutions involved across all programs
 *  bachelors     — Bachelor's degree programs (none in current dataset)
 *  masters       — Master's degree programs (MBA, MSc, etc.)
 *  doctorate     — Doctoral programs (DBA, PhD)
 *  certificates  — Certificates, PG Certificates, Executive Diplomas,
 *                  Advanced Certificates, Bootcamps, Executive Programs
 *
 * Fields per program:
 *  id              — unique camelCase identifier
 *  name            — full program name
 *  shortName       — display-friendly short name
 *  university      — array of institution IDs (ref → colleges)
 *  universityLabel — human-readable institution string
 *  duration        — display string as-is from source
 *  durationMonths  — { min: number, max: number } for range filtering
 *  field           — primary domain/subject area
 *  credential      — credential awarded (MBA / MSc / DBA / Certificate / etc.)
 *  credentialType  — more granular type tag
 *  isExecutive     — boolean, true if targeted at working professionals
 *  isJoint         — boolean, true if delivered by 2+ institutions
 *  tags            — searchable keyword array
 */

/* ─────────────────────────────────────────────────────────────
   COLLEGES  (unique institutions referenced across programs)
───────────────────────────────────────────────────────────── */
const colleges = [
  {
    id: "imt_g",
    name: "IMT Ghaziabad",
    shortName: "IMT-G",
    type: "Business School",
    country: "India",
    tier: "Premium",
  },
  {
    id: "lbs",
    name: "Liverpool Business School",
    shortName: "LBS",
    type: "Business School",
    country: "UK",
    tier: "International",
    parentUniversity: "Liverpool John Moores University",
  },
  {
    id: "ggu",
    name: "Golden Gate University",
    shortName: "GGU",
    type: "University",
    country: "USA",
    tier: "International",
  },
  {
    id: "opj",
    name: "O.P. Jindal Global University",
    shortName: "OPJ / JGU",
    type: "University",
    country: "India",
    tier: "Premium",
  },
  {
    id: "edgewood",
    name: "Edgewood College",
    shortName: "Edgewood",
    type: "Liberal Arts College",
    country: "USA",
    tier: "International",
  },
  {
    id: "pwc_academy",
    name: "PwC Academy",
    shortName: "PwC Academy",
    type: "Professional Training Institute",
    country: "India",
    tier: "Industry",
  },
  {
    id: "iiitb",
    name: "IIIT Bangalore",
    shortName: "IIIT-B",
    type: "Institute of Technology",
    country: "India",
    tier: "Premium",
  },
  {
    id: "ljmu",
    name: "Liverpool John Moores University",
    shortName: "LJMU",
    type: "University",
    country: "UK",
    tier: "International",
  },
  {
    id: "mica",
    name: "MICA – The School of Ideas",
    shortName: "MICA",
    type: "Management & Communication School",
    country: "India",
    tier: "Premium",
  },
  {
    id: "iimk",
    name: "IIM Kozhikode",
    shortName: "IIM-K",
    type: "IIM",
    country: "India",
    tier: "Elite",
  },
  {
    id: "upgrad",
    name: "upGrad",
    shortName: "upGrad",
    type: "EdTech Platform",
    country: "India",
    tier: "Platform",
  },
];


/* ─────────────────────────────────────────────────────────────
   BACHELORS  (none in current dataset — placeholder retained
               for schema consistency and future additions)
───────────────────────────────────────────────────────────── */
const bachelors = [];


/* ─────────────────────────────────────────────────────────────
   MASTERS
───────────────────────────────────────────────────────────── */
const masters = [
  {
    id: "mba_lbs",
    name: "MBA – Liverpool Business School",
    shortName: "MBA (LBS)",
    university: ["imt_g", "lbs"],
    universityLabel: "IMT Ghaziabad & Liverpool Business School",
    duration: "18 Months",
    durationMonths: { min: 18, max: 18 },
    field: "General Management",
    credential: "MBA",
    credentialType: "Master of Business Administration",
    isExecutive: false,
    isJoint: true,
    tags: ["MBA", "management", "international", "UK", "IMT", "LBS", "general management"],
  },
  {
    id: "mba_ggu",
    name: "GGU MBA",
    shortName: "MBA (GGU)",
    university: ["ggu"],
    universityLabel: "Golden Gate University",
    duration: "15 Months",
    durationMonths: { min: 15, max: 15 },
    field: "General Management",
    credential: "MBA",
    credentialType: "Master of Business Administration",
    isExecutive: false,
    isJoint: false,
    tags: ["MBA", "management", "USA", "GGU", "international", "general management"],
  },
  {
    id: "mba_opj",
    name: "MBA from O.P. Jindal Global University",
    shortName: "MBA (OPJ)",
    university: ["opj"],
    universityLabel: "O.P. Jindal Global University",
    duration: "12 Months",
    durationMonths: { min: 12, max: 12 },
    field: "General Management",
    credential: "MBA",
    credentialType: "Master of Business Administration",
    isExecutive: false,
    isJoint: false,
    tags: ["MBA", "management", "Jindal", "OPJ", "JGU", "general management"],
  },
  {
    id: "mba_opj_law",
    name: "MBA from OP Jindal – in Business & Law",
    shortName: "MBA in Business & Law (OPJ)",
    university: ["opj"],
    universityLabel: "O.P. Jindal Global University",
    duration: "12 Months",
    durationMonths: { min: 12, max: 12 },
    field: "Business & Law",
    credential: "MBA",
    credentialType: "Master of Business Administration",
    isExecutive: false,
    isJoint: false,
    tags: ["MBA", "business law", "Jindal", "OPJ", "legal", "corporate law"],
  },
  {
    id: "mba_opj_cap",
    name: "MBA from OP Jindal | Career Acceleration Program from upGrad",
    shortName: "MBA + CAP (OPJ × upGrad)",
    university: ["opj", "upgrad"],
    universityLabel: "O.P. Jindal Global University & upGrad",
    duration: "12 Months",
    durationMonths: { min: 12, max: 12 },
    field: "General Management",
    credential: "MBA",
    credentialType: "Master of Business Administration",
    isExecutive: false,
    isJoint: true,
    tags: ["MBA", "career acceleration", "Jindal", "OPJ", "upGrad", "management", "CAP"],
  },
  {
    id: "mba_edgewood",
    name: "Edgewood – MBA",
    shortName: "MBA (Edgewood)",
    university: ["edgewood"],
    universityLabel: "Edgewood College, USA",
    duration: "14 Months",
    durationMonths: { min: 14, max: 14 },
    field: "General Management",
    credential: "MBA",
    credentialType: "Master of Business Administration",
    isExecutive: false,
    isJoint: false,
    tags: ["MBA", "management", "USA", "Edgewood", "international", "general management"],
  },
  {
    id: "msc_ds_iiitb_ljmu",
    name: "Master of Science in Data Science",
    shortName: "MSc Data Science (IIIT-B & LJMU)",
    university: ["iiitb", "ljmu"],
    universityLabel: "IIIT Bangalore & Liverpool John Moores University",
    duration: "18 – 21 Months",
    durationMonths: { min: 18, max: 21 },
    field: "Data Science",
    credential: "MSc",
    credentialType: "Master of Science",
    isExecutive: false,
    isJoint: true,
    tags: ["MSc", "data science", "IIIT-B", "LJMU", "machine learning", "analytics", "UK", "international"],
  },
  {
    id: "masters_ai_ds_opj",
    name: "Master's Degree in Artificial Intelligence and Data Science",
    shortName: "Masters AI & DS (OPJ)",
    university: ["opj"],
    universityLabel: "O.P. Jindal Global University",
    duration: "12 Months",
    durationMonths: { min: 12, max: 12 },
    field: "AI & Data Science",
    credential: "Master's Degree",
    credentialType: "Master's Degree",
    isExecutive: false,
    isJoint: false,
    tags: ["masters", "AI", "artificial intelligence", "data science", "Jindal", "OPJ", "ML"],
  },
  {
    id: "masters_acc_fin_opj",
    name: "Master's Degree in International Accounting and Finance (Integrated with ACCA)",
    shortName: "Masters Accounting & Finance + ACCA (OPJ)",
    university: ["opj"],
    universityLabel: "O.P. Jindal Global University",
    duration: "12 Months",
    durationMonths: { min: 12, max: 12 },
    field: "Accounting & Finance",
    credential: "Master's Degree",
    credentialType: "Master's Degree",
    isExecutive: false,
    isJoint: false,
    tags: ["masters", "accounting", "finance", "ACCA", "Jindal", "OPJ", "international", "CPA"],
  },
  {
    id: "msc_ml_ai_iiitb_ljmu",
    name: "Master of Science in Machine Learning & AI",
    shortName: "MSc ML & AI (IIIT-B & LJMU)",
    university: ["iiitb", "ljmu"],
    universityLabel: "IIIT Bangalore & Liverpool John Moores University",
    duration: "18 – 21 Months",
    durationMonths: { min: 18, max: 21 },
    field: "Machine Learning & AI",
    credential: "MSc",
    credentialType: "Master of Science",
    isExecutive: false,
    isJoint: true,
    tags: ["MSc", "machine learning", "AI", "artificial intelligence", "IIIT-B", "LJMU", "deep learning", "UK"],
  },
];


/* ─────────────────────────────────────────────────────────────
   DOCTORATE
───────────────────────────────────────────────────────────── */
const doctorate = [
  {
    id: "dba_mba_edgewood",
    name: "DBA & MBA from Edgewood College",
    shortName: "DBA + MBA (Edgewood)",
    university: ["edgewood"],
    universityLabel: "Edgewood College, USA",
    duration: "30 Months",
    durationMonths: { min: 30, max: 30 },
    field: "Business Administration",
    credential: "DBA + MBA",
    credentialType: "Doctor of Business Administration",
    isExecutive: true,
    isJoint: false,
    tags: ["DBA", "MBA", "doctorate", "doctoral", "business administration", "USA", "Edgewood", "research", "leadership"],
    note: "Dual credential — includes integrated MBA alongside the DBA",
  },
];


/* ─────────────────────────────────────────────────────────────
   CERTIFICATES
   (Includes: Executive Programs, PG Certificates, Advanced
    Certificates, Executive Diplomas, Bootcamps, Professional
    Certificate Programmes)
───────────────────────────────────────────────────────────── */
const certificates = [
  {
    id: "cert_agmp_imt",
    name: "IMT – Advanced General Management Program",
    shortName: "Advanced GMP (IMT-G)",
    university: ["imt_g"],
    universityLabel: "IMT Ghaziabad",
    duration: "11 Months",
    durationMonths: { min: 11, max: 11 },
    field: "General Management",
    credential: "Certificate",
    credentialType: "Advanced Certificate Program",
    isExecutive: true,
    isJoint: false,
    tags: ["certificate", "general management", "IMT", "executive", "leadership", "business strategy"],
  },
  {
    id: "cert_ds_bootcamp_pwc",
    name: "Data Science Bootcamp with AI",
    shortName: "Data Science Bootcamp (PwC Academy)",
    university: ["pwc_academy"],
    universityLabel: "PwC Academy",
    duration: "6 Months",
    durationMonths: { min: 6, max: 6 },
    field: "Data Science & AI",
    credential: "Certificate",
    credentialType: "Bootcamp Certificate",
    isExecutive: false,
    isJoint: false,
    tags: ["certificate", "data science", "AI", "bootcamp", "PwC", "analytics", "machine learning"],
  },
  {
    id: "cert_ba_consulting_pwc",
    name: "Certificate Course in Business Analytics & Consulting",
    shortName: "Business Analytics & Consulting (PwC Academy)",
    university: ["pwc_academy"],
    universityLabel: "PwC Academy",
    duration: "6 Months",
    durationMonths: { min: 6, max: 6 },
    field: "Business Analytics",
    credential: "Certificate",
    credentialType: "Certificate Course",
    isExecutive: false,
    isJoint: false,
    tags: ["certificate", "business analytics", "consulting", "PwC", "data", "insights"],
  },
  {
    id: "cert_fin_modelling_pwc",
    name: "Certificate Program in Financial Modelling & Analysis",
    shortName: "Financial Modelling & Analysis (PwC Academy)",
    university: ["pwc_academy"],
    universityLabel: "PwC Academy",
    duration: "4 Months",
    durationMonths: { min: 4, max: 4 },
    field: "Finance",
    credential: "Certificate",
    credentialType: "Certificate Program",
    isExecutive: false,
    isJoint: false,
    tags: ["certificate", "financial modelling", "finance", "Excel", "valuation", "FP&A", "PwC"],
  },
  {
    id: "cert_perf_mkt_upgrad",
    name: "Advanced Certificate in Performance Marketing",
    shortName: "Performance Marketing (upGrad)",
    university: ["upgrad"],
    universityLabel: "upGrad",
    duration: "3 Months",
    durationMonths: { min: 3, max: 3 },
    field: "Digital Marketing",
    credential: "Certificate",
    credentialType: "Advanced Certificate",
    isExecutive: false,
    isJoint: false,
    tags: ["certificate", "performance marketing", "paid media", "Google Ads", "Meta Ads", "ROI", "upGrad"],
  },
  {
    id: "exec_dip_ds_ai_iiitb",
    name: "Executive Diploma in Data Science & AI",
    shortName: "Exec Diploma DS & AI (IIIT-B)",
    university: ["iiitb"],
    universityLabel: "IIIT Bangalore",
    duration: "12 – 15 Months",
    durationMonths: { min: 12, max: 15 },
    field: "Data Science & AI",
    credential: "Executive Diploma",
    credentialType: "Executive Diploma",
    isExecutive: true,
    isJoint: false,
    tags: ["executive diploma", "data science", "AI", "machine learning", "IIIT-B", "working professionals"],
  },
  {
    id: "pgcert_ds_ai_exec_iiitb",
    name: "Post Graduate Certificate in Data Science & AI (Executive)",
    shortName: "PG Cert DS & AI Executive (IIIT-B)",
    university: ["iiitb"],
    universityLabel: "IIIT Bangalore",
    duration: "6 – 9 Months",
    durationMonths: { min: 6, max: 9 },
    field: "Data Science & AI",
    credential: "PG Certificate",
    credentialType: "Post Graduate Certificate",
    isExecutive: true,
    isJoint: false,
    tags: ["PG certificate", "data science", "AI", "executive", "IIIT-B", "analytics"],
  },
  {
    id: "adv_cert_digimkt_mica",
    name: "Advanced Certificate in Digital Marketing and Communication",
    shortName: "Digital Marketing & Communication (MICA)",
    university: ["mica"],
    universityLabel: "MICA – The School of Ideas",
    duration: "4 – 10 Months (Depending upon Specialization)",
    durationMonths: { min: 4, max: 10 },
    field: "Digital Marketing",
    credential: "Certificate",
    credentialType: "Advanced Certificate",
    isExecutive: false,
    isJoint: false,
    tags: ["certificate", "digital marketing", "communication", "MICA", "social media", "content", "branding"],
  },
  {
    id: "cert_hr_analytics_iimk",
    name: "Professional Certificate Programme in HR Management and Analytics",
    shortName: "HR Management & Analytics (IIM-K)",
    university: ["iimk"],
    universityLabel: "IIM Kozhikode",
    duration: "6 Months (5 + 1)",
    durationMonths: { min: 6, max: 6 },
    field: "Human Resources",
    credential: "Certificate",
    credentialType: "Professional Certificate Programme",
    isExecutive: true,
    isJoint: false,
    tags: ["certificate", "HR", "human resources", "people analytics", "IIM-K", "IIM", "HRBP", "executive"],
  },
  {
    id: "exec_dip_ml_ai_iiitb",
    name: "Executive Diploma in Machine Learning & AI",
    shortName: "Exec Diploma ML & AI (IIIT-B)",
    university: ["iiitb"],
    universityLabel: "IIIT Bangalore",
    duration: "12 – 15 Months",
    durationMonths: { min: 12, max: 15 },
    field: "Machine Learning & AI",
    credential: "Executive Diploma",
    credentialType: "Executive Diploma",
    isExecutive: true,
    isJoint: false,
    tags: ["executive diploma", "machine learning", "AI", "deep learning", "NLP", "IIIT-B", "working professionals"],
  },
  {
    id: "exec_prog_genai_leaders_iiitb",
    name: "Executive Program in Generative AI for Leaders",
    shortName: "GenAI for Leaders (IIIT-B)",
    university: ["iiitb"],
    universityLabel: "IIIT Bangalore",
    duration: "5 Months",
    durationMonths: { min: 5, max: 5 },
    field: "Generative AI",
    credential: "Certificate",
    credentialType: "Executive Program",
    isExecutive: true,
    isJoint: false,
    tags: ["executive program", "generative AI", "GenAI", "LLM", "leadership", "AI strategy", "IIIT-B"],
  },
  {
    id: "adv_cert_genai_upgrad",
    name: "upGrad – Advanced Certificate Program in Generative AI",
    shortName: "Advanced Certificate GenAI (upGrad)",
    university: ["upgrad"],
    universityLabel: "upGrad",
    duration: "5 Months",
    durationMonths: { min: 5, max: 5 },
    field: "Generative AI",
    credential: "Certificate",
    credentialType: "Advanced Certificate Program",
    isExecutive: false,
    isJoint: false,
    tags: ["certificate", "generative AI", "GenAI", "LLM", "prompt engineering", "ChatGPT", "upGrad"],
  },
];


/* ─────────────────────────────────────────────────────────────
   MASTER EXPORT  — all sections bundled
───────────────────────────────────────────────────────────── */
const programs = {
  colleges,
  bachelors,
  masters,
  doctorate,
  certificates,
};

export default programs;

/* Named exports for selective imports */
export { colleges, bachelors, masters, doctorate, certificates };


/* ─────────────────────────────────────────────
   QUICK STATS (for reference)
   ─────────────────────────────────────────────
   Total programs : 23
   ─────────────────────────────────────────────
   colleges       : 11 unique institutions
   bachelors      : 0
   masters        : 10
   doctorate      : 1
   certificates   : 12
   ─────────────────────────────────────────────

   USAGE EXAMPLES
   ─────────────────────────────────────────────

   // Import everything
   import programs from './programs';
   const { colleges, masters, doctorate, certificates } = programs;

   // Or use named imports
   import { masters, certificates } from './programs';

   // Filter by field
   const aiPrograms = [
     ...masters.filter(p => p.field.toLowerCase().includes("ai")),
     ...certificates.filter(p => p.field.toLowerCase().includes("ai")),
   ];

   // Filter by duration range (e.g. under 6 months)
   const shortPrograms = certificates.filter(p => p.durationMonths.max <= 6);

   // Filter executive programs only
   const execPrograms = [
     ...masters.filter(p => p.isExecutive),
     ...certificates.filter(p => p.isExecutive),
     ...doctorate.filter(p => p.isExecutive),
   ];

   // Get college name by ID
   const getCollege = (id) => colleges.find(c => c.id === id);
   getCollege("iiitb"); // → { id: "iiitb", name: "IIIT Bangalore", ... }

   // Get all programs for a specific university
   const allTypes = [...masters, ...doctorate, ...certificates, ...bachelors];
   const iiitbPrograms = allTypes.filter(p => p.university.includes("iiitb"));

───────────────────────────────────────────── */