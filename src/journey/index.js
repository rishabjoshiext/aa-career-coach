/**
 * Career journey progression engine — public API.
 */

export {
  PATH_MILESTONE_COUNTS,
  PATH_TOTAL_BOX_COUNTS,
  generateCareerProgression,
  progressionToFrame3Journey,
  buildJourneyFromProgressionEngine,
  parseSalaryBand,
  samplePathRoles,
} from './progressionEngine.js'

export {
  CURATED_LADDERS,
  CATEGORY_TO_CURATED,
  getAllLadders,
  getLadderForCategory,
  getCategoryLaddersFromMapping,
  buildStemLadder,
  extractRoleStem,
} from './roleLadders.js'

export {
  normalizeRole,
  roleSimilarity,
  findRoleIndexInLadder,
  selectBestLadder,
  sliceProgression,
  findDestinationMeta,
} from './roleMatcher.js'
