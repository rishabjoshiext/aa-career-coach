/* A minimal, production-friendly extraction of the prototype's PD for Frame 3.
 * We'll expand this to cover all roles; for now Finance Manager + HR Manager are fully defined.
 */

export const PD = {
  'Finance Manager': {
    trad: { yrs: 9, label: 'Traditional' },
    fast: { yrs: 7, label: 'Fast Track' },
    accel: { yrs: 5, label: 'Accelerated' },
    nodes: {
      trad: [
        {
          r: 'Accounts Assistant',
          yr: 1,
          brief: 'Data entry, basic bookkeeping',
          sal: '₹16–20k/mo',
          detail: {
            lifestyle: 'First step. Very early career. Stability is priority.',
            what: [
              'Enter daily accounting transactions',
              'Support senior accountants with filings',
              'Learn company accounting software',
              'Assist in monthly closing process',
            ],
            skills: ['Tally basics', 'Data entry accuracy', 'Excel fundamentals', 'Filing & documentation'],
          },
        },
        {
          r: 'Junior Accountant',
          yr: 2.5,
          brief: 'Tax filing, audit support, TDS',
          sal: '₹20–26k/mo',
          detail: {
            lifestyle: 'Growing slowly. Learning the full accounting cycle.',
            what: [
              'Handle TDS and GST returns filing',
              'Support internal audit processes',
              'Prepare bank reconciliation statements',
              'Month-end closing support',
            ],
            skills: ['GST & TDS compliance', 'Bank reconciliation', 'Audit basics', 'Advanced Excel'],
          },
        },
        {
          r: 'Senior Accountant',
          yr: 4,
          brief: 'MIS reports, full compliance',
          sal: '₹26–35k/mo',
          detail: {
            lifestyle: 'Mid-junior level comfort. Building professional reputation.',
            what: [
              'Prepare monthly MIS and P&L statements',
              'Handle full compliance calendar',
              'File all statutory returns independently',
              'Report to Accounts Manager',
            ],
            skills: ['MIS reporting', 'P&L preparation', 'Tax computation', 'Statutory compliance'],
          },
        },
        {
          r: 'Accounts Manager',
          yr: 6,
          brief: 'Team lead, budgeting, P&L',
          sal: '₹34–46k/mo',
          detail: {
            lifestyle: 'First management role. Housing loan possible. Savings growing.',
            what: [
              'Lead team of 3–5 junior accountants',
              'Own monthly MIS and budget preparation',
              'Handle payroll and compliance calendar',
              'Report directly to Finance Controller',
            ],
            skills: ['Team management', 'Budget preparation', 'ERP basics', 'Vendor management'],
          },
        },
        {
          r: 'Finance Controller',
          yr: 7.5,
          brief: 'Full P&L, strategic input',
          sal: '₹44–62k/mo',
          detail: {
            lifestyle: 'Senior professional. Strong savings. Near financial independence.',
            what: [
              'Own full P&L for a business unit or division',
              'Lead quarterly financial planning',
              'Present results to senior leadership',
              'Manage audit, risk, and compliance',
            ],
            skills: ['P&L ownership', 'Financial planning & analysis', 'Board-level communication', 'Risk management'],
          },
        },
        {
          r: 'Finance Manager',
          yr: 9,
          brief: 'Strategic finance, team lead',
          sal: '₹65–85k/mo',
          goal: true,
          detail: {
            lifestyle: 'Top 10% earner. Financial independence reached. Dream lifestyle.',
            what: [
              'Lead full finance function for a company or large BU',
              'Own financial strategy and investment decisions',
              'Manage a team of 8–15 people',
              'Report directly to CEO or CFO',
            ],
            skills: ['Strategic finance', 'Team leadership', 'Investor communication', 'Financial modelling at scale'],
          },
        },
      ],
      fast: [
        {
          r: 'Accounts Manager',
          yr: 2,
          brief: 'Faster jump to management',
          sal: '₹30–42k/mo',
          detail: {
            lifestyle: 'Ahead of peers already. Visible momentum.',
            what: [
              'Accelerated to management track 2 years early',
              'Full payroll and MIS responsibility',
              '2× faster than traditional path',
              'First significant salary jump',
            ],
            skills: ['Team management basics', 'MIS reporting', 'Advanced accounting tools', 'Budget preparation'],
          },
        },
        {
          r: 'Sr. Finance Analyst',
          yr: 3.5,
          brief: 'Financial modelling, data-driven',
          sal: '₹38–52k/mo',
          detail: {
            lifestyle: 'Clearly ahead of traditional track. Strong credibility.',
            what: [
              'Build financial models for leadership decisions',
              'Conduct variance analysis on monthly budgets',
              'Support CFO in investor and board presentations',
              'Lead budgeting and forecasting cycle',
            ],
            skills: ['Financial modelling', 'Variance analysis', 'Forecasting', 'Power BI / advanced Excel'],
          },
        },
        {
          r: 'Finance Controller',
          yr: 5.5,
          brief: 'P&L owner, strategic input',
          sal: '₹48–64k/mo',
          detail: {
            lifestyle: 'Significantly ahead of peers. Housing and savings milestone early.',
            what: [
              'Full P&L ownership 2 years ahead of traditional path',
              'Strategic input in business decisions',
              'Leading financial analysis for leadership',
              'Managing audit, compliance, and treasury',
            ],
            skills: ['P&L ownership', 'Financial modelling', 'Management reporting', 'Risk assessment'],
          },
        },
        {
          r: 'Finance Manager',
          yr: 7,
          brief: 'Goal — 2 years early',
          sal: '₹62–80k/mo',
          goal: true,
          detail: {
            lifestyle: 'Top earner in peer group. High quality of life. Multiple assets.',
            what: [
              'Finance Manager 2 years ahead of the traditional path',
              'Full team and strategy ownership',
              'Strong salary — ₹62–80k/mo',
              'CFO track is now accessible',
            ],
            skills: ['Strategic finance', 'Team leadership', 'Board-level communication', 'Investment analysis'],
          },
        },
      ],
      accel: [
        {
          r: 'Accts Mgr + Degree',
          yr: 1.5,
          brief: 'Enrol today. Both work and study.',
          sal: '₹26–34k/mo',
          tag: true,
          detail: {
            lifestyle: 'Investing in the future. No lifestyle disruption. Weekend classes only.',
            what: [
              'Enrol in BBA/MBA specialisation while working',
              'First salary hike as early as 6 months in',
              'Study on weekends only — zero career break',
              'Degree progress: 25% complete',
            ],
            skills: ['Online learning discipline', 'Core finance modules', 'Time management', 'Peer networking via alumni'],
          },
        },
        {
          r: 'Finance Specialist',
          yr: 3,
          brief: 'Degree 60% done. Applying now.',
          sal: '₹38–54k/mo',
          detail: {
            lifestyle: 'Visible career momentum. Colleagues noticing. Salary 60%+ up from start.',
            what: [
              'Major salary jump — first role upgrade landed',
              'Degree is 60% complete — credibility very high',
              'Finance Specialist or Senior Analyst roles accessible',
              'Starting to build professional reputation',
            ],
            skills: ['Financial analysis', 'Specialisation modules complete', 'SQL & Power BI basics', 'Industry network building'],
          },
        },
        {
          r: 'Finance Manager',
          yr: 5,
          brief: 'Goal. 4 years saved vs trad.',
          sal: '₹58–75k/mo',
          goal: true,
          detail: {
            lifestyle: 'Top earner. Dream lifestyle unlocked. Ahead of every peer who did not upskill.',
            what: [
              'Finance Manager role achieved — 4 years before traditional path',
              'Degree in hand — UGC recognised',
              '₹40–55k additional earned vs doing nothing',
              'Ready for CFO track and beyond',
            ],
            skills: ['Strategic finance leadership', 'P&L ownership', 'Team management', 'Financial modelling mastery'],
          },
        },
      ],
    },
  },
  'HR Manager': {
    trad: { yrs: 8, label: 'Traditional' },
    fast: { yrs: 5, label: 'Fast Track' },
    accel: { yrs: 3, label: 'Accelerated' },
    nodes: {
      trad: [
        {
          r: 'Senior HR Executive',
          yr: 2,
          brief: 'Recruitment & admin lead',
          sal: '₹20–28k/mo',
          detail: {
            lifestyle: 'Building credibility in HR. Early stability.',
            what: [
              'Own end-to-end recruitment for 3–5 open positions',
              'Handle joining formalities and HRMS data entry',
              'Support statutory compliance filing',
            ],
            skills: ['HRMS basics', 'Recruitment lifecycle', 'Joining formalities', 'Statutory basics'],
          },
        },
        {
          r: 'HR Team Lead',
          yr: 5,
          brief: 'Team of 3, talent & compliance',
          sal: '₹30–42k/mo',
          detail: {
            lifestyle: 'Mid-career momentum. Noticeable salary jump.',
            what: [
              'Lead a team of 3 HR executives',
              'Own payroll and compliance calendar',
              'Manage talent acquisition for the division',
            ],
            skills: ['Team management', 'Payroll processing', 'EPFO & ESI compliance', 'Performance management'],
          },
        },
        {
          r: 'HR Manager',
          yr: 8,
          brief: 'Full people strategy ownership',
          sal: '₹55–75k/mo',
          goal: true,
          detail: {
            lifestyle: 'Top HR professional. Respected in industry.',
            what: [
              'Own HR strategy for the organisation',
              'Partner with leadership on workforce planning',
              'Oversee entire people function — 5–12 person team',
            ],
            skills: ['HR strategy', 'Leadership', 'Workforce planning', 'HR analytics'],
          },
        },
      ],
      fast: [
        {
          r: 'HR Team Lead',
          yr: 2,
          brief: 'Faster track to leadership',
          sal: '₹28–38k/mo',
          detail: {
            lifestyle: 'Visible early momentum vs peers.',
            what: ['Fast-tracked to team leadership', 'Own compliance and payroll early', '2 years ahead of traditional path'],
            skills: ['Compliance management', 'Recruitment ownership', 'Team coordination'],
          },
        },
        {
          r: 'Senior HR Manager',
          yr: 4,
          brief: 'Strategy, analytics, culture',
          sal: '₹42–58k/mo',
          detail: {
            lifestyle: 'Strong salary. Senior professional perception.',
            what: ['HR strategy involvement with C-suite', 'People analytics capability built', 'Culture programs owned'],
            skills: ['HR analytics', 'Strategic planning', 'Culture design', 'L&D basics'],
          },
        },
        {
          r: 'HR Manager',
          yr: 5,
          brief: 'Goal — 3 yrs ahead',
          sal: '₹52–70k/mo',
          goal: true,
          detail: {
            lifestyle: 'Peak mid-career comfort. Peers years behind.',
            what: ['Goal achieved 3 years ahead', 'Full strategic HR ownership', 'HRBP and CoE tracks now accessible'],
            skills: ['Strategic HR', 'Full team ownership', 'Executive presence'],
          },
        },
      ],
      accel: [
        {
          r: 'HR Lead + Degree',
          yr: 1,
          brief: 'Work + study simultaneously',
          sal: '₹24–32k/mo',
          tag: true,
          detail: {
            lifestyle: 'No disruption. Growing quietly.',
            what: ['Enrol in BBA HR specialisation today', 'Study only on weekends', 'First salary hike in 6–9 months'],
            skills: ['Core HR modules', 'Online learning', 'Time management'],
          },
        },
        {
          r: 'Talent Manager',
          yr: 2,
          brief: 'Degree halfway. Big jump.',
          sal: '₹36–50k/mo',
          detail: {
            lifestyle: 'Career clearly on a different trajectory. Confident.',
            what: ['Major role upgrade — Talent Manager or HRBP level', 'Degree 60% complete', 'Companies seeing the degree'],
            skills: ['Talent acquisition strategy', 'HRMS mastery', 'L&D design', 'HR analytics basics'],
          },
        },
        {
          r: 'HR Manager',
          yr: 3,
          brief: 'Goal. 5 years saved.',
          sal: '₹48–68k/mo',
          goal: true,
          detail: {
            lifestyle: 'Dream career achieved faster than anyone expected.',
            what: ['HR Manager in 3 years', 'UGC recognised degree in hand', 'Full people strategy ownership'],
            skills: ['Strategic HR', 'People analytics', 'Executive communication', 'Team leadership'],
          },
        },
      ],
    },
  },
}

export const DEFAULT_ROLE = 'Finance Manager'

