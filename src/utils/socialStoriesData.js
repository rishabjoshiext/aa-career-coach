/** Social proof + testimonials for Frame 6 — fixed Apna Advantage copy. */

export const PLATFORM_METRICS = [
  { value: '1L+', label: 'Learners coached', icon: 'learners' },
  { value: '16+', label: 'UGC-DEB approved partners', icon: 'degree' },
  { value: '97%', label: 'Course-fit satisfaction', icon: 'satisfaction' },
  { value: '2.3x', label: 'Avg. salary growth post-degree', icon: 'growth' },
]

/** Same eight stories for every destination / industry. */
export const APNA_TESTIMONIALS = [
  {
    i: 'R',
    n: 'Rohit Sharma',
    c: 'Lucknow, UP',
    f: 'Operations lead',
    h: '+38%',
    ti: '3.5 yrs',
    q: 'The structured upskilling and guidance helped my profile finally match the kind of leadership roles I was aiming for.',
    ph: true,
  },
  {
    i: 'A',
    n: 'Anjali Mehta',
    c: 'Indore, MP',
    f: 'HR executive',
    h: '+44%',
    ti: '4 yrs',
    q: 'After the program, I didn’t have to switch companies to see growth, my role, responsibilities, and overall career trajectory finally started reflecting the level I had been working towards.',
    ph: true,
  },
  {
    i: 'V',
    n: 'Vishal Kumar',
    c: 'Pune, MH',
    f: 'Business analyst',
    h: '+33%',
    ti: '2.5 yrs',
    q: 'What really made the difference was the right guidance and learning path, instead of collecting random certificates, I finally had clarity on what to pursue and where to apply.',
    ph: false,
  },
  {
    i: 'S',
    n: 'Sunita Devi',
    c: 'Jaipur, RJ',
    f: 'Customer success',
    h: '+52%',
    ti: '5 yrs',
    q: 'Apna Advantage helped me identify exactly where my profile was lacking, and having that clarity made me much more confident while preparing for interviews.',
    ph: true,
  },
  {
    i: 'M',
    n: 'Mohit Bansal',
    c: 'Delhi NCR',
    f: 'Sales executive',
    h: '+41%',
    ti: '4.5 yrs',
    q: 'Thanks to the flexible weekend learning and practical guidance from Apna Advantage, I was able to upskill and move into a better role without taking a career break.',
    ph: true,
  },
  {
    i: 'K',
    n: 'Kavita Iyer',
    c: 'Hyderabad, TS',
    f: 'Marketing associate',
    h: '+36%',
    ti: '3 yrs',
    q: 'Apna Advantage helped me position my LinkedIn profile with a clear career direction, and that’s when meaningful referrals and opportunities started coming in.',
    ph: false,
  },
  {
    i: 'K',
    n: 'Kartik Rao',
    c: 'Chennai, TN',
    f: 'Finance associate',
    h: '+47%',
    ti: '4 yrs',
    q: 'Apna Advantage helped me focus on measurable career growth, which made it much easier to build a strong and confident story during interviews.',
    ph: true,
  },
  {
    i: 'N',
    n: 'Neha Patel',
    c: 'Ahmedabad, GJ',
    f: 'Content executive',
    h: '+35%',
    ti: '3.5 yrs',
    q: 'Coming from a smaller city, I always felt at a disadvantage, but with the right certifications and profile building support from Apna Advantage, I finally started getting shortlisted for the opportunities I wanted.',
    ph: true,
  },
]

function hashStr(s) {
  let h = 0
  for (let i = 0; i < s.length; i += 1) h = (h << 5) - h + s.charCodeAt(i)
  return Math.abs(h)
}

export function liveReviewersCount(card, destinationTitle) {
  const base = card?.dbProfiles ? Math.min(420, Math.round(card.dbProfiles * 0.08)) : 160
  return Math.max(120, base + (hashStr(destinationTitle) % 90))
}

/** @param {string} [destinationTitle] — only used for the goal tag on each card */
export function buildFallbackStories(destinationTitle) {
  const dest = String(destinationTitle || 'your goal').trim() || 'your goal'
  return APNA_TESTIMONIALS.map((story) => ({ ...story, t: dest }))
}
