import { useEffect, useMemo, useRef, useState } from 'react'
import { Label } from '../ui/Label.jsx'
import { Select } from '../ui/Select.jsx'
import {
  completionYearOptions,
  DEGREES_ITI,
  DEGREES_PG,
  DEGREES_UG,
  EDU_BRANCH_COLLEGE,
  EDU_BRANCH_SCHOOL_ONLY,
  EDU_MAX_PILLS,
  EDU_PROGRAM_MODE_OPTIONS,
  ITI_TRADES,
  legacyEduFromMax,
  searchIndianColleges,
  SCHOOL_MEDIUM_OPTIONS,
} from '../../data/frame1Education.js'
import { specializationsForPgDegree, specializationsForUgDegree } from '../../data/degreeSpecializations.js'
import { DropdownLayer } from '../ui/DropdownLayer.jsx'

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

function ListCombo({ label, required, value, onChange, options, placeholder, disabled }) {
  const [q, setQ] = useState(value || '')
  const [open, setOpen] = useState(false)
  const wrap = useRef(null)

  useEffect(() => {
    setQ(value || '')
  }, [value])

  useClickOutside(
    wrap,
    () => {
      setOpen(false)
      setQ(value || '')
    },
    open,
  )

  const matches = useMemo(() => {
    const qq = (q || '').trim().toLowerCase()
    if (!qq) return options
    return options.filter((o) => o.toLowerCase().includes(qq))
  }, [q, options])

  return (
    <div>
      {required ? <Label required>{label}</Label> : <Label optional>{label}</Label>}
      <div ref={wrap} className="relative">
        <div
          className={[
            'min-h-[42px] rounded-[9px] border-[1.5px] px-[11px] py-[8px]',
            disabled ? 'border-[rgba(0,0,0,.06)] bg-[rgba(0,0,0,.03)]' : 'border-[rgba(0,0,0,.09)] bg-white',
          ].join(' ')}
          onMouseDown={() => !disabled && setOpen(true)}
        >
          <input
            value={q}
            disabled={disabled}
            onChange={(e) => {
              const v = e.target.value
              setQ(v)
              setOpen(true)
            }}
            onFocus={() => !disabled && setOpen(true)}
            onKeyDown={(e) => {
              if (disabled) return
              if (e.key === 'Enter') {
                e.preventDefault()
                const first = matches[0]
                if (!first) return
                onChange(first)
                setQ(first)
                setOpen(false)
                return
              }
              if (e.key === 'Escape') {
                setOpen(false)
                setQ(value || '')
              }
            }}
            placeholder={placeholder}
            className="w-full border-0 bg-transparent px-0 py-[3px] text-[13px] outline-none placeholder:text-[#ccc] disabled:cursor-not-allowed"
            autoComplete="off"
          />
        </div>
        <DropdownLayer open={open && !disabled && matches.length > 0} anchorRef={wrap}>
          {matches.slice(0, 80).map((opt) => {
            const sel = value === opt
            return (
              <button
                key={opt}
                type="button"
                className={[
                  'block w-full rounded-[6px] px-[10px] py-[7px] text-left text-[12px] transition-colors',
                  sel ? 'bg-[rgba(55,1,123,.08)] font-[800] text-[#37017B]' : 'text-[#0C0C0C] hover:bg-[rgba(55,1,123,.07)] hover:text-[#37017B]',
                ].join(' ')}
                onMouseDown={(ev) => ev.preventDefault()}
                onClick={() => {
                  onChange(opt)
                  setQ(opt)
                  setOpen(false)
                }}
              >
                {opt}
              </button>
            )
          })}
        </DropdownLayer>
      </div>
    </div>
  )
}

export function Frame1EducationSection({ s, setS }) {
  const [collegeQ, setCollegeQ] = useState(s.uni || '')
  const collegeWrap = useRef(null)
  const [collegeOpen, setCollegeOpen] = useState(false)

  useEffect(() => {
    setCollegeQ(s.uni || '')
  }, [s.uni])

  const showSchoolTrack = EDU_BRANCH_SCHOOL_ONLY.has(s.eduMax)
  const showCollegeTrack = EDU_BRANCH_COLLEGE.has(s.eduMax)

  const collegeHits = useMemo(() => searchIndianColleges(collegeQ, 30), [collegeQ])

  useClickOutside(
    collegeWrap,
    () => {
      setCollegeOpen(false)
      setCollegeQ(s.uni || '')
    },
    collegeOpen,
  )

  const specOptions = useMemo(() => {
    if (s.eduMax === 'iti') return ITI_TRADES
    if (s.eduMax === 'graduate') return specializationsForUgDegree(s.degreeEdu)
    if (s.eduMax === 'postgraduate') return specializationsForPgDegree(s.degreeEdu)
    return []
  }, [s.eduMax, s.degreeEdu])

  const degreeOptions = useMemo(() => {
    if (s.eduMax === 'iti') return DEGREES_ITI
    if (s.eduMax === 'graduate') return DEGREES_UG
    if (s.eduMax === 'postgraduate') return DEGREES_PG
    return []
  }, [s.eduMax])

  const yearOpts = useMemo(() => completionYearOptions(), [])

  const pickEduMax = (id) => {
    setS((p) => ({
      ...p,
      eduMax: id,
      edu: legacyEduFromMax(id),
      schoolMedium: '',
      uni: '',
      degreeEdu: id === 'iti' ? 'ITI' : '',
      spec: '',
      year: '',
    }))
    setCollegeQ('')
  }

  return (
    <>
      <div className="mb-[8px] mt-[6px] flex items-center gap-2">
        <div className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[rgba(55,1,123,.07)] text-[11px] font-[800] text-[#37017B] [font-family:'DM Serif Display',serif]">
          2
        </div>
        <div className="text-[13px] font-[800] tracking-[-.01em] text-[#0C0C0C]">Education</div>
      </div>

      <div>
        <Label required>What is your highest level of education?</Label>
        <div className="mt-2 flex flex-wrap gap-2">
          {EDU_MAX_PILLS.map((pill) => {
            const on = s.eduMax === pill.id
            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => pickEduMax(pill.id)}
                className={[
                  'rounded-[50px] border px-[14px] py-[8px] text-[12px] font-[700] transition-all duration-200',
                  on
                    ? 'border-[#37017B] bg-[#37017B] text-white shadow-[0_2px_10px_rgba(55,1,123,.2)]'
                    : 'border-[rgba(0,0,0,.12)] bg-white text-[#0C0C0C] hover:border-[rgba(55,1,123,.35)]',
                ].join(' ')}
              >
                {pill.label}
              </button>
            )
          })}
        </div>
      </div>

      <div
        className={[
          'grid transition-[grid-template-rows,opacity] duration-300 ease-out',
          showSchoolTrack ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        ].join(' ')}
      >
        <div className="overflow-hidden">
          <div className="mt-3 rounded-[11px] border border-[rgba(0,0,0,.07)] bg-[rgba(255,255,255,.55)] px-[13px] pb-[13px] pt-[11px]">
            <Label required>School medium</Label>
            <div className="mt-1">
              <Select value={s.schoolMedium} onChange={(e) => setS((p) => ({ ...p, schoolMedium: e.target.value }))}>
                <option value="">Select medium</option>
                {SCHOOL_MEDIUM_OPTIONS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div
        className={[
          'grid transition-[grid-template-rows,opacity] duration-300 ease-out',
          showCollegeTrack ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        ].join(' ')}
      >
        <div className={showCollegeTrack ? 'min-h-0 overflow-visible' : 'min-h-0 overflow-hidden'}>
          <div className="mt-3 space-y-3 rounded-[11px] border border-[rgba(0,0,0,.07)] bg-[rgba(255,255,255,.55)] px-[13px] pb-[13px] pt-[11px]">
            <div ref={collegeWrap} className="relative">
              <Label required>College / institute name</Label>
              <div
                className="mt-1 min-h-[42px] rounded-[9px] border-[1.5px] border-[rgba(0,0,0,.09)] bg-white px-[11px] py-[8px]"
                onMouseDown={() => setCollegeOpen(true)}
              >
                <input
                  value={collegeQ}
                  onChange={(e) => {
                    const v = e.target.value
                    setCollegeQ(v)
                    setS((p) => ({ ...p, uni: v }))
                    setCollegeOpen(true)
                  }}
                  onFocus={() => setCollegeOpen(true)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      const first = collegeHits[0]
                      if (first) {
                        setS((p) => ({ ...p, uni: first }))
                        setCollegeQ(first)
                      }
                      setCollegeOpen(false)
                    }
                    if (e.key === 'Escape') setCollegeOpen(false)
                  }}
                  placeholder="e.g., St. Stephens"
                  className="w-full border-0 bg-transparent px-0 py-[3px] text-[13px] outline-none placeholder:text-[#ccc]"
                  autoComplete="off"
                />
              </div>
              <DropdownLayer open={collegeOpen && collegeHits.length > 0} anchorRef={collegeWrap}>
                {collegeHits.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className="block w-full rounded-[6px] px-[10px] py-[7px] text-left text-[12px] text-[#0C0C0C] transition-colors hover:bg-[rgba(55,1,123,.07)] hover:text-[#37017B]"
                    onMouseDown={(ev) => ev.preventDefault()}
                    onClick={() => {
                      setS((p) => ({ ...p, uni: c }))
                      setCollegeQ(c)
                      setCollegeOpen(false)
                    }}
                  >
                    {c}
                  </button>
                ))}
              </DropdownLayer>
            </div>

            {s.eduMax === 'iti' ? (
              <div>
                <Label required>Degree</Label>
                <div className="mt-1 rounded-[9px] border-[1.5px] border-[rgba(0,0,0,.09)] bg-[rgba(55,1,123,.06)] px-[13px] py-[10px] text-[13px] font-[800] text-[#37017B]">
                  ITI
                </div>
              </div>
            ) : (
              <ListCombo
                label="Degree"
                required
                value={s.degreeEdu}
                onChange={(v) => setS((p) => ({ ...p, degreeEdu: v, spec: '' }))}
                options={degreeOptions}
                placeholder="Search or pick degree"
                disabled={false}
              />
            )}

            <ListCombo
              label="Specialization"
              required
              value={s.spec}
              onChange={(v) => setS((p) => ({ ...p, spec: v }))}
              options={specOptions}
              placeholder={
                s.degreeEdu ? 'Search or pick specialization' : 'Choose degree first — then pick specialization'
              }
              disabled={!s.degreeEdu}
            />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <Label required>Year of completion</Label>
                <div className="mt-1">
                  <Select value={s.year} onChange={(e) => setS((p) => ({ ...p, year: e.target.value }))}>
                    <option value="">Select year</option>
                    {yearOpts.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
              <div>
                <Label required>Mode</Label>
                <div className="mt-1">
                  <Select
                    value={s.eduStudyMode}
                    onChange={(e) => setS((p) => ({ ...p, eduStudyMode: e.target.value }))}
                  >
                    <option value="">Select mode</option>
                    {EDU_PROGRAM_MODE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            </div>

            <div>
              <Label required>School medium</Label>
              <div className="mt-1">
                <Select value={s.schoolMedium} onChange={(e) => setS((p) => ({ ...p, schoolMedium: e.target.value }))}>
                  <option value="">Select medium</option>
                  {SCHOOL_MEDIUM_OPTIONS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
