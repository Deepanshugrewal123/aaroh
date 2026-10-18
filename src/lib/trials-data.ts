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
];
