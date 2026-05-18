/**
 * Canonical timeline: Traditional → Yr 7, Fast Track → Yr 5.5, Accelerated → Yr 4.
 * Milestone `yr` values are fractions of each path end so cards align with the top scale.
 */

export const TIMELINE_MAX_YEARS = 7

export const PATH_END_YEARS = {
  trad: 7,
  fast: 5.5,
  accel: 4,
}

/** Milestone positions as fractions of each path end year (aligns cards with Yr 1–7 scale). */
const PATH_YEAR_FRACTIONS = {
  trad: [1 / 7, 2 / 7, 3 / 7, 4 / 7, 5.5 / 7, 1],
  fast: [1 / 5.5, 2 / 5.5, 3 / 5.5, 4 / 5.5, 1],
  accel: [1 / 4, 2 / 4, 1],
}

/** Left edge of the year ruler (Frame 3 `TIMELINE_START_X` should match). */
export const TIMELINE_ORIGIN_X = 175

/** Minimum center X for the first card on each path (keeps boxes right of NOW / labels). */
export const PATH_MIN_FIRST_CENTER = {
  trad: 318,
  fast: 298,
  accel: 298,
}

function fractionsForCount(pathKey, count) {
  const base = PATH_YEAR_FRACTIONS[pathKey] || PATH_YEAR_FRACTIONS.trad
  if (count <= 0) return []
  if (count === base.length) return base
  if (count === 1) return [1]
  const out = []
  for (let i = 0; i < count; i += 1) {
    out.push((i + 1) / count)
  }
  return out
}

/** Integer year labels for the top ruler (max = 7). */
export function buildTimelineYearTicks(maxYr = TIMELINE_MAX_YEARS) {
  const max = Math.ceil(Number(maxYr) || TIMELINE_MAX_YEARS)
  const ticks = [1, 2, 3, 4, 5, 6, 7].filter((y) => y <= max)
  return ticks
}

/**
 * Apply path-end years to every milestone and sync path metadata `yrs`.
 * @param {object} journey — Frame 3 journey shape
 */
export function applyTimelineToJourney(journey) {
  if (!journey?.nodes) return journey

  const out = {
    ...journey,
    trad: { ...journey.trad, yrs: PATH_END_YEARS.trad },
    fast: { ...journey.fast, yrs: PATH_END_YEARS.fast },
    accel: { ...journey.accel, yrs: PATH_END_YEARS.accel },
    nodes: { ...journey.nodes },
  }

  for (const pk of ['trad', 'fast', 'accel']) {
    const endYear = PATH_END_YEARS[pk]
    const nodes = journey.nodes[pk] || []
    const fractions = fractionsForCount(pk, nodes.length)
    out.nodes[pk] = nodes.map((n, i) => ({
      ...n,
      yr: +(fractions[i] * endYear).toFixed(1),
    }))
  }

  return out
}

const MIN_MILESTONE_CENTER_GAP = 200

/**
 * Prevent milestone cards (~176px wide) from overlapping on the same path.
 */
export function milestoneCentersForPath(
  nodes,
  xForYear,
  minGap = MIN_MILESTONE_CENTER_GAP,
  minFirstCenter = 0,
  maxCenter = Infinity,
) {
  const centers = (nodes || []).map((n) => xForYear(n.yr))
  if (centers.length && minFirstCenter > 0 && centers[0] < minFirstCenter) {
    const shift = minFirstCenter - centers[0]
    for (let i = 0; i < centers.length; i += 1) {
      centers[i] += shift
    }
  }
  for (let i = 1; i < centers.length; i += 1) {
    if (centers[i] - centers[i - 1] < minGap) {
      centers[i] = centers[i - 1] + minGap
    }
  }
  if (Number.isFinite(maxCenter) && centers.length) {
    const overflow = centers[centers.length - 1] - maxCenter
    if (overflow > 0) {
      for (let i = 0; i < centers.length; i += 1) {
        centers[i] -= overflow
      }
      if (minFirstCenter > 0 && centers[0] < minFirstCenter) {
        const shift = minFirstCenter - centers[0]
        for (let i = 0; i < centers.length; i += 1) {
          centers[i] += shift
        }
      }
    }
  }
  return centers
}

/** Accelerated path (3 cards): pin middle milestone to centre between first and last. */
export function accelCentersThreeBox(firstCenter, endCenter) {
  const first = Number(firstCenter) || 0
  const last = Number(endCenter) || first
  const mid = Math.round((first + last) / 2)
  return [first, mid, last]
}
