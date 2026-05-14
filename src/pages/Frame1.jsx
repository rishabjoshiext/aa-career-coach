import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LiveProfileCard } from '../components/LiveProfileCard.jsx'
import { useAppState } from '../hooks/appState.jsx'
import { Button } from '../components/ui/Button.jsx'
import { Input } from '../components/ui/Input.jsx'
import { Label } from '../components/ui/Label.jsx'
import { Select } from '../components/ui/Select.jsx'
import {
  ScoreFormatToggleButton,
  ScoreFormatToggleGroup,
  ToggleButton,
  ToggleGroup,
} from '../components/ui/Toggle.jsx'
import { RunLoadOverlay } from '../components/loaders/RunLoadOverlay.jsx'

const COMMON_COMPANIES = [
  'Google',
  'Microsoft',
  'Amazon',
  'Meta',
  'Apple',
  'Goldman Sachs',
  'JP Morgan',
  'HDFC Bank',
  'ICICI Bank',
  'TCS',
  'Infosys',
  'Wipro',
  'Tata',
  'Reliance',
  'Adani',
  'Unilever',
  'HUL',
  'ITC',
  'PepsiCo',
  'Coca-Cola',
  'Salesforce',
  'Oracle',
  'Adobe',
  'SAP',
  'IBM',
  'Deloitte',
  'EY',
  'KPMG',
  'PwC',
  'McKinsey',
  'BCG',
  'Bain',
  'Accenture',
  'Capgemini',
  'Cognizant',
  'Genpact',
  'EXL',
  'WNS',
  'HCL',
  'Tech Mahindra',
  'Mahindra',
  'Bajaj',
  'L&T',
  'Asian Paints',
  'Berger',
  'Marico',
  'Dabur',
  'Nestle',
  'Britannia',
  'Parle',
  'Zomato',
  'Swiggy',
  'Flipkart',
  'MakeMyTrip',
  'Paytm',
  'PhonePe',
  'Razorpay',
  'Freshworks',
  'Zoho',
  "BYJU'S",
  'Unacademy',
  'Vedantu',
  'Nykaa',
  'Lenskart',
  'Boat',
  'Mamaearth',
  'Pharmeasy',
  'Tata 1mg',
  'Ola',
  'Uber',
  'Rapido',
  'Delhivery',
  'Blue Dart',
  'DHL',
  'Maersk',
  'Aditya Birla',
  'Vedanta',
  'Hindalco',
  'JSW Steel',
  'Tata Steel',
  'Bajaj Allianz',
  'HDFC Life',
  'SBI Life',
  'Tata AIA',
  'Axis Bank',
  'Kotak',
  'Yes Bank',
  'IndusInd',
  'PNB',
  'SBI',
  'BSE',
  'NSE',
  'RBI',
  'SEBI',
  'Apna',
  'LinkedIn',
  'Naukri',
]

const FUNCTIONAL_AREA_OPTIONS = [
  'Finance',
  'HR',
  'Marketing',
  'Sales',
  'Operations',
  'IT',
  'Product',
  'Strategy',
  'SCM',
  'Customer Success',
  'Business Analytics',
  'Consulting',
  'Data Science',
  'AI & ML',
  'Digital Marketing',
  'E-commerce',
  'Healthcare Management',
  'Banking & Insurance',
  'Project Management',
  'Entrepreneurship',
  'General Management',
  'Quality Management',
  'Retail Management',
  'International Business',
  'Business Development',
  'Legal & Compliance',
  'Risk Management',
  'Sustainability & ESG',
  'UI/UX',
  'Cybersecurity',
  'Cloud & DevOps',
  'Other',
]

const ROLE_OPTIONS_BY_FUNC = {
  Finance: ['Finance Analyst', 'Accounts Executive', 'Finance Manager', 'FP&A Analyst', 'Cost Accountant', 'Treasury Analyst', 'Tax Analyst', 'Finance Controller', 'CFO', 'Other'],
  HR: ['HR Executive', 'HR Manager', 'Recruiter', 'Talent Acquisition Specialist', 'HRBP', 'Payroll Executive', 'L&D Manager', 'HR Director', 'Other'],
  Marketing: ['Marketing Executive', 'Brand Manager', 'Content Marketer', 'Marketing Manager', 'Growth Manager', 'Campaign Manager', 'Marketing Analyst', 'CMO', 'Other'],
  Sales: ['Sales Executive', 'Business Development Manager', 'Key Account Manager', 'Sales Manager', 'Inside Sales Executive', 'Territory Manager', 'Sales Head', 'VP Sales', 'Other'],
  Operations: ['Operations Executive', 'Operations Manager', 'Process Associate', 'Operations Analyst', 'Logistics Coordinator', 'Plant Manager', 'COO', 'Other'],
  IT: ['Software Developer', 'System Administrator', 'IT Support Executive', 'Network Engineer', 'Database Administrator', 'IT Manager', 'Solutions Architect', 'CTO', 'Other'],
  Product: ['Product Analyst', 'Associate Product Manager', 'Product Manager', 'Senior Product Manager', 'Group PM', 'Director of Product', 'VP Product', 'CPO', 'Other'],
  Strategy: ['Strategy Analyst', 'Business Analyst', 'Strategy Manager', 'Strategy Consultant', 'Corporate Strategy Lead', 'VP Strategy', 'Chief Strategy Officer', 'Other'],
  SCM: ['Supply Chain Analyst', 'Procurement Executive', 'Logistics Executive', 'Warehouse Manager', 'Supply Chain Manager', 'Category Manager', 'VP Supply Chain', 'Other'],
  'Customer Success': ['Customer Support Executive', 'Customer Success Manager', 'Account Manager', 'Client Relations Manager', 'CX Manager', 'VP Customer Success', 'Other'],
  'Business Analytics': ['Data Analyst', 'Business Analyst', 'Analytics Manager', 'BI Developer', 'Insights Manager', 'Analytics Lead', 'Director Analytics', 'Other'],
  Consulting: ['Analyst', 'Consultant', 'Senior Consultant', 'Engagement Manager', 'Associate Principal', 'Principal', 'Partner', 'Other'],
  'Data Science': ['Data Scientist', 'ML Engineer', 'Data Analyst', 'Research Scientist', 'AI Engineer', 'Data Science Manager', 'Chief Data Officer', 'Other'],
  'AI & ML': ['ML Engineer', 'AI Researcher', 'Data Scientist', 'NLP Engineer', 'Computer Vision Engineer', 'AI Product Manager', 'Head of AI', 'Other'],
  'Digital Marketing': ['SEO Analyst', 'SEM Specialist', 'Social Media Manager', 'Content Strategist', 'Digital Marketing Manager', 'Performance Marketer', 'Head of Digital', 'Other'],
  'E-commerce': ['E-commerce Executive', 'Category Manager', 'Marketplace Manager', 'E-commerce Analyst', 'E-commerce Manager', 'Growth Manager', 'VP E-commerce', 'Other'],
  'Healthcare Management': ['Healthcare Administrator', 'Hospital Manager', 'Clinical Coordinator', 'Healthcare Consultant', 'Operations Manager', 'CEO Hospital', 'Other'],
  'Banking & Insurance': ['Relationship Manager', 'Credit Analyst', 'Branch Manager', 'Insurance Advisor', 'Risk Analyst', 'Compliance Officer', 'VP Banking', 'Other'],
  'Project Management': ['Project Coordinator', 'Project Manager', 'Program Manager', 'Scrum Master', 'PMO Analyst', 'Portfolio Manager', 'VP Projects', 'Other'],
  Entrepreneurship: ['Founder', 'Co-Founder', 'Startup Consultant', 'Business Development Manager', 'Product Lead', 'CEO', 'Other'],
  'General Management': ['Management Trainee', 'Assistant Manager', 'Manager', 'Senior Manager', 'Deputy GM', 'General Manager', 'VP', 'Director', 'Other'],
  'Quality Management': ['Quality Analyst', 'QA Engineer', 'Quality Manager', 'Six Sigma Black Belt', 'Process Improvement Lead', 'Head of Quality', 'Other'],
  'Retail Management': ['Retail Executive', 'Store Manager', 'Area Manager', 'Visual Merchandiser', 'Retail Operations Manager', 'Regional Manager', 'VP Retail', 'Other'],
  'International Business': ['International Business Analyst', 'Export Manager', 'Trade Finance Manager', 'Business Development Manager', 'Country Manager', 'Global Head', 'Other'],
  'Business Development': ['BD Executive', 'BD Manager', 'Partnerships Manager', 'Key Accounts Manager', 'Growth Manager', 'VP Business Development', 'Other'],
  'Legal & Compliance': ['Legal Analyst', 'Compliance Officer', 'Legal Executive', 'Company Secretary', 'Legal Manager', 'General Counsel', 'Chief Legal Officer', 'Other'],
  'Risk Management': ['Risk Analyst', 'Risk Manager', 'Credit Risk Analyst', 'Operational Risk Manager', 'Chief Risk Officer', 'Other'],
  'Sustainability & ESG': ['CSR Executive', 'ESG Analyst', 'Sustainability Manager', 'Environment Officer', 'ESG Consultant', 'Head of Sustainability', 'Other'],
  'UI/UX': ['UI Designer', 'UX Researcher', 'Product Designer', 'Interaction Designer', 'UX Lead', 'Design Manager', 'Chief Design Officer', 'Other'],
  Cybersecurity: ['Security Analyst', 'Penetration Tester', 'Security Engineer', 'SOC Analyst', 'InfoSec Manager', 'CISO', 'Other'],
  'Cloud & DevOps': ['DevOps Engineer', 'Cloud Engineer', 'Site Reliability Engineer', 'Platform Engineer', 'Cloud Architect', 'VP Engineering', 'Other'],
  Other: ['Executive', 'Manager', 'Analyst', 'Consultant', 'Team Lead', 'Senior Executive', 'Other'],
}

const TAR_FUNC_OPTIONS = [...FUNCTIONAL_AREA_OPTIONS.slice(0, -1), 'Open / System should suggest', 'Other']

function isValidTenDigitPhone(phone) {
  return /^\d{10}$/.test(String(phone ?? '').trim())
}

function isValidEmail(email) {
  const t = String(email ?? '').trim()
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)
}

function sanitizeDecimalInput(raw) {
  let t = String(raw ?? '').replace(/[^0-9.]/g, '')
  const i = t.indexOf('.')
  if (i !== -1) {
    t = `${t.slice(0, i + 1)}${t.slice(i + 1).replace(/\./g, '')}`
  }
  return t
}

function scoreValid(raw, mode) {
  const t = String(raw ?? '').trim()
  if (!t) return false
  const n = Number(t)
  if (!Number.isFinite(n)) return false
  if (mode === 'pct') return n > 0 && n <= 100
  return n > 0 && n <= 10
}

export function Frame1() {
  const nav = useNavigate()
  const { s, setS, progressPct } = useAppState()
  const [panel, setPanel] = useState('profile') // profile | dreams
  const [dCoQ, setDCoQ] = useState('')
  const [dCoOpen, setDCoOpen] = useState(false)
  const dCoWrapRef = useRef(null)
  const dCoInpRef = useRef(null)

  const [funcQ, setFuncQ] = useState('')
  const [funcOpen, setFuncOpen] = useState(false)
  const funcWrapRef = useRef(null)

  const [roleQ, setRoleQ] = useState('')
  const [roleOpen, setRoleOpen] = useState(false)
  const roleWrapRef = useRef(null)

  const [tarFuncQ, setTarFuncQ] = useState('')
  const [tarFuncOpen, setTarFuncOpen] = useState(false)
  const tarFuncWrapRef = useRef(null)

  const scrollRef = useRef(null)
  const [toDestLoading, setToDestLoading] = useState(false)

  const dreamSalaryClamped = useMemo(() => {
    const n = Number(s.dSalary)
    return Number.isFinite(n) ? Math.min(50, Math.max(5, Math.round(n))) : 25
  }, [s.dSalary])

  const dreamSalaryFillPct = useMemo(() => ((dreamSalaryClamped - 5) / 45) * 100, [dreamSalaryClamped])

  useEffect(() => {
    const n = Number(s.dSalary)
    if (!Number.isFinite(n) || n < 5 || n > 50) {
      setS((p) => ({ ...p, dSalary: dreamSalaryClamped }))
      return
    }
    if (Math.round(n) !== n) {
      setS((p) => ({ ...p, dSalary: Math.round(n) }))
    }
  }, [s.dSalary, dreamSalaryClamped, setS])

  const dreamMonthly = useMemo(() => {
    const v = dreamSalaryClamped
    return Math.round((v * 100000) / 12).toLocaleString('en-IN')
  }, [dreamSalaryClamped])

  const dreamSummary = useMemo(() => {
    const parts = []
    if (s.dRole) parts.push(`<strong>${s.dRole}</strong>`)
    if (s.dCompanies.length) parts.push(`at ${s.dCompanies.map((c) => `<strong>${c}</strong>`).join(' / ')}`)
    if (s.dSalary) parts.push(`earning <strong>₹${dreamSalaryClamped}L/yr</strong>`)
    if (s.dMode === 'both') parts.push('without taking a break from work')
    else if (s.dMode === 'break') parts.push('via a focused full-time degree')
    if (s.dTarFunc && s.dTarFunc !== 'Open / System should suggest')
      parts.push(`growing in <strong>${s.dTarFunc}</strong>`)
    return parts.length ? parts.join(' ') : ''
  }, [s.dCompanies, s.dMode, s.dRole, s.dSalary, s.dTarFunc, dreamSalaryClamped])

  const dCoMatches = useMemo(() => {
    const q = dCoQ.trim().toLowerCase()
    if (!q || s.dCompanies.length >= 3) return []
    return COMMON_COMPANIES.filter((c) => c.toLowerCase().includes(q) && !s.dCompanies.includes(c)).slice(0, 8)
  }, [dCoQ, s.dCompanies])

  useEffect(() => {
    const onDown = (ev) => {
      if (!dCoWrapRef.current) return
      if (dCoWrapRef.current.contains(ev.target)) return
      setDCoOpen(false)
    }
    window.addEventListener('mousedown', onDown)
    return () => window.removeEventListener('mousedown', onDown)
  }, [])

  useEffect(() => {
    const onDown = (ev) => {
      if (!funcWrapRef.current) return
      if (funcWrapRef.current.contains(ev.target)) return
      setFuncOpen(false)
      // Keep input text aligned with selected value when closing.
      setFuncQ(s.func || '')
    }
    window.addEventListener('mousedown', onDown)
    return () => window.removeEventListener('mousedown', onDown)
  }, [s.func])

  useEffect(() => {
    const onDown = (ev) => {
      if (!roleWrapRef.current) return
      if (roleWrapRef.current.contains(ev.target)) return
      setRoleOpen(false)
      setRoleQ(s.role || '')
    }
    window.addEventListener('mousedown', onDown)
    return () => window.removeEventListener('mousedown', onDown)
  }, [s.role])

  useEffect(() => {
    const onDown = (ev) => {
      if (!tarFuncWrapRef.current) return
      if (tarFuncWrapRef.current.contains(ev.target)) return
      setTarFuncOpen(false)
      setTarFuncQ(s.dTarFunc || '')
    }
    window.addEventListener('mousedown', onDown)
    return () => window.removeEventListener('mousedown', onDown)
  }, [s.dTarFunc])

  // Reset role when functional area changes
  useEffect(() => {
    setRoleQ('')
    setS((p) => ({ ...p, role: '' }))
    setRoleOpen(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.func])

  const funcMatches = useMemo(() => {
    const q = (funcQ || '').trim().toLowerCase()
    if (!q) return FUNCTIONAL_AREA_OPTIONS
    const matched = FUNCTIONAL_AREA_OPTIONS.filter((o) => o.toLowerCase().includes(q))
    return matched.length ? matched : FUNCTIONAL_AREA_OPTIONS
  }, [funcQ])

  const roleOptions = useMemo(
    () => ROLE_OPTIONS_BY_FUNC[s.func] || ['Executive', 'Manager', 'Analyst', 'Consultant', 'Team Lead', 'Other'],
    [s.func],
  )

  const roleMatches = useMemo(() => {
    const q = (roleQ || '').trim().toLowerCase()
    if (!q) return roleOptions
    const matched = roleOptions.filter((o) => o.toLowerCase().includes(q))
    return matched.length ? matched : roleOptions
  }, [roleQ, roleOptions])

  const tarFuncMatches = useMemo(() => {
    const q = (tarFuncQ || '').trim().toLowerCase()
    if (!q) return TAR_FUNC_OPTIONS
    const matched = TAR_FUNC_OPTIONS.filter((o) => o.toLowerCase().includes(q))
    return matched.length ? matched : TAR_FUNC_OPTIONS
  }, [tarFuncQ])

  const profileReadyForDreams = useMemo(() => {
    const p = s
    if (!String(p.name || '').trim()) return false
    if (!isValidTenDigitPhone(p.phone)) return false
    if (!isValidEmail(p.email)) return false
    if (!p.edu) return false
    if (!p.bd10) return false
    if (!scoreValid(p.sc10, p.edScore10Mode || 'pct')) return false
    if (!p.bd12) return false
    if (!scoreValid(p.sc12, p.edScore12Mode || 'pct')) return false
    if (p.edu === 'UG' || p.edu === 'PG') {
      if (!String(p.uni || '').trim() || !p.year || !p.mode || !p.spec) return false
      if (!scoreValid(p.scoreUG, p.edScoreUgMode || 'pct')) return false
    }
    if (p.exp !== 'fresher') {
      if (!String(p.func || '').trim()) return false
      if (!String(p.role || '').trim()) return false
      if (!String(p.company || '').trim()) return false
      if (!String(p.yrsCur || '').trim()) return false
      if (!String(p.salary || '').trim()) return false
    }
    if (p.hasPrev) {
      if (!String(p.prevRole || '').trim()) return false
      if (!String(p.prevCo || '').trim()) return false
      if (!String(p.prevYrs || '').trim()) return false
      if (!String(p.prevWhy || '').trim()) return false
      if (!String(p.prevSal || '').trim()) return false
    }
    if (!String(p.ind || '').trim()) return false
    if (!p.english) return false
    if (!p.linkedinTier) return false
    return true
  }, [s])

  const dreamsReady = useMemo(() => {
    if (!String(s.dRole || '').trim()) return false
    if (!Array.isArray(s.dCompanies) || s.dCompanies.length < 1) return false
    if (!String(s.dTarFunc || '').trim()) return false
    if (!s.dMode) return false
    const n = Number(s.dSalary)
    if (!Number.isFinite(n)) return false
    if (n < 5 || n > 50) return false
    return true
  }, [s.dRole, s.dCompanies, s.dTarFunc, s.dMode, s.dSalary])

  const readyForAnalyse = profileReadyForDreams && dreamsReady

  const addDreamCo = (c) => {
    const v = c.trim()
    if (!v) return
    setS((p) => (p.dCompanies.includes(v) || p.dCompanies.length >= 3 ? p : { ...p, dCompanies: [...p.dCompanies, v] }))
    setDCoQ('')
    setDCoOpen(false)
    window.setTimeout(() => dCoInpRef.current?.focus(), 0)
  }

  const removeDreamCo = (c) => {
    setS((p) => ({ ...p, dCompanies: p.dCompanies.filter((x) => x !== c) }))
    window.setTimeout(() => dCoInpRef.current?.focus(), 0)
  }

  return (
    <section className="absolute inset-0 overflow-hidden">
      <div ref={scrollRef} data-scroll-top className="absolute inset-0 overflow-y-auto px-9 pb-8 pt-7">
        <div className="mx-auto grid max-w-[980px] grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
          <div>
            {/* Sub-flow indicator */}
            <div className="mb-[14px] flex items-center gap-[6px] text-[11px] font-[600] text-[#bbb]">
              <div
                className={[
                  'rounded-[20px] bg-[rgba(0,0,0,.04)] px-[10px] py-[3px]',
                  panel === 'profile' ? 'bg-[rgba(55,1,123,.07)] text-[#37017B]' : '',
                ].join(' ')}
              >
                1 · Profile
              </div>
              <span className="text-[#ddd]">›</span>
              <div
                className={[
                  'rounded-[20px] bg-[rgba(0,0,0,.04)] px-[10px] py-[3px]',
                  panel === 'dreams' ? 'bg-[rgba(55,1,123,.07)] text-[#37017B]' : '',
                ].join(' ')}
              >
                2 · Aspirations
              </div>
            </div>

            {/* PANEL 1A — PROFILE */}
            {panel === 'profile' && (
              <div>
                <div className="mb-1 text-[27px] leading-[1.2] [font-family:'DM Serif Display',serif]">
                  Let&apos;s build <em className="text-[#37017B] not-italic">your full profile.</em>
                </div>
                <div className="mb-6 text-[13px] leading-[1.55] text-[#555]">
                  Your counselor is capturing every detail. The more we know, the more accurately the system maps your real
                  career options.
                </div>

                <div className="flex flex-col gap-[11px]">
                  {/* Personal */}
                  <div className="mb-[8px] mt-[6px] flex items-center gap-2">
                    <div className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[rgba(55,1,123,.07)] text-[11px] font-[800] text-[#37017B] [font-family:'DM Serif Display',serif]">
                      1
                    </div>
                    <div className="text-[13px] font-[800] tracking-[-.01em] text-[#0C0C0C]">Personal</div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                    <div>
                      <Label required>Full Name</Label>
                      <Input value={s.name} onChange={(e) => setS((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Rohan Mehta" />
                    </div>
                    <div>
                      <Label required>Phone</Label>
                      <Input
                        value={s.phone}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, '').slice(0, 10)
                          setS((p) => ({ ...p, phone: digits }))
                        }}
                        placeholder="10-digit mobile"
                        inputMode="numeric"
                        autoComplete="tel"
                        maxLength={10}
                        pattern="\d{10}"
                        title="Enter exactly 10 digits (numbers only)"
                      />
                      {s.phone && s.phone.length < 10 ? (
                        <div className="mt-1 text-[10px] font-[600] text-[#b45309]">Enter all 10 digits (numbers only).</div>
                      ) : null}
                    </div>
                    <div>
                      <Label required>Email</Label>
                      <Input
                        type="email"
                        value={s.email}
                        onChange={(e) => setS((p) => ({ ...p, email: e.target.value }))}
                        placeholder="rohan@example.com"
                      />
                    </div>
                  </div>

                  {/* Education */}
                  <div className="mb-[8px] mt-[6px] flex items-center gap-2">
                    <div className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[rgba(55,1,123,.07)] text-[11px] font-[800] text-[#37017B] [font-family:'DM Serif Display',serif]">
                      2
                    </div>
                    <div className="text-[13px] font-[800] tracking-[-.01em] text-[#0C0C0C]">Education</div>
                  </div>

                  <div>
                    <Label required>Highest Qualification</Label>
                    <ToggleGroup>
                      <ToggleButton active={s.edu === '12'} onClick={() => setS((p) => ({ ...p, edu: '12' }))}>
                        12th / Diploma
                      </ToggleButton>
                      <ToggleButton active={s.edu === 'UG'} onClick={() => setS((p) => ({ ...p, edu: 'UG' }))}>
                        Graduate (UG)
                      </ToggleButton>
                      <ToggleButton active={s.edu === 'PG'} onClick={() => setS((p) => ({ ...p, edu: 'PG' }))}>
                        Post Graduate (PG)
                      </ToggleButton>
                    </ToggleGroup>
                  </div>

                  {/* Class 10 */}
                  <div className="rounded-[11px] border border-[rgba(0,0,0,.07)] bg-[rgba(255,255,255,.5)] px-[13px] pb-[13px] pt-[11px]">
                    <div className="mb-[9px] flex items-center gap-[6px] text-[10px] font-[800] uppercase tracking-[.08em] text-[#37017B]">
                      Class 10
                      <span className="h-[1px] flex-1 bg-[repeating-linear-gradient(90deg,rgba(55,1,123,.18)_0_2px,transparent_2px_5px)]" />
                    </div>
                    <div className="mb-[10px] flex flex-wrap items-center justify-end gap-2">
                      <span className="text-[10px] font-[700] uppercase tracking-[.07em] text-[#aaa]">Score format</span>
                      <ScoreFormatToggleGroup>
                        <ScoreFormatToggleButton
                          active={s.edScore10Mode === 'pct'}
                          onClick={() => setS((p) => ({ ...p, edScore10Mode: 'pct' }))}
                        >
                          %
                        </ScoreFormatToggleButton>
                        <ScoreFormatToggleButton
                          active={s.edScore10Mode === 'cgpa'}
                          onClick={() => setS((p) => ({ ...p, edScore10Mode: 'cgpa' }))}
                        >
                          CGPA
                        </ScoreFormatToggleButton>
                      </ScoreFormatToggleGroup>
                    </div>
                    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                      <div>
                        <Label required>Board</Label>
                        <Select value={s.bd10} onChange={(e) => setS((p) => ({ ...p, bd10: e.target.value }))}>
                          <option value="">Select board</option>
                          <option>CBSE</option>
                          <option>ICSE</option>
                          <option>State Board</option>
                          <option>IB / Cambridge</option>
                          <option>Other</option>
                        </Select>
                      </div>
                      <div>
                        <Label required>{s.edScore10Mode === 'cgpa' ? 'CGPA (10 pt)' : 'Score (%)'}</Label>
                        <Input
                          value={s.sc10}
                          onChange={(e) => setS((p) => ({ ...p, sc10: sanitizeDecimalInput(e.target.value) }))}
                          placeholder={s.edScore10Mode === 'cgpa' ? 'e.g. 9.2' : 'e.g. 88'}
                          inputMode="decimal"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Class 12 */}
                  <div className="rounded-[11px] border border-[rgba(0,0,0,.07)] bg-[rgba(255,255,255,.5)] px-[13px] pb-[13px] pt-[11px]">
                    <div className="mb-[9px] flex items-center gap-[6px] text-[10px] font-[800] uppercase tracking-[.08em] text-[#37017B]">
                      Class 12 / Diploma
                      <span className="h-[1px] flex-1 bg-[repeating-linear-gradient(90deg,rgba(55,1,123,.18)_0_2px,transparent_2px_5px)]" />
                    </div>
                    <div className="mb-[10px] flex flex-wrap items-center justify-end gap-2">
                      <span className="text-[10px] font-[700] uppercase tracking-[.07em] text-[#aaa]">Score format</span>
                      <ScoreFormatToggleGroup>
                        <ScoreFormatToggleButton
                          active={s.edScore12Mode === 'pct'}
                          onClick={() => setS((p) => ({ ...p, edScore12Mode: 'pct' }))}
                        >
                          %
                        </ScoreFormatToggleButton>
                        <ScoreFormatToggleButton
                          active={s.edScore12Mode === 'cgpa'}
                          onClick={() => setS((p) => ({ ...p, edScore12Mode: 'cgpa' }))}
                        >
                          CGPA
                        </ScoreFormatToggleButton>
                      </ScoreFormatToggleGroup>
                    </div>
                    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                      <div>
                        <Label required>Board</Label>
                        <Select value={s.bd12} onChange={(e) => setS((p) => ({ ...p, bd12: e.target.value }))}>
                          <option value="">Select board</option>
                          <option>CBSE</option>
                          <option>ICSE</option>
                          <option>State Board</option>
                          <option>IB / Cambridge</option>
                          <option>NIOS</option>
                          <option>Diploma</option>
                          <option>Other</option>
                        </Select>
                      </div>
                      <div>
                        <Label required>{s.edScore12Mode === 'cgpa' ? 'CGPA (10 pt)' : 'Score (%)'}</Label>
                        <Input
                          value={s.sc12}
                          onChange={(e) => setS((p) => ({ ...p, sc12: sanitizeDecimalInput(e.target.value) }))}
                          placeholder={s.edScore12Mode === 'cgpa' ? 'e.g. 8.6' : 'e.g. 72'}
                          inputMode="decimal"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Higher education */}
                  {(s.edu === 'UG' || s.edu === 'PG') && (
                    <div className="rounded-[11px] border border-[rgba(0,0,0,.07)] bg-[rgba(255,255,255,.5)] px-[13px] pb-[13px] pt-[11px]">
                      <div className="mb-[9px] flex items-center gap-[6px] text-[10px] font-[800] uppercase tracking-[.08em] text-[#37017B]">
                        {s.edu === 'PG' ? 'Post Graduate Education' : 'Higher Education'}
                        <span className="h-[1px] flex-1 bg-[repeating-linear-gradient(90deg,rgba(55,1,123,.18)_0_2px,transparent_2px_5px)]" />
                      </div>
                      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                        <div>
                          <Label required>University</Label>
                          <Input value={s.uni} onChange={(e) => setS((p) => ({ ...p, uni: e.target.value }))} placeholder="e.g. Osmania University" />
                        </div>
                        <div>
                          <Label required>Year of Passing</Label>
                          <Select value={s.year} onChange={(e) => setS((p) => ({ ...p, year: e.target.value }))}>
                            <option value="">Year</option>
                            <option>2025</option>
                            <option>2024</option>
                            <option>2023</option>
                            <option>2022</option>
                            <option>2021</option>
                            <option>2020</option>
                            <option>2019</option>
                            <option>2018 or earlier</option>
                          </Select>
                        </div>
                        <div>
                          <Label required>Mode</Label>
                          <Select value={s.mode} onChange={(e) => setS((p) => ({ ...p, mode: e.target.value }))}>
                            <option value="">Select mode</option>
                            <option>Regular (Full-time)</option>
                            <option>Part-time</option>
                            <option>Distance / Online</option>
                            <option>Open School</option>
                          </Select>
                        </div>
                      </div>

                      <div className="mt-[9px]">
                        <div className="mb-[10px] flex flex-wrap items-center justify-end gap-2">
                          <span className="text-[10px] font-[700] uppercase tracking-[.07em] text-[#aaa]">Score format</span>
                          <ScoreFormatToggleGroup>
                            <ScoreFormatToggleButton
                              active={s.edScoreUgMode === 'pct'}
                              onClick={() => setS((p) => ({ ...p, edScoreUgMode: 'pct' }))}
                            >
                              %
                            </ScoreFormatToggleButton>
                            <ScoreFormatToggleButton
                              active={s.edScoreUgMode === 'cgpa'}
                              onClick={() => setS((p) => ({ ...p, edScoreUgMode: 'cgpa' }))}
                            >
                              CGPA
                            </ScoreFormatToggleButton>
                          </ScoreFormatToggleGroup>
                        </div>
                        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                          <div>
                            <Label required>Specialisation</Label>
                            <Select value={s.spec} onChange={(e) => setS((p) => ({ ...p, spec: e.target.value }))}>
                              <option value="">Select specialisation</option>
                              <option>BBA — General</option>
                              <option>BBA — Finance</option>
                              <option>BBA — HR</option>
                              <option>BBA — Marketing</option>
                              <option>BCom — General</option>
                              <option>BCom — Honours</option>
                              <option>BCom — Computers</option>
                              <option>BSc — Computer Science</option>
                              <option>BSc — General</option>
                              <option>BA — General</option>
                              <option>BA — Economics</option>
                              <option>BTech / BE</option>
                              <option>Diploma</option>
                              <option>MBA — General</option>
                              <option>MBA — Finance</option>
                              <option>MBA — HR</option>
                              <option>MBA — Marketing</option>
                              <option>MCA</option>
                              <option>MTech</option>
                              <option>MA — General</option>
                              <option>MSc — General</option>
                              <option>Other</option>
                            </Select>
                          </div>
                          <div>
                            <Label required>{s.edScoreUgMode === 'cgpa' ? 'CGPA (10 pt)' : 'Score (%)'}</Label>
                            <Input
                              value={s.scoreUG}
                              onChange={(e) => setS((p) => ({ ...p, scoreUG: sanitizeDecimalInput(e.target.value) }))}
                              placeholder={s.edScoreUgMode === 'cgpa' ? 'e.g. 7.4' : 'e.g. 68'}
                              inputMode="decimal"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Work */}
                  <div className="mb-[8px] mt-[6px] flex items-center gap-2">
                    <div className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[rgba(55,1,123,.07)] text-[11px] font-[800] text-[#37017B] [font-family:'DM Serif Display',serif]">
                      3
                    </div>
                    <div className="text-[13px] font-[800] tracking-[-.01em] text-[#0C0C0C]">Work Experience</div>
                  </div>

                  <div>
                    <Label required>Total Experience</Label>
                    <ToggleGroup>
                      <ToggleButton active={s.exp === 'fresher'} onClick={() => setS((p) => ({ ...p, exp: 'fresher' }))}>
                        Fresher
                      </ToggleButton>
                      <ToggleButton active={s.exp === '0-1'} onClick={() => setS((p) => ({ ...p, exp: '0-1' }))}>
                        Under 1 Yr
                      </ToggleButton>
                      <ToggleButton active={s.exp === '1-3'} onClick={() => setS((p) => ({ ...p, exp: '1-3' }))}>
                        1–3 Yrs
                      </ToggleButton>
                      <ToggleButton active={s.exp === '3-6'} onClick={() => setS((p) => ({ ...p, exp: '3-6' }))}>
                        3–6 Yrs
                      </ToggleButton>
                      <ToggleButton active={s.exp === '6+'} onClick={() => setS((p) => ({ ...p, exp: '6+' }))}>
                        6+ Yrs
                      </ToggleButton>
                    </ToggleGroup>
                  </div>

                  {s.exp !== 'fresher' && (
                    <div className="rounded-[11px] border border-[rgba(0,0,0,.07)] bg-[rgba(255,255,255,.5)] p-[13px]">
                      <div className="mb-[9px] flex items-center justify-between">
                        <div className="text-[11px] font-[700] uppercase tracking-[.06em] text-[#37017B]">Current Role</div>
                      </div>
                      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                        <div>
                          <Label required>Functional Area</Label>
                          <div ref={funcWrapRef} className="relative">
                            <div
                              className="min-h-[42px] rounded-[9px] border-[1.5px] border-[rgba(0,0,0,.09)] bg-white px-[11px] py-[8px]"
                              onMouseDown={() => setFuncOpen(true)}
                            >
                              <input
                                value={funcQ}
                                onChange={(e) => {
                                  setFuncQ(e.target.value)
                                  setFuncOpen(true)
                                }}
                                onFocus={() => setFuncOpen(true)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault()
                                    const first = funcMatches[0]
                                    if (!first) return
                                    setS((p) => ({ ...p, func: first }))
                                    setFuncQ(first)
                                    setFuncOpen(false)
                                  }
                                  if (e.key === 'Escape') setFuncOpen(false)
                                }}
                                placeholder={s.func ? '' : 'Search a function…'}
                                className="w-full border-0 bg-transparent px-0 py-[3px] text-[13px] outline-none placeholder:text-[#ccc]"
                                autoComplete="off"
                              />
                            </div>

                            {funcOpen && (
                              <div className="absolute left-0 top-[calc(100%+4px)] z-50 max-h-[220px] w-full overflow-y-auto rounded-[9px] border border-[rgba(55,1,123,.14)] bg-white p-[5px] shadow-[0_6px_24px_rgba(55,1,123,.12)]">
                                {funcMatches.map((opt) => {
                                  const selected = s.func === opt
                                  return (
                                    <button
                                      key={opt}
                                      type="button"
                                      className={[
                                        'block w-full rounded-[6px] px-[10px] py-[7px] text-left text-[12px] transition-colors',
                                        selected ? 'bg-[rgba(55,1,123,.08)] text-[#37017B] font-[800]' : 'text-[#0C0C0C] hover:bg-[rgba(55,1,123,.07)] hover:text-[#37017B]',
                                      ].join(' ')}
                                      onMouseDown={(ev) => ev.preventDefault()}
                                      onClick={() => {
                                        setS((p) => ({ ...p, func: opt }))
                                        setFuncQ(opt)
                                        setFuncOpen(false)
                                      }}
                                    >
                                      {opt}
                                    </button>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          <Label required>Role / Designation</Label>
                          <div ref={roleWrapRef} className="relative">
                            <div
                              className="min-h-[42px] rounded-[9px] border-[1.5px] border-[rgba(0,0,0,.09)] bg-white px-[11px] py-[8px]"
                              onMouseDown={() => setRoleOpen(true)}
                            >
                              <input
                                value={roleQ}
                                onChange={(e) => {
                                  setRoleQ(e.target.value)
                                  setRoleOpen(true)
                                }}
                                onFocus={() => setRoleOpen(true)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault()
                                    const first = roleMatches[0]
                                    if (!first) return
                                    setS((p) => ({ ...p, role: first }))
                                    setRoleQ(first)
                                    setRoleOpen(false)
                                  }
                                  if (e.key === 'Escape') setRoleOpen(false)
                                }}
                                placeholder={s.func ? 'Search or type a role…' : 'Select a function first'}
                                disabled={!s.func}
                                className="w-full border-0 bg-transparent px-0 py-[3px] text-[13px] outline-none placeholder:text-[#ccc] disabled:cursor-not-allowed"
                                autoComplete="off"
                              />
                            </div>
                            {roleOpen && s.func && (
                              <div className="absolute left-0 top-[calc(100%+4px)] z-50 max-h-[220px] w-full overflow-y-auto rounded-[9px] border border-[rgba(55,1,123,.14)] bg-white p-[5px] shadow-[0_6px_24px_rgba(55,1,123,.12)]">
                                {roleMatches.map((opt) => {
                                  const selected = s.role === opt
                                  return (
                                    <button
                                      key={opt}
                                      type="button"
                                      className={[
                                        'block w-full rounded-[6px] px-[10px] py-[7px] text-left text-[12px] transition-colors',
                                        selected ? 'bg-[rgba(55,1,123,.08)] text-[#37017B] font-[800]' : 'text-[#0C0C0C] hover:bg-[rgba(55,1,123,.07)] hover:text-[#37017B]',
                                      ].join(' ')}
                                      onMouseDown={(ev) => ev.preventDefault()}
                                      onClick={() => {
                                        setS((p) => ({ ...p, role: opt }))
                                        setRoleQ(opt)
                                        setRoleOpen(false)
                                      }}
                                    >
                                      {opt}
                                    </button>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          <Label required>Level</Label>
                          <ToggleGroup className="text-[10px]">
                            <ToggleButton active={s.level === 'IC'} onClick={() => setS((p) => ({ ...p, level: 'IC' }))}>
                              Individual Contributor
                            </ToggleButton>
                            <ToggleButton active={s.level === 'MG'} onClick={() => setS((p) => ({ ...p, level: 'MG' }))}>
                              Manager
                            </ToggleButton>
                          </ToggleGroup>
                        </div>
                      </div>
                      <div className="mt-[9px] grid grid-cols-1 gap-3 lg:grid-cols-3">
                        <div>
                          <Label required>Current Company</Label>
                          <Input value={s.company} onChange={(e) => setS((p) => ({ ...p, company: e.target.value }))} placeholder="e.g. Infosys" />
                        </div>
                        <div>
                          <Label required>Years at Company</Label>
                          <Input value={s.yrsCur} onChange={(e) => setS((p) => ({ ...p, yrsCur: e.target.value }))} placeholder="e.g. 1.5" />
                        </div>
                        <div>
                          <Label required>Monthly Salary (₹)</Label>
                          <Input value={s.salary} onChange={(e) => setS((p) => ({ ...p, salary: e.target.value }))} placeholder="e.g. 24000" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Previous role block */}
                  {s.exp !== 'fresher' && (
                    <>
                      {s.hasPrev && (
                        <div className="rounded-[11px] border border-[rgba(0,0,0,.07)] bg-[rgba(255,255,255,.5)] p-[13px]">
                          <div className="mb-[9px] flex items-center justify-between">
                            <div className="text-[11px] font-[700] uppercase tracking-[.06em] text-[#37017B]">Previous Role</div>
                            <button
                              className="border-0 bg-transparent text-[10px] font-[600] text-[#aaa] underline"
                              onClick={() =>
                                setS((p) => ({
                                  ...p,
                                  hasPrev: false,
                                  prevRole: '',
                                  prevCo: '',
                                  prevYrs: '',
                                  prevWhy: '',
                                  prevSal: '',
                                }))
                              }
                            >
                              Remove
                            </button>
                          </div>
                          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                            <div>
                              <Label required>Previous Role</Label>
                              <Input value={s.prevRole} onChange={(e) => setS((p) => ({ ...p, prevRole: e.target.value }))} placeholder="e.g. HR Trainee" />
                            </div>
                            <div>
                              <Label required>Previous Company</Label>
                              <Input value={s.prevCo} onChange={(e) => setS((p) => ({ ...p, prevCo: e.target.value }))} placeholder="e.g. TCS" />
                            </div>
                            <div>
                              <Label required>Years</Label>
                              <Input value={s.prevYrs} onChange={(e) => setS((p) => ({ ...p, prevYrs: e.target.value }))} placeholder="e.g. 2" />
                            </div>
                          </div>
                          <div className="mt-[9px] grid grid-cols-1 gap-3 lg:grid-cols-3">
                            <div className="lg:col-span-2">
                              <Label required>Why Did You Leave</Label>
                              <Input
                                value={s.prevWhy}
                                onChange={(e) => setS((p) => ({ ...p, prevWhy: e.target.value }))}
                                placeholder="e.g. Better growth opportunity"
                              />
                            </div>
                            <div>
                              <Label required>Last Salary (₹)</Label>
                              <Input value={s.prevSal} onChange={(e) => setS((p) => ({ ...p, prevSal: e.target.value }))} placeholder="e.g. 18000" />
                            </div>
                          </div>
                        </div>
                      )}

                      {!s.hasPrev && (
                        <button
                          className="w-full cursor-pointer rounded-[9px] border border-dashed border-[rgba(55,1,123,.14)] bg-[rgba(55,1,123,.07)] px-3 py-[9px] text-[11px] font-[700] text-[#37017B] transition-colors duration-200 hover:bg-[rgba(55,1,123,.14)]"
                          onClick={() => setS((p) => ({ ...p, hasPrev: true }))}
                        >
                          + Add Previous Experience
                        </button>
                      )}
                    </>
                  )}

                  {/* Skills & Inputs */}
                  <div className="mb-[8px] mt-[6px] flex items-center gap-2">
                    <div className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[rgba(55,1,123,.07)] text-[11px] font-[800] text-[#37017B] [font-family:'DM Serif Display',serif]">
                      4
                    </div>
                    <div className="text-[13px] font-[800] tracking-[-.01em] text-[#0C0C0C]">Skills & Inputs</div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                    <div>
                      <Label required>Industry</Label>
                      <Input value={s.ind} onChange={(e) => setS((p) => ({ ...p, ind: e.target.value }))} placeholder="e.g. Banking, IT, FMCG" />
                    </div>
                    <div>
                      <Label required>Spoken English</Label>
                      <Select value={s.english} onChange={(e) => setS((p) => ({ ...p, english: e.target.value }))}>
                        <option value="">Select level</option>
                        <option>Basic</option>
                        <option>Conversational</option>
                        <option>Fluent</option>
                        <option>Business / Professional</option>
                      </Select>
                    </div>
                    <div>
                      <Label required>LinkedIn Connections</Label>
                      <Select value={s.linkedinTier} onChange={(e) => setS((p) => ({ ...p, linkedinTier: e.target.value }))}>
                        <option value="">Select range</option>
                        <option>0–50</option>
                        <option>50–200</option>
                        <option>200–500</option>
                        <option>500–1000</option>
                        <option>1000+</option>
                        <option>Not on LinkedIn</option>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                    <div>
                      <Label optional>Projects</Label>
                      <Input value={s.projects} onChange={(e) => setS((p) => ({ ...p, projects: e.target.value }))} placeholder="e.g. College finance project, Excel dashboard" />
                    </div>
                    <div>
                      <Label optional>Internships</Label>
                      <Input value={s.internships} onChange={(e) => setS((p) => ({ ...p, internships: e.target.value }))} placeholder="e.g. 2 mo HDFC, 3 mo retail audit" />
                    </div>
                  </div>
                </div>

                <div className="mt-[22px] flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-[10px]">
                  <Button disabled={!profileReadyForDreams} onClick={() => { if (profileReadyForDreams) { setPanel('dreams'); window.setTimeout(() => scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' }), 0) } }}>
                    Continue to Aspirations →
                  </Button>
                  {!profileReadyForDreams ? (
                    <span className="text-[11px] font-[600] text-[#b45309]">Complete all required fields (*) to continue.</span>
                  ) : null}
                </div>
              </div>
            )}

            {/* PANEL 1B — DREAMS */}
            {panel === 'dreams' && (
              <div>
                <div className="mb-1 text-[27px] leading-[1.2] [font-family:'DM Serif Display',serif]">
                  Now — what are <em className="text-[#37017B] not-italic">your aspirations?</em>
                </div>
                <div className="mb-6 text-[13px] leading-[1.55] text-[#555]">
                  No wrong answers. The system uses these to weight which destinations match your ambition — and which paths
                  protect you from undershooting.
                </div>

                <div className="flex flex-col gap-[13px]">
                  <div className="flex items-center gap-2">
                    <div className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[rgba(55,1,123,.07)] text-[11px] font-[800] text-[#37017B] [font-family:'DM Serif Display',serif]">
                      1
                    </div>
                    <div className="text-[13px] font-[800] tracking-[-.01em] text-[#0C0C0C]">Dream Role</div>
                    <div className="ml-auto text-[10.5px] text-[#bbb]">
                      What role would feel like a real win 5 years from now?
                    </div>
                  </div>
                  <Label required>Dream role</Label>
                  <Input value={s.dRole} onChange={(e) => setS((p) => ({ ...p, dRole: e.target.value }))} placeholder="Type or pick — e.g. Finance Manager" />

                  <div className="flex items-center gap-2">
                    <div className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[rgba(55,1,123,.07)] text-[11px] font-[800] text-[#37017B] [font-family:'DM Serif Display',serif]">
                      2
                    </div>
                    <div className="text-[13px] font-[800] tracking-[-.01em] text-[#0C0C0C]">Dream Companies</div>
                    <div className="ml-auto text-[10.5px] text-[#bbb]">Pick 1–3</div>
                  </div>
                  <Label required>Dream companies</Label>
                  <div ref={dCoWrapRef} className="relative">
                    <div
                      className="min-h-[42px] rounded-[9px] border-[1.5px] border-[rgba(0,0,0,.09)] bg-white px-[11px] py-[8px]"
                      onMouseDown={() => window.setTimeout(() => dCoInpRef.current?.focus(), 0)}
                    >
                      <div className="flex flex-wrap items-center gap-[6px]">
                        {s.dCompanies.map((c) => (
                          <span
                            key={c}
                            className="inline-flex items-center gap-[6px] rounded-[20px] border border-[rgba(55,1,123,.14)] bg-[rgba(55,1,123,.07)] px-[10px] py-[4px] text-[11px] font-[600] text-[#37017B]"
                          >
                            {c}
                            <button
                              className="text-[13px] leading-none text-[#37017B]/60 hover:text-[#37017B]"
                              onMouseDown={(ev) => ev.preventDefault()}
                              onClick={(ev) => {
                                ev.preventDefault()
                                removeDreamCo(c)
                              }}
                            >
                              ×
                            </button>
                          </span>
                        ))}

                        <input
                          ref={dCoInpRef}
                          disabled={s.dCompanies.length >= 3}
                          value={dCoQ}
                          onChange={(e) => {
                            setDCoQ(e.target.value)
                            setDCoOpen(true)
                          }}
                          onFocus={() => setDCoOpen(true)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              if (dCoMatches.length) addDreamCo(dCoMatches[0])
                              else addDreamCo(dCoQ)
                              return
                            }
                            if (e.key === 'Backspace' && !dCoQ && s.dCompanies.length) {
                              setS((p) => ({ ...p, dCompanies: p.dCompanies.slice(0, -1) }))
                            }
                            if (e.key === 'Escape') setDCoOpen(false)
                          }}
                          placeholder={
                            s.dCompanies.length === 0
                              ? 'Type a company name…'
                              : s.dCompanies.length >= 3
                                ? 'Maximum 3 companies'
                                : 'Add another…'
                          }
                          className="min-w-[120px] flex-1 border-0 bg-transparent px-0 py-[3px] text-[12px] outline-none placeholder:text-[#ccc] disabled:cursor-not-allowed disabled:text-[#bbb]"
                          autoComplete="off"
                        />
                      </div>
                    </div>

                    {dCoOpen && dCoMatches.length > 0 && s.dCompanies.length < 3 && (
                      <div className="absolute left-0 top-[calc(100%+4px)] z-50 max-h-[180px] w-full overflow-y-auto rounded-[9px] border border-[rgba(55,1,123,.14)] bg-white p-[5px] shadow-[0_6px_24px_rgba(55,1,123,.12)]">
                        {dCoMatches.map((c) => (
                          <button
                            key={c}
                            className="block w-full rounded-[6px] px-[10px] py-[6px] text-left text-[12px] text-[#0C0C0C] hover:bg-[rgba(55,1,123,.07)] hover:text-[#37017B]"
                            onMouseDown={(ev) => ev.preventDefault()}
                            onClick={() => addDreamCo(c)}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[rgba(55,1,123,.07)] text-[11px] font-[800] text-[#37017B] [font-family:'DM Serif Display',serif]">
                      3
                    </div>
                    <div className="text-[13px] font-[800] tracking-[-.01em] text-[#0C0C0C]">Dream Salary</div>
                    <div className="ml-auto text-[10.5px] text-[#bbb]">By Year 5 (LPA)</div>
                  </div>
                  <Label required>Target package</Label>
                  <div className="rounded-[11px] border-[1.5px] border-[rgba(0,0,0,.09)] bg-white px-4 py-[14px]">
                    <div className="mb-[11px] flex items-baseline justify-between">
                      <div className="[font-family:'DM Serif Display',serif] text-[24px] text-[#37017B]">
                        ₹<span className="tabular-nums">{dreamSalaryClamped}</span>
                        <span className="ml-[3px] font-[600] text-[#555] [font-family:Outfit,system-ui,sans-serif]">
                          LPA
                        </span>
                      </div>
                      <div className="text-[10px] font-[600] text-[#bbb]">
                        ≈ ₹<span className="tabular-nums">{dreamMonthly}</span>/mo
                      </div>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={50}
                      step={1}
                      value={dreamSalaryClamped}
                      onChange={(e) => setS((p) => ({ ...p, dSalary: Number(e.target.value) }))}
                      className="dream-salary-range w-full cursor-pointer"
                      style={{ '--fill-pct': `${dreamSalaryFillPct}%` }}
                    />
                    <div className="mt-[6px] flex justify-between text-[9px] font-[600] text-[#ccc]">
                      <span>5L</span>
                      <span>15L</span>
                      <span>25L</span>
                      <span>35L</span>
                      <span>50L+</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[rgba(55,1,123,.07)] text-[11px] font-[800] text-[#37017B] [font-family:'DM Serif Display',serif]">
                      4
                    </div>
                    <div className="text-[13px] font-[800] tracking-[-.01em] text-[#0C0C0C]">Preferred Mode</div>
                    <div className="ml-auto text-[10.5px] text-[#bbb]">If a degree becomes part of the plan</div>
                  </div>
                  <Label required>Preferred mode</Label>
                  <ToggleGroup>
                    <ToggleButton active={s.dMode === 'both'} onClick={() => setS((p) => ({ ...p, dMode: 'both' }))}>
                      Work + Study (no break)
                    </ToggleButton>
                    <ToggleButton active={s.dMode === 'break'} onClick={() => setS((p) => ({ ...p, dMode: 'break' }))}>
                      Career break — full-time degree
                    </ToggleButton>
                    <ToggleButton active={s.dMode === 'uns'} onClick={() => setS((p) => ({ ...p, dMode: 'uns' }))}>
                      Not sure yet
                    </ToggleButton>
                  </ToggleGroup>

                  <div className="flex items-center gap-2">
                    <div className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[rgba(55,1,123,.07)] text-[11px] font-[800] text-[#37017B] [font-family:'DM Serif Display',serif]">
                      5
                    </div>
                    <div className="text-[13px] font-[800] tracking-[-.01em] text-[#0C0C0C]">Target Functional Area</div>
                    <div className="ml-auto text-[10.5px] text-[#bbb]">Where do you see yourself growing?</div>
                  </div>
                  <Label required>Target functional area</Label>
                  <div ref={tarFuncWrapRef} className="relative">
                    <div
                      className="min-h-[42px] rounded-[9px] border-[1.5px] border-[rgba(0,0,0,.09)] bg-white px-[11px] py-[8px]"
                      onMouseDown={() => setTarFuncOpen(true)}
                    >
                      <input
                        value={tarFuncQ}
                        onChange={(e) => {
                          setTarFuncQ(e.target.value)
                          setTarFuncOpen(true)
                        }}
                        onFocus={() => setTarFuncOpen(true)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            const first = tarFuncMatches[0]
                            if (!first) return
                            setS((p) => ({ ...p, dTarFunc: first }))
                            setTarFuncQ(first)
                            setTarFuncOpen(false)
                          }
                          if (e.key === 'Escape') setTarFuncOpen(false)
                        }}
                        placeholder={s.dTarFunc ? '' : 'Search a function…'}
                        className="w-full border-0 bg-transparent px-0 py-[3px] text-[13px] outline-none placeholder:text-[#ccc]"
                        autoComplete="off"
                      />
                    </div>
                    {tarFuncOpen && (
                      <div className="absolute left-0 top-[calc(100%+4px)] z-50 max-h-[220px] w-full overflow-y-auto rounded-[9px] border border-[rgba(55,1,123,.14)] bg-white p-[5px] shadow-[0_6px_24px_rgba(55,1,123,.12)]">
                        {tarFuncMatches.map((opt) => {
                          const selected = s.dTarFunc === opt
                          return (
                            <button
                              key={opt}
                              type="button"
                              className={[
                                'block w-full rounded-[6px] px-[10px] py-[7px] text-left text-[12px] transition-colors',
                                selected ? 'bg-[rgba(55,1,123,.08)] text-[#37017B] font-[800]' : 'text-[#0C0C0C] hover:bg-[rgba(55,1,123,.07)] hover:text-[#37017B]',
                              ].join(' ')}
                              onMouseDown={(ev) => ev.preventDefault()}
                              onClick={() => {
                                setS((p) => ({ ...p, dTarFunc: opt }))
                                setTarFuncQ(opt)
                                setTarFuncOpen(false)
                              }}
                            >
                              {opt}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  <div className="mt-[14px] rounded-[11px] border border-[rgba(55,1,123,.14)] bg-[linear-gradient(135deg,rgba(55,1,123,.07),rgba(117,4,255,.04))] px-4 py-[13px]">
                    <div className="mb-[6px] text-[10px] font-[800] uppercase tracking-[.07em] text-[#37017B]">
                      Compiled aspiration
                    </div>
                    <div
                      className="text-[12px] leading-[1.55] text-[#0C0C0C]"
                      dangerouslySetInnerHTML={{
                        __html: dreamSummary || 'Fill in above and your goals appear here.',
                      }}
                    />
                  </div>
                </div>

                <div className="mt-[22px] flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-[10px]">
                  <Button variant="ghost" onClick={() => { setPanel('profile'); window.setTimeout(() => scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' }), 0) }}>
                    ← Back to Profile
                  </Button>
                  <Button disabled={!readyForAnalyse} onClick={() => readyForAnalyse && setToDestLoading(true)}>
                    Analyse My Profile →
                  </Button>
                  {!readyForAnalyse ? (
                    <span className="text-[11px] font-[600] text-[#b45309]">
                      {!profileReadyForDreams
                        ? 'Profile is incomplete — fix required fields on step 1.'
                        : 'Complete every aspiration field (*) before analysing.'}
                    </span>
                  ) : null}
                </div>
              </div>
            )}
          </div>

          {/* Right sticky card */}
          <div>
            <LiveProfileCard s={s} progressPct={progressPct} />
          </div>
        </div>
      </div>

      <RunLoadOverlay
        open={toDestLoading}
        variant="profile"
        totalMs={7200}
        onDone={() => {
          setToDestLoading(false)
          nav('/2')
        }}
      />
    </section>
  )
}

