import { useEffect, useMemo, useRef, useState } from 'react'
import { Label } from '../ui/Label.jsx'
import { Select } from '../ui/Select.jsx'
import { DropdownLayer } from '../ui/DropdownLayer.jsx'
import { searchSkillCatalog, suggestedSkillChipsForProfile } from '../../data/skillsSuggestions.js'

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

const ENGLISH_OPTIONS = ['Basic', 'Conversational', 'Fluent', 'Business / Professional']

const LINKEDIN_OPTIONS = ['0–50', '50–200', '200–500', '500–1000', '1000+', 'Not on LinkedIn']

function addSkill(setS, raw) {
  const t = String(raw || '').trim()
  if (!t) return
  setS((p) => {
    const cur = Array.isArray(p.selectedSkills) ? [...p.selectedSkills] : []
    if (cur.length >= 20) return p
    if (cur.some((x) => x.toLowerCase() === t.toLowerCase())) return p
    return { ...p, selectedSkills: [...cur, t] }
  })
}

function removeSkill(setS, skill) {
  const t = String(skill || '').trim().toLowerCase()
  setS((p) => ({
    ...p,
    selectedSkills: (Array.isArray(p.selectedSkills) ? p.selectedSkills : []).filter((x) => x.toLowerCase() !== t),
  }))
}

const chipSelected =
  'inline-flex items-center gap-1 rounded-[8px] border border-[rgba(55,1,123,.08)] bg-[rgba(55,1,123,.04)] px-[10px] py-[5px] text-[11px] font-[700] text-[#0C0C0C]'
const chipSuggest =
  'inline-flex items-center gap-1 rounded-[50px] border border-[rgba(0,0,0,.12)] bg-white px-[11px] py-[5px] text-[11px] font-[700] text-[#0C0C0C] transition-colors hover:border-[rgba(55,1,123,.35)]'

export function Frame1SkillsSection({ s, setS }) {
  const selected = Array.isArray(s.selectedSkills) ? s.selectedSkills : []
  const selectedLc = useMemo(() => new Set(selected.map((x) => x.toLowerCase())), [selected])

  const suggestions = useMemo(() => suggestedSkillChipsForProfile(s), [s.exp, s.role])
  const suggestionRow = useMemo(
    () => suggestions.filter((sk) => !selectedLc.has(sk.toLowerCase())),
    [suggestions, selectedLc],
  )

  const [q, setQ] = useState('')
  const [focused, setFocused] = useState(false)
  const wrap = useRef(null)

  const hits = useMemo(() => {
    const t = (q || '').trim()
    if (!t) return []
    const base = searchSkillCatalog(t, 48)
    return base.filter((x) => !selectedLc.has(x.toLowerCase()))
  }, [q, selectedLc])

  const showDd = focused && hits.length > 0

  useClickOutside(
    wrap,
    () => {
      setFocused(false)
    },
    focused,
  )

  return (
    <>
      <div className="mb-[8px] mt-[10px] flex items-center gap-2">
        <div className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[rgba(55,1,123,.07)] text-[11px] font-[800] text-[#37017B] [font-family:'DM Serif Display',serif]">
          4
        </div>
        <div className="text-[13px] font-[800] tracking-[-.01em] text-[#0C0C0C]">Skills &amp; Inputs</div>
      </div>

      <div className="flex flex-col gap-6">
        <div>
          <Label required>Skills</Label>
          <div className="mt-1.5 text-[11px] font-[700] text-[#0C0C0C]">What skills would you highlight?</div>
          <div className="mt-1 text-[11px] font-[600] text-[#888]">Select at least 2</div>

          {selected.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {selected.map((sk) => (
                <span key={sk} className={chipSelected}>
                  <span className="max-w-[220px] truncate">{sk}</span>
                  <button
                    type="button"
                    className="ml-[4px] flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-full text-[14px] leading-none text-[#666] hover:bg-[rgba(55,1,123,.1)] hover:text-[#37017B]"
                    aria-label={`Remove ${sk}`}
                    onClick={() => removeSkill(setS, sk)}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          ) : null}

          <div ref={wrap} className="relative mt-3">
            <div className="flex min-h-[42px] items-center gap-2 rounded-[9px] border-[1.5px] border-[rgba(0,0,0,.09)] bg-white px-[11px] py-[8px]">
              <span className="text-[13px] text-[#aaa]" aria-hidden>
                🔍
              </span>
              <input
                value={q}
                onChange={(e) => {
                  setQ(e.target.value)
                  setFocused(true)
                }}
                onFocus={() => setFocused(true)}
                onBlur={() => window.setTimeout(() => setFocused(false), 160)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    const t = (q || '').trim()
                    if (t) addSkill(setS, t)
                    setQ('')
                  }
                  if (e.key === 'Escape') setFocused(false)
                }}
                placeholder="Search skills"
                className="min-w-0 flex-1 border-0 bg-transparent py-[3px] text-[13px] outline-none placeholder:text-[#ccc]"
                autoComplete="off"
              />
            </div>
            <DropdownLayer open={showDd} anchorRef={wrap}>
              {hits.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  className="block w-full rounded-[6px] px-[10px] py-[7px] text-left text-[12px] text-[#0C0C0C] hover:bg-[rgba(55,1,123,.07)]"
                  onMouseDown={(ev) => ev.preventDefault()}
                  onClick={() => {
                    addSkill(setS, opt)
                    setQ('')
                  }}
                >
                  {opt}
                </button>
              ))}
            </DropdownLayer>
          </div>

          {suggestionRow.length ? (
            <div className="mt-3 max-h-[70px] overflow-hidden">
              <div className="flex flex-wrap gap-2">
                {suggestionRow.map((sk) => (
                  <button key={sk} type="button" className={chipSuggest} onClick={() => addSkill(setS, sk)}>
                    <span className="max-w-[180px] truncate">{sk}</span>
                    <span className="text-[12px] font-[800] text-[#37017B]/70">+</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label required>Spoken English</Label>
            <div className="mt-1">
              <Select value={s.english} onChange={(e) => setS((p) => ({ ...p, english: e.target.value }))}>
                <option value="">Select level</option>
                {ENGLISH_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div>
            <Label required>LinkedIn Connections</Label>
            <div className="mt-1">
              <Select value={s.linkedinTier} onChange={(e) => setS((p) => ({ ...p, linkedinTier: e.target.value }))}>
                <option value="">Select range</option>
                {LINKEDIN_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
