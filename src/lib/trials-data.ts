import { CareerTrial } from "./types";

export const CAREER_TRIALS: CareerTrial[] = [
  {
    id: "trial-ux-design",
    careerSlug: "product-ux-designer",
    title: "Micro-Trial: Hospital Patient Check-In Flow Heuristic Audit",
    discipline: "arts_design",
    estimatedMinutes: 12,
    objective: "Identify usability friction and accessibility blockers in an urgent care clinic check-in kiosk flow.",
    scenario: "Metro Care Clinic deployed a touchscreen check-in kiosk for walk-in patients. However, 42% of elderly patients abandon the kiosk and ask the front desk for help. You have been given the screen flow and user error logs.",
    instructions: [
      "Review the reported patient pain points: Small touch targets (24px buttons), low contrast grey text on white background (#999 on #FFF), and ambiguous error message 'Invalid Token'.",
      "Evaluate which UX intervention will provide the highest usability impact for distressed or elderly patients.",
      "Write your rationale and propose one micro-copy improvement for the error state.",
    ],
    practicalTask: {
      prompt: "Select the most effective UX remediation priority and submit your rationale:",
      type: "choice_and_rationale",
      options: [
        {
          id: "option-a",
          label: "Visual Accessibility & Clear Feedback: Enlarge touch targets to min 48px, increase contrast to WCAG AA (min 4.5:1), and replace 'Invalid Token' with 'We couldn't find your phone number. Please re-enter or ask Maya at the front desk.'",
          explanation: "Strongest choice: Directly solves physical motor constraints, visual clarity, and provides a compassionate, actionable recovery path for anxious patients.",
          score: 95,
        },
        {
          id: "option-b",
          label: "Visual Delight: Add animated 3D illustrations and an AI avatar voice to guide the patient through the kiosk steps.",
          explanation: "Risky: Adds cognitive overload and processing latency for patients in physical discomfort without fixing the fundamental contrast and button target issues.",
          score: 40,
        },
        {
          id: "option-c",
          label: "Form Simplification: Remove the check-in screen completely and force all patients to scan a QR code on their own smartphones.",
          explanation: "Inaccessible: Assumes all patients have charged smartphones, camera literacy, and mobile connectivity, exacerbating exclusion for elderly patients.",
          score: 30,
        },
      ],
      starterContent: "Key UX friction observed: Low visual contrast and non-actionable error copy.\n\nMy proposed remediation rationale:",
    },
    evaluationCriteria: [
      {
        criterion: "User Empathy & Accessibility Standards",
        weight: 40,
        description: "Focus on WCAG touch target sizes, contrast ratios, and stress-tolerant design principles.",
      },
      {
        criterion: "Clarity of Rationale",
        weight: 35,
        description: "Clear explanation connecting the design change to measurable patient outcome.",
      },
      {
        criterion: "Actionable Error Recovery Copy",
        weight: 25,
        description: "Providing a humane, unambiguous fallback instruction for the patient.",
      },
    ],
    reflectionQuestions: [
      "Did you enjoy dissecting how small layout choices directly impact human stress levels?",
      "Did you prefer thinking about visual aesthetics or functional clarity and accessibility?",
    ],
    suggestedNextStep: "If this resonated with you, try exploring Wireframing Foundations and Figma Auto-Layout in your Project Studio.",
  },
  {
    id: "trial-financial-analysis",
    careerSlug: "financial-analyst",
    title: "Micro-Trial: Retail Margin Compression & Pricing Sensitivity",
    discipline: "commerce_business",
    estimatedMinutes: 15,
    objective: "Analyze a sudden gross margin drop for an organic snack brand and recommend a data-backed pricing or cost response.",
    scenario: "GreenBites Ltd reported a drop in Gross Profit Margin from 42% to 33% despite revenue growing 20% year-on-year. Procurement data reveals that raw almond costs rose 35% due to drought, while freight shipping costs rose 15%. Management is debating whether to absorb the costs or raise prices.",
    instructions: [
      "Analyze the numbers: Revenue = $12M (Units: 3M @ $4.00 avg). Cost of Goods Sold (COGS) increased from $2.32/unit to $2.68/unit.",
      "Evaluate the trade-off between a 10% price increase (which risks an estimated 6% volume loss) vs renegotiating packaging packaging materials (saving $0.12/unit).",
      "Select the optimal recommendation and provide your financial breakdown.",
    ],
    practicalTask: {
      prompt: "Choose the soundest business intervention based on unit economics and defend your calculation:",
      type: "choice_and_rationale",
      options: [
        {
          id: "option-a",
          label: "Blended Approach: Implement a measured 6% price adjustment ($4.24/unit) while renegotiating packaging supplier terms ($0.12 savings/unit) to restore gross margins to ~38% without triggering steep customer churn.",
          explanation: "Strongest choice: Balances unit margin recovery while avoiding the demand elasticity cliff of a double-digit price shock.",
          score: 95,
        },
        {
          id: "option-b",
          label: "Full Price Pass-Through: Increase price immediately by 25% to $5.00/unit to expand gross margin beyond 45%.",
          explanation: "High risk: Highly elastic consumer snack category will likely experience substantial volume drop to cheaper substitutes, damaging total dollar gross profit.",
          score: 45,
        },
        {
          id: "option-c",
          label: "Full Cost Absorption: Keep prices static and borrow short-term debt to fund the difference hoping almond prices crash next month.",
          explanation: "Dangerous: Leverages the balance sheet on speculative commodity fluctuations and burns operational cash flow.",
          score: 25,
        },
      ],
      starterContent: "Analysis of Gross Margin Erosion:\nCurrent Gross Profit/unit: $1.32. Prior Gross Profit/unit: $1.68.\n\nMy strategic recommendation and justification:",
    },
    evaluationCriteria: [
      {
        criterion: "Unit Economics Logic",
        weight: 40,
        description: "Understanding of COGS breakdown, margin calculations, and demand elasticity.",
      },
      {
        criterion: "Risk & Trade-off Awareness",
        weight: 35,
        description: "Acknowledging consumer churn risks versus supplier renegotiation timelines.",
      },
      {
        criterion: "Actionable Executive Recommendation",
        weight: 25,
        description: "Concise, defensible memo structure ready for management decision-making.",
      },
    ],
    reflectionQuestions: [
      "Did you find working with margins, unit costs, and trade-offs engaging?",
      "Did you prefer qualitative business strategy or the concrete math of unit economics?",
    ],
    suggestedNextStep: "Try building a 3-Statement Integrated Financial Model in Excel/Google Sheets in the Project Studio.",
  },
  {
    id: "trial-fullstack-debug",
    careerSlug: "full-stack-systems-engineer",
    title: "Micro-Trial: Database Bottleneck & Optimistic UI Debugging",
    discipline: "engineering",
    estimatedMinutes: 15,
    objective: "Diagnose an N+1 query performance bottleneck causing slow dashboard loading in a student portal.",
    scenario: "A college course portal dashboard is timing out during registration week. The server log reveals that when fetching 100 students, the backend executes 1 query for the students, and then executes 100 individual queries in a loop to fetch each student's enrollment status.",
    instructions: [
      "Identify the core architectural defect (N+1 query problem).",
      "Evaluate the optimal database remediation (Eager loading with JOIN or batch query with WHERE IN).",
      "Explain how you would prevent duplicate form submissions if the user taps the 'Enroll' button repeatedly.",
    ],
    practicalTask: {
      prompt: "Select the professional architectural fix for this performance and concurrency issue:",
      type: "choice_and_rationale",
      options: [
        {
          id: "option-a",
          label: "Database JOIN + Frontend Idempotency: Replace the looped queries with a single SQL JOIN (or Prisma include/eager-load), add a compound index on (student_id, course_id), and disable the submit button with an idempotent request key to prevent duplicate enrollments.",
          explanation: "Exemplary solution: Collapses 101 network roundtrips into 1 indexed query, reducing DB latency from 2,100ms to 18ms, while preventing race-condition double-charging.",
          score: 100,
        },
        {
          id: "option-b",
          label: "Hardware Scaling: Upgrade the database server from 2 vCPU to 16 vCPU without modifying the backend query loop.",
          explanation: "Inefficient anti-pattern: Burning infrastructure budget to mask an unscalable algorithm that will fail again at 1,000 students.",
          score: 35,
        },
        {
          id: "option-c",
          label: "Client-side Throttling Only: Add a 5-second setTimeout delay in the browser before sending each student query.",
          explanation: "Counter-productive: Makes the user wait even longer and leaves the database vulnerable to connection pool starvation.",
          score: 20,
        },
      ],
      starterContent: "Root cause diagnosis: N+1 sequential database roundtrips.\n\nProposed solution and schema indexing plan:",
    },
    evaluationCriteria: [
      {
        criterion: "Database Query Optimization",
        weight: 45,
        description: "Understanding network roundtrip overhead and relational JOIN / indexing mechanics.",
      },
      {
        criterion: "Concurrency & Race Condition Handling",
        weight: 35,
        description: "Recognizing double-submission risks and idempotent request handling.",
      },
      {
        criterion: "Engineering Trade-off Judgment",
        weight: 20,
        description: "Fixing root algorithmic cause vs throwing expensive compute at unindexed queries.",
      },
    ],
    reflectionQuestions: [
      "Did you enjoy reasoning about system performance, queries, and concurrency?",
      "Do you feel energized by finding and fixing invisible backend bottlenecks?",
    ],
    suggestedNextStep: "Build your first production-grade CRUD project with Prisma & relational indexing in Project Studio.",
  },
  {
    id: "trial-public-policy",
    careerSlug: "public-policy-analyst",
    title: "Micro-Trial: Electric Bus Subsidy Stakeholder Conflict",
    discipline: "law_public_service",
    estimatedMinutes: 12,
    objective: "Analyze conflicting priorities between municipal transit budgets, clean air goals, and private minibus operators.",
    scenario: "A tier-1 city council is drafting a policy to mandate 100% electric municipal buses by 2028. However, 12,000 private mini-bus operators (who transport 40% of daily commuters) strike, claiming they cannot afford $80,000 EV buses without bankruptcy.",
    instructions: [
      "Review the competing priorities: Public health (diesel emissions cause 30% of particulate pollution), fiscal constraints (city subsidy budget capped at $20M), and informal transport livelihoods.",
      "Formulate an equitable transition framework that protects air quality goals without destroying worker livelihoods.",
    ],
    practicalTask: {
      prompt: "Choose the most balanced, evidence-based policy recommendation:",
      type: "choice_and_rationale",
      options: [
        {
          id: "option-a",
          label: "Phased Low-Interest Financing & Route Franchise Model: Direct $15M of municipal funds into a blended-finance credit guarantee fund offering 3% interest loans for EV minibuses, while integrating private operators into a unified digital ticketing franchise.",
          explanation: "Optimal policy design: Leverages public funds 4x through private bank lending, preserves operator ownership, and standardizes transit quality.",
          score: 95,
        },
        {
          id: "option-b",
          label: "Uncompromising Ban: Impose immediate heavy daily fines on all non-EV commercial vehicles starting next month.",
          explanation: "Policy failure: Likely triggers severe urban gridlock, political backlash, illegal informal operations, and economic paralysis for daily wage commuters.",
          score: 25,
        },
        {
          id: "option-c",
          label: "Full Abandonment: Cancel all EV targets and continue subsidizing diesel fuel for the next 15 years.",
          explanation: "Fails environmental and public health mandates; locks city into high long-term healthcare costs and respiratory illness burdens.",
          score: 20,
        },
      ],
      starterContent: "Stakeholder analysis: Public commuters, private mini-bus owners, municipal budget.\n\nMy policy transition proposal:",
    },
    evaluationCriteria: [
      {
        criterion: "Stakeholder Impact & Equity",
        weight: 40,
        description: "Respecting livelihood realities alongside public interest goals.",
      },
      {
        criterion: "Fiscal Realism & Financing",
        weight: 35,
        description: "Feasible use of government capital through blended guarantees rather than outright handouts.",
      },
      {
        criterion: "Implementation Feasibility",
        weight: 25,
        description: "Realistic transition timeline with measurable milestones.",
      },
    ],
    reflectionQuestions: [
      "Did you enjoy balancing economic constraints, legal mandates, and human outcomes?",
      "Would you like to draft evidence-based policy papers that impact civic life?",
    ],
    suggestedNextStep: "Review the Public Policy Whitepaper task in your Adaptive Roadmap.",
  },
  {
    id: "trial-clinical-coordination",
    careerSlug: "clinical-research-coordinator",
    title: "Micro-Trial: Outpatient Clinic Schedule Disruption & Administrative Triage",
    discipline: "healthcare",
    estimatedMinutes: 12,
    disclaimerNotice: "FICTIONAL SCENARIO NOTICE: All patient profiles, clinic schedules, and staff names are entirely fictional and designed solely for educational exploration of healthcare operations. This trial does NOT teach or evaluate clinical diagnosis, prescribing, or medical triage. Administrative workflow coordination is strictly distinguished from clinical medical licensing.",
    objective: "Manage a multi-patient outpatient clinic schedule crisis following an emergency surgery delay while maintaining patient safety, transport deadlines, and confidentiality.",
    scenario: "At Metro Health Oncology Day Care, Dr. Ananya Rao was called into emergency surgery at 8:45 AM and will be delayed by 2.5 hours. Four patients are scheduled in the 9:00 AM–10:30 AM block: Patient A (72, post-chemo follow-up, arrived via ambulance van with fixed 11:30 AM return pickup); Patient B (44, routine 6-month remission checkup, asymptomatic, flexible laptop worker); Patient C (58, post-op day 4 wound review, reports localized redness and heat around drain site, accompanied by anxious daughter); Patient D (36, new intake consultation with 3 folders of external diagnostic biopsy slides requiring 45 mins intake).",
    instructions: [
      "Assess clinical acuity vs logistics: Immediate safety concerns (Patient C's potential wound complication) must be handed off to on-duty nursing staff before administrative rescheduling.",
      "Accommodate non-negotiable external constraints: Patient A's contracted medical transport departure cannot be missed without stranding an elderly patient.",
      "Preserve privacy and patient dignity: Do not announce clinical conditions, diagnoses, or names over waiting room loudspeakers.",
      "Formulate an orderly triage plan that balances patient well-being, clinic resources, and strict privacy standards.",
    ],
    referenceData: {
      title: "Scheduled Patient Intake Roster (09:00 - 10:30 AM)",
      disclosureNotice: "Fictional administrative intake roster. All patient details are synthetic.",
      headers: ["Patient ID", "Appointment Type", "Clinical/Logistical Notes", "Operating Constraint"],
      rows: [
        ["Pt #101 (Age 72)", "Post-Chemotherapy Labs & Review", "Stable vitals, needs CBC blood draw & medication refill", "Non-emergency ambulance return dispatch at 11:30 AM sharp"],
        ["Pt #102 (Age 44)", "Routine 6-Mo Remission Follow-Up", "Asymptomatic, maintenance phase", "Working remotely on laptop; flexible for afternoon"],
        ["Pt #103 (Age 58)", "Post-Op Wound Review (Day 4)", "Reports surgical drain site redness, warmth & mild tenderness", "Arrived with daughter; acute pain rating 5/10"],
        ["Pt #104 (Age 36)", "First-Time Oncology Consultation", "Complex referral with 3 biopsy slide envelopes", "Requires 45 min physician deep-dive review"],
      ],
      notes: [
        "Clinic Protocol §4.2: Any post-surgical patient presenting with acute localized inflammation must be assessed by the floor triage nurse within 15 minutes of presentation.",
        "Privacy Protocol: Under medical privacy standards, patient names, diagnoses, and medical histories must never be spoken across public waiting lounges.",
      ],
    },
    practicalTask: {
      prompt: "Select the soundest administrative coordination plan for Dr. Rao's delayed clinic and justify your prioritization logic:",
      type: "choice_and_rationale",
      options: [
        {
          id: "option-a",
          label: "Safety Triage First & Coordinated Logistics: 1) Immediately escort Patient C to the nursing triage bay for clinical wound evaluation by Staff Nurse Preeti. 2) Fast-track Patient A's scheduled blood draw with the clinical fellow so results are ready and prescription refilled before the 11:30 AM ambulance departure. 3) Privately speak with Patient B in consultation nook, explain physician delay transparently, and offer priority 2:00 PM slot with parking voucher. 4) Reschedule Patient D's 45-minute comprehensive intake to tomorrow 9:00 AM so complex biopsy records receive unhurried attention.",
          explanation: "Exemplary coordination: Prioritizes potential clinical risk (Patient C wound infection) through proper nursing referral without attempting unqualified diagnosis, resolves hard logistical transport limits (Patient A), respects patient time, and preserves thoroughness for complex new intake.",
          score: 95,
        },
        {
          id: "option-b",
          label: "Standard Queue Order with Rapid Turnaround: Keep all 4 patients in their initial queue order in the lobby. When Dr. Rao arrives at 11:15 AM, compress each appointment to 8 minutes each to catch up with the morning schedule.",
          explanation: "High risk: Leaves Patient C's inflamed surgical site unmonitored for over 2 hours, guarantees Patient A misses the medical transport van, and rushes complex cancer intake into an unsafe 8-minute superficial chat.",
          score: 40,
        },
        {
          id: "option-c",
          label: "Unqualified Front-Desk Triage: The coordinator visually inspects Patient C's wound in the lobby, cancels Patient A's appointment completely, and instructs Patient D to leave confidential biopsy slides in an unattended basket at the reception counter.",
          explanation: "Dangerous and non-compliant: Exceeds administrative scope by attempting unlicensed physical diagnosis, violates patient privacy regulations, risks specimen misplacement, and abandons an elderly patient reliant on ambulance transit.",
          score: 25,
        },
      ],
      starterContent: "Administrative Triage Plan:\nUrgent Safety Priority: Immediate nursing evaluation for Patient C.\nLogistical Resolution: Fast-track Patient A labs before ambulance window.\n\nMy operational justification & communication plan:",
    },
    evaluationCriteria: [
      {
        criterion: "Clinical Safety Awareness & Proper Delegation",
        weight: 35,
        description: "Recognizing urgent symptoms (e.g. post-op inflammation) and delegating immediately to licensed nursing staff rather than delaying or attempting unlicensed diagnosis.",
      },
      {
        criterion: "Logistical & Transport Coordination",
        weight: 30,
        description: "Managing hard external constraints like fixed medical transit pick-up windows and laboratory turnarounds.",
      },
      {
        criterion: "Patient Communication & Confidentiality",
        weight: 20,
        description: "Compassionate, discrete patient communication adhering to medical privacy standards without disclosure in waiting areas.",
      },
      {
        criterion: "Operational Resource Optimization",
        weight: 15,
        description: "Protecting comprehensive consultation slots for complex diagnostic cases rather than dangerous superficial compression.",
      },
    ],
    reflectionQuestions: [
      "Did you enjoy balancing patient empathy, ethical rules, and fast-moving operational logistics?",
      "Do you find satisfaction in keeping a high-stakes healthcare environment organized and patient-centered?",
    ],
    suggestedNextStep: "Explore GCP (Good Clinical Practice) fundamentals and Clinical Protocol Management in the Project Studio.",
  },
  {
    id: "trial-environmental-data",
    careerSlug: "environmental-data-researcher",
    title: "Micro-Trial: Urban Heat Island & Air Quality Sensor Anomaly Analysis",
    discipline: "science_research",
    estimatedMinutes: 14,
    disclaimerNotice: "SYNTHETIC DATASET NOTICE: This dataset is entirely synthetic and generated for educational and analytical skills evaluation. It does not represent verified field measurements of any actual city. In real environmental science, sensor calibration, sampling bias, and confounding variables must be rigorously controlled before publishing findings.",
    objective: "Analyze a 5-day microclimate sensor dataset across urban zones, calculate cooling differentials, detect sensor missingness bias, and formulate evidence-based conclusions with scientific humility.",
    scenario: "Greenfield Municipal Climate Action Team deployed microclimate sensor nodes across four distinct urban zones during a mid-summer heatwave. You have been provided the 5-day aggregated telemetry: Zone 1 (Industrial Logistics Yard), Zone 2 (Commercial High-Rise Core), Zone 3 (Suburban Residential), and Zone 4 (Protected Urban Forest Park). City leadership wants to know if expanding tree canopy will single-handedly solve both extreme heat and particulate pollution.",
    instructions: [
      "Compare daytime surface temperature and PM2.5 particulate levels across the four zones.",
      "Calculate the observed temperature difference between the lowest canopy zone (Industrial) and highest canopy zone (Urban Forest Park).",
      "Examine sensor missingness rates: Note that Zone 4 recorded 19.4% data loss due to dense canopy solar panel shading and cellular packet drop.",
      "Evaluate whether correlation between canopy cover and lower pollution proves direct causation, or whether confounding factors (e.g., diesel truck traffic in Zone 1 vs zero vehicle traffic in Zone 4) must be factored in.",
    ],
    referenceData: {
      title: "Greenfield Metro 5-Day Environmental Sensor Telemetry (Aggregated Daytime 08:00–18:00)",
      disclosureNotice: "SYNTHETIC DATASET: Synthetic sensor observations created solely for data analysis practice.",
      headers: ["Zone ID & Description", "Mean Surface Temp (°C)", "Mean PM2.5 (µg/m³)", "Tree Canopy Cover (%)", "Data Missingness Rate (%)", "Sensor Status"],
      rows: [
        ["Zone 1: Industrial Logistics Yard", "38.6°C", "94.2 µg/m³", "7.1%", "1.4%", "Calibrated / Continuous"],
        ["Zone 2: Commercial Core", "36.4°C", "71.8 µg/m³", "12.4%", "0.8%", "Calibrated / Continuous"],
        ["Zone 3: Suburban Residential", "32.1°C", "38.5 µg/m³", "36.2%", "2.9%", "Calibrated / Continuous"],
        ["Zone 4: Urban Forest Park", "28.7°C", "18.9 µg/m³", "74.8%", "19.4%", "Flagged: Periodic Midday Solar Occlusion"],
      ],
      notes: [
        "WHO 24-hr Guideline for PM2.5 is 15 µg/m³. Zone 1 exceeds by >6x; Zone 4 approaches guideline.",
        "Missingness in Zone 4 clustered during 11:30 AM–14:00 PM due to canopy obstruction of telemetry solar pack, which could introduce a slight downward bias to reported daytime mean temperatures.",
      ],
    },
    practicalTask: {
      prompt: "Select the scientifically sound research interpretation and policy briefing:",
      type: "choice_and_rationale",
      options: [
        {
          id: "option-a",
          label: "Evidence-Based Analysis with Uncertainty Bounds: 1) Report an observed 9.9°C temperature delta (38.6°C vs 28.7°C) and a 75.3 µg/m³ PM2.5 difference between industrial and forested zones. 2) Explicitly disclose that Zone 4's 19.4% missingness during peak midday hours likely introduces a slight downward temperature bias. 3) Warn city council that while canopy expansion provides proven thermal cooling, the PM2.5 discrepancy is heavily confounded by industrial freight emissions; tree planting alone without industrial emission controls will not achieve clean air targets.",
          explanation: "Exemplary scientific rigor: Accurate math (38.6 - 28.7 = 9.9°C), candid disclosure of sensor telemetry limitations, and careful distinction between correlation and causation without making misleading promises to policymakers.",
          score: 95,
        },
        {
          id: "option-b",
          label: "Deterministic Causal Projection: Announce that increasing canopy cover by 20% in Zone 1 is guaranteed to reduce surface temperatures by exactly 3.2°C and eliminate particulate pollution within 60 days. Dismiss the 19.4% missing data in Zone 4 as inconsequential.",
          explanation: "Flawed science: Assumes linear determinism, ignores vehicle emission confounders, and hides significant sensor data gaps from decision-makers.",
          score: 40,
        },
        {
          id: "option-c",
          label: "Selective Data Pruning: Remove Zone 4 completely from the study to avoid discussing missing data, and tell the council that temperature has no relationship to vegetation.",
          explanation: "Scientific malpractice: Discards relevant empirical observations to conceal sensor maintenance issues and produces a misleading conclusion directly contradicting environmental physics.",
          score: 20,
        },
      ],
      starterContent: "Environmental Sensor Data Analysis:\nCalculated Thermal Delta: 38.6°C - 28.7°C = 9.9°C cooling differential.\nSensor Data Limitation: 19.4% missingness in Zone 4 due to solar occlusion.\n\nMy scientific interpretation & policy advisory:",
    },
    evaluationCriteria: [
      {
        criterion: "Calculation Accuracy & Data Interpretation",
        weight: 35,
        description: "Accurate computation of thermal differentials (9.9°C) and particulate gradients across urban typologies.",
      },
      {
        criterion: "Scientific Uncertainty & Missingness Auditing",
        weight: 30,
        description: "Recognizing sampling bias caused by intermittent sensor outages during peak solar periods.",
      },
      {
        criterion: "Confounder Analysis (Correlation vs Causation)",
        weight: 25,
        description: "Differentiating vegetation cooling from vehicular emission baselines rather than attributing all variance to canopy alone.",
      },
      {
        criterion: "Policy Communication & Research Integrity",
        weight: 10,
        description: "Honest, evidence-based recommendations that protect public credibility without overpromising.",
      },
    ],
    reflectionQuestions: [
      "Did you enjoy working with sensor tables, spotting hidden measurement quirks, and reasoning about physical environments?",
      "Do you prefer discovering what data actually proves versus what people assume it proves?",
    ],
    suggestedNextStep: "Explore the Geospatial Python & Satellite Remote Sensing project in Project Studio.",
  },
  {
    id: "trial-investigative-tech",
    careerSlug: "investigative-tech-journalist",
    title: "Micro-Trial: Automated Hiring Algorithm Leak & Multi-Source Verification",
    discipline: "media_communication",
    estimatedMinutes: 12,
    disclaimerNotice: "FICTIONAL SCENARIO NOTICE: All product names ('TalentScan AI'), corporate entities, audit documents, and source excerpts in this trial are entirely fictional and synthesized for journalism training. No real companies, researchers, or individuals are represented. Professional investigative journalism requires independent verification, source protection, and rigorous right-of-reply standards.",
    objective: "Evaluate a leak alleging algorithmic bias in an automated hiring tool, cross-examine corporate claims against independent academic research, and draft a balanced investigative brief with ethical right-of-reply.",
    scenario: "A leaked internal engineering document from 'TalentScan AI' (a video-interview candidate screening tool used by major employers) lands in your newsroom inbox. The anonymous whistleblower claims the scoring model flags candidates with regional non-native accents with a 3.4x higher rejection rate. The company recently published a press release claiming 99.8% demographic neutrality. An independent university preprint from 4 months ago also analyzed the system with mixed findings.",
    instructions: [
      "Analyze the 4 source excerpts in the investigative dossier.",
      "Classify each source's reliability and bias: Differentiate between unverified anonymous leak, corporate public relations marketing, peer-reviewed academic testing, and individual social media venting.",
      "Formulate a verification plan: Cross-check the leak with documented test data, seek confirmation from former employees, and issue a specific right-of-reply inquiry to TalentScan AI leadership.",
      "Avoid defamatory clickbait while holding high-stakes algorithmic automation accountable.",
    ],
    sourceExcerpts: [
      {
        id: "src-1",
        sourceLabel: "Source 1: Anonymous Whistleblower Slack Leak",
        sourceType: "internal_leak",
        excerptText: "'Product team ignored the October bias sprint results. The acoustic model has a 3.4x false rejection rate on heavy regional accents. VP insisted on shipping for Q4 enterprise contracts anyway.'",
        classification: "unverified",
        analysis: "Highly valuable lead with specific dates and internal jargon, but an unauthenticated screenshot that could be fabricated, altered, or taken out of context. Cannot be reported as verified truth without corroboration.",
      },
      {
        id: "src-2",
        sourceLabel: "Source 2: TalentScan Official Press Statement",
        sourceType: "company_pr",
        excerptText: "'TalentScan AI represents the gold standard in inclusive hiring, achieving 99.8% demographic neutrality across gender and ethnicity in rigorous third-party auditing.'",
        classification: "disputed",
        analysis: "Corporate PR claim that conveniently omits accent and linguistic diversity; uses vague terms ('third-party auditing') without naming the audit firm or publishing testing parameters.",
      },
      {
        id: "src-3",
        sourceLabel: "Source 3: University AI Accountability Lab Pre-print",
        sourceType: "independent_audit",
        excerptText: "'In automated testing of 400 synthetic audio clips across 8 acoustic profiles, TalentScan's public API returned an 18.2% lower mean confidence score for speakers with South Asian and West African phoneme patterns (p < 0.01). Note: Evaluated on API v2.3; company released v3.0 last month.'",
        classification: "supported",
        analysis: "Empirically documented methodology with statistical significance, but notes a version caveat (tested v2.3 rather than the current v3.0 release). Solid anchor for technical inquiry.",
      },
      {
        id: "src-4",
        sourceLabel: "Source 4: Reddit /r/jobs Candidate Thread",
        sourceType: "user_opinion",
        excerptText: "'I got rejected in 4 minutes after speaking 2 sentences. This garbage AI is 100% racist and intentionally fails anyone who isn't an American native speaker!'",
        classification: "opinion",
        analysis: "Real human frustration and narrative color illustrating applicant stress, but an anecdotal opinion without technical insight into the rejection cause. Cannot be cited as proof of intentional systemic bias.",
      },
    ],
    practicalTask: {
      prompt: "Select the ethically and legally sound investigative reporting plan:",
      type: "choice_and_rationale",
      options: [
        {
          id: "option-a",
          label: "Multi-Source Verification & Formal Right-of-Reply: 1) Anchor the reporting on the university lab's verified 18.2% acoustic disparity while noting the version nuance. 2) Corroborate the leaked Slack thread by contacting additional former engineers on Signal. 3) Send a formal, detailed right-of-reply questionnaire to TalentScan AI citing the October audit and university findings, giving 48 hours for response. 4) Publish an investigative piece detailing the empirical findings, the internal whistleblower allegations, the company's defense, and the broader lack of hiring transparency.",
          explanation: "Gold standard investigative journalism: Transparently distinguishes verified academic findings from anonymous leaks, seeks primary document corroboration, grants fair right-of-reply, and holds algorithmic power accountable without sensationalizing unverified screenshots.",
          score: 95,
        },
        {
          id: "option-b",
          label: "Viral Breaking News Scoop: Publish the leaked screenshot immediately under the headline 'Leaked Chat Proves TalentScan AI Is Deliberately Racist', embedding the Reddit comment as public evidence without contacting TalentScan AI.",
          explanation: "Severe journalistic breach: Vulnerable to defamation lawsuits, prints unverified claims as absolute facts, cites anonymous social media comments as proof of intent, and fails basic right-of-reply standards.",
          score: 35,
        },
        {
          id: "option-c",
          label: "Uncritical PR Stenography: Disregard the whistleblower leak and the academic study as anti-tech bias, and publish a sponsored summary of TalentScan's 99.8% demographic neutrality press release.",
          explanation: "Abandons investigative watchdog role: Repackages corporate marketing spin as independent news and leaves real algorithmic discrimination unexamined.",
          score: 30,
        },
      ],
      starterContent: "Investigative Reporting Plan:\nVerified Empirical Anchor: University pre-print (18.2% acoustic confidence disparity).\nCorroboration Required: Primary confirmation of internal October Slack thread.\n\nMy verification roadmap & right-of-reply structure:",
    },
    evaluationCriteria: [
      {
        criterion: "Source Triangulation & Verification Standards",
        weight: 35,
        description: "Distinguishing between verified academic data, uncorroborated leaks, corporate spin, and anecdotal opinion.",
      },
      {
        criterion: "Ethical Right-of-Reply & Fairness",
        weight: 30,
        description: "Providing clear technical queries and fair deadlines to subjects of investigation before publication.",
      },
      {
        criterion: "Public Accountability & Rigorous Framing",
        weight: 25,
        description: "Holding algorithmic systems accountable to affected communities without resorting to clickbait or defamation.",
      },
      {
        criterion: "Legal Prudence & Attribution Accuracy",
        weight: 10,
        description: "Proper hedging, attribution of sources, and protection of confidential whistleblower channels.",
      },
    ],
    reflectionQuestions: [
      "Did you enjoy digging behind corporate claims, questioning numbers, and verifying facts?",
      "Do you find satisfaction in acting as an objective watchdog for truth and public transparency?",
    ],
    suggestedNextStep: "Review the Investigative Tech Journalism feature project brief in Project Studio.",
  },
];

export interface RubricEvaluationResult {
  score: number; // 0 - 100
  ratingBand: "exemplary" | "proficient" | "developing" | "needs_revision";
  criteriaScores: {
    criterion: string;
    weight: number;
    score: number;
    feedback: string;
  }[];
  overallFeedback: string;
}

export function evaluateTrialSubmission(
  trial: CareerTrial,
  selectedOptionId: string,
  rationale: string
): RubricEvaluationResult {
  const selectedOption = trial.practicalTask.options?.find((o) => o.id === selectedOptionId);
  const baseScore = selectedOption ? selectedOption.score : 50;

  // Rationale depth adjustment (max +5 bonus if rationale is thoughtful and substantive)
  const trimmed = (rationale || "").trim();
  const starter = (trial.practicalTask.starterContent || "").trim();
  const addedContent = trimmed.replace(starter, "").trim();

  let rationaleBonus = 0;
  if (addedContent.length >= 60) {
    rationaleBonus = 5;
  } else if (addedContent.length >= 25) {
    rationaleBonus = 3;
  }

  const finalScore = Math.min(100, Math.max(15, baseScore + rationaleBonus));

  let ratingBand: RubricEvaluationResult["ratingBand"] = "developing";
  if (finalScore >= 90) ratingBand = "exemplary";
  else if (finalScore >= 75) ratingBand = "proficient";
  else if (finalScore >= 45) ratingBand = "developing";
  else ratingBand = "needs_revision";

  const criteriaScores = trial.evaluationCriteria.map((crit) => {
    const factor = baseScore >= 90 ? 1.0 : baseScore >= 60 ? 0.72 : baseScore >= 35 ? 0.48 : 0.32;
    const critScore = Math.min(100, Math.max(15, Math.round(finalScore * factor + (crit.weight * 0.1))));

    let feedback = "";
    if (critScore >= 85) {
      feedback = `Demonstrates strong mastery of ${crit.criterion.toLowerCase()}.`;
    } else if (critScore >= 60) {
      feedback = `Shows basic grasp of ${crit.criterion.toLowerCase()}, but leaves key trade-offs unaddressed.`;
    } else {
      feedback = `Critical vulnerability in ${crit.criterion.toLowerCase()} requiring systematic review.`;
    }

    return {
      criterion: crit.criterion,
      weight: crit.weight,
      score: critScore,
      feedback,
    };
  });

  return {
    score: finalScore,
    ratingBand,
    criteriaScores,
    overallFeedback: selectedOption
      ? selectedOption.explanation
      : "Decision recorded and evaluated against scenario criteria.",
  };
}

export function getTrialById(id: string): CareerTrial | undefined {
  return CAREER_TRIALS.find((t) => t.id === id);
}

export function getTrialByCareerSlug(careerSlug: string): CareerTrial | undefined {
  return CAREER_TRIALS.find((t) => t.careerSlug === careerSlug);
}

export function isCareerTrialCompleted(profile: { completedTrialIds: string[] }, careerSlug: string): boolean {
  return CAREER_TRIALS.some(
    (trial) => trial.careerSlug === careerSlug && profile.completedTrialIds.includes(trial.id)
  );
}
