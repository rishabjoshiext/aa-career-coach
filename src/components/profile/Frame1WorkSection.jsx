import { useEffect, useMemo, useRef, useState } from 'react'
import { Label } from '../ui/Label.jsx'
import { Select } from '../ui/Select.jsx'
import { ToggleButton, ToggleGroup } from '../ui/Toggle.jsx'
import { Input } from '../ui/Input.jsx'
import { DropdownLayer } from '../ui/DropdownLayer.jsx'
import {
  expBandFromTotalMonths,
  functionalAreaFromIndustry,
  searchIndustries,
  searchWorkEmployers,
  searchWorkRoles,
} from '../../data/workExperienceData.js'

function useClickOutside(ref, onClose, active) {
  useEffect(() => {
    if (!active) return
    const down = (ev) => {
      if (!ref.current) return
      if (ref.current.contains(ev.target)) return
      if (ev.target.closest?.('[data-autocomplete-layer]')) return
      onClose()
    }
    window.addEventListener('mousedown', down)
    return () => window.removeEventListener('mousedown', down)
  }, [ref, onClose, active])
}

function patchExperienceFromYM(setS, yearsStr, monthsStr) {
  const y = parseInt(String(yearsStr ?? ''), 10)
  const mRaw = monthsStr === '' || monthsStr == null ? 0 : parseInt(String(monthsStr), 10)
  if (!Number.isFinite(y) || y < 0 || y > 50) return
  if (!Number.isFinite(mRaw) || mRaw < 0 || mRaw > 11) return
  const total = y * 12 + mRaw
  const exp = expBandFromTotalMonths(total)
  setS((p) => ({
    ...p,
    totalExpYears: String(y),
    totalExpMonths: monthsStr === '' ? '' : String(mRaw),
    exp,
  }))
}

function selectFresher(setS) {
  setS((p) => ({
    ...p,
    exp: 'fresher',
    totalExpYears: '',
    totalExpMonths: '',
    company: '',
    role: '',
    salary: '',
    ind: '',
    func: '',
    level: 'IC',
  }))
}

const chipSelected = 'border-[#37017B] bg-[#37017B] text-white shadow-[0_2px_10px_rgba(55,1,123,.2)]'
const chipIdle = 'border-[rgba(0,0,0,.12)] bg-white text-[#0C0C0C] hover:border-[rgba(55,1,123,.35)]'

export function Frame1WorkSection({ s, setS }) {
  const isFresher = s.exp === 'fresher'
  const hasWork = Boolean(s.exp) && s.exp !== 'fresher'

  const [coQ, setCoQ] = useState(s.company || '')
  const [coFocused, setCoFocused] = useState(false)
  const coWrap = useRef(null)

  const [indQ, setIndQ] = useState(s.ind || '')
  const [indOpen, setIndOpen] = useState(false)
  const indWrap = useRef(null)

  const [roleQ, setRoleQ] = useState(s.role || '')
  const [roleFocused, setRoleFocused] = useState(false)
  const roleWrap = useRef(null)

  useEffect(() => {
    setCoQ(s.company || '')
  }, [s.company])
  useEffect(() => {
    setIndQ(s.ind || '')
  }, [s.ind])
  useEffect(() => {
    setRoleQ(s.role || '')
  }, [s.role])

  const coHits = useMemo(() => searchWorkEmployers(coQ, 28), [coQ])
  const indOpts = useMemo(() => searchIndustries(indQ, 24), [indQ])
  const roleHits = useMemo(() => searchWorkRoles(roleQ, 48), [roleQ])

  const showCoDd = coFocused && (coQ || '').trim().length > 0 && coHits.length > 0
  const showRoleDd = roleFocused && (roleQ || '').trim().length > 0 && roleHits.length > 0

  useClickOutside(
    coWrap,
    () => {
      setCoFocused(false)
      setCoQ(s.company || '')
    },
    coFocused,
  )
  useClickOutside(
    indWrap,
    () => {
      setIndOpen(false)
      setIndQ(s.ind || '')
    },
    indOpen,
  )
  useClickOutside(
    roleWrap,
    () => {
      setRoleFocused(false)
      setRoleQ(s.role || '')
    },
    roleFocused,
  )

  const yearOpts = useMemo(() => Array.from({ length: 41 }, (_, i) => String(i)), [])

  return (
    <>
      <div className="mb-[8px] mt-[10px] flex items-center gap-2">
        <div className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[rgba(55,1,123,.07)] text-[11px] font-[800] text-[#37017B] [font-family:'DM Serif Display',serif]">
          3
        </div>
        <div className="text-[13px] font-[800] tracking-[-.01em] text-[#0C0C0C]">Work experience</div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <button
          type="button"
          onClick={() => selectFresher(setS)}
          className={[
            'relative flex min-h-[52px] w-full cursor-pointer items-center rounded-[12px] border-[1.5px] px-[14px] py-[12px] pr-11 text-left text-[13px] font-[800] transition-all duration-200',
            isFresher ? chipSelected : chipIdle,
          ].join(' ')}
        >
          <span className={isFresher ? 'text-white' : 'text-[#0C0C0C]'}>I am a fresher</span>
          <span
            className={[
              'absolute right-3 top-1/2 flex h-[18px] w-[18px] -translate-y-1/2 items-center justify-center rounded-full border-2 bg-white',
              isFresher ? 'border-white/80' : 'border-[rgba(0,0,0,.2)]',
            ].join(' ')}
          >
            {isFresher ? <span className="h-[8px] w-[8px] rounded-full bg-white" /> : null}
          </span>
        </button>

        <button
          type="button"
          onClick={() =>
            setS((p) => ({
              ...p,
              exp: '0-1',
              totalExpYears: p.totalExpYears || '',
              totalExpMonths: p.totalExpMonths || '',
            }))
          }
          className={[
            'relative flex min-h-[52px] w-full cursor-pointer items-center rounded-[12px] border-[1.5px] px-[14px] py-[12px] pr-11 text-left text-[13px] font-[800] transition-all duration-200',
            hasWork ? chipSelected : chipIdle,
          ].join(' ')}
        >
          <span className={hasWork ? 'text-white' : 'text-[#0C0C0C]'}>I have work experience</span>
          <span
            className={[
              'absolute right-3 top-1/2 flex h-[18px] w-[18px] -translate-y-1/2 items-center justify-center rounded-full border-2 bg-white',
              hasWork ? 'border-white/80' : 'border-[rgba(0,0,0,.2)]',
            ].join(' ')}
          >
            {hasWork ? <span className="h-[8px] w-[8px] rounded-full bg-white" /> : null}
          </span>
        </button>
      </div>

      <div
        className={[
          'grid transition-[grid-template-rows,opacity] duration-300 ease-out',
          hasWork ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        ].join(' ')}
      >
        <div className={hasWork ? 'min-h-0 overflow-visible' : 'min-h-0 overflow-hidden'}>
          <div className="mt-3 space-y-4 rounded-[11px] border border-[rgba(0,0,0,.07)] bg-[rgba(255,255,255,.55)] px-[13px] pb-[14px] pt-[12px]">
            <div>
              <div className="mb-[2px] text-[13px] font-[800] text-[#0C0C0C]">Total years of experience</div>
              <div className="mb-2 text-[11px] text-[#888]">Sum all the experiences from your previous jobs.</div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <Label required>Years</Label>
                  <Select
                    value={s.totalExpYears}
                    onChange={(e) => patchExperienceFromYM(setS, e.target.value, s.totalExpMonths)}
                  >
                    <option value="">Years</option>
                    {yearOpts.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label optional>Months</Label>
                  <Select
                    value={s.totalExpMonths === '' ? '' : s.totalExpMonths}
                    onChange={(e) => patchExperienceFromYM(setS, s.totalExpYears || '0', e.target.value)}
                  >
                    <option value="">Months (optional)</option>
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i} value={String(i)}>
                        {i}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            </div>

            <div ref={coWrap} className="relative">
              <Label required>Current / recent company</Label>
              <div
                className="mt-1 min-h-[42px] rounded-[9px] border-[1.5px] border-[rgba(0,0,0,.09)] bg-white px-[11px] py-[8px]"
                onMouseDown={() => setCoFocused(true)}
              >
                <input
                  value={coQ}
                  onChange={(e) => {
                    const v = e.target.value
                    setCoQ(v)
                    setS((p) => ({ ...p, company: v }))
                  }}
                  onFocus={() => setCoFocused(true)}
                  onBlur={() => window.setTimeout(() => setCoFocused(false), 180)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      if (coHits[0]) {
                        setS((p) => ({ ...p, company: coHits[0] }))
                        setCoQ(coHits[0])
                      }
                      setCoFocused(false)
                    }
                    if (e.key === 'Escape') setCoFocused(false)
                  }}
                  placeholder="Company name"
                  className="w-full border-0 bg-transparent px-0 py-[3px] text-[13px] outline-none placeholder:text-[#ccc]"
                  autoComplete="off"
                />
              </div>
              <DropdownLayer open={showCoDd} anchorRef={coWrap}>
                {coHits.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className="block w-full rounded-[6px] px-[10px] py-[7px] text-left text-[12px] text-[#0C0C0C] hover:bg-[rgba(55,1,123,.07)]"
                    onMouseDown={(ev) => ev.preventDefault()}
                    onClick={() => {
                      setS((p) => ({ ...p, company: c }))
                      setCoQ(c)
                      setCoFocused(false)
                    }}
                  >
                    {c}
                  </button>
                ))}
              </DropdownLayer>
            </div>

            <div>
              <Label required>Level</Label>
              <ToggleGroup className="mt-1 text-[11px]">
                <ToggleButton active={s.level === 'IC'} onClick={() => setS((p) => ({ ...p, level: 'IC' }))}>
                  Individual Contributor
                </ToggleButton>
                <ToggleButton active={s.level === 'MG'} onClick={() => setS((p) => ({ ...p, level: 'MG' }))}>
                  Manager
                </ToggleButton>
              </ToggleGroup>
            </div>

            <div ref={indWrap} className="relative">
              <Label required>Industry</Label>
              <div
                className="mt-1 min-h-[42px] rounded-[9px] border-[1.5px] border-[rgba(0,0,0,.09)] bg-white px-[11px] py-[8px]"
                onMouseDown={() => setIndOpen(true)}
              >
                <input
                  value={indQ}
                  onChange={(e) => {
                    const v = e.target.value
                    setIndQ(v)
                    setS((p) => ({ ...p, ind: v, func: functionalAreaFromIndustry(v) }))
                    setIndOpen(true)
                  }}
                  onFocus={() => setIndOpen(true)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      const first = indOpts[0]
                      if (first) {
                        setS((p) => ({ ...p, ind: first, func: functionalAreaFromIndustry(first) }))
                        setIndQ(first)
                      }
                      setIndOpen(false)
                    }
                    if (e.key === 'Escape') setIndOpen(false)
                  }}
                  placeholder="Search industry…"
                  className="w-full border-0 bg-transparent px-0 py-[3px] text-[13px] outline-none placeholder:text-[#ccc]"
                  autoComplete="off"
                />
              </div>
              <DropdownLayer open={indOpen && indOpts.length > 0} anchorRef={indWrap}>
                {indOpts.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    className="block w-full rounded-[6px] px-[10px] py-[7px] text-left text-[12px] hover:bg-[rgba(55,1,123,.07)]"
                    onMouseDown={(ev) => ev.preventDefault()}
                    onClick={() => {
                      setS((p) => ({ ...p, ind: opt, func: functionalAreaFromIndustry(opt) }))
                      setIndQ(opt)
                      setIndOpen(false)
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </DropdownLayer>
            </div>

            <div ref={roleWrap} className="relative">
              <Label required>Role / designation</Label>
              <div
                className="mt-1 min-h-[42px] rounded-[9px] border-[1.5px] border-[rgba(0,0,0,.09)] bg-white px-[11px] py-[8px]"
                onMouseDown={() => setRoleFocused(true)}
              >
                <input
                  value={roleQ}
                  onChange={(e) => {
                    const v = e.target.value
                    setRoleQ(v)
                    setS((p) => ({ ...p, role: v }))
                  }}
                  onFocus={() => setRoleFocused(true)}
                  onBlur={() => window.setTimeout(() => setRoleFocused(false), 180)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      if (roleHits[0]) {
                        setS((p) => ({ ...p, role: roleHits[0] }))
                        setRoleQ(roleHits[0])
                      }
                      setRoleFocused(false)
                    }
                    if (e.key === 'Escape') setRoleFocused(false)
                  }}
                  placeholder="Role or designation"
                  className="w-full border-0 bg-transparent px-0 py-[3px] text-[13px] outline-none placeholder:text-[#ccc]"
                  autoComplete="off"
                />
              </div>
              <DropdownLayer open={showRoleDd} anchorRef={roleWrap}>
                {roleHits.map((r) => (
                  <button
                    key={r}
                    type="button"
                    className="block w-full rounded-[6px] px-[10px] py-[7px] text-left text-[12px] hover:bg-[rgba(55,1,123,.07)]"
                    onMouseDown={(ev) => ev.preventDefault()}
                    onClick={() => {
                      setS((p) => ({ ...p, role: r }))
                      setRoleQ(r)
                      setRoleFocused(false)
                    }}
                  >
                    {r}
                  </button>
                ))}
              </DropdownLayer>
            </div>

            <div>
              <Label required>Monthly salary (₹)</Label>
              <Input
                value={s.salary}
                onChange={(e) => setS((p) => ({ ...p, salary: e.target.value.replace(/[^\d]/g, '') }))}
                placeholder="e.g. 45000"
                inputMode="numeric"
                className="mt-1"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
