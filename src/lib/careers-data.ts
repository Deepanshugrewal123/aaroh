import { CareerRole } from "./types";

export const CAREERS_CATALOG: CareerRole[] = [
  {
    id: "career-1",
    slug: "product-ux-designer",
    title: "Digital Product & UX Designer",
    discipline: "arts_design",
    tagline: "Bridge human needs and digital systems through research, wireframing, and accessible design.",
    summary: "Product designers explore how real people interact with digital products, conduct user research, craft intuitive interaction architectures, and design design-system-compliant interfaces that solve complex workflows.",
    workStyle: ["creative", "analytical", "collaborative"],
    beginnerAccessibility: "high",
    dayInTheLife: {
      typicalHours: "9:30 AM – 6:30 PM (flexible, milestone-based)",
      coreActivities: [
        "Synthesizing qualitative user interview recordings into journey maps",
        "Iterating wireframes and interactive prototypes in Figma",
        "Reviewing implementation fidelity with frontend engineers",
        "Conducting unmoderated usability tests on proposed design changes",
      ],
      realWorkExamples: [
        "Redesigning a mobile banking checkout flow to reduce form abandonments by simplifying error messages",
        "Building a high-contrast accessibility audit checklist for an enterprise healthcare dashboard",
      ],
    },
    skillsRequired: [
      { skillId: "visual-hierarchy", importance: "essential", minimumLevel: 2 },
      { skillId: "ui-prototyping", importance: "essential", minimumLevel: 2 },
      { skillId: "ux-research", importance: "essential", minimumLevel: 2 },
      { skillId: "written-communication", importance: "advantageous", minimumLevel: 2 },
      { skillId: "critical-reasoning", importance: "advantageous", minimumLevel: 1 },
    ],
    entryPathways: [
      {
        pathTitle: "Case-Study Portfolio Route",
        description: "Focus on 2-3 deeply researched case studies solving real-world friction rather than purely decorative Dribbble mockups.",
        timelineMonths: "4–6 months",
        firstProject: "Redesign an unwieldy local public transit or university registration portal with user research & prototype.",
      },
      {
        pathTitle: "Design Systems & Junior UI Specialist",
        description: "Master design tokens, auto-layout, component variants, and handoff documentation.",
        timelineMonths: "3–5 months",
        firstProject: "Build an accessible, WCAG AA compliant open-source component kit.",
      },
    ],
    tradeoffsAndRealities: {
      positives: [
        "Direct visual impact on how thousands or millions experience software",
        "Highly collaborative role intersecting engineering, business, and human psychology",
        "Strong portfolio-driven hiring where proven work outweighs university brand",
      ],
      challenges: [
        "Frequent stakeholder misalignment and differing subjective aesthetic opinions",
        "Need to continuously justify design decisions using data rather than personal taste",
      ],
      commonMisconceptions: [
        "Misconception: You need to know fine-art drawing or illustration to be a great UX designer.",
        "Misconception: Beautiful colors matter more than functional workflow clarity and usability.",
      ],
    },
    verifiedSources: [
      {
        title: "Nielsen Norman Group UX Roles & Competencies Survey",
        retrievedYear: 2024,
        notes: "Documents entry pathways, core responsibilities, and research vs UI emphasis.",
      },
    ],
  },
  {
    id: "career-2",
    slug: "financial-analyst",
    title: "Financial Analyst & Valuation Associate",
    discipline: "commerce_business",
    tagline: "Turn company performance data, financial filings, and market dynamics into capital decisions.",
    summary: "Financial analysts evaluate company operating metrics, forecast cash flows, build valuation models, and prepare investment recommendations for corporate development, private equity, or equity research teams.",
    workStyle: ["analytical", "independent", "strategic"],
    beginnerAccessibility: "medium",
    dayInTheLife: {
      typicalHours: "8:30 AM – 7:30 PM (longer during earnings seasons)",
      coreActivities: [
        "Spreading financial statements from quarterly 10-Q and 10-K filings into model sheets",
        "Conducting discounted cash flow (DCF) and trading comparable valuations",
        "Writing crisp 2-page investment committee memorandums",
        "Tracking industry trends, commodity price movements, and competitive benchmarking",
      ],
      realWorkExamples: [
        "Modeling the financial impact of a 15% raw material inflation scenario on a retail consumer brand",
        "Preparing an EBITDA bridge chart to explain quarterly margin variations to leadership",
      ],
    },
    skillsRequired: [
      { skillId: "accounting-fundamentals", importance: "essential", minimumLevel: 2 },
      { skillId: "financial-modeling", importance: "essential", minimumLevel: 2 },
      { skillId: "quantitative-fluency", importance: "essential", minimumLevel: 2 },
      { skillId: "written-communication", importance: "advantageous", minimumLevel: 2 },
      { skillId: "critical-reasoning", importance: "essential", minimumLevel: 2 },
    ],
    entryPathways: [
      {
        pathTitle: "Corporate Finance & FP&A Track",
        description: "Join corporate finance teams analyzing department budgets, variance analysis, and operational forecasting.",
        timelineMonths: "3–6 months",
        firstProject: "Create a 3-statement dynamic model with scenario toggles for an exchange-listed consumer goods company.",
      },
      {
        pathTitle: "Equity Research & Valuation Track",
        description: "Focus on sector coverage, writing thesis-driven notes, and building comparative multiple tables.",
        timelineMonths: "5–8 months",
        firstProject: "Publish an independent initiated coverage memo on an Indian mid-cap infrastructure company.",
      },
    ],
    tradeoffsAndRealities: {
      positives: [
        "High intellectual rigor and deep understanding of how real businesses create or destroy economic value",
        "Strong quantitative foundation applicable across startups, private capital, and corporate strategy",
      ],
      challenges: [
        "High attention to detail required; a single broken cell formula can propagate errors across a whole deck",
        "Demanding hours during quarterly reporting cycles and transaction deadlines",
      ],
      commonMisconceptions: [
        "Misconception: Financial analysis is purely complex math. Reality: It is mostly accounting logic, clear business assumptions, and disciplined spreadsheet modeling.",
      ],
    },
    verifiedSources: [
      {
        title: "CFA Institute Global Body of Investment Knowledge",
        retrievedYear: 2024,
        notes: "Outlines financial statement analysis, corporate finance, and equity valuation competencies.",
      },
    ],
  },
  {
    id: "career-3",
    slug: "full-stack-systems-engineer",
    title: "Full-Stack Web & Systems Engineer",
    discipline: "engineering",
    tagline: "Architect and build reliable digital services from database schemas to interactive client interfaces.",
    summary: "Full-stack engineers turn product requirements into robust, scalable software. They model database relationships, write performant API endpoints, and craft responsive, accessible user interfaces with clean state management.",
    workStyle: ["practical_hands_on", "analytical", "collaborative"],
    beginnerAccessibility: "high",
    dayInTheLife: {
      typicalHours: "9:30 AM – 6:30 PM",
      coreActivities: [
        "Designing database migrations and relational query logic",
        "Writing TypeScript endpoints with validated input schemas and unit tests",
        "Building responsive UI components matching design tokens",
        "Reviewing peer pull requests and debugging staging environment regressions",
      ],
      realWorkExamples: [
        "Refactoring an unindexed database query to bring p95 API response times from 1,200ms down to 45ms",
        "Implementing an optimistic UI update with offline retry capability for a field-worker data entry app",
      ],
    },
    skillsRequired: [
      { skillId: "web-development", importance: "essential", minimumLevel: 2 },
      { skillId: "sql-relational", importance: "essential", minimumLevel: 2 },
      { skillId: "git-collaboration", importance: "essential", minimumLevel: 2 },
      { skillId: "critical-reasoning", importance: "advantageous", minimumLevel: 2 },
      { skillId: "python-core", importance: "advantageous", minimumLevel: 1 },
    ],
    entryPathways: [
      {
        pathTitle: "Production-Grade Full-Stack Project Track",
        description: "Move beyond tutorial clones. Build a complete vertical slice application with real authentication, database migrations, error boundaries, and automated tests.",
        timelineMonths: "4–6 months",
        firstProject: "Deploy an end-to-end task and inventory management platform with PostgreSQL and Next.js.",
      },
      {
        pathTitle: "Open Source Contributor Track",
        description: "Identify real issues in active developer tools or component libraries and submit clean, well-tested pull requests.",
        timelineMonths: "3–6 months",
        firstProject: "Contribute documentation fixes and accessibility test cases to popular UI libraries.",
      },
    ],
    tradeoffsAndRealities: {
      positives: [
        "Empowerment to bring any digital idea to life autonomously",
        "Extensive remote opportunities and objective proof-of-work hiring culture",
      ],
      challenges: [
        "Rapidly evolving framework ecosystems and continuous learning requirement",
        "Debugging obscure asynchronous edge cases and cross-browser quirks",
      ],
      commonMisconceptions: [
        "Misconception: You must memorize complex competitive programming algorithms to build great web software.",
        "Misconception: Modern full-stack engineering is just copying and pasting AI snippets without understanding fundamentals.",
      ],
    },
    verifiedSources: [
      {
        title: "Stack Overflow Developer Survey & ACM Computing Curricula Guidelines",
        retrievedYear: 2024,
        notes: "Detailed breakdown of web engineering competencies and real-world developer workflows.",
      },
    ],
  },
  {
    id: "career-4",
    slug: "public-policy-analyst",
    title: "Public Policy & Governance Analyst",
    discipline: "law_public_service",
    tagline: "Evaluate societal challenges, analyze legal frameworks, and design evidence-backed public programs.",
    summary: "Public policy analysts research societal issues, dissect proposed regulations, consult diverse civic stakeholders, and craft actionable policy briefs that help government bodies, think tanks, and NGOs govern effectively.",
    workStyle: ["analytical", "strategic", "collaborative"],
    beginnerAccessibility: "medium",
    dayInTheLife: {
      typicalHours: "9:00 AM – 6:00 PM",
      coreActivities: [
        "Reading statutory legislation, judicial precedents, and parliamentary debate records",
        "Extracting empirical trends from government census and economic survey datasets",
        "Conducting structured stakeholder consultation roundtables with affected communities",
        "Drafting clear policy memos with cost-benefit and unintended consequence analyses",
      ],
      realWorkExamples: [
        "Drafting an evidence-based recommendation brief on improving rural electric vehicle charging incentives",
        "Synthesizing public feedback submissions on draft personal data protection rules",
      ],
    },
    skillsRequired: [
      { skillId: "policy-analysis", importance: "essential", minimumLevel: 2 },
      { skillId: "written-communication", importance: "essential", minimumLevel: 3 },
      { skillId: "critical-reasoning", importance: "essential", minimumLevel: 2 },
      { skillId: "quantitative-fluency", importance: "advantageous", minimumLevel: 2 },
      { skillId: "investigative-research", importance: "advantageous", minimumLevel: 2 },
    ],
    entryPathways: [
      {
        pathTitle: "Think Tank & Policy Fellowship Route",
        description: "Publish analytical policy briefs on current public consultative papers released by ministries or think tanks.",
        timelineMonths: "4–8 months",
        firstProject: "Author a 1,500-word policy commentary on an active municipal urban mobility master plan.",
      },
      {
        pathTitle: "Legislative Research Assistant Route",
        description: "Support elected representatives or advocacy coalitions with rapid legislative briefs and question-hour research.",
        timelineMonths: "3–6 months",
        firstProject: "Prepare an annotated clause-by-clause comparative analysis of two state renewable energy bills.",
      },
    ],
    tradeoffsAndRealities: {
      positives: [
        "Meaningful work addressing systemic public challenges affecting millions of citizens",
        "Deep exposure to legislative systems, administrative bureaucracy, and civic governance",
      ],
      challenges: [
        "Policy implementation timelines are often lengthy and subject to political cycles",
        "Balancing evidence-based recommendations against real-world political constraints",
      ],
      commonMisconceptions: [
        "Misconception: You must have a law degree to work in public policy. Economics, sociology, and engineering backgrounds are equally valuable.",
      ],
    },
    verifiedSources: [
      {
        title: "National Institute of Public Finance and Policy / PRS Legislative Research Guidelines",
        retrievedYear: 2024,
        notes: "Outlines legislative analysis frameworks and public policy competencies in India.",
      },
    ],
  },
  {
    id: "career-5",
    slug: "environmental-data-researcher",
    title: "Environmental Data & Climate Researcher",
    discipline: "science_research",
    tagline: "Analyze geospatial data, climate models, and biodiversity metrics to protect ecosystems.",
    summary: "Environmental data researchers combine statistical analysis, geospatial information systems (GIS), and domain science to track deforestation, water table depletion, carbon emissions, and climate risks.",
    workStyle: ["analytical", "independent", "practical_hands_on"],
    beginnerAccessibility: "medium",
    dayInTheLife: {
      typicalHours: "9:00 AM – 5:30 PM",
      coreActivities: [
        "Processing satellite multispectral imagery and remote sensing geospatial files",
        "Writing Python scripts to clean meteorological sensor readings and air quality data",
        "Calibrating hydrological or carbon-sequestration predictive models",
        "Drafting peer-reviewable research reports and open data visual summaries",
      ],
      realWorkExamples: [
        "Mapping urban heat island effects across a metropolitan city using thermal satellite imagery and ground sensors",
        "Analyzing a decade of groundwater monitoring well telemetry to identify vulnerable agricultural aquifers",
      ],
    },
    skillsRequired: [
      { skillId: "python-core", importance: "essential", minimumLevel: 2 },
      { skillId: "quantitative-fluency", importance: "essential", minimumLevel: 2 },
      { skillId: "critical-reasoning", importance: "essential", minimumLevel: 2 },
      { skillId: "data-visualization", importance: "essential", minimumLevel: 2 },
      { skillId: "written-communication", importance: "advantageous", minimumLevel: 2 },
    ],
    entryPathways: [
      {
        pathTitle: "Open Geospatial Research Route",
        description: "Utilize public satellite data (Copernicus / USGS / ISRO) to build reproducible environmental risk notebooks.",
        timelineMonths: "4–6 months",
        firstProject: "Build an open-source satellite NDVI vegetation index tracker for your native state or district.",
      },
    ],
    tradeoffsAndRealities: {
      positives: [
        "Directly purposeful mission working on global climate and conservation challenges",
        "Opportunity to work at the intersection of natural sciences, remote sensing, and computing",
      ],
      challenges: [
        "Dealing with noisy, missing, or irregular field sensor data",
        "Navigating grant cycles and research funding dependencies",
      ],
      commonMisconceptions: [
        "Misconception: Environmental work is strictly outdoors field sampling. Modern conservation relies heavily on computational modeling and geospatial analysis.",
      ],
    },
    verifiedSources: [
      {
        title: "United Nations Environment Programme (UNEP) Science Division Guidance",
        retrievedYear: 2024,
        notes: "Details environmental data standards and climate risk analytics frameworks.",
      },
    ],
  },
  {
    id: "career-6",
    slug: "clinical-research-coordinator",
    title: "Clinical Research Coordinator",
    discipline: "healthcare",
    tagline: "Guide life-saving clinical trials with ethical rigor, patient care, and regulatory precision.",
    summary: "Clinical Research Coordinators manage the day-to-day operations of medical clinical trials. They recruit and monitor participant consent, uphold Good Clinical Practice (GCP) standards, maintain trial logs, and safeguard patient safety.",
    workStyle: ["practical_hands_on", "collaborative", "analytical"],
    beginnerAccessibility: "medium",
    dayInTheLife: {
      typicalHours: "8:30 AM – 5:00 PM (hospital / clinic based)",
      coreActivities: [
        "Administering informed consent documentation with prospective trial participants",
        "Coordinating patient biological sample collections with pathology laboratories",
        "Recording patient vitals, adverse event notes, and medication tracking into Electronic Data Capture (EDC) systems",
        "Preparing documentation for institutional ethics committee (IEC) routine audits",
      ],
      realWorkExamples: [
        "Auditing 50 participant case report forms to verify zero protocol deviations before a Phase III trial interim review",
        "Creating a patient-friendly illustrated pamphlet explaining a new oncology clinical trial's visit schedule",
      ],
    },
    skillsRequired: [
      { skillId: "clinical-methodology", importance: "essential", minimumLevel: 2 },
      { skillId: "critical-reasoning", importance: "essential", minimumLevel: 2 },
      { skillId: "written-communication", importance: "essential", minimumLevel: 2 },
      { skillId: "quantitative-fluency", importance: "advantageous", minimumLevel: 1 },
    ],
    entryPathways: [
      {
        pathTitle: "GCP Certification & Academic Hospital Track",
        description: "Obtain Good Clinical Practice certification and intern in hospital-based clinical trial units.",
        timelineMonths: "3–6 months",
        firstProject: "Create a mock Institutional Ethics Committee submission dossier for a non-invasive diagnostic trial.",
      },
    ],
    tradeoffsAndRealities: {
      positives: [
        "Directly advancing medical breakthroughs and treatments that save lives",
        "High demand across pharmaceutical firms, biotech contract research organizations (CROs), and tertiary hospital networks",
      ],
      challenges: [
        "Zero-tolerance for documentation oversights due to strict regulatory audits",
        "Emotional sensitivity required when working with vulnerable patients with serious medical conditions",
      ],
      commonMisconceptions: [
        "Misconception: You need an MBBS doctor degree to coordinate clinical trials. Degrees in Pharmacy, Biotechnology, Life Sciences, and Nursing are widely accepted.",
      ],
    },
    verifiedSources: [
      {
        title: "Central Drugs Standard Control Organisation (CDSCO) / Indian GCP Guidelines",
        retrievedYear: 2024,
        notes: "Regulatory requirements for clinical trial conduct and coordinator qualifications in India.",
      },
    ],
  },
  {
    id: "career-7",
    slug: "investigative-tech-journalist",
    title: "Science & Technology Journalist",
    discipline: "media_communication",
    tagline: "Uncover truths, demystify complex breakthroughs, and hold technology accountable to the public.",
    summary: "Science and tech journalists investigate the societal implications of emerging technologies, verify technical claims, interview researchers and impacted citizens, and produce compelling, deeply reported stories.",
    workStyle: ["creative", "independent", "analytical"],
    beginnerAccessibility: "high",
    dayInTheLife: {
      typicalHours: "9:00 AM – 6:30 PM (deadline-driven)",
      coreActivities: [
        "Reading newly published pre-prints and regulatory filings for investigative leads",
        "Conducting interviews with researchers, whistleblowers, and consumer advocates",
        "Fact-checking technical claims and testing product claims hands-on",
        "Writing narrative investigative features and publishing explainers",
      ],
      realWorkExamples: [
        "Investigating dark patterns in predatory student loan apps that harvested mobile contacts illegally",
        "Writing an accessible, rigorous 2,000-word explainer detailing how mRNA vaccines stimulate cellular immunity",
      ],
    },
    skillsRequired: [
      { skillId: "written-communication", importance: "essential", minimumLevel: 3 },
      { skillId: "investigative-research", importance: "essential", minimumLevel: 2 },
      { skillId: "critical-reasoning", importance: "essential", minimumLevel: 3 },
      { skillId: "data-visualization", importance: "advantageous", minimumLevel: 1 },
    ],
    entryPathways: [
      {
        pathTitle: "Independent Reporting & Bylines Route",
        description: "Pitch and publish reported pieces in university magazines, independent digital outlets, or Substack.",
        timelineMonths: "3–5 months",
        firstProject: "Report an in-depth feature examining how algorithmic grading affected student admissions in your region.",
      },
    ],
    tradeoffsAndRealities: {
      positives: [
        "Freedom to satisfy intellectual curiosity and inform public discourse",
        "Holding influential institutions and technology companies accountable",
      ],
      challenges: [
        "Tight editorial deadlines and competitive freelance pitching cycles",
        "Navigating aggressive PR spin and legal threats when publishing sensitive investigations",
      ],
      commonMisconceptions: [
        "Misconception: Journalism is just opinion blogging. Credible journalism requires multiple sourced interviews, documented paper trails, and rigorous fact-checking.",
      ],
    },
    verifiedSources: [
      {
        title: "Society of Professional Journalists Code of Ethics & Global Investigative Journalism Network",
        retrievedYear: 2024,
        notes: "Standards of verification, attribution, and ethical newsgathering.",
      },
    ],
  },
];
