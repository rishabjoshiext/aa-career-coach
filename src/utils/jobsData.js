/* Extracted from prototype (subset used in Frame 3 MDP and job modal). */

export const JOB_LISTINGS = {
  'Finance Manager': [
    {
      co: 'HDFC Bank',
      title: 'Finance Manager — Retail Banking',
      loc: 'Mumbai',
      mode: 'Hybrid',
      sal: '₹65–95k/mo',
      exp: '4–7 yrs',
      posted: '2d ago',
      skills: ['Financial Modelling', 'MIS Reporting', 'P&L', 'SAP'],
      about:
        'Lead the retail finance function for the Western Region. Own monthly MIS, P&L, and quarterly forecasting for ₹2,400 Cr business.',
      what:
        'Drive monthly closing, manage 4-person FP&A team, present to leadership, lead vendor & audit cycles.',
    },
    {
      co: 'TCS',
      title: 'Finance Manager — Internal Audit',
      loc: 'Mumbai',
      mode: 'Hybrid',
      sal: '₹50–75k/mo',
      exp: '3–6 yrs',
      posted: '5d ago',
      skills: ['Internal Audit', 'SOX', 'SAP', 'Risk'],
      about:
        'Manage internal audits for the BFSI delivery vertical. Cover ₹3,500 Cr in operational scope across 8 client engagements.',
      what:
        'Conduct risk-based audits, present findings to leadership, drive control remediation, lead a team of 3 senior associates.',
    },
    {
      co: 'Infosys',
      title: 'Finance Manager — F&A Delivery',
      loc: 'Bengaluru',
      mode: 'Onsite',
      sal: '₹55–80k/mo',
      exp: '4–7 yrs',
      posted: '3d ago',
      skills: ['F&A', 'SLA Mgmt', 'Process Excellence', 'Excel'],
      about:
        'Manage finance & accounting delivery for a Fortune 500 US client. Lead end-to-end controllership and reporting.',
      what:
        'Own monthly close, drive automation, manage 8-person team, present to client leadership weekly.',
    },
    {
      co: 'Goldman Sachs',
      title: 'Finance Manager — Treasury',
      loc: 'Bengaluru',
      mode: 'Onsite',
      sal: '₹110–160k/mo',
      exp: '5–8 yrs',
      posted: '1d ago',
      skills: ['Treasury', 'Banking', 'Derivatives', 'Risk'],
      about:
        "Drive treasury strategy for India's capital markets ops. Manage ₹5,000+ Cr in working capital across multiple banks.",
      what:
        'Own banking relationships, optimise cash flows, manage forex and derivatives exposure, lead investment decisions.',
    },
  ],
  'HR Manager': [
    {
      co: 'Tata Elxsi',
      title: 'HR Manager — Engineering Talent',
      loc: 'Bengaluru',
      mode: 'Hybrid',
      sal: '₹70–95k/mo',
      exp: '5–8 yrs',
      posted: '1d ago',
      skills: ['Talent Acquisition', 'HRBP', 'Workday', 'Engineering Hiring'],
      about:
        'Lead HR strategy for the Embedded Engineering BU at Tata Elxsi. Partner with engineering leadership on workforce planning.',
      what:
        'Drive technical hiring, run leadership coaching, own employee experience metrics, manage 350+ engineering employees.',
    },
    {
      co: 'Swiggy',
      title: 'HR Manager — Operations Talent',
      loc: 'Bengaluru',
      mode: 'Onsite',
      sal: '₹75–105k/mo',
      exp: '4–7 yrs',
      posted: '2d ago',
      skills: ['Operations HR', 'High-Volume Hiring', 'HR Analytics', 'Stakeholder Mgmt'],
      about:
        "Lead HR for Swiggy's instamart operations covering 12 cities. Manage talent for the fastest-growing vertical.",
      what:
        'Drive city-level hiring at scale, design retention programs, partner with City Heads, run HR business reviews monthly.',
    },
    {
      co: 'Wipro',
      title: 'HR Manager — Talent Acquisition',
      loc: 'Pune',
      mode: 'Hybrid',
      sal: '₹55–75k/mo',
      exp: '4–7 yrs',
      posted: '4d ago',
      skills: ['Recruitment', 'ATS', 'Stakeholder Mgmt', 'Compliance'],
      about:
        'Lead talent acquisition for the digital transformation business. Hire 120+ professionals annually across India centres.',
      what:
        'Manage 5-person TA team, drive lateral and campus hiring, own employer branding, ensure full compliance.',
    },
  ],
}

export function logoKey(co = '') {
  const m = co.toLowerCase()
  if (m.includes('tcs')) return 'tcs'
  if (m.includes('infosys')) return 'infosys'
  if (m.includes('wipro')) return 'wipro'
  if (m.includes('swiggy')) return 'swiggy'
  if (m.includes('tata')) return 'tata'
  if (m.includes('hdfc')) return 'hdfc'
  if (m.includes('icici')) return 'icici'
  if (m.includes('goldman')) return 'goldman'
  return 'default'
}

