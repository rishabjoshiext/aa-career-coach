#!/usr/bin/env node
/**
 * Calls OpenAI to draft extra rows for `src/data/extendedDestinationRoles.js`.
 *
 *   OPENAI_API_KEY=sk-... node scripts/generate-destination-cards.mjs
 *
 * Prints a JSON array to stdout — copy into EXTENDED_ROLE_ROWS after review.
 */

const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini'

const SYSTEM = `You output only valid JSON: an array of objects. No markdown.
Each object must have exactly these keys (all strings except the three year numbers):
industry, role, desc, jobs, apnaJobs, growth, sal, accelYrs, fastYrs, tradYrs, dbProfiles, naukri, linkedin
- industry: one of the Indian career-function buckets we use (e.g. IT, Product, Data Science, Business Analytics, Marketing, Finance, Operations, Sales, HR, Cloud & DevOps, Cybersecurity, Customer Success, AI & ML, Strategy, Consulting, E-commerce, SCM, Digital Marketing, Risk Management, Legal & Compliance, UI/UX, Other).
- jobs / growth: strings like "12,400+" and "+48%"
- sal: INR range like "₹1–1.8L" or "₹85k–1.4L"
- apnaJobs: string integer with commas optional
- dbProfiles, naukri, linkedin: plausible integers as numbers
- desc: one sentence, India-relevant
Use varied seniority and realistic ladders.`

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    console.error('Missing OPENAI_API_KEY')
    process.exit(1)
  }

  const user = `Generate 12 distinct career destination cards spread across at least 8 different industry values.
Focus on gaps like senior analytics, data platform, revops analytics, FP&A analytics, supply chain analytics, security data roles, and GTM ops.`

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.35,
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: user },
      ],
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('OpenAI error', res.status, err)
    process.exit(1)
  }

  const data = await res.json()
  const text = data?.choices?.[0]?.message?.content?.trim()
  if (!text) {
    console.error('Empty response', JSON.stringify(data).slice(0, 500))
    process.exit(1)
  }

  let parsed
  try {
    parsed = JSON.parse(text)
  } catch {
    console.error('Model did not return pure JSON:\n', text.slice(0, 2000))
    process.exit(1)
  }

  if (!Array.isArray(parsed)) {
    console.error('Expected JSON array, got', typeof parsed)
    process.exit(1)
  }

  console.log(JSON.stringify(parsed, null, 2))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
