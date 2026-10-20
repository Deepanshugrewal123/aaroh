import { ProjectBrief } from "./types";

export const PROJECT_BRIEFS: ProjectBrief[] = [
  {
    id: "proj-1",
    slug: "accessible-patient-portal",
    title: "WCAG-Compliant Clinic Appointment & Check-In Portal",
    careerSlug: "product-ux-designer",
    discipline: "arts_design",
    difficulty: "beginner",
    estimatedEffortHours: 14,
    problemStatement:
      "Elderly patients with mild visual and motor impairments struggle to navigate crowded hospital appointment interfaces. Design and prototype an accessible appointment booking and check-in flow meeting WCAG 2.1 AA standards.",
    targetUsers:
      "Patients aged 60+ and clinic triage staff navigating stressful clinical visits.",
    scopeAndFeatures: [
      "High-contrast color palette with min 4.5:1 text contrast and 3:1 graphical object contrast",
      "Large touch targets (min 48x48 CSS pixels) with clear visible focus rings",
      "Accessible step-by-step progress indicator with linear single-column layout",
      "Screen-reader-friendly validation micro-copy and audible tone feedback cues",
    ],
    requiredSkills: ["visual-hierarchy", "ui-prototyping", "ux-research"],
    deliverables: [
      {
        id: "p1-deliv-1",
        label: "WCAG 2.1 AA heuristic evaluation worksheet highlighting 5 critical barriers",
        isRequired: true,
      },
      {
        id: "p1-deliv-2",
        label: "Primary user persona summary with motor and visual accessibility constraints",
        isRequired: true,
      },
      {
        id: "p1-deliv-3",
        label: "Low-fidelity single-column linear wireframe with visible keyboard focus rings",
        isRequired: true,
      },
      {
        id: "p1-deliv-4",
        label: "Clickable Figma/Penpot high-fidelity interactive prototype meeting 4.5:1 text contrast",
        isRequired: true,
      },
      {
        id: "p1-deliv-5",
        label: "Usability walkthrough notes from at least 2 simulated sessions and design trade-off reflection",
        isRequired: true,
      },
    ],
    rubricCriteria: [
      {
        id: "p1-crit-1",
        title: "Visual Hierarchy & Accessible Contrast",
        description: "Adherence to WCAG 2.1 AA contrast thresholds, legible typography scaling, and single-column clarity.",
        weight: 35,
        associatedSkillId: "visual-hierarchy",
        passingThreshold: 75,
      },
      {
        id: "p1-crit-2",
        title: "Interactive UI Prototyping & Focus States",
        description: "Interactive fidelity in Figma/Penpot, explicit tab focus states, and seamless error recovery flows.",
        weight: 35,
        associatedSkillId: "ui-prototyping",
        passingThreshold: 75,
      },
      {
        id: "p1-crit-3",
        title: "User Research & Heuristic Grounding",
        description: "Persona depth, synthesis of cognitive/motor barriers, and evidence-backed user journey design.",
        weight: 30,
        associatedSkillId: "ux-research",
        passingThreshold: 70,
      },
    ],
    milestones: [
      {
        title: "Heuristic Audit & User Persona",
        deliverables: [
          "Heuristic evaluation worksheet highlighting 5 critical accessibility issues",
          "1 primary persona summary with accessibility constraints",
        ],
        criteria: "Evidence of direct reference to WCAG 2.1 AA guidelines.",
      },
      {
        title: "Low-Fidelity Wireframes & User Journey",
        deliverables: [
          "Single-column linear wireframe for Mobile & Tablet",
          "Error recovery screen designs",
        ],
        criteria: "Zero multi-column clutter; explicit focus states on all form controls.",
      },
      {
        title: "High-Fidelity Interactive Prototype & Usability Test",
        deliverables: [
          "Figma or Penpot interactive prototype with clickable check-in path",
          "Usability test notes from at least 2 simulated user sessions",
        ],
        criteria: "All typography readable at 100% and 200% zoom without horizontal scrolling.",
      },
    ],
    testingChecklist: [
      "Passed automated contrast checking tools (e.g. Stark or WebAIM contrast checker)",
      "Tested keyboard navigation using only Tab, Shift+Tab, and Enter/Space keys",
      "Tested screen-reader announcement order on form inputs and error messages",
    ],
    readmeTemplateOutline: [
      "Project Overview & The Accessibility Problem",
      "User Research Insights & Design Decisions",
      "WCAG 2.1 AA Compliance Matrix",
      "Interactive Prototype Link & Walkthrough GIF",
      "Personal Reflection on Design Trade-offs",
    ],
    deploymentAndDemoChecklist: [
      "Published Figma Community file or Penpot open prototype link",
      "Video walkthrough (under 3 minutes) demonstrating keyboard navigation",
      "Documented rationale explaining why decorative elements were eliminated",
    ],
  },
  {
    id: "proj-2",
    slug: "dcf-financial-model-fmcg",
    title: "Dynamic DCF & Sensitivity Valuation Model for FMCG",
    careerSlug: "financial-analyst",
    discipline: "commerce_business",
    difficulty: "intermediate",
    estimatedEffortHours: 18,
    problemStatement:
      "Raw material inflation and changing consumer discretionary spending have created uncertainty in retail consumer goods earnings. Build an integrated 3-statement financial forecast and Discounted Cash Flow (DCF) model with dynamic scenario toggles for an exchange-listed consumer goods company.",
    targetUsers:
      "Investment committees, equity research analysts, and corporate treasury teams.",
    scopeAndFeatures: [
      "Historical financial statement analysis across 3 past fiscal years",
      "5-year integrated forecast linking Revenue, Income Statement, Balance Sheet, and Cash Flow",
      "WACC (Weighted Average Cost of Capital) calculation with verifiable Capital Asset Pricing Model (CAPM) inputs",
      "Sensitivity matrix analyzing Enterprise Value across varying Terminal Growth Rates (1.5% - 3.5%) and WACCs (8% - 12%)",
    ],
    requiredSkills: ["accounting-fundamentals", "financial-modeling", "quantitative-fluency"],
    deliverables: [
      {
        id: "p2-deliv-1",
        label: "Standardized 3-year historical financial statement spread (IS, BS, CFS)",
        isRequired: true,
      },
      {
        id: "p2-deliv-2",
        label: "5-year dynamic forecast schedule linking revenue drivers, DSO/DIO working capital, and CapEx",
        isRequired: true,
      },
      {
        id: "p2-deliv-3",
        label: "Verifiable CAPM/WACC cost-of-capital calculation schedule with disclosed risk-free rate",
        isRequired: true,
      },
      {
        id: "p2-deliv-4",
        label: "Two-variable sensitivity data table (Terminal Growth Rate vs WACC) with automated delta calculation",
        isRequired: true,
      },
      {
        id: "p2-deliv-5",
        label: "Executive investment memorandum detailing valuation assumptions, margin of safety, and risks",
        isRequired: true,
      },
    ],
    rubricCriteria: [
      {
        id: "p2-crit-1",
        title: "Dynamic 3-Statement Modeling & Forecasting",
        description: "Zero hardcoded arithmetic; dynamically balanced balance sheet; transparent revenue driver buildup.",
        weight: 35,
        associatedSkillId: "financial-modeling",
        passingThreshold: 75,
      },
      {
        id: "p2-crit-2",
        title: "Accounting Integrity & Statement Reconciliation",
        description: "Correct cash flow reconciliation; proper working capital changes; adherence to corporate reporting standards.",
        weight: 35,
        associatedSkillId: "accounting-fundamentals",
        passingThreshold: 75,
      },
      {
        id: "p2-crit-3",
        title: "Sensitivity Valuation & Quantitative Analysis",
        description: "Robust data tables, defensible CAPM assumptions, and rigorous scenario stress-testing.",
        weight: 30,
        associatedSkillId: "quantitative-fluency",
        passingThreshold: 70,
      },
    ],
    milestones: [
      {
        title: "Data Spreading & Historical Ratios",
        deliverables: [
          "Clean standardized financial spread sheet",
          "Key ratio calculation: Gross margin, EBITDA margin, Working Capital cycle, ROIC",
        ],
        criteria: "Formulas dynamically linked; zero hardcoded arithmetic calculations in total rows.",
      },
      {
        title: "Forecast & Working Capital Logic",
        deliverables: [
          "Revenue driver build-up (volume x pricing)",
          "Working capital schedule: DSO, DIO, DPO logic",
        ],
        criteria: "Balance Sheet balances automatically across all forecast years without plug formulas.",
      },
      {
        title: "DCF Valuation & Sensitivity Tables",
        deliverables: [
          "Free Cash Flow to Firm (FCFF) calculations",
          "Two-variable Data Table for WACC vs Perpetual Growth Rate",
          "2-page Executive Investment Memo",
        ],
        criteria: "Transparent formula documentation and documented scenario assumptions (Bull, Base, Bear).",
      },
    ],
    suggestedDatasetsOrAPIs: [
      {
        name: "NSE India / BSE Financial Filings",
        url: "https://www.bseindia.com",
        note: "Free public access to audited annual 10-K / annual reports",
      },
      {
        name: "Reserve Bank of India 10-Year G-Sec Yields",
        url: "https://www.rbi.org.in",
        note: "Benchmark risk-free rate data for WACC",
      },
    ],
    testingChecklist: [
      "Audited for circular calculation loops and broken cell references (#REF!, #DIV/0!)",
      "Verified balance sheet identity (Assets = Liabilities + Equity) across all scenarios",
      "Checked that sensitivity tables respond immediately when switching between Base, Bull, and Bear inputs",
    ],
    readmeTemplateOutline: [
      "Company Profile & Industry Background",
      "Key Operating Assumptions (Pricing, Volume, Cost Drivers)",
      "Valuation Methodology & WACC Derivation",
      "Sensitivity Analysis & Margin of Safety Findings",
      "Investment Recommendation Summary",
    ],
    deploymentAndDemoChecklist: [
      "Google Sheets view-only link or public Excel workbook download",
      "2-page PDF Executive Investment Memorandum",
      "Explicit disclosure of assumptions and limitations",
    ],
  },
  {
    id: "proj-3",
    slug: "vertical-slice-inventory-system",
    title: "Production-Grade Inventory & Task Management System",
    careerSlug: "full-stack-systems-engineer",
    discipline: "engineering",
    difficulty: "intermediate",
    estimatedEffortHours: 20,
    problemStatement:
      "Many student developers build simple tutorials that break when dealing with concurrent requests, relational foreign keys, or database transaction rollbacks. Architect and build an inventory management application with relational schema migrations, input validation, and automated API integration tests.",
    targetUsers:
      "Campus laboratory administrators, workshop technicians, and equipment borrowing managers.",
    scopeAndFeatures: [
      "Normalized relational schema (Users, Items, Categories, BorrowRequests, AuditLogs)",
      "Server-side schema validation using Zod on all API endpoints",
      "Optimistic UI updates with graceful offline error handling",
      "Atomic database transaction preventing double-booking of equipment",
      "Automated test suite verifying API happy and failure paths",
    ],
    requiredSkills: ["web-development", "sql-relational", "git-collaboration"],
    deliverables: [
      {
        id: "p3-deliv-1",
        label: "Normalized relational database schema with foreign keys, indexes, and migrations",
        isRequired: true,
      },
      {
        id: "p3-deliv-2",
        label: "Server-side input validation and error handling schemas (Zod/TypeScript)",
        isRequired: true,
      },
      {
        id: "p3-deliv-3",
        label: "Database transaction logic guaranteeing atomic inventory reservations without race conditions",
        isRequired: true,
      },
      {
        id: "p3-deliv-4",
        label: "Responsive UI with structured empty, loading, and error states",
        isRequired: true,
      },
      {
        id: "p3-deliv-5",
        label: "Automated API integration test suite covering happy and failure paths (e.g. Vitest/Jest)",
        isRequired: true,
      },
    ],
    rubricCriteria: [
      {
        id: "p3-crit-1",
        title: "Full-Stack Application Architecture & Validation",
        description: "Rigorous server-side validation; clean separation of concerns; responsive UI with comprehensive loading/empty/error states.",
        weight: 35,
        associatedSkillId: "web-development",
        passingThreshold: 75,
      },
      {
        id: "p3-crit-2",
        title: "Relational Data Modeling & Atomic Transactions",
        description: "Normalized 3NF schema, indexes on foreign keys, and atomic isolation preventing concurrency anomalies.",
        weight: 35,
        associatedSkillId: "sql-relational",
        passingThreshold: 75,
      },
      {
        id: "p3-crit-3",
        title: "Git Commit Hygiene & Repository Documentation",
        description: "Atomic commit history; comprehensive README with setup instructions, ER diagram, and testing reports.",
        weight: 30,
        associatedSkillId: "git-collaboration",
        passingThreshold: 70,
      },
    ],
    milestones: [
      {
        title: "Relational Schema & Migrations",
        deliverables: [
          "Prisma schema with indexes, foreign key constraints, and onDelete cascades",
          "Initial migration script",
        ],
        criteria: "Properly indexed query paths for search and status filters.",
      },
      {
        title: "Validated API Endpoints & Transaction Logic",
        deliverables: [
          "REST/Server Actions with Zod schemas",
          "Database transaction handling concurrent checkout attempts",
        ],
        criteria: "100% of invalid payloads rejected with HTTP 400 and structured error json.",
      },
      {
        title: "Accessible Frontend & Automated Integration Tests",
        deliverables: [
          "Responsive UI built with reusable components",
          "Automated Vitest/Playwright test suite passing",
        ],
        criteria: "Zero console warnings; clear loading, empty, and error state coverage.",
      },
    ],
    testingChecklist: [
      "Ran automated test suite with edge cases (empty strings, negative inventory counts, unauthorized tokens)",
      "Simulated concurrent loan requests to verify zero negative stock anomalies",
      "Checked mobile responsiveness and accessibility keyboard tab order",
    ],
    readmeTemplateOutline: [
      "Architecture Overview & Tech Stack Choices",
      "Relational Entity Relationship Diagram",
      "Local Setup & Migration Instructions",
      "API Contracts & Error Format Documentation",
      "Automated Testing Approach & Verified Test Results",
    ],
    deploymentAndDemoChecklist: [
      "Public GitHub repository with meaningful atomic commit history",
      "Live deployment URL (Vercel / Railway / Render) with live SQLite/Postgres persistence",
      "Documentation explaining how concurrency race conditions are mitigated",
    ],
  },
  {
    id: "proj-4",
    slug: "urban-mobility-policy-brief",
    title: "Tier-2 City Urban Electric Mobility Policy Whitepaper",
    careerSlug: "public-policy-analyst",
    discipline: "law_public_service",
    difficulty: "beginner",
    estimatedEffortHours: 12,
    problemStatement:
      "Tier-2 Indian cities face rapid vehicle growth, causing localized air quality deterioration while lacking the massive fiscal budgets of metropolitan capitals. Research and author a 2,500-word evidence-backed policy brief proposing a blended-finance electric feeder bus scheme for a designated tier-2 city.",
    targetUsers:
      "City municipal corporations, state transport departments, and urban planning think tanks.",
    scopeAndFeatures: [
      "Assessment of current urban air quality indices and diesel transit emissions",
      "Stakeholder mapping: Municipal corporation, private operators, daily commuters, and discoms",
      "Blended financing model comparing direct capital subsidies vs viability gap funding (VGF)",
      "Clause-by-clause regulatory implementation blueprint",
    ],
    requiredSkills: ["policy-analysis", "written-communication", "critical-reasoning"],
    deliverables: [
      {
        id: "p4-deliv-1",
        label: "Empirical baseline analysis of vehicular fleet age and air quality telemetry in target city",
        isRequired: true,
      },
      {
        id: "p4-deliv-2",
        label: "Stakeholder consultation matrix evaluating municipal, operator, and commuter trade-offs",
        isRequired: true,
      },
      {
        id: "p4-deliv-3",
        label: "Blended financing model comparing direct capital subsidies against viability gap funding (VGF)",
        isRequired: true,
      },
      {
        id: "p4-deliv-4",
        label: "2,500-word structured executive policy brief with actionable legislative recommendations",
        isRequired: true,
      },
      {
        id: "p4-deliv-5",
        label: "1-page executive summary infographic summarizing the implementation roadmap and risks",
        isRequired: true,
      },
    ],
    rubricCriteria: [
      {
        id: "p4-crit-1",
        title: "Statutory Policy Analysis & Regulatory Design",
        description: "Sound jurisdictional grounding, municipal governance alignment, and clause-by-clause implementation feasibility.",
        weight: 35,
        associatedSkillId: "policy-analysis",
        passingThreshold: 75,
      },
      {
        id: "p4-crit-2",
        title: "Structured Written Communication & Executive Synthesis",
        description: "Clear readability, persuasive synthesis of complex fiscal models, and unambiguous executive summaries.",
        weight: 35,
        associatedSkillId: "written-communication",
        passingThreshold: 75,
      },
      {
        id: "p4-crit-3",
        title: "Critical Evaluation of Trade-offs & Unintended Consequences",
        description: "Anticipating fiscal strain, operator pushback, grid charging constraints, and low-income fare equity.",
        weight: 30,
        associatedSkillId: "critical-reasoning",
        passingThreshold: 70,
      },
    ],
    milestones: [
      {
        title: "Empirical Context & Problem Definition",
        deliverables: [
          "Statistical summary of vehicular fleet age and air quality telemetry in target city",
          "Literature review of 3 comparable international cases",
        ],
        criteria: "Every statistical claim attributed to official government or peer-reviewed datasets.",
      },
      {
        title: "Stakeholder Consultation & Trade-off Analysis",
        deliverables: [
          "Matrix of stakeholder interests, friction points, and incentives",
          "Cost-benefit comparison of 3 policy alternatives",
        ],
        criteria: "Unintended consequences explicitly analyzed (e.g. fare increases, electricity grid load).",
      },
      {
        title: "Drafting the Executive Policy Brief",
        deliverables: [
          "2,500-word structured policy brief with executive summary",
          "1-page Infographic summary of the proposed financing mechanism",
        ],
        criteria: "Clear language, structured headings, and actionable legislative recommendations.",
      },
    ],
    suggestedDatasetsOrAPIs: [
      {
        name: "Central Pollution Control Board (CPCB) Telemetry",
        url: "https://cpcb.nic.in",
        note: "Continuous Ambient Air Quality Monitoring System data",
      },
      {
        name: "Ministry of Road Transport and Highways (MoRTH) Reports",
        url: "https://morth.nic.in",
        note: "Vehicle registration and public transit fleet statistics",
      },
    ],
    testingChecklist: [
      "Fact-checked every cited number against original source reports",
      "Reviewed readability score (Flesch-Kincaid) to ensure accessible communication for policymakers",
      "Checked that all legal and administrative terms conform to municipal governance statutes",
    ],
    readmeTemplateOutline: [
      "Executive Summary & Policy Goal",
      "Problem Statement & Diagnostic Data",
      "Stakeholder Impact Analysis",
      "The Proposed Policy Framework",
      "Implementation Roadmap & Risk Mitigation",
    ],
    deploymentAndDemoChecklist: [
      "Published PDF policy paper on Zenodo, SSRN, or open portfolio repository",
      "Executive summary slide deck (5 slides)",
      "Transparent disclosure of data sources and methodological limitations",
    ],
  },
  {
    id: "proj-5",
    slug: "air-quality-spatial-analysis",
    title: "Urban Hyperlocal Air Quality & Heat Island Geospatial Analysis",
    careerSlug: "environmental-data-researcher",
    discipline: "science_research",
    difficulty: "intermediate",
    estimatedEffortHours: 16,
    problemStatement:
      "Metropolitan weather stations provide only sparse average measurements, concealing localized air quality and extreme heat pockets in dense informal neighborhoods. Build an automated data ingestion, cleaning, and geospatial analysis pipeline examining urban microclimates.",
    targetUsers:
      "Municipal environmental departments, urban forestry planners, and public health researchers.",
    scopeAndFeatures: [
      "Automated retrieval and validation of ground-level PM2.5 and temperature telemetry",
      "Statistical outlier detection filtering optical sensor fog anomalies from genuine combustion spikes",
      "Inverse Distance Weighting (IDW) interpolation mapping spatial exposure across wards",
      "Interactive map dashboard highlighting tree canopy deficits and vulnerable demographics",
    ],
    requiredSkills: ["data-visualization", "python-core", "quantitative-fluency"],
    deliverables: [
      {
        id: "p5-deliv-1",
        label: "Automated data ingestion and cleaning pipeline for multi-station sensor telemetry (CPCB / OpenAQ)",
        isRequired: true,
      },
      {
        id: "p5-deliv-2",
        label: "Statistical anomaly detection algorithm separating optical sensor fog anomalies from true particulate spikes",
        isRequired: true,
      },
      {
        id: "p5-deliv-3",
        label: "Geospatial heat-map visualization correlating PM2.5 concentrations with canopy cover and population density",
        isRequired: true,
      },
      {
        id: "p5-deliv-4",
        label: "Modular Python codebase with automated data validation tests and reproducible Jupyter notebook",
        isRequired: true,
      },
      {
        id: "p5-deliv-5",
        label: "Scientific methodology summary detailing sensor calibration limits and spatial interpolation uncertainties",
        isRequired: true,
      },
    ],
    rubricCriteria: [
      {
        id: "p5-crit-1",
        title: "Data Visualization & Spatial Storytelling",
        description: "Accurate color scale mapping; accessible legends; intuitive geographic overlays revealing environmental disparities.",
        weight: 35,
        associatedSkillId: "data-visualization",
        passingThreshold: 75,
      },
      {
        id: "p5-crit-2",
        title: "Python Data Processing & Statistical Pipeline",
        description: "Vectorized computations (Pandas/NumPy), modular functions, defensive null handling, and reproducible workflow.",
        weight: 35,
        associatedSkillId: "python-core",
        passingThreshold: 75,
      },
      {
        id: "p5-crit-3",
        title: "Quantitative Interpretation & Anomaly Auditing",
        description: "Sound statistical distributions, transparent treatment of outliers, and honest communication of uncertainty bounds.",
        weight: 30,
        associatedSkillId: "quantitative-fluency",
        passingThreshold: 70,
      },
    ],
    milestones: [
      {
        title: "Telemetry Ingestion & Quality Control",
        deliverables: [
          "Python ingestion script for public sensor APIs",
          "Automated test suite checking missing timestamp gaps",
        ],
        criteria: "Zero unhandled NaN/NULL sensor disconnect crashes.",
      },
      {
        title: "Spatial Modeling & Correlation",
        deliverables: [
          "IDW spatial interpolation across city coordinate bounds",
          "Bivariate correlation between surface temperature and green cover",
        ],
        criteria: "Documented p-values and confidence intervals for all claimed environmental correlations.",
      },
      {
        title: "Interactive Web Map & Synthesis Brief",
        deliverables: [
          "Streamlit or Leaflet/HTML interactive visualization",
          "5-page reproducible technical report",
        ],
        criteria: "Map loads efficiently; documented limitations on sensor density.",
      },
    ],
    suggestedDatasetsOrAPIs: [
      {
        name: "OpenAQ Global Air Quality API",
        url: "https://openaq.org",
        note: "Open-source continuous ambient monitoring API",
      },
      {
        name: "ISRO Bhuvan Indian Geospatial Portal",
        url: "https://bhuvan.nrsc.gov.in",
        note: "Satellite land use and vegetation index datasets",
      },
    ],
    testingChecklist: [
      "Tested script against edge case datasets (missing sensors, power blackout days)",
      "Verified color accessibility (colorblind-safe palettes for choropleth maps)",
      "Checked memory usage during large polygon spatial joins",
    ],
    readmeTemplateOutline: [
      "Research Question & Microclimate Problem",
      "Data Ingestion Architecture & Preprocessing Logic",
      "Spatial Correlation Findings & Anomaly Detection",
      "Interactive Dashboard Link & Deployment",
      "Methodological Limitations & Future Sensor Placement Recommendations",
    ],
    deploymentAndDemoChecklist: [
      "Public GitHub repository with conda/pip environment specification",
      "Interactive hosted demo (Streamlit Community Cloud / HuggingFace Spaces)",
      "Open access data citation block adhering to scientific licensing",
    ],
  },
  {
    id: "proj-6",
    slug: "oncology-trial-audit-protocol",
    title: "Phase II Multi-Site Oncology Protocol Compliance & Adverse Event Audit",
    careerSlug: "clinical-research-coordinator",
    discipline: "healthcare",
    difficulty: "intermediate",
    estimatedEffortHours: 15,
    problemStatement:
      "Multi-center clinical oncology trials often experience high protocol deviations due to complex dose modification schedules and missed lab windows. Author an ICH-GCP compliant protocol compliance and adverse event triage audit system for a decentralized clinical trial.",
    targetUsers:
      "Principal investigators, hospital institutional review boards (IRBs), and clinical trial monitors.",
    scopeAndFeatures: [
      "Protocol deviation triage matrix categorizing minor administrative delays vs major patient safety violations",
      "Expedited 24-hour Serious Adverse Event (SAE) reporting workflow conforming to CDSCO/FDA guidelines",
      "Informed Consent Form (ICF) comprehension audit checklist for non-English and vulnerable patient cohorts",
      "Source Data Verification (SDV) sampling methodology and risk-based site monitoring plan",
    ],
    requiredSkills: ["clinical-methodology", "critical-reasoning", "written-communication"],
    deliverables: [
      {
        id: "p6-deliv-1",
        label: "Standard Operating Procedure (SOP) for protocol deviation triage and patient re-consenting",
        isRequired: true,
      },
      {
        id: "p6-deliv-2",
        label: "Informed Consent Form (ICF) comprehension audit checklist meeting ICH-GCP guidelines",
        isRequired: true,
      },
      {
        id: "p6-deliv-3",
        label: "Serious Adverse Event (SAE) 24-hour expedited reporting workflow and escalation timeline map",
        isRequired: true,
      },
      {
        id: "p6-deliv-4",
        label: "Mock clinical trial monitoring audit findings report for institutional review boards (IRB)",
        isRequired: true,
      },
      {
        id: "p6-deliv-5",
        label: "Patient confidentiality and Source Data Verification (SDV) compliance protocol",
        isRequired: true,
      },
    ],
    rubricCriteria: [
      {
        id: "p6-crit-1",
        title: "ICH-GCP Clinical Protocol & Ethics Adherence",
        description: "Strict conformity with Good Clinical Practice standards, patient rights preservation, and IRB escalation paths.",
        weight: 35,
        associatedSkillId: "clinical-methodology",
        passingThreshold: 75,
      },
      {
        id: "p6-crit-2",
        title: "Critical Audit Reasoning & Risk Assessment",
        description: "Clear prioritization of patient safety over operational expediency; root cause analysis of protocol deviations.",
        weight: 35,
        associatedSkillId: "critical-reasoning",
        passingThreshold: 75,
      },
      {
        id: "p6-crit-3",
        title: "Regulatory Clinical Documentation & Written Communication",
        description: "Unambiguous SOP language, auditable documentation trails, and precise regulatory terminology.",
        weight: 30,
        associatedSkillId: "written-communication",
        passingThreshold: 70,
      },
    ],
    milestones: [
      {
        title: "Regulatory Framework & Protocol Architecture",
        deliverables: [
          "Deviation classification decision tree",
          "ICH-GCP regulatory citation index",
        ],
        criteria: "Clear distinction between safety-critical protocol deviations and administrative variances.",
      },
      {
        title: "Adverse Event Escalation & Verification SOP",
        deliverables: [
          "24-hour SAE notification template with causality assessment guidelines",
          "Investigator site file (ISF) reconciliation checklist",
        ],
        criteria: "Zero ambiguity in emergency unblinding or drug discontinuation protocols.",
      },
      {
        title: "Comprehensive Monitoring Audit Report",
        deliverables: [
          "Simulated 10-patient audit report with identified discrepancies and corrective actions",
          "Ethics committee summary letter",
        ],
        criteria: "Actionable corrective and preventive action (CAPA) plan included.",
      },
    ],
    suggestedDatasetsOrAPIs: [
      {
        name: "Clinical Trials Registry - India (CTRI)",
        url: "https://ctri.nic.in",
        note: "Indian national registry of approved biomedical trials",
      },
      {
        name: "ICH Official Guidelines (E6 R2)",
        url: "https://www.ich.org",
        note: "Good Clinical Practice international ethical and quality standard",
      },
    ],
    testingChecklist: [
      "Cross-checked all reporting timelines against statutory CDSCO New Drugs & Clinical Trials Rules (2019)",
      "Reviewed privacy compliance (removal of all Protected Health Information / HIPAA identifiers)",
      "Validated that consent forms utilize layperson language suitable for grade 8 reading level",
    ],
    readmeTemplateOutline: [
      "Clinical Context & Trial Background",
      "Ethics Framework & GCP Compliance Standards",
      "Protocol Deviation Decision Tree & Escalation",
      "Safety Monitoring & Adverse Event Reporting Blueprint",
      "Source Data Verification Methodology & Limitations",
    ],
    deploymentAndDemoChecklist: [
      "Published PDF protocol portfolio with version control history on Zenodo or GitHub",
      "Process flow diagram illustrating 24-hour expedited event reporting",
      "Declaration of ethical compliance and simulated patient anonymity",
    ],
  },
  {
    id: "proj-7",
    slug: "dark-patterns-investigative-dossier",
    title: "Algorithmic Pricing & Deceptive Subscription UX Investigative Dossier",
    careerSlug: "investigative-tech-journalist",
    discipline: "media_communication",
    difficulty: "intermediate",
    estimatedEffortHours: 14,
    problemStatement:
      "Consumer tech platforms increasingly utilize dynamic surge pricing, hidden drip fees, and deceptive subscription cancellation mazes to suppress user agency. Investigate and document these practices through empirical testing, public complaint tracking, and an evidence-backed investigative report.",
    targetUsers:
      "Consumer advocacy organizations, technology regulatory bodies, and the public.",
    scopeAndFeatures: [
      "Empirical testing apparatus logging price fluctuations across varying operating systems and geolocations",
      "Classification of discovered user traps against the OECD and ASCI Dark Pattern taxonomies",
      "Terms of Service legal analysis exposing hidden automatic renewal and dispute arbitration clauses",
      "Structured right-to-reply questionnaire sent to audited companies following journalistic ethics standards",
    ],
    requiredSkills: ["investigative-research", "written-communication", "critical-reasoning"],
    deliverables: [
      {
        id: "p7-deliv-1",
        label: "Empirical pricing log capturing dynamic checkout fee variations across 100 test runs",
        isRequired: true,
      },
      {
        id: "p7-deliv-2",
        label: "Primary source dossier linking consumer complaints to specific deceptive design taxonomies",
        isRequired: true,
      },
      {
        id: "p7-deliv-3",
        label: "Corporate terms-of-service clause analysis exposing deceptive opt-out friction and arbitration traps",
        isRequired: true,
      },
      {
        id: "p7-deliv-4",
        label: "2,000-word investigative article with corroborating screenshots and legal fact-checking notes",
        isRequired: true,
      },
      {
        id: "p7-deliv-5",
        label: "Right-to-reply memo sent to company representatives with documented response log and corrections policy",
        isRequired: true,
      },
    ],
    rubricCriteria: [
      {
        id: "p7-crit-1",
        title: "Primary Source Verification & Investigative Rigor",
        description: "Empirical data logging, dual-source verification of consumer harms, and meticulous chain of evidence.",
        weight: 35,
        associatedSkillId: "investigative-research",
        passingThreshold: 75,
      },
      {
        id: "p7-crit-2",
        title: "Compelling Editorial Narrative & Fact-Checked Writing",
        description: "Accessible storytelling translating complex dark patterns without hyperbole or unsubstantiated claims.",
        weight: 35,
        associatedSkillId: "written-communication",
        passingThreshold: 75,
      },
      {
        id: "p7-crit-3",
        title: "Critical Analysis of Algorithmic Deception & Harm",
        description: "Dissecting business model incentives, regulatory gaps, and quantifiable financial impact on everyday consumers.",
        weight: 30,
        associatedSkillId: "critical-reasoning",
        passingThreshold: 70,
      },
    ],
    milestones: [
      {
        title: "Empirical Testing & Evidence Gathering",
        deliverables: [
          "Logged spreadsheet of checkout prices across user agents and IPs",
          "Archive of annotated full-page UI flow screenshots",
        ],
        criteria: "Zero unverified anecdotal claims; all pricing discrepancies reproducible.",
      },
      {
        title: "Legal & Regulatory Benchmarking",
        deliverables: [
          "Cross-reference against Consumer Protection Act (2019) and Dark Pattern Guidelines (2023)",
          "Draft right-to-reply letter with specific factual queries",
        ],
        criteria: "Strict adherence to journalistic fairness and fair-dealing principles.",
      },
      {
        title: "Investigative Feature Article & Dossier",
        deliverables: [
          "2,000-word investigative report with embedded exhibits",
          "Public GitHub repository containing cleaned dataset and fact-checking binder",
        ],
        criteria: "Every factual assertion mapped to a verified screenshot, test log, or official filing.",
      },
    ],
    suggestedDatasetsOrAPIs: [
      {
        name: "National Consumer Helpline (NCH) Grievance Portal",
        url: "https://consumerhelpline.gov.in",
        note: "Public consumer grievance trends and advisories",
      },
      {
        name: "Advertising Standards Council of India (ASCI) Guidelines",
        url: "https://ascionline.in",
        note: "Official regulatory guidelines on deceptive patterns in advertising",
      },
    ],
    testingChecklist: [
      "Conducted reverse image search on all marketing exhibits to verify authenticity",
      "Audited claims with a second researcher to ensure reproducibility",
      "Reviewed text with legal counsel guidelines on defamation and public interest reporting",
    ],
    readmeTemplateOutline: [
      "Executive Summary & The Deceptive Pattern Finding",
      "Empirical Methodology & Testing Apparatus",
      "Taxonomy of Identified Dark Patterns with Visual Proof",
      "Corporate Response & Right-to-Reply Analysis",
      "Regulatory Implications & Recommendations for Consumer Protection",
    ],
    deploymentAndDemoChecklist: [
      "Published article on Substack, Medium, or open-source Gitbook dossier",
      "Public GitHub repository containing CSV dataset of all price tests",
      "Public corrections and transparency policy",
    ],
  },
];
