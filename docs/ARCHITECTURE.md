# Aaroh — System Architecture & Technical Specifications

## 1. Overview & System Purpose
Aaroh is an intelligent, student-first personal career intelligence platform designed to move students from career ambiguity to verified proof-of-work.

### Non-Negotiable Operational Tenets
1. **Never claim 100% deterministic certainty:** Career exploration recommendations are starting hypotheses, not psychic destinies.
2. **Transparent Skill Metrics:** Skill coverage scores represent verifiable rubric coverage, never "probabilities of getting hired".
3. **Multi-Disciplinary Equality:** First-class support for Engineering, Commerce, Arts/Design, Sciences, Healthcare, Law, and Media.
4. **Anti-Burnout & Exam Mode:** Dynamic throttling of roadmap capacity during college exams without manipulative streaks or guilt messaging.

---

## 2. Layered Architecture

```mermaid
flowchart TD
    subgraph UI ["Client Presentation Layer (Next.js 15 App Router)"]
        Landing["Landing Page + Interactive Career Map"]
        Onboarding["Progressive Onboarding Wizard"]
        AppShell["Responsive AppShell (Desktop Sidebar + Mobile Drawer)"]
        Dashboard["Student Intelligence Dashboard"]
        Explore["Career Explorer & Multi-Path Comparator"]
        Trials["Career Trial Simulator"]
        Skills["Skill Intelligence & Gap Diagnostic"]
        Roadmap["Adaptive Roadmap & Capacity Planner"]
        Projects["Project Studio & Portfolio"]
        Mentor["Context-Aware AI Mentor"]
    end

    subgraph Core ["Engine & Domain Logic Layer"]
        RecEngine["Recommendation Engine (Weighted Multi-Criteria Scoring)"]
        SkillGraph["Skill Dependency & Evidence Verification Logic"]
        RoadmapEngine["Roadmap Sequencer with Dynamic Exam Throttling"]
        Store["State Persistence Layer (LocalStorage / Cloud Sync Ready)"]
    end

    subgraph Data ["Catalog & Persistence"]
        CareersCatalog["Curated Multi-Disciplinary Career Catalog"]
        SkillsCatalog["Skill Taxonomy & Prerequisite Matrix"]
        TrialsCatalog["Hands-On Micro-Work Simulations with Rubrics"]
        ProjectsCatalog["Project Briefs with Testing & README Checklists"]
        PrismaSchema["Prisma Relational Schema (SQLite Dev / PostgreSQL Prod)"]
    end

    Landing --> Onboarding
    Onboarding --> Dashboard
    AppShell --> Dashboard
    AppShell --> Explore
    AppShell --> Trials
    AppShell --> Skills
    AppShell --> Roadmap
    AppShell --> Projects
    AppShell --> Mentor

    Explore & Dashboard --> RecEngine
    Skills --> SkillGraph
    Roadmap --> RoadmapEngine
    
    RecEngine --> CareersCatalog
    SkillGraph --> SkillsCatalog
    Trials --> TrialsCatalog
    Projects --> ProjectsCatalog
    RoadmapEngine --> PrismaSchema
```

---

## 3. Design System & Tokens
- **Dark Theme Canvas:** `#101113`
- **Secondary Surface:** `#15171A`
- **Cards:** `#1B1E22`
- **Interactive Surfaces:** `#22262B`
- **Borders:** `rgba(255, 255, 255, 0.08)` (subtle), `rgba(255, 255, 255, 0.16)` (medium)
- **Primary Brand Amber:** `#F59E0B` (glow: `rgba(245, 158, 11, 0.15)`)
- **Positive Emerald:** `#34D399`
- **Warning/Error Rose:** `#F43F5E`
- **Text:** Primary `#F8F9FA`, Muted `#9CA3AF`
- **Light Theme Equivalents:** High-contrast `#F8F9FA` canvas with `#FFFFFF` cards, `#DEE2E6` borders, and `#181A1D` text.
- **Typography:** Manrope for bold headings, Inter for high legibility body copy.
