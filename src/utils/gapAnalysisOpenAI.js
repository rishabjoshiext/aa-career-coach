import { GAPS_BY_ROLE } from './gapsData.js'

const CAT_KEYS = ['edu', 'skill', 'exp', 'dev']

function stripJsonFence(text) {
  const t = String(text || '').trim()
  const m = t.match(/^```(?:json)?\s*([\s\S]*?)```$/i)
  return m ? m[1].trim() : t
}

function validPill(p) {
  return p === 'crit' || p === 'miss' || p === 'need'
}

function validCls(c) {
  return c === 'red' || c === 'amber' || c === 'green'
}

/** Returns true if object matches GAPS_BY_ROLE entry shape */
export function isValidGapsShape(g) {
  if (!g || typeof g !== 'object') return false
  for (const k of CAT_KEYS) {
    const block = g[k]
    if (!block || typeof block !== 'object') return false
    if (typeof block.imp !== 'string' || !block.imp.trim()) return false
    if (!validCls(block.cls)) return false
    if (!Array.isArray(block.items) || block.items.length < 1) return false
    for (const it of block.items) {
      if (typeof it.n !== 'string' || !it.n.trim()) return false
      if (typeof it.d !== 'string' || !it.d.trim()) return false
      if (!validPill(it.pill)) return false
      if (!Array.isArray(it.actions) || it.actions.length < 1) return false
      if (it.w != null && typeof it.w !== 'string') return false
    }
  }
  return true
}

export function normalizeGaps(raw) {
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(stripJsonFence(raw)) : raw
    if (!isValidGapsShape(parsed)) return null
    return parsed
  } catch {
    return null
  }
}

/**
 * Deterministic gap set when OpenAI is unavailable — always themed to `targetRole`,
 * never Finance Manager boilerplate unless targetRole is Finance Manager.
 */
export function buildFallbackGaps(targetRole, card) {
  const role = String(targetRole || 'this role').trim() || 'this role'
  const blurb = (card?.desc && String(card.desc).trim()) || `leading work aligned to ${role}`

  return {
    edu: {
      imp: 'Delays career progression toward this role',
      cls: 'red',
      items: [
        {
          n: `Formal qualification signal for ${role}`,
          d: `Many ${role} job descriptions filter for recognised degrees or diplomas related to: ${blurb.slice(0, 120)}${blurb.length > 120 ? '…' : ''}`,
          w: 'Often a hard filter before interviews',
          pill: 'crit',
          actions: [
            'Shortlist 2 UGC-recognised or industry-accepted programmes that hiring managers in this track mention',
            'Pick a weekend / online mode so you can keep earning while studying',
            'Align electives or projects to outcomes named in recent JDs for this role',
          ],
        },
        {
          n: 'Stackable certification in your domain',
          d: 'Certifications reduce time-to-shortlist when a degree upgrade is not immediately feasible',
          pill: 'miss',
          actions: [
            'Complete one credible certification in the next 6–9 months',
            'Add proof of completion to your resume and LinkedIn Featured section',
          ],
        },
      ],
    },
    skill: {
      imp: 'Costs interview rounds until you demonstrate depth',
      cls: 'amber',
      items: [
        {
          n: `Core toolkit for ${role}`,
          d: `Recruiters expect hands-on proficiency with tools and methods tied to: ${blurb.slice(0, 100)}${blurb.length > 100 ? '…' : ''}`,
          w: 'Frequently tested in practical rounds',
          pill: 'crit',
          actions: [
            'Map the top 5 tools / methods from 20 recent JDs for this title',
            'Build 2 portfolio artefacts (dashboard, campaign, deck, repo) you can walk through live',
          ],
        },
        {
          n: 'Workflow & delivery hygiene',
          d: 'Structured execution, documentation, and stakeholder updates separate senior-ready candidates',
          pill: 'miss',
          actions: ['Adopt a simple weekly outcomes log', 'Practice concise written updates as you would to a hiring manager'],
        },
        {
          n: 'Data literacy for decisions',
          d: 'Most tracks now expect comfort interpreting metrics and running basic analyses',
          pill: 'miss',
          actions: ['Complete a short analytics / spreadsheet modelling module', 'Tie every example to a business metric'],
        },
        {
          n: 'Domain vocabulary in English + Hindi',
          d: 'Panel interviews mix languages; fluency with terms reduces mis-hires signals',
          pill: 'need',
          actions: ['Maintain a 20-term glossary for your target industry', 'Rehearse 60-second stories using those terms'],
        },
        {
          n: 'AI-assisted productivity (where ethical)',
          d: 'Shows you can ship faster without cutting quality — increasingly common expectation',
          pill: 'need',
          actions: ['Pick one vetted workflow (research, drafting, QA) and document before/after time saved'],
        },
      ],
    },
    exp: {
      imp: 'Adds time to promotion or lateral move',
      cls: 'amber',
      items: [
        {
          n: `Ownership breadth expected before ${role}`,
          d: 'Hiring panels look for end-to-end ownership, not only task execution',
          w: 'One of the most common gaps on junior-to-mid profiles',
          pill: 'crit',
          actions: [
            'Identify one initiative you can own metrics for over the next 2 quarters',
            'Ask your manager to sponsor a stretch assignment with a written scope',
          ],
        },
        {
          n: 'Cross-functional collaboration proof',
          d: 'This role coordinates across teams; evidence of that reduces perceived ramp time',
          pill: 'miss',
          actions: ['Volunteer for a pilot involving two departments', 'Capture outcomes in STAR format for interviews'],
        },
        {
          n: 'Stakeholder communication cadence',
          d: 'Regular, calm updates to leadership mirror how the role operates day-to-day',
          pill: 'miss',
          actions: ['Run a monthly digest for your team or leadership', 'Collect one testimonial quote per quarter'],
        },
        {
          n: 'Risk / compliance touchpoints (if relevant)',
          d: 'Even light exposure to approvals, audits, or policy reduces screening friction',
          pill: 'need',
          actions: ['Shadow a compliance or QA review once a quarter', 'Note learnings in your interview stories'],
        },
      ],
    },
    dev: {
      imp: 'Weak inbound and referral flow without visibility',
      cls: 'green',
      items: [
        {
          n: `Profile positioned for ${role}`,
          d: 'Headline, skills, and featured work should match how recruiters search for this title',
          w: 'Low discoverability hurts shortlist rate',
          pill: 'miss',
          actions: [
            'Rewrite headline with role + 2 proof points (metric, scope, tool)',
            'Pin a case study or one-pager that mirrors target JD language',
          ],
        },
        {
          n: 'Referral network in target companies',
          d: 'Warm intros compress hiring cycles versus cold applications alone',
          pill: 'need',
          actions: ['List 15 target employers; request 2 intros per month via mutuals', 'Offer a crisp ask: 15-min context, not a job request'],
        },
        {
          n: 'Community or guild participation',
          d: 'Signals seriousness and surfaces hiring managers organically',
          pill: 'need',
          actions: ['Join one relevant community (Slack, Discord, local chapter)', 'Contribute one insight post monthly'],
        },
        {
          n: 'Interview storytelling practice',
          d: 'Personal development includes rehearsal — reduces nervous drops in senior rounds',
          pill: 'need',
          actions: ['Record 3 stories monthly; trim to 90 seconds each', 'Swap mock interviews with a peer weekly'],
        },
      ],
    },
  }
}

export async function fetchGapAnalysisWithOpenAI({ targetRole, industryLabel, card }) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  if (!apiKey) return null

  const role = String(targetRole || '').trim() || 'Target role'
  const ind = industryLabel || 'General'
  const desc = card?.desc ? String(card.desc) : ''
  const sal = card?.sal ? String(card.sal) : ''

  const prompt = `You are a career coach for India market. Produce ONLY valid JSON (no markdown) for gap analysis toward ONE destination role.

Destination role: ${role}
Industry / function context: ${ind}
Role description (from dataset): ${desc}
Typical salary band if known: ${sal}

Return JSON with exactly these keys: edu, skill, exp, dev. Each value is an object:
{ "imp": string (short impact headline like "Delays career by 3.2 years" or "Costs 2 rounds in interviews"),
  "cls": "red" | "amber" | "green",
  "items": array of 2-5 objects, each:
    { "n": string title,
      "d": string 1-2 sentences why it matters for THIS role,
      "w": optional string extra warning line,
      "pill": "crit" | "miss" | "need",
      "actions": array of exactly 3 concise action strings (India-relevant, realistic)
    }
}

Rules:
- Tailor EVERY line to "${role}" and the industry context — no generic finance/HR filler unless the role is in that domain.
- edu = formal education & recognised credentials; skill = tools/methods; exp = work scope & tenure-type proof; dev = visibility, network, portfolio, communication habits (label internally as personal development).
- Use plausible statistics occasionally (e.g. "78% of JDs") but do not invent company names.
- Mix pills: each category should include at least one "crit" if realistic, and a spread of miss/need.`

  try {
    const resp = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        input: prompt,
        temperature: 0.25,
      }),
    })
    if (!resp.ok) return null
    const data = await resp.json()
    const text = data?.output_text || ''
    if (!text) return null
    return normalizeGaps(text)
  } catch {
    return null
  }
}

/** Prefer static library when the selected card exactly matches a curated role. */
export function getStaticGapsForRole(roleTitle) {
  const key = String(roleTitle || '').trim()
  if (GAPS_BY_ROLE[key]) return GAPS_BY_ROLE[key]
  return null
}
