/**
 * degreeSkills.js
 *
 * Skills per online degree × specialization.
 * Each entry: { skill: string, subtext: string }
 * "General" key = fallback when specialization is not found.
 *
 * Degrees covered:
 *  Online MBA | Online MCA | Online MA | Online MCom
 *  Online MSc | Online BBA | Online BA | Online BCA | Online BCom
 */

const degreeSkills = {

  /* ─────────────────────────────────────────────
     ONLINE MBA
  ───────────────────────────────────────────── */
  "Online MBA": {

    "Finance": [
      { skill: "Financial Modeling",        subtext: "Build DCF, LBO and scenario models to support business decisions" },
      { skill: "Investment Analysis",        subtext: "Evaluate equities, bonds and market opportunities with quantitative rigor" },
      { skill: "Corporate Finance",          subtext: "Manage capital structure, WACC and fundraising strategies" },
      { skill: "Risk Management",            subtext: "Identify, measure and mitigate financial risks across portfolios" },
      { skill: "Financial Reporting",        subtext: "Prepare and interpret P&L, balance sheets and cash flow statements" },
      { skill: "Derivatives & Treasury",     subtext: "Handle FX, interest rate hedging and working capital optimization" },
    ],

    "Marketing": [
      { skill: "Brand Management",           subtext: "Build and sustain brand equity across consumer touchpoints" },
      { skill: "Consumer Behaviour",         subtext: "Analyse buying patterns to shape product and campaign strategy" },
      { skill: "Digital Marketing",          subtext: "Drive growth via SEO, paid media and marketing automation" },
      { skill: "Market Research",            subtext: "Design primary and secondary studies to validate business ideas" },
      { skill: "Product Marketing",          subtext: "Define positioning, messaging and go-to-market for new launches" },
      { skill: "Marketing Analytics",        subtext: "Measure campaign ROI through attribution models and dashboards" },
    ],

    "Human Resource Management": [
      { skill: "Talent Acquisition",         subtext: "Design hiring pipelines and employer branding strategies" },
      { skill: "Performance Management",     subtext: "Build OKR/KPI frameworks that align teams with business goals" },
      { skill: "Learning & Development",     subtext: "Create capability-building programs to upskill workforces" },
      { skill: "HR Analytics",               subtext: "Use data to predict attrition, engagement and workforce needs" },
      { skill: "Compensation & Benefits",    subtext: "Design competitive total rewards and equity structures" },
      { skill: "Organizational Behaviour",   subtext: "Understand group dynamics to improve culture and effectiveness" },
    ],

    "Operations Management": [
      { skill: "Supply Chain Management",    subtext: "Optimize end-to-end procurement, logistics and inventory flows" },
      { skill: "Lean & Six Sigma",           subtext: "Eliminate waste and reduce defects using process improvement tools" },
      { skill: "Project Management",         subtext: "Plan, execute and close projects on time and within budget" },
      { skill: "Quality Management",         subtext: "Implement QMS frameworks to ensure consistent output quality" },
      { skill: "Operations Analytics",       subtext: "Use data to improve throughput, cost and service levels" },
      { skill: "Procurement Strategy",       subtext: "Negotiate contracts and build resilient supplier networks" },
    ],

    "Business Analytics": [
      { skill: "Data Analysis & Visualization", subtext: "Transform raw data into actionable insights using charts and dashboards" },
      { skill: "Statistical Modelling",      subtext: "Apply regression, clustering and forecasting to business problems" },
      { skill: "SQL & Database Management",  subtext: "Query structured databases to extract business-critical metrics" },
      { skill: "Business Intelligence",      subtext: "Build BI solutions using tools like Power BI or Tableau" },
      { skill: "Predictive Analytics",       subtext: "Build models that forecast demand, churn and revenue" },
      { skill: "Decision Science",           subtext: "Apply optimization and simulation to guide strategic choices" },
    ],

    "Information Technology": [
      { skill: "IT Strategy & Governance",   subtext: "Align technology investments with business objectives and risk appetite" },
      { skill: "Enterprise Architecture",    subtext: "Design scalable IT systems and integration blueprints for enterprises" },
      { skill: "Digital Transformation",     subtext: "Lead cloud, AI and automation adoption across the organization" },
      { skill: "Cybersecurity Fundamentals", subtext: "Manage information security policies and risk across IT systems" },
      { skill: "ERP & Systems Management",   subtext: "Oversee SAP, Oracle or similar enterprise system implementations" },
      { skill: "Agile & DevOps Practices",   subtext: "Apply iterative delivery methods to accelerate technology projects" },
    ],

    "Supply Chain Management": [
      { skill: "Demand & Supply Planning",   subtext: "Forecast demand and align procurement to meet business needs" },
      { skill: "Logistics Management",       subtext: "Optimize warehousing, transportation and last-mile delivery" },
      { skill: "Global Sourcing",            subtext: "Identify and onboard international suppliers with cost efficiency" },
      { skill: "Inventory Optimization",     subtext: "Balance stock levels to reduce carrying costs without stockouts" },
      { skill: "Supply Chain Analytics",     subtext: "Use data to identify bottlenecks and improve network performance" },
      { skill: "Vendor Relationship Mgmt",   subtext: "Build long-term supplier partnerships that ensure quality delivery" },
    ],

    "Entrepreneurship": [
      { skill: "Business Model Design",      subtext: "Create viable revenue models and value propositions from scratch" },
      { skill: "Startup Fundraising",        subtext: "Build pitch decks and navigate angel, VC and seed funding rounds" },
      { skill: "Product-Market Fit",         subtext: "Validate customer problems and iterate to find scalable solutions" },
      { skill: "Financial Planning (Startup)", subtext: "Build runway projections, unit economics and cap table models" },
      { skill: "Growth Hacking",             subtext: "Run rapid experiments across channels to acquire and retain users" },
      { skill: "Leadership & Team Building", subtext: "Hire, motivate and align founding teams towards a shared vision" },
    ],

    "Healthcare Management": [
      { skill: "Healthcare Operations",      subtext: "Manage hospital workflows, capacity planning and patient flow" },
      { skill: "Health Policy & Regulation", subtext: "Navigate regulatory frameworks like NABH, CDSCO and NMC guidelines" },
      { skill: "Healthcare Finance",         subtext: "Manage hospital P&L, insurance billing and cost control" },
      { skill: "Clinical Quality Management", subtext: "Implement quality systems to improve patient safety outcomes" },
      { skill: "Health Informatics",         subtext: "Leverage EMR and HIS systems for data-driven care delivery" },
      { skill: "Pharma & Medical Devices",   subtext: "Understand go-to-market strategy for healthcare products" },
    ],

    "International Business": [
      { skill: "Global Trade & Forex",       subtext: "Manage import/export documentation and currency risk in trade" },
      { skill: "Cross-Cultural Management",  subtext: "Lead diverse teams across geographies and cultural contexts" },
      { skill: "International Marketing",    subtext: "Adapt products and campaigns for different global markets" },
      { skill: "Trade Compliance & Law",     subtext: "Navigate international trade laws, tariffs and customs regulations" },
      { skill: "Global Supply Chain",        subtext: "Build resilient supply networks spanning multiple countries" },
      { skill: "Emerging Market Strategy",   subtext: "Identify growth opportunities in high-growth developing economies" },
    ],

    "General": [
      { skill: "Strategic Thinking",         subtext: "Analyse business problems and craft long-term competitive strategies" },
      { skill: "Financial Literacy",         subtext: "Read and interpret financial statements for informed decisions" },
      { skill: "Leadership & Communication", subtext: "Inspire teams and communicate vision clearly at all levels" },
      { skill: "Business Analytics",         subtext: "Use data to support business decisions across functions" },
      { skill: "Project Management",         subtext: "Deliver projects on time and budget using structured methods" },
      { skill: "Problem Solving",            subtext: "Break down complex challenges using structured frameworks" },
    ],
  },

  /* ─────────────────────────────────────────────
     ONLINE MCA
  ───────────────────────────────────────────── */
  "Online MCA": {

    "Software Engineering": [
      { skill: "Data Structures & Algorithms", subtext: "Design efficient solutions using arrays, trees, graphs and sorting logic" },
      { skill: "Object-Oriented Programming",  subtext: "Build modular, reusable code using OOP principles in Java or C++" },
      { skill: "Software Design Patterns",      subtext: "Apply proven architectural patterns like MVC, Singleton and Observer" },
      { skill: "Database Management (SQL)",     subtext: "Design relational schemas and write optimized queries in SQL" },
      { skill: "Version Control (Git)",         subtext: "Manage codebases, branching and team collaboration using Git" },
      { skill: "Software Testing & QA",         subtext: "Write unit, integration and end-to-end tests to ensure code quality" },
    ],

    "Data Science & AI": [
      { skill: "Machine Learning",            subtext: "Build supervised and unsupervised models to solve prediction problems" },
      { skill: "Python for Data Science",     subtext: "Use Pandas, NumPy and Scikit-learn for data analysis and modelling" },
      { skill: "Deep Learning & Neural Nets", subtext: "Design CNNs, RNNs and transformer models for AI applications" },
      { skill: "Data Wrangling & EDA",        subtext: "Clean, explore and visualize messy datasets before modelling" },
      { skill: "Natural Language Processing", subtext: "Build text analysis, sentiment detection and LLM-based applications" },
      { skill: "MLOps & Model Deployment",    subtext: "Deploy and monitor ML models in production using pipelines and APIs" },
    ],

    "Cyber Security": [
      { skill: "Network Security",            subtext: "Secure TCP/IP networks using firewalls, VPNs and intrusion detection" },
      { skill: "Ethical Hacking & Pentesting", subtext: "Identify vulnerabilities through authorized penetration testing" },
      { skill: "Cryptography",               subtext: "Apply encryption, hashing and PKI to protect data in transit and rest" },
      { skill: "Security Operations (SOC)",   subtext: "Monitor and respond to incidents using SIEM and threat intelligence" },
      { skill: "Cloud Security",             subtext: "Secure AWS/Azure/GCP workloads with IAM, CSPM and compliance tools" },
      { skill: "Digital Forensics",          subtext: "Investigate cyber incidents and recover evidence from digital systems" },
    ],

    "Cloud Computing": [
      { skill: "Cloud Architecture (AWS/Azure/GCP)", subtext: "Design scalable, high-availability cloud-native solutions" },
      { skill: "Containerization & Kubernetes",      subtext: "Deploy and orchestrate microservices using Docker and Kubernetes" },
      { skill: "DevOps & CI/CD",                     subtext: "Automate software delivery pipelines with Jenkins, GitHub Actions" },
      { skill: "Infrastructure as Code",             subtext: "Provision cloud infrastructure using Terraform or AWS CloudFormation" },
      { skill: "Cloud Cost Optimization",            subtext: "Right-size resources and apply FinOps practices to reduce cloud spend" },
      { skill: "Serverless Computing",               subtext: "Build event-driven applications using Lambda, Cloud Functions and Azure Functions" },
    ],

    "Full Stack Development": [
      { skill: "Frontend Development (React/Vue)", subtext: "Build responsive, component-driven web UIs with modern JS frameworks" },
      { skill: "Backend Development (Node/Django)", subtext: "Create REST and GraphQL APIs with server-side frameworks" },
      { skill: "Database Design (SQL & NoSQL)",    subtext: "Design schemas for PostgreSQL, MySQL, MongoDB and Redis" },
      { skill: "Authentication & Security",        subtext: "Implement OAuth, JWT and secure session management in web apps" },
      { skill: "API Integration",                  subtext: "Consume and build third-party APIs for payments, maps and messaging" },
      { skill: "Deployment & DevOps",              subtext: "Deploy full-stack apps on cloud with Docker and CI/CD pipelines" },
    ],

    "Mobile Application Development": [
      { skill: "Android Development (Kotlin)",  subtext: "Build native Android apps using Jetpack Compose and modern Android APIs" },
      { skill: "iOS Development (Swift)",       subtext: "Build native iOS apps using SwiftUI and Apple platform frameworks" },
      { skill: "React Native / Flutter",        subtext: "Develop cross-platform mobile apps with a single codebase" },
      { skill: "Mobile UI/UX Design",           subtext: "Design intuitive, accessible and performant mobile interfaces" },
      { skill: "Mobile API Integration",        subtext: "Connect apps to backend services via REST, GraphQL and WebSockets" },
      { skill: "App Store Publishing & ASO",    subtext: "Publish, optimize and grow apps on Google Play and App Store" },
    ],

    "General": [
      { skill: "Programming Fundamentals",     subtext: "Write clean, efficient code in at least one modern language" },
      { skill: "Data Structures & Algorithms", subtext: "Solve computational problems using optimal data structures" },
      { skill: "Database Management",          subtext: "Design and query relational and NoSQL databases effectively" },
      { skill: "Web Technologies",             subtext: "Understand HTML, CSS, JavaScript and how the web works" },
      { skill: "Operating Systems & Networks", subtext: "Work with Linux, processes, memory management and TCP/IP basics" },
      { skill: "Problem Solving",              subtext: "Break down complex technical problems into implementable solutions" },
    ],
  },

  /* ─────────────────────────────────────────────
     ONLINE MA
  ───────────────────────────────────────────── */
  "Online MA": {

    "English Literature": [
      { skill: "Literary Analysis",           subtext: "Deconstruct texts using critical theories like structuralism and feminism" },
      { skill: "Academic Writing",            subtext: "Produce well-researched, structured essays and dissertations" },
      { skill: "Content & Copywriting",       subtext: "Craft compelling narratives for digital, editorial and brand contexts" },
      { skill: "Research Methodology",        subtext: "Design and execute humanities research with rigorous methodology" },
      { skill: "Communication Skills",        subtext: "Present complex ideas clearly in written and spoken formats" },
      { skill: "Editorial & Publishing",      subtext: "Understand publishing workflows, editing standards and content curation" },
    ],

    "Psychology": [
      { skill: "Psychological Assessment",    subtext: "Administer and interpret standardized psychometric instruments" },
      { skill: "Counselling Techniques",      subtext: "Apply CBT, person-centred and other therapeutic approaches" },
      { skill: "Research & Statistics",       subtext: "Design studies and analyse behavioral data using SPSS or R" },
      { skill: "Organisational Psychology",   subtext: "Apply psychological principles to improve workplace performance" },
      { skill: "Child & Developmental Psych", subtext: "Understand cognitive, emotional and social development across life stages" },
      { skill: "Mental Health Awareness",     subtext: "Identify, support and refer individuals experiencing mental health challenges" },
    ],

    "Sociology": [
      { skill: "Social Research Methods",     subtext: "Conduct qualitative and quantitative studies on social phenomena" },
      { skill: "Social Theory",               subtext: "Apply classical and contemporary sociological frameworks to analyse society" },
      { skill: "Community Development",       subtext: "Design programs that strengthen local communities and social capital" },
      { skill: "Gender & Diversity Studies",  subtext: "Analyse power structures, inequality and representation in society" },
      { skill: "Policy Analysis",             subtext: "Evaluate social policies for their impact on communities and institutions" },
      { skill: "Data Collection & Fieldwork", subtext: "Gather primary data through surveys, ethnography and interviews" },
    ],

    "Economics": [
      { skill: "Microeconomics",              subtext: "Analyse consumer behaviour, market structures and pricing mechanisms" },
      { skill: "Macroeconomics",              subtext: "Understand national income, inflation, monetary and fiscal policy" },
      { skill: "Econometrics",                subtext: "Apply statistical models to test economic hypotheses with data" },
      { skill: "Development Economics",       subtext: "Study growth, poverty and inequality in emerging economies" },
      { skill: "Financial Economics",         subtext: "Analyse capital markets, asset pricing and investment behaviour" },
      { skill: "Policy Research & Writing",   subtext: "Produce evidence-based policy briefs for government and think tanks" },
    ],

    "Political Science": [
      { skill: "Governance & Public Policy",  subtext: "Analyse how governments formulate and implement public policies" },
      { skill: "International Relations",     subtext: "Understand geopolitics, diplomacy and global power dynamics" },
      { skill: "Political Theory",            subtext: "Engage with foundational thinkers from Hobbes to Rawls" },
      { skill: "Research & Data Analysis",    subtext: "Use quantitative and qualitative methods for political research" },
      { skill: "Electoral Politics",          subtext: "Study voting behaviour, election systems and political campaigns" },
      { skill: "Policy Writing & Advocacy",   subtext: "Craft policy documents and position papers for public discourse" },
    ],

    "History": [
      { skill: "Historical Research",         subtext: "Navigate archives, primary sources and historical databases" },
      { skill: "Critical Analysis",           subtext: "Evaluate historical arguments, biases and historiographical debates" },
      { skill: "Academic Writing",            subtext: "Produce rigorous, well-cited historical essays and dissertations" },
      { skill: "Oral History & Ethnography",  subtext: "Collect and interpret personal narratives and lived experiences" },
      { skill: "Cultural Heritage Management", subtext: "Work in museums, archives and heritage conservation projects" },
      { skill: "Public History Communication", subtext: "Translate historical knowledge for mainstream and digital audiences" },
    ],

    "Journalism & Mass Communication": [
      { skill: "News Reporting & Writing",    subtext: "Write accurate, timely stories across print, digital and broadcast" },
      { skill: "Digital Journalism",          subtext: "Produce multimedia content for online platforms and social media" },
      { skill: "Investigative Journalism",    subtext: "Research and expose stories using data, RTI and source cultivation" },
      { skill: "Media Ethics & Law",          subtext: "Navigate press freedom, defamation law and journalistic standards" },
      { skill: "Video & Podcast Production",  subtext: "Script, shoot and edit audio-visual content for digital audiences" },
      { skill: "PR & Corporate Communications", subtext: "Manage brand narratives and stakeholder messaging professionally" },
    ],

    "Public Administration": [
      { skill: "Public Policy Analysis",      subtext: "Evaluate government programs for effectiveness and equity" },
      { skill: "Governance & Accountability", subtext: "Understand transparency mechanisms in government institutions" },
      { skill: "Administrative Law",          subtext: "Interpret rules, regulations and judicial review of state action" },
      { skill: "Development Planning",        subtext: "Design and implement welfare programs in urban and rural contexts" },
      { skill: "Budget & Public Finance",     subtext: "Analyse government budgets, revenue and expenditure management" },
      { skill: "E-Governance",                subtext: "Apply digital tools to improve citizen service delivery and transparency" },
    ],

    "General": [
      { skill: "Critical Thinking",           subtext: "Analyse arguments, identify assumptions and evaluate evidence" },
      { skill: "Research & Writing",          subtext: "Conduct structured research and communicate findings in clear prose" },
      { skill: "Communication Skills",        subtext: "Express ideas persuasively in written and verbal formats" },
      { skill: "Analytical Reasoning",        subtext: "Break down complex social, cultural or economic issues systematically" },
      { skill: "Qualitative Research",        subtext: "Gather and interpret non-numerical data using interviews and fieldwork" },
      { skill: "Digital Literacy",            subtext: "Use digital tools for research, collaboration and content creation" },
    ],
  },

  /* ─────────────────────────────────────────────
     ONLINE MCOM
  ───────────────────────────────────────────── */
  "Online MCom": {

    "Accounting & Finance": [
      { skill: "Advanced Financial Accounting", subtext: "Prepare consolidated accounts under Ind AS and IFRS standards" },
      { skill: "Management Accounting",         subtext: "Use costing, budgeting and variance analysis for decision-making" },
      { skill: "Auditing & Assurance",          subtext: "Conduct statutory and internal audits following ICAI standards" },
      { skill: "Corporate Taxation",            subtext: "Manage direct and indirect tax compliance including GST and TDS" },
      { skill: "Financial Analysis",            subtext: "Evaluate business performance through ratio and trend analysis" },
      { skill: "Accounting Software (Tally/SAP)", subtext: "Process transactions and generate reports in accounting systems" },
    ],

    "Taxation": [
      { skill: "GST Compliance",              subtext: "File GSTR returns, manage input tax credit and handle GST audits" },
      { skill: "Income Tax Planning",         subtext: "Minimise tax liability through legal deductions and exemptions" },
      { skill: "Direct Tax Laws",             subtext: "Navigate the Income Tax Act, TDS provisions and assessments" },
      { skill: "Indirect Tax Laws",           subtext: "Manage customs, excise and service tax compliance" },
      { skill: "Tax Litigation",              subtext: "Draft appeals, represent clients before tax authorities and tribunals" },
      { skill: "International Taxation",      subtext: "Handle transfer pricing, DTAA treaties and cross-border tax issues" },
    ],

    "Banking & Finance": [
      { skill: "Banking Operations",          subtext: "Understand retail and commercial banking products and processes" },
      { skill: "Credit Analysis",             subtext: "Assess borrower risk and structure loans for individuals and corporates" },
      { skill: "Financial Markets",           subtext: "Analyse equity, debt and derivative markets and instruments" },
      { skill: "Risk Management",             subtext: "Identify credit, market and operational risks in banking context" },
      { skill: "Investment Management",       subtext: "Build and manage portfolios aligned to client risk profiles" },
      { skill: "Regulatory Compliance (RBI)", subtext: "Ensure adherence to RBI guidelines, KYC and AML norms" },
    ],

    "E-Commerce & Digital Business": [
      { skill: "E-Commerce Operations",       subtext: "Manage product listings, inventory and marketplace operations" },
      { skill: "Digital Payments & Fintech",  subtext: "Understand payment gateways, UPI, wallets and BNPL models" },
      { skill: "Digital Marketing",           subtext: "Drive traffic and sales using SEO, SEM and social commerce" },
      { skill: "Supply Chain for E-Commerce", subtext: "Manage fulfilment, returns and last-mile logistics for online retail" },
      { skill: "Analytics & Conversion",      subtext: "Optimize product pages and funnels using data and A/B testing" },
      { skill: "Business Law (Digital)",      subtext: "Navigate consumer protection, data privacy and digital contracts" },
    ],

    "Business Administration": [
      { skill: "Strategic Management",        subtext: "Analyse competitive landscapes and craft long-term business strategy" },
      { skill: "Financial Management",        subtext: "Manage working capital, budgets and financial planning cycles" },
      { skill: "Organizational Behaviour",    subtext: "Understand team dynamics, leadership styles and motivation theories" },
      { skill: "Marketing Management",        subtext: "Develop pricing, product and promotional strategies for growth" },
      { skill: "Business Research Methods",   subtext: "Design surveys and analyse data to support business decisions" },
      { skill: "Business Communication",      subtext: "Write reports, proposals and present ideas effectively to stakeholders" },
    ],

    "General": [
      { skill: "Accounting Principles",       subtext: "Record, classify and summarize financial transactions accurately" },
      { skill: "Taxation Basics",             subtext: "Understand direct and indirect tax obligations for businesses" },
      { skill: "Financial Analysis",          subtext: "Interpret financial ratios and statements to assess business health" },
      { skill: "Business Law",                subtext: "Navigate contracts, company law and commercial regulations" },
      { skill: "MS Excel & Tally",            subtext: "Use spreadsheets and accounting software for financial work" },
      { skill: "Business Communication",      subtext: "Communicate professionally in reports, emails and presentations" },
    ],
  },

  /* ─────────────────────────────────────────────
     ONLINE MSC
  ───────────────────────────────────────────── */
  "Online MSc": {

    "Computer Science": [
      { skill: "Advanced Algorithms",         subtext: "Design and analyse efficient algorithms for complex computational problems" },
      { skill: "Distributed Systems",         subtext: "Build scalable, fault-tolerant systems using distributed architecture" },
      { skill: "Machine Learning",            subtext: "Train and evaluate ML models for classification, regression and clustering" },
      { skill: "Computer Networks",           subtext: "Understand protocols, routing, TCP/IP stack and network security" },
      { skill: "Cloud & Big Data",            subtext: "Process large-scale data using Spark, Hadoop and cloud services" },
      { skill: "Research & Publications",     subtext: "Conduct original research and write academic papers for conferences" },
    ],

    "Data Science": [
      { skill: "Statistical Modelling",       subtext: "Apply regression, Bayesian inference and hypothesis testing to data" },
      { skill: "Machine Learning Engineering", subtext: "Build end-to-end ML pipelines from feature engineering to deployment" },
      { skill: "Python & R Programming",      subtext: "Use Python and R for data manipulation, analysis and visualization" },
      { skill: "Big Data & Spark",            subtext: "Process and analyse large datasets using distributed computing frameworks" },
      { skill: "Data Visualization",          subtext: "Communicate insights through charts, dashboards and storytelling" },
      { skill: "Deep Learning",               subtext: "Build neural networks for image, text and time-series applications" },
    ],

    "Statistics": [
      { skill: "Applied Statistics",          subtext: "Use ANOVA, regression and non-parametric tests for real-world problems" },
      { skill: "Probability Theory",          subtext: "Model uncertainty using distributions, Bayes theorem and stochastic processes" },
      { skill: "Statistical Computing (R/Python)", subtext: "Implement statistical analyses and simulations programmatically" },
      { skill: "Biostatistics",               subtext: "Apply clinical trial design, survival analysis and epidemiological methods" },
      { skill: "Survey Sampling Methods",     subtext: "Design representative samples and handle non-response bias" },
      { skill: "Time Series Analysis",        subtext: "Model and forecast temporal data using ARIMA, GARCH and state-space models" },
    ],

    "Mathematics": [
      { skill: "Linear Algebra",              subtext: "Apply matrices, eigenvalues and transformations to computing and physics" },
      { skill: "Real & Complex Analysis",     subtext: "Master rigorous proofs in continuity, differentiation and integration" },
      { skill: "Numerical Methods",           subtext: "Solve mathematical problems computationally using algorithms" },
      { skill: "Discrete Mathematics",        subtext: "Apply logic, combinatorics and graph theory to CS and engineering" },
      { skill: "Mathematical Modelling",      subtext: "Translate real-world problems into solvable mathematical frameworks" },
      { skill: "Operations Research",         subtext: "Use linear programming and optimisation for business and logistics" },
    ],

    "Environmental Science": [
      { skill: "Environmental Impact Assessment", subtext: "Evaluate and document environmental effects of development projects" },
      { skill: "Climate Science & Modelling",     subtext: "Understand climate systems and interpret climate projection data" },
      { skill: "GIS & Remote Sensing",            subtext: "Analyse geospatial data for land use, deforestation and pollution mapping" },
      { skill: "Waste & Water Management",         subtext: "Design systems for solid waste treatment and water quality management" },
      { skill: "Environmental Policy",             subtext: "Navigate regulatory frameworks like EIA, CPCB and international accords" },
      { skill: "Ecological Research",              subtext: "Conduct field studies on biodiversity, ecosystems and species conservation" },
    ],

    "Biotechnology": [
      { skill: "Molecular Biology Techniques", subtext: "Perform PCR, gel electrophoresis and DNA sequencing in lab contexts" },
      { skill: "Genetic Engineering",          subtext: "Manipulate genes using CRISPR, recombinant DNA and gene expression tools" },
      { skill: "Bioinformatics",               subtext: "Analyse genomic and proteomic data using computational biology tools" },
      { skill: "Cell Culture & Fermentation",  subtext: "Grow and maintain cell lines and microbial cultures for research" },
      { skill: "Regulatory Affairs (Pharma)",  subtext: "Navigate drug development regulations from IND to NDA filing" },
      { skill: "Research & Scientific Writing", subtext: "Design experiments and publish results in peer-reviewed journals" },
    ],

    "Physics": [
      { skill: "Quantum Mechanics",           subtext: "Apply quantum principles to atomic, molecular and optical systems" },
      { skill: "Computational Physics",       subtext: "Simulate physical systems using MATLAB, Python or Fortran" },
      { skill: "Electromagnetism",            subtext: "Solve Maxwell's equations and their applications in devices and communications" },
      { skill: "Solid State Physics",         subtext: "Understand crystal structures, semiconductors and material properties" },
      { skill: "Experimental Physics",        subtext: "Design and conduct experiments with data acquisition and error analysis" },
      { skill: "Scientific Research",         subtext: "Formulate hypotheses, design studies and publish original findings" },
    ],

    "Chemistry": [
      { skill: "Organic Chemistry",           subtext: "Synthesise and characterize organic compounds using modern reactions" },
      { skill: "Analytical Chemistry",        subtext: "Use spectroscopy, chromatography and electrochemical methods for analysis" },
      { skill: "Physical Chemistry",          subtext: "Apply thermodynamics, kinetics and quantum chemistry to chemical systems" },
      { skill: "Green Chemistry",             subtext: "Design processes that minimize hazardous substances and waste" },
      { skill: "Lab Techniques & Safety",     subtext: "Operate lab instruments and follow safety protocols in chemical research" },
      { skill: "Scientific Writing",          subtext: "Document experimental results and publish in peer-reviewed formats" },
    ],

    "General": [
      { skill: "Research Methodology",        subtext: "Design and execute scientific studies with proper controls and analysis" },
      { skill: "Data Analysis",               subtext: "Process and interpret experimental or observational datasets" },
      { skill: "Scientific Writing",          subtext: "Communicate research findings clearly in academic and professional formats" },
      { skill: "Laboratory Skills",           subtext: "Work with standard lab equipment and maintain experimental integrity" },
      { skill: "Problem Solving",             subtext: "Apply scientific reasoning to solve complex, real-world challenges" },
      { skill: "Statistical Analysis",        subtext: "Use statistics to validate hypotheses and draw meaningful conclusions" },
    ],
  },

  /* ─────────────────────────────────────────────
     ONLINE BBA
  ───────────────────────────────────────────── */
  "Online BBA": {

    "Finance": [
      { skill: "Financial Accounting",        subtext: "Record and report business transactions using double-entry bookkeeping" },
      { skill: "Financial Analysis",          subtext: "Interpret balance sheets, P&L and cash flow statements" },
      { skill: "Investment Basics",           subtext: "Understand equities, mutual funds and fixed income instruments" },
      { skill: "Excel for Finance",           subtext: "Build financial models and dashboards using advanced Excel functions" },
      { skill: "Banking & Credit",            subtext: "Understand loan structures, credit scoring and banking products" },
      { skill: "Taxation Fundamentals",       subtext: "Apply basic knowledge of GST, TDS and income tax for businesses" },
    ],

    "Marketing": [
      { skill: "Marketing Fundamentals",      subtext: "Apply the 4Ps framework to plan and launch products and campaigns" },
      { skill: "Digital Marketing Basics",    subtext: "Run SEO, social media and email campaigns to drive online growth" },
      { skill: "Consumer Behaviour",          subtext: "Understand what drives buying decisions across customer segments" },
      { skill: "Brand Awareness",             subtext: "Build consistent brand identity across visual and verbal touchpoints" },
      { skill: "Sales Techniques",            subtext: "Use consultative selling and objection handling to close deals" },
      { skill: "Market Research",             subtext: "Conduct surveys and competitive analysis to validate business ideas" },
    ],

    "Human Resource Management": [
      { skill: "Recruitment & Selection",     subtext: "Source, screen and interview candidates using structured methods" },
      { skill: "HR Policies & Compliance",    subtext: "Understand labour laws, ESI, PF and workplace regulations" },
      { skill: "Training & Development",      subtext: "Design onboarding and skill programs for employees" },
      { skill: "Payroll Management",          subtext: "Process salaries, deductions and statutory filings accurately" },
      { skill: "Employee Engagement",         subtext: "Run initiatives that build team morale and reduce attrition" },
      { skill: "Performance Appraisal",       subtext: "Use goal-setting frameworks like KRAs to evaluate employee performance" },
    ],

    "Operations": [
      { skill: "Operations Planning",         subtext: "Schedule, coordinate and monitor day-to-day business activities" },
      { skill: "Supply Chain Basics",         subtext: "Understand procurement, inventory and logistics fundamentals" },
      { skill: "Quality Management",          subtext: "Apply QC tools and standards to improve output consistency" },
      { skill: "Lean Operations",             subtext: "Identify waste in processes and apply lean principles to eliminate it" },
      { skill: "ERP Fundamentals",            subtext: "Navigate enterprise software like SAP or Oracle for operations" },
      { skill: "Vendor Management",           subtext: "Evaluate and manage supplier relationships and purchase orders" },
    ],

    "Business Analytics": [
      { skill: "Excel & Data Analysis",       subtext: "Use pivot tables, VLOOKUP and charts to analyse business data" },
      { skill: "Business Statistics",         subtext: "Apply descriptive stats, probability and basic regression to data" },
      { skill: "SQL Basics",                  subtext: "Query databases to extract business metrics and reports" },
      { skill: "Dashboard Building",          subtext: "Create interactive business dashboards in Power BI or Tableau" },
      { skill: "Analytical Thinking",         subtext: "Decompose business problems into measurable, data-driven components" },
      { skill: "Reporting & Insights",        subtext: "Present data findings clearly to stakeholders and decision-makers" },
    ],

    "International Business": [
      { skill: "Global Business Environment", subtext: "Understand geopolitics, trade agreements and international economics" },
      { skill: "Import/Export Management",    subtext: "Navigate customs, INCOTERMS and trade documentation" },
      { skill: "Cross-Cultural Communication", subtext: "Work effectively with teams and clients across diverse cultures" },
      { skill: "Foreign Exchange Basics",     subtext: "Understand currency risk and how FX movements affect business" },
      { skill: "International Marketing",     subtext: "Adapt marketing strategies for global markets and audiences" },
      { skill: "Global Supply Chain",         subtext: "Manage suppliers and logistics across international boundaries" },
    ],

    "General": [
      { skill: "Business Communication",      subtext: "Write emails, reports and present ideas confidently and clearly" },
      { skill: "Accounting Basics",           subtext: "Record financial transactions and prepare simple financial statements" },
      { skill: "Marketing Fundamentals",      subtext: "Understand how businesses attract, retain and grow customers" },
      { skill: "MS Office (Excel, PPT, Word)", subtext: "Use office tools to create reports, presentations and analyses" },
      { skill: "Analytical Thinking",         subtext: "Approach business problems with structured, data-informed reasoning" },
      { skill: "Teamwork & Leadership",       subtext: "Collaborate effectively and take initiative in team settings" },
    ],
  },

  /* ─────────────────────────────────────────────
     ONLINE BA
  ───────────────────────────────────────────── */
  "Online BA": {

    "English": [
      { skill: "Reading & Literary Analysis", subtext: "Closely read texts and identify themes, structure and meaning" },
      { skill: "Creative & Academic Writing", subtext: "Produce original and research-based written work across genres" },
      { skill: "Grammar & Language Skills",   subtext: "Master English grammar for professional and creative contexts" },
      { skill: "Content Writing",             subtext: "Write engaging blogs, articles and web copy for digital platforms" },
      { skill: "Communication Skills",        subtext: "Express ideas clearly and confidently in speech and writing" },
      { skill: "Editing & Proofreading",      subtext: "Review and refine written content for accuracy and clarity" },
    ],

    "Psychology": [
      { skill: "Psychological Concepts",      subtext: "Apply foundational theories of behaviour, cognition and emotion" },
      { skill: "Human Development",           subtext: "Understand growth patterns across childhood, adolescence and adulthood" },
      { skill: "Basic Counselling Skills",    subtext: "Practice active listening, empathy and reflective techniques" },
      { skill: "Research Methods",            subtext: "Design surveys and analyse human behavioural data" },
      { skill: "Abnormal Psychology",         subtext: "Recognize and understand common mental health conditions" },
      { skill: "Social Psychology",           subtext: "Analyse how group dynamics and social norms influence behaviour" },
    ],

    "Sociology": [
      { skill: "Sociological Thinking",       subtext: "Analyse society using concepts like class, gender and institutions" },
      { skill: "Social Research Methods",     subtext: "Collect data through surveys, interviews and field observation" },
      { skill: "Community & Development",     subtext: "Understand social welfare, NGO work and grassroots development" },
      { skill: "Social Issues Awareness",     subtext: "Critically engage with poverty, inequality and social justice" },
      { skill: "Communication & Writing",     subtext: "Produce reports, essays and presentations on social topics" },
      { skill: "Cultural Diversity",          subtext: "Appreciate and work sensitively across multicultural contexts" },
    ],

    "Economics": [
      { skill: "Micro & Macroeconomics",      subtext: "Understand market forces, national income and economic policy" },
      { skill: "Business Economics",          subtext: "Apply economic reasoning to pricing, production and market entry" },
      { skill: "Statistical Methods",         subtext: "Use basic stats and Excel to analyse economic indicators" },
      { skill: "Public Finance",              subtext: "Understand government revenue, expenditure and fiscal policy" },
      { skill: "Banking & Money",             subtext: "Explain monetary policy, banking systems and financial instruments" },
      { skill: "Research & Report Writing",   subtext: "Document economic analysis in structured, evidence-based reports" },
    ],

    "Political Science": [
      { skill: "Indian Polity & Constitution", subtext: "Understand governance, fundamental rights and constitutional law" },
      { skill: "International Relations",     subtext: "Analyse foreign policy, diplomacy and global institutions" },
      { skill: "Public Administration",       subtext: "Study how government institutions are organized and managed" },
      { skill: "Political Theory",            subtext: "Engage with democratic, liberal and socialist thought" },
      { skill: "Research & Essay Writing",    subtext: "Structure and argue political ideas in academic formats" },
      { skill: "Civic Awareness",             subtext: "Engage with current affairs, elections and policy developments" },
    ],

    "History": [
      { skill: "Historical Research",         subtext: "Use primary and secondary sources to build historical arguments" },
      { skill: "Indian & World History",      subtext: "Analyse major events, movements and turning points in history" },
      { skill: "Critical Reading",            subtext: "Evaluate historical accounts for bias, perspective and evidence" },
      { skill: "Academic Essay Writing",      subtext: "Argue historical theses in well-structured written work" },
      { skill: "Heritage & Culture",          subtext: "Appreciate and document cultural heritage and lived traditions" },
      { skill: "Communication Skills",        subtext: "Present historical knowledge clearly to academic and public audiences" },
    ],

    "Journalism": [
      { skill: "News Writing & Reporting",    subtext: "Write accurate, concise stories using the inverted pyramid structure" },
      { skill: "Digital Content Creation",    subtext: "Produce social media posts, videos and online articles" },
      { skill: "Interviewing Skills",         subtext: "Conduct structured and unstructured interviews to gather information" },
      { skill: "Media Ethics",                subtext: "Apply principles of accuracy, fairness and journalistic accountability" },
      { skill: "Photography & Video Basics",  subtext: "Capture and edit basic visual content for digital publishing" },
      { skill: "Social Media Management",     subtext: "Grow and manage an audience across Instagram, X and LinkedIn" },
    ],

    "General": [
      { skill: "Communication Skills",        subtext: "Articulate ideas clearly in written, verbal and visual formats" },
      { skill: "Critical Thinking",           subtext: "Analyse arguments, identify biases and form well-reasoned opinions" },
      { skill: "Research & Writing",          subtext: "Gather information from credible sources and present it clearly" },
      { skill: "Social Awareness",            subtext: "Understand diverse social, cultural and political perspectives" },
      { skill: "Digital Literacy",            subtext: "Navigate digital tools for research, communication and content" },
      { skill: "Time Management",             subtext: "Plan work, meet deadlines and prioritize tasks independently" },
    ],
  },

  /* ─────────────────────────────────────────────
     ONLINE BCA
  ───────────────────────────────────────────── */
  "Online BCA": {

    "Software Development": [
      { skill: "Programming (C, Java, Python)", subtext: "Write, debug and optimize code in foundational programming languages" },
      { skill: "Data Structures",              subtext: "Implement arrays, linked lists, trees and graphs to solve problems" },
      { skill: "DBMS & SQL",                   subtext: "Design database schemas and write SQL queries for data management" },
      { skill: "Web Development Basics",       subtext: "Build web pages using HTML, CSS and basic JavaScript" },
      { skill: "Object-Oriented Programming",  subtext: "Design modular software using classes, inheritance and polymorphism" },
      { skill: "Software Development Lifecycle", subtext: "Follow SDLC phases from requirements to deployment and maintenance" },
    ],

    "Data Science": [
      { skill: "Python for Data Analysis",    subtext: "Use Pandas and NumPy to clean, transform and analyse datasets" },
      { skill: "Machine Learning Basics",     subtext: "Build classification and regression models using Scikit-learn" },
      { skill: "Data Visualization",          subtext: "Create charts and dashboards using Matplotlib, Seaborn or Power BI" },
      { skill: "Statistics Fundamentals",     subtext: "Apply mean, variance, distributions and hypothesis testing to data" },
      { skill: "SQL & Database Querying",     subtext: "Extract, join and aggregate data from relational databases" },
      { skill: "Excel for Data",              subtext: "Analyse and present data using pivot tables and Excel functions" },
    ],

    "Cyber Security": [
      { skill: "Network Security Basics",     subtext: "Understand firewalls, VPNs, intrusion detection and secure protocols" },
      { skill: "Ethical Hacking Fundamentals", subtext: "Learn vulnerability scanning and basic penetration testing concepts" },
      { skill: "Operating System Security",   subtext: "Harden Linux and Windows systems against common attack vectors" },
      { skill: "Cryptography Basics",         subtext: "Apply symmetric, asymmetric and hashing techniques to protect data" },
      { skill: "Cybersecurity Tools",         subtext: "Use tools like Wireshark, Nmap and Metasploit for security analysis" },
      { skill: "Security Awareness",          subtext: "Identify phishing, social engineering and insider threat patterns" },
    ],

    "Cloud Computing": [
      { skill: "Cloud Fundamentals (AWS/Azure)", subtext: "Understand IaaS, PaaS, SaaS models and core cloud services" },
      { skill: "Linux & Shell Scripting",     subtext: "Navigate Linux OS and automate tasks using Bash scripts" },
      { skill: "Virtualisation & Containers", subtext: "Use VMware, Docker and basic Kubernetes for app deployment" },
      { skill: "Networking Basics",           subtext: "Understand IP addressing, subnets, DNS and cloud networking" },
      { skill: "Cloud Storage & Databases",   subtext: "Work with S3, RDS and cloud-native database services" },
      { skill: "DevOps Basics",               subtext: "Understand CI/CD pipelines and version control with Git" },
    ],

    "Full Stack Development": [
      { skill: "Frontend (HTML, CSS, JS, React)", subtext: "Build interactive, responsive web UIs from scratch" },
      { skill: "Backend (Node.js / PHP)",      subtext: "Create server-side logic, REST APIs and user authentication" },
      { skill: "Database (MySQL / MongoDB)",   subtext: "Design and query SQL and NoSQL databases for web applications" },
      { skill: "Git & Version Control",        subtext: "Manage code history and collaborate using GitHub workflows" },
      { skill: "API Development",              subtext: "Build and test RESTful APIs that connect frontend to backend services" },
      { skill: "Deployment & Hosting",         subtext: "Deploy web apps on Heroku, Vercel or AWS using basic DevOps tools" },
    ],

    "General": [
      { skill: "Programming Fundamentals",    subtext: "Write logical, well-structured code in at least one language" },
      { skill: "Database & SQL Basics",       subtext: "Design tables, write queries and manage basic relational databases" },
      { skill: "Web Development Basics",      subtext: "Create simple static and dynamic web pages using core web technologies" },
      { skill: "Problem Solving",             subtext: "Approach computing challenges analytically and algorithmically" },
      { skill: "Computer Networks Basics",    subtext: "Understand how devices communicate over local and wide area networks" },
      { skill: "MS Office & Digital Tools",   subtext: "Use productivity software for documentation and data presentation" },
    ],
  },

  /* ─────────────────────────────────────────────
     ONLINE BCOM
  ───────────────────────────────────────────── */
  "Online BCom": {

    "Accounting & Finance": [
      { skill: "Financial Accounting",        subtext: "Prepare trial balance, final accounts and financial statements" },
      { skill: "Cost Accounting",             subtext: "Apply job costing, process costing and marginal costing methods" },
      { skill: "Auditing Basics",             subtext: "Understand audit procedures, internal controls and verification" },
      { skill: "Tally & Accounting Software", subtext: "Record transactions, generate ledgers and prepare reports in Tally" },
      { skill: "Taxation (GST & IT)",         subtext: "File GST returns and calculate income tax for individuals and firms" },
      { skill: "Excel for Accounting",        subtext: "Manage books of accounts and create MIS reports using Excel" },
    ],

    "Taxation": [
      { skill: "GST Filing & Compliance",     subtext: "File GSTR-1, GSTR-3B and manage ITC reconciliation" },
      { skill: "Income Tax Returns (ITR)",    subtext: "Prepare and file ITRs for individuals, firms and companies" },
      { skill: "TDS & TCS",                   subtext: "Deduct, deposit and file TDS returns under the Income Tax Act" },
      { skill: "Tax Planning",                subtext: "Use deductions and exemptions to minimize tax burden legally" },
      { skill: "Accounting Software",         subtext: "Process tax entries in Tally or other accounting platforms" },
      { skill: "Financial Compliance",        subtext: "Ensure timely statutory filings and maintain proper documentation" },
    ],

    "Banking & Finance": [
      { skill: "Banking Products & Services", subtext: "Understand savings, loans, credit cards and investment products" },
      { skill: "Financial Literacy",          subtext: "Read financial statements and assess business health" },
      { skill: "Credit & Lending Basics",     subtext: "Understand credit assessment, EMI calculations and loan disbursement" },
      { skill: "Investment Awareness",        subtext: "Know about mutual funds, fixed deposits and stock market basics" },
      { skill: "Digital Banking",             subtext: "Navigate UPI, net banking, NEFT, RTGS and fintech solutions" },
      { skill: "Customer Service in BFSI",    subtext: "Handle client queries, KYC documentation and account management" },
    ],

    "E-Commerce": [
      { skill: "Online Selling & Marketplace", subtext: "List and manage products on Amazon, Flipkart and Meesho" },
      { skill: "Digital Payments",            subtext: "Understand payment gateways, UPI and reconciliation processes" },
      { skill: "E-Commerce Accounting",       subtext: "Manage GST, invoicing and financial records for online businesses" },
      { skill: "Digital Marketing Basics",    subtext: "Drive traffic using SEO, paid ads and social media promotions" },
      { skill: "Customer Relations Online",   subtext: "Handle returns, reviews and customer queries on digital platforms" },
      { skill: "Business Analytics",          subtext: "Use platform dashboards to track sales, conversion and growth" },
    ],

    "Business Administration": [
      { skill: "Business Communication",      subtext: "Draft professional emails, reports and deliver effective presentations" },
      { skill: "Principles of Management",    subtext: "Apply planning, organizing, leading and controlling in organizations" },
      { skill: "Marketing Basics",            subtext: "Understand the 4Ps, branding and consumer behaviour fundamentals" },
      { skill: "Financial Accounting",        subtext: "Record transactions and prepare basic financial statements" },
      { skill: "Entrepreneurship",            subtext: "Identify opportunities, create business plans and understand risk" },
      { skill: "MS Office Skills",            subtext: "Use Word, Excel and PowerPoint for business tasks professionally" },
    ],

    "General": [
      { skill: "Financial Accounting",        subtext: "Prepare and interpret basic financial statements and ledgers" },
      { skill: "Taxation Basics (GST & IT)",  subtext: "Understand key tax obligations for individuals and businesses" },
      { skill: "Business Communication",      subtext: "Write professional emails, reports and speak confidently in meetings" },
      { skill: "Tally / Accounting Software", subtext: "Maintain books of accounts using standard accounting platforms" },
      { skill: "MS Excel",                    subtext: "Build financial summaries, MIS reports and data models in Excel" },
      { skill: "Analytical Thinking",         subtext: "Apply logical reasoning to solve business and financial problems" },
    ],
  },
};

export default degreeSkills;

/* ─────────────────────────────────────────────
   USAGE EXAMPLE
   ─────────────────────────────────────────────

   import degreeSkills from './degreeSkills';

   function getSkills(degree, specialization) {
     const degreeData = degreeSkills[degree];
     if (!degreeData) return [];
     return degreeData[specialization] ?? degreeData["General"] ?? [];
   }

   // Example calls:
   getSkills("Online MBA", "Finance");
   // → [{ skill: "Financial Modeling", subtext: "Build DCF..." }, ...]

   getSkills("Online MBA", "Unknown Specialization");
   // → falls back to General skills for Online MBA

   getSkills("Online BCA", "Cyber Security");
   // → [{ skill: "Network Security Basics", subtext: "..." }, ...]

───────────────────────────────────────────── */