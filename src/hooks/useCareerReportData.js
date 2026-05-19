import { useMemo } from 'react'
import { useAppState } from './appState.jsx'
import { INDUSTRIES, flattenIndustryRoles } from '../utils/fasttrackData.js'
import { resolvePdRole } from '../utils/roleKey.js'
import { resolveUserJourney, profileMonthlySalaryLabel } from '../utils/resolveJourney.js'
import {
  buildEducationGapBlock,
  buildExperienceGapBlock,
  buildFallbackGaps,
  buildPersonalDevGapBlock,
  buildSkillsGapBlock,
  getStaticGapsForRole,
} from '../utils/gapAnalysis.js'
import { buildFallbackSpec } from '../utils/specialisationData.js'
import { buildFallbackRoiModel, fmtRupeeMoK, resolveMonthlySalaryRupees } from '../utils/roiModel.js'
import { DEFAULT_DEGREE_TENURE_MONTHS } from '../utils/roiData.js'
import {
  expectedSalaryBandLpa,
  formatSalaryCompact,
  formatSalaryLabelIndian,
  lpaFromMonthlyK,
} from '../utils/formatINR.js'
import { PD } from '../utils/pathData.js'

function buildGaps(profile, destinationTitle, roleCard, journey) {
  const title = String(destinationTitle || 'your goal').trim() || 'your goal'
  const staticGaps = getStaticGapsForRole(title)
  const base = staticGaps || buildFallbackGaps(title, roleCard)
  return {
    ...base,
    edu: buildEducationGapBlock(profile, title, roleCard),
    skill: buildSkillsGapBlock(profile, title, roleCard),
    exp: buildExperienceGapBlock(profile, title, roleCard, journey),
    dev: buildPersonalDevGapBlock(profile, title, roleCard),
  }
}

function pickGapItems(items, limit, excludeNames = new Set()) {
  const pool = (items || []).filter((i) => i.n && !excludeNames.has(i.n))
  const preferred = pool.filter((i) => i.pill === 'crit' || i.pill === 'miss')
  const rest = pool.filter((i) => !preferred.includes(i))
  const ordered = [...preferred, ...rest]
  return ordered.slice(0, limit).map((i) => i.n)
}

function gapSummaryRows(gaps) {
  const pick = (block) => block?.items?.find((i) => i.pill === 'crit') || block?.items?.[0]
  const edu = pick(gaps.edu)
  const skill = pick(gaps.skill)
  const expCrit =
    gaps.exp?.items?.find((i) => i.pill === 'crit' && i.n === 'Essential Skills and Degree') || pick(gaps.exp)
  const dev = pick(gaps.dev)

  const skillChips = pickGapItems(gaps.skill?.items, 2)
  const devChips = pickGapItems(gaps.dev?.items, 2)

  return [
    {
      icon: '🎓',
      title: 'Education Gap',
      description: edu?.d || edu?.n || gaps.edu?.imp,
    },
    {
      icon: '🛠',
      title: 'Skill Gap',
      description: skill?.d || skill?.n || gaps.skill?.imp,
      chips: skillChips,
    },
    {
      icon: '⏱',
      title: 'Experience Gap',
      description: expCrit?.d || expCrit?.n || gaps.exp?.imp,
    },
    {
      icon: '🌱',
      title: 'Personal Development',
      description: dev?.d || dev?.n || gaps.dev?.imp,
      chips: devChips,
    },
  ]
}

function formatPathYearsLabel(years) {
  const n = Number(years)
  if (!Number.isFinite(n) || n <= 0) return '—'
  const rounded = Math.round(n * 10) / 10
  const label = rounded % 1 === 0 ? String(Math.round(rounded)) : rounded.toFixed(1)
  return `${label} ${rounded === 1 ? 'Year' : 'Years'}`
}

/** All dynamic fields for Career Transformation Pass PDF — mirrors Frames 3–7 state. */
export function useCareerReportData() {
  const { s, selRole, selIndustry, rYear } = useAppState()

  return useMemo(() => {
    const pdKey = resolvePdRole(selRole)
    const destinationTitle = (selRole && String(selRole).trim()) || 'your goal'
    const industryRow = INDUSTRIES.find((i) => i.id === selIndustry)
    const industryLabel = industryRow?.n || s.ind || 'Your industry'

    const flat = flattenIndustryRoles(selIndustry === 'all' ? 'all' : selIndustry)
    const roleCard =
      flat.find((c) => c.role === destinationTitle) || flat.find((c) => c.role === pdKey) || flat[0]

    const { journey } = resolveUserJourney({ selRole, selIndustry, profile: s })
    const pd = PD[pdKey] || PD['Finance Manager']
    const gaps = buildGaps(s, destinationTitle, roleCard, journey)
    const spec = buildFallbackSpec(destinationTitle, roleCard, s)

    const monthlySalaryRupees = resolveMonthlySalaryRupees(s)
    const roiModel = buildFallbackRoiModel({
      monthlySalaryRupees,
      degreeTenureMonths: DEFAULT_DEGREE_TENURE_MONTHS,
    })
    const yr = Math.min(5, Math.max(1, Number(rYear) || 5))
    const accelSeries = roiModel.pathMonthlyK.accel
    const stagSeries = roiModel.stagMonthlyK

    const roiYears = [0, 1, 2, 3, 4, 5].filter((y) => y <= yr).map((y) => ({
      year: y,
      noAction: fmtRupeeMoK(stagSeries[y]),
      accelerated: fmtRupeeMoK(accelSeries[y]),
      stagK: stagSeries[y],
      accelK: accelSeries[y],
      accelLpa: formatSalaryCompact(lpaFromMonthlyK(accelSeries[y])),
    }))

    const accelNodes = journey?.nodes?.accel ?? []
    const pathSteps = accelNodes.map((node) => ({
      title: String(node.r || '').trim() || 'Milestone',
      tag: Boolean(node.tag),
      salary: node.sal ? formatSalaryLabelIndian(node.sal) : '',
    }))

    if (pathSteps.length === 0) {
      pathSteps.push(
        { title: (s.role || '').trim() || 'Current role', tag: false, salary: profileMonthlySalaryLabel(s) || '' },
        { title: destinationTitle, tag: true, salary: roleCard?.sal ? formatSalaryLabelIndian(roleCard.sal) : '' },
      )
    }

    const skills = [
      ...(gaps.skill?.items?.map((i) => i.n) || []),
      ...(spec.curriculum?.slice(0, 6) || []),
    ].filter((v, i, a) => v && a.indexOf(v) === i)

    const industries = [industryLabel, s.ind, ...(spec.chips || [])].filter(
      (v, i, a) => v && a.indexOf(v) === i,
    )

    const roles = [...accelNodes.map((n) => n.r).filter(Boolean), destinationTitle].filter(
      (v, i, a) => v && a.indexOf(v) === i,
    )

    const displayName = (s.name || '').trim() || 'Your name'
    const firstName = displayName.split(/\s+/)[0] || 'there'
    const pathYears = journey?.accel?.yrs ?? pd.accel?.yrs ?? '—'

    return {
      displayName,
      firstName,
      destinationTitle,
      industryLabel,
      specTitle: spec.title,
      transformationBadge: `Transformation Incoming — ${formatPathYearsLabel(pathYears)}`,
      gapRows: gapSummaryRows(gaps),
      pathSteps,
      roi: {
        rYear: yr,
        expectedBand: expectedSalaryBandLpa(accelSeries[yr]),
        year5Lpa: formatSalaryCompact(lpaFromMonthlyK(accelSeries[yr])),
        years: roiYears,
        maxK: Math.max(1, ...roiYears.flatMap((r) => [r.stagK, r.accelK])),
      },
      growthAdvantages: [
        'Better career opportunities vs staying on current trajectory',
        'Faster promotions with structured credentials + skills',
        'Stronger industry profile for recruiter shortlists',
        'Higher earning potential on the accelerated path',
      ],
      skills: skills.slice(0, 8),
      industries: industries.slice(0, 8),
      roles: roles.slice(0, 8),
      nextSteps: [
        `Complete ${spec.title}`,
        'Build must-have skills and tools from your gap list',
        'Work on live projects aligned to your target role',
        'Gain internship or project experience',
        `Become job-ready for ${destinationTitle}`,
      ],
      careerOutlook: `Demand for ${destinationTitle} roles remains strong across Indian metros. Job postings show ${spec.growth || 'strong'} growth over five years — closing your profile gaps improves shortlist odds.`,
      finalInsight: `You are building toward ${destinationTitle} with a structured accelerated pathway (${formatPathYearsLabel(pathYears)} vs ${formatPathYearsLabel(journey?.trad?.yrs ?? pd.trad?.yrs)} traditional). Stay consistent with skills, projects, and visibility.`,
    }
  }, [s, selRole, selIndustry, rYear])
}
