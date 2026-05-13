/** Gap categories per role — mirrors prototype PD.gaps */

export const GAPS_BY_ROLE = {
  'Finance Manager': {
    edu: {
      imp: 'Delays career by 3.2 years',
      cls: 'red',
      items: [
        {
          n: 'Finance Specialisation Degree (BBA/MBA Finance)',
          d: 'Without this, 87% of Finance Manager JDs will not shortlist your profile',
          w: 'Critical blocker at resume screening stage',
          pill: 'crit',
          actions: [
            'Enrol in online BBA/MBA Finance programme',
            'Complete within 2–3 years while working',
            'UGC recognised degree carries full weight in interviews',
          ],
        },
        {
          n: 'Professional Certification (CMA / CA Intermediate)',
          d: 'Required knowledge for companies with SEBI/RBI regulatory compliance needs',
          w: 'Required by 64% of Finance Controller+ JDs',
          pill: 'miss',
          actions: [
            'Register for CMA Foundation as first step',
            'Complete within 18 months alongside degree',
            'Significantly increases interview call rate',
          ],
        },
      ],
    },
    skill: {
      imp: 'Costs 2 rounds in interviews',
      cls: 'amber',
      items: [
        {
          n: 'Advanced Excel & Financial Modelling',
          d: 'Non-negotiable for any finance role above executive level — used in every interview',
          w: 'Asked in 91% of finance interviews as practical test',
          pill: 'crit',
          actions: [
            'Complete 30-hour Excel modelling course online',
            'Build 3 sample financial models for portfolio',
            'Practice DCF, P&L, cash flow modelling daily',
          ],
        },
        {
          n: 'ERP Systems — SAP / Tally Prime / Oracle',
          d: 'Standard tool at all companies with 100+ employees',
          pill: 'miss',
          actions: ['Get Tally Prime certified (2 months)', 'Learn SAP basics via free SAP Learning Hub'],
        },
        {
          n: 'GST & Corporate Taxation',
          d: 'Core compliance knowledge for all finance roles',
          pill: 'miss',
          actions: ['Take a dedicated GST certification course', 'Practice with real ITR and GSTR filings'],
        },
        {
          n: 'MIS Reporting & Power BI',
          d: 'Data-driven finance decisions now expected at all levels',
          pill: 'need',
          actions: ['Complete Power BI beginner course (10 hrs)', 'Build 2 sample MIS dashboards for your portfolio'],
        },
        {
          n: 'SQL Basics for Finance',
          d: 'Increasingly expected for large-company finance roles',
          pill: 'need',
          actions: ['30 days of SQL basics via free online resources', 'Practice querying financial datasets'],
        },
      ],
    },
    exp: {
      imp: 'Adds 18 months to promotion cycle',
      cls: 'amber',
      items: [
        {
          n: 'Budgeting & P&L Ownership',
          d: 'Hands-on P&L experience is the most critical missing signal — mentioned in 76% of Finance Manager JDs',
          w: 'Most commonly cited missing element in junior finance profiles',
          pill: 'crit',
          actions: [
            'Ask current manager to include you in budgeting process',
            'Volunteer for annual budget preparation support',
            'Start tracking your team/department expenses proactively',
          ],
        },
        {
          n: '36 Months in Core Finance Function',
          d: 'Continuous finance experience across full accounting cycle required',
          pill: 'miss',
          actions: ['Focus exclusively on finance roles for next 3 years', 'Avoid lateral moves to non-finance departments'],
        },
        {
          n: 'Stakeholder Reporting Experience',
          d: 'Presenting financial results to senior leadership or board',
          pill: 'miss',
          actions: [
            'Prepare and present monthly finance summary to your manager',
            'Build strong communication skills alongside technical skills',
          ],
        },
        {
          n: 'Vendor Management & Procurement',
          d: 'Finance Managers often own vendor negotiation and procurement oversight',
          pill: 'need',
          actions: ['Take ownership of any vendor invoices in current role', 'Learn procurement basics through online module'],
        },
      ],
    },
    dev: {
      imp: 'Reduces inbound by 60%',
      cls: 'green',
      items: [
        {
          n: 'LinkedIn Profile — Finance Positioning',
          d: 'Your profile currently lacks finance-specific keywords that recruiters actively search for',
          w: 'Not appearing in recruiter searches for finance roles',
          pill: 'miss',
          actions: [
            'Add "Financial Analysis", "P&L", "MIS Reporting" to headline',
            'Rewrite summary with finance career narrative',
            'List all finance projects and achievements with numbers',
          ],
        },
        {
          n: 'Finance Community Membership (ICAI / CII)',
          d: 'Peer networks accelerate mentorship and job referrals in finance',
          pill: 'need',
          actions: ['Join ICAI Student/Associate Member programme', 'Attend 1 finance industry event per quarter'],
        },
        {
          n: 'Published Financial Analysis or Case Study',
          d: 'Portfolio of self-published analysis signals seriousness beyond daily work',
          pill: 'need',
          actions: ['Write a quarterly finance analysis for your industry on LinkedIn', 'Share one insight per month'],
        },
        {
          n: 'Reference Network in Finance',
          d: '65% of Finance Manager roles filled through referrals, not job boards',
          pill: 'need',
          actions: [
            'Connect with 5 Finance Managers in your target industry on LinkedIn',
            'Ask current manager for introductions to their network',
          ],
        },
      ],
    },
  },
  'HR Manager': {
    edu: {
      imp: 'Blocks 78% of HR Manager JDs',
      cls: 'red',
      items: [
        {
          n: 'HR Specialisation Degree (BBA/MBA HR)',
          d: 'Without formal degree, most candidates you compete with will have one — and get shortlisted instead',
          w: 'Eliminated at screening in 78% of HR Manager JDs',
          pill: 'crit',
          actions: [
            'Enrol in BBA HR specialisation programme',
            'UGC recognised — carries full weight in interviews',
            'Weekend mode — zero career break required',
          ],
        },
        {
          n: 'Labour Law Certification',
          d: 'Statutory compliance is a core HR function — expected from Manager level',
          pill: 'miss',
          actions: ['Take a dedicated Labour Law course (2 months)', 'Get certified before applying to Manager roles'],
        },
        {
          n: 'SHRM / NHRDN Certification',
          d: 'Global HR credential increasingly recognised by MNCs and large Indian companies',
          pill: 'need',
          actions: ['Register for SHRM-CP or equivalent', 'Complete alongside degree programme'],
        },
      ],
    },
    skill: {
      imp: 'Costs 2 seniority levels in hiring',
      cls: 'amber',
      items: [
        {
          n: 'HRMS Software (Darwinbox / Keka / SAP HCM)',
          d: 'Standard expectation at all companies with 100+ employees — non-negotiable for Manager level',
          w: 'Asked in every HR Manager interview — practical assessment done',
          pill: 'crit',
          actions: [
            'Get hands-on with Darwinbox or Keka free trials',
            'Build a certification in whichever HRMS is most common in your target industry',
          ],
        },
        {
          n: 'Payroll Processing & EPFO / ESI Compliance',
          d: 'Statutory compliance knowledge is a core HR Manager function',
          pill: 'miss',
          actions: ['Complete payroll certification course (1 month)', 'Practice with sample payroll scenarios'],
        },
        {
          n: 'Talent Acquisition & ATS Tools',
          d: 'Recruitment lifecycle management required at all HR Manager levels',
          pill: 'miss',
          actions: ['Master any ATS — iSmartRecruit, Zoho Recruit, or similar', 'Build a structured JD and interview framework'],
        },
        {
          n: 'L&D Design Basics',
          d: 'Learning & Development increasingly expected to be owned by HR Managers',
          pill: 'need',
          actions: ['Design one L&D programme for your current company', 'Take a basic instructional design course'],
        },
        {
          n: 'HR Analytics & People Data',
          d: 'Data-driven HR decisions are now expected by modern leadership teams',
          pill: 'need',
          actions: ['Learn basic HR dashboarding in Excel or Power BI', 'Present people metrics to leadership'],
        },
      ],
    },
    exp: {
      imp: 'Adds 18 months to promotion',
      cls: 'amber',
      items: [
        {
          n: 'End-to-End Recruitment Ownership',
          d: 'Not just support — owning the full hiring pipeline from JD to onboarding',
          w: 'Missing from 8 in 10 junior HR profiles — top screening criterion',
          pill: 'crit',
          actions: ['Volunteer to own one full recruitment cycle now', 'Track and report hiring metrics independently'],
        },
        {
          n: 'Payroll Compliance Cycle Ownership',
          d: 'Hands-on monthly payroll processing and filing experience',
          pill: 'miss',
          actions: ['Ask to be included in monthly payroll processing', 'Build a payroll tracker and compliance calendar'],
        },
        {
          n: 'Performance Appraisal Cycle',
          d: 'Owning and managing the annual appraisal process for a group of employees',
          pill: 'miss',
          actions: ['Design a basic KPI framework for your team/department', 'Run the appraisal process end-to-end even informally'],
        },
        {
          n: 'Exit Interview & Attrition Analysis',
          d: 'Attrition management is a senior HR skill expected from Manager level',
          pill: 'need',
          actions: ['Conduct exit interviews and build an attrition dashboard', 'Present findings to management'],
        },
      ],
    },
    dev: {
      imp: 'Reduces visibility by 55%',
      cls: 'green',
      items: [
        {
          n: 'LinkedIn Positioned as HR Professional',
          d: 'Currently missing HR-specific keywords that recruiters actively search for',
          w: 'Not appearing in HR recruiter searches',
          pill: 'miss',
          actions: [
            'Add "Talent Acquisition", "HRMS", "Compliance" to profile headline',
            'Rewrite summary with HR career narrative',
            'Post one HR insight per week',
          ],
        },
        {
          n: 'SHRM / NHRDN Community Membership',
          d: 'HR networks that fast-track mentorship, referrals, and job discovery',
          pill: 'need',
          actions: ['Join NHRDN student member programme (free)', 'Attend 1 HR industry webinar per month'],
        },
        {
          n: 'Case Study or HR Project Published',
          d: 'Public portfolio signals above-average initiative to hiring managers',
          pill: 'need',
          actions: ['Document one HR project or process improvement you ran', 'Post as a LinkedIn article'],
        },
        {
          n: 'Reference Network in HR',
          d: '60%+ of HR Manager roles filled through referrals — not job boards',
          pill: 'need',
          actions: ['Connect with 5 HR Managers in target companies', 'Ask for informational calls'],
        },
      ],
    },
  },
}
