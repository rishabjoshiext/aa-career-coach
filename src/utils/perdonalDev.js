/**
 * degreePersonalDev.js
 *
 * Personal development, soft skills & LinkedIn/networking enhancements
 * mapped to each of the 9 online degrees.
 *
 * Structure per entry:
 *  { skill: string, subtext: string, type: "soft_skill" | "linkedin" }
 *
 * Rules per degree:
 *  - Exactly 5 items
 *  - Max 2 of type "soft_skill"
 *  - Min 3 of type "linkedin"  (networking-first focus)
 *
 * Degrees covered:
 *  Online MBA | Online MCA | Online MA  | Online MCom | Online MSc
 *  Online BBA | Online BA  | Online BCA | Online BCom
 */

const degreePersonalDev = {

  /* ─────────────────────────────────────────────
     ONLINE MBA
  ───────────────────────────────────────────── */
  "Online MBA": [
    {
      skill: "Executive Presence",
      subtext: "Command attention in boardrooms, virtual calls and leadership forums with confidence and gravitas",
      type: "soft_skill",
    },
    {
      skill: "Stakeholder Management",
      subtext: "Navigate competing priorities by building trust and influencing decisions across business functions",
      type: "soft_skill",
    },
    {
      skill: "Connect with Industry Leaders on LinkedIn",
      subtext: "Send personalized connection requests to CXOs, VPs and domain leaders with a clear value proposition — not just a blank invite",
      type: "linkedin",
    },
    {
      skill: "Engage in MBA Alumni & Industry Groups",
      subtext: "Join LinkedIn groups like 'MBA Professionals India' and your university's alumni network to access referrals, job leads and mentors",
      type: "linkedin",
    },
    {
      skill: "Build a Thought Leadership Profile",
      subtext: "Share weekly posts on strategy, business news or your MBA learnings to attract recruiters, collaborators and senior connections organically",
      type: "linkedin",
    },
  ],

  /* ─────────────────────────────────────────────
     ONLINE MCA
  ───────────────────────────────────────────── */
  "Online MCA": [
    {
      skill: "Growth Mindset in Tech",
      subtext: "Embrace continuous learning as technology evolves — treat every new framework or tool as an opportunity, not a threat",
      type: "soft_skill",
    },
    {
      skill: "Logical Problem Decomposition",
      subtext: "Break large engineering challenges into smaller, testable units before writing a single line of code",
      type: "soft_skill",
    },
    {
      skill: "Showcase Projects & GitHub on LinkedIn",
      subtext: "Pin your best GitHub repos and live project links to your LinkedIn profile — recruiters skim Featured sections before reading your resume",
      type: "linkedin",
    },
    {
      skill: "Network in Developer & Tech Communities",
      subtext: "Follow and engage with engineers at your target companies, join groups like 'Software Developers India' and comment on tech posts to get noticed",
      type: "linkedin",
    },
    {
      skill: "Reach Out to Hiring Managers Directly",
      subtext: "Identify tech leads and engineering managers at target companies and send a concise, skills-focused message — most are open to connecting with motivated candidates",
      type: "linkedin",
    },
  ],

  /* ─────────────────────────────────────────────
     ONLINE MA
  ───────────────────────────────────────────── */
  "Online MA": [
    {
      skill: "Empathy & Active Listening",
      subtext: "Build genuine relationships in social, academic and professional settings by listening to understand, not just to respond",
      type: "soft_skill",
    },
    {
      skill: "Persuasive Communication",
      subtext: "Present research, ideas and opinions in a compelling way that resonates with both academic and non-academic audiences",
      type: "soft_skill",
    },
    {
      skill: "Build an NGO, Academia & Policy Network",
      subtext: "Connect with researchers, policy professionals and social sector leaders on LinkedIn — most are highly responsive to thoughtful, cause-aligned outreach",
      type: "linkedin",
    },
    {
      skill: "Share Writing & Research Publicly",
      subtext: "Post excerpts of your essays, field insights or research findings as LinkedIn articles to attract mentors, collaborators and recruiters in your domain",
      type: "linkedin",
    },
    {
      skill: "Activate Your University Alumni Network",
      subtext: "Search your university name on LinkedIn, filter by graduation year and specialization to find alumni in roles you aspire to — they convert at the highest rate for mentorship calls",
      type: "linkedin",
    },
  ],

  /* ─────────────────────────────────────────────
     ONLINE MCOM
  ───────────────────────────────────────────── */
  "Online MCom": [
    {
      skill: "Attention to Detail",
      subtext: "Develop the habit of reviewing every figure, clause and calculation twice — in finance and accounting, small errors carry large consequences",
      type: "soft_skill",
    },
    {
      skill: "Professional Integrity",
      subtext: "Build a reputation for confidentiality, accuracy and ethical conduct — the foundation of a long career in finance and compliance",
      type: "soft_skill",
    },
    {
      skill: "Connect with CA, CFA & Finance Professionals",
      subtext: "Build a network of chartered accountants, analysts and finance managers on LinkedIn — they often share openings, referrals and exam tips within their circles",
      type: "linkedin",
    },
    {
      skill: "Join Industry & Professional Body Groups",
      subtext: "Engage in ICAI, CFA Institute India and finance-focused LinkedIn groups to stay current, meet peers and get discovered by recruiters who scout these communities",
      type: "linkedin",
    },
    {
      skill: "Optimize Your LinkedIn for Finance Roles",
      subtext: "Add certifications (GST, Tally, Excel), highlight internship achievements in numbers and use keywords like FP&A, Audit and Tax Compliance so recruiters find you in searches",
      type: "linkedin",
    },
  ],

  /* ─────────────────────────────────────────────
     ONLINE MSC
  ───────────────────────────────────────────── */
  "Online MSc": [
    {
      skill: "Scientific Curiosity",
      subtext: "Cultivate the habit of asking 'why' before accepting conclusions — rigorous curiosity is what separates good scientists from great ones",
      type: "soft_skill",
    },
    {
      skill: "Research Communication",
      subtext: "Translate dense scientific findings into clear, accessible language for non-specialist audiences in reports, presentations and interviews",
      type: "soft_skill",
    },
    {
      skill: "Connect with Researchers & R&D Professionals",
      subtext: "Follow scientists, professors and industry researchers at your target organizations and engage with their posts — research communities reward visibility and intellectual contribution",
      type: "linkedin",
    },
    {
      skill: "Share Research Insights & Publications",
      subtext: "Post about your thesis topic, publish summaries of interesting papers and announce your research milestones on LinkedIn to build a credible academic-to-industry profile",
      type: "linkedin",
    },
    {
      skill: "Network Across Academia–Industry Bridge Groups",
      subtext: "Join LinkedIn groups connecting scientists to industry (e.g., 'Data Science India', 'Biotech Professionals India') to discover how peers transitioned and who's hiring",
      type: "linkedin",
    },
  ],

  /* ─────────────────────────────────────────────
     ONLINE BBA
  ───────────────────────────────────────────── */
  "Online BBA": [
    {
      skill: "Business Acumen",
      subtext: "Develop a sharp sense of how businesses make money, manage costs and create value — start by reading one business news article every morning",
      type: "soft_skill",
    },
    {
      skill: "Time & Priority Management",
      subtext: "Use time-blocking and task prioritization to juggle academics, internships and extracurriculars without burning out",
      type: "soft_skill",
    },
    {
      skill: "Connect with Internship & Entry-Level Mentors",
      subtext: "Reach out to professionals who are 3–5 years into their career and ask for a 15-minute chat about their journey — they remember being in your shoes and convert better than senior leaders",
      type: "linkedin",
    },
    {
      skill: "Follow & Engage with Target Companies",
      subtext: "Follow your dream companies, comment thoughtfully on their posts and engage with content from their employees — recruiters notice engaged followers during hiring cycles",
      type: "linkedin",
    },
    {
      skill: "Build Your Network Before You Need It",
      subtext: "Start connecting during year 1, not placement season — send 5 connection requests a week to alumni, industry professionals and peers so you have a warm network when it matters",
      type: "linkedin",
    },
  ],

  /* ─────────────────────────────────────────────
     ONLINE BA
  ───────────────────────────────────────────── */
  "Online BA": [
    {
      skill: "Emotional Intelligence",
      subtext: "Recognize and manage your own emotions while reading others accurately — essential in counselling, social work, communications and team-oriented roles",
      type: "soft_skill",
    },
    {
      skill: "Storytelling & Creativity",
      subtext: "Craft narratives that connect with people emotionally and logically — a skill that transfers into content, journalism, education and advocacy careers",
      type: "soft_skill",
    },
    {
      skill: "Connect with Social Sector & NGO Leaders",
      subtext: "The development sector is highly network-driven — connect with NGO founders, UPSC coaches, educators and policy professionals who share insights and openings in their inner circle",
      type: "linkedin",
    },
    {
      skill: "Create Content That Demonstrates Your Knowledge",
      subtext: "Post a 200-word take on a current social, political or cultural issue every week — it signals intellectual depth and attracts connections from media, academia and public policy",
      type: "linkedin",
    },
    {
      skill: "Leverage Alumni for Career Navigation",
      subtext: "Search for BA graduates from your college who now work in your desired field and message them — shared institutional identity dramatically increases response rates to cold outreach",
      type: "linkedin",
    },
  ],

  /* ─────────────────────────────────────────────
     ONLINE BCA
  ───────────────────────────────────────────── */
  "Online BCA": [
    {
      skill: "Continuous Self-Learning",
      subtext: "Tech evolves faster than curricula — build the habit of learning one new tool, language or concept every month through free platforms like freeCodeCamp or YouTube",
      type: "soft_skill",
    },
    {
      skill: "Debugging Mindset",
      subtext: "Approach errors and failures as puzzles, not setbacks — systematic debugging and root-cause thinking are what distinguish strong junior developers",
      type: "soft_skill",
    },
    {
      skill: "Build in Public & Showcase Work on LinkedIn",
      subtext: "Post progress updates on personal projects, college assignments and mini-apps you've built — 'build in public' gets more profile views and recruiter messages than a static resume",
      type: "linkedin",
    },
    {
      skill: "Network Inside Startup & Tech Ecosystems",
      subtext: "Follow and connect with founders, CTOs and tech leads at startups on LinkedIn — early-stage companies hire based on potential and network proximity far more than pedigree",
      type: "linkedin",
    },
    {
      skill: "Join Hackathon & Open Source Communities on LinkedIn",
      subtext: "Document every hackathon, open-source contribution and coding contest on LinkedIn — tag the event organizers so your post gets amplified and seen by tech recruiters in their network",
      type: "linkedin",
    },
  ],

  /* ─────────────────────────────────────────────
     ONLINE BCOM
  ───────────────────────────────────────────── */
  "Online BCom": [
    {
      skill: "Financial Discipline & Accuracy",
      subtext: "Cultivate the practice of double-checking every number — one misplaced decimal in accounts can have outsized professional consequences",
      type: "soft_skill",
    },
    {
      skill: "Professional Work Ethic",
      subtext: "Show up prepared, meet deadlines and communicate proactively — reliability is the most transferable skill in accounting and finance careers",
      type: "soft_skill",
    },
    {
      skill: "Connect with Accountants, Tax Professionals & CAs",
      subtext: "Build a LinkedIn network of practicing CAs, tax consultants and finance executives — they share job referrals, articleship openings and exam guidance within close circles",
      type: "linkedin",
    },
    {
      skill: "Highlight Certifications & Software Skills Prominently",
      subtext: "Add Tally, GST Practitioner, Excel and any internship projects to your LinkedIn Featured section — finance recruiters filter heavily by tools before shortlisting for interviews",
      type: "linkedin",
    },
    {
      skill: "Network with Batch Alumni in Finance & Accounts",
      subtext: "Find BCom graduates from your institution who are now in finance roles and request 10-minute advice calls — same-degree alumni are the single highest-converting source of career referrals",
      type: "linkedin",
    },
  ],
};

export default degreePersonalDev;

/* ─────────────────────────────────────────────
   USAGE EXAMPLE
   ─────────────────────────────────────────────

   import degreePersonalDev from './degreePersonalDev';

   // Get all 5 items for a degree
   const allItems = degreePersonalDev["Online MBA"];

   // Filter only soft skills (max 2 per degree)
   const softSkills = allItems.filter(i => i.type === "soft_skill");

   // Filter only LinkedIn / networking items (min 3 per degree)
   const linkedinItems = allItems.filter(i => i.type === "linkedin");

   // Combine both files for a unified degree profile
   import degreeSkills     from './degreeSkills';
   import degreePersonalDev from './degreePersonalDev';

   function getFullDegreeProfile(degree, specialization) {
     const domainSkills = degreeSkills[degree]?.[specialization]
                       ?? degreeSkills[degree]?.["General"]
                       ?? [];
     const pdSkills = degreePersonalDev[degree] ?? [];
     return { domainSkills, pdSkills };
   }

───────────────────────────────────────────── */