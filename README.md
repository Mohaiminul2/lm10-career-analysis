# LM10 — Lionel Messi Career Intelligence

An interactive sports-analytics dashboard that explores the exhaustive goals repository of Lionel Messi's professional football career. Built with **React 19**, **TypeScript**, **Vite 6**, **Tailwind CSS v4**, and **Recharts 3**, the platform isolates club-level dominance (FC Barcelona & Paris Saint-Germain) from his legendary international exploits with Argentina, with rich cross-filtering, advanced analytics, and a browsable goals explorer.

<p align="center">
  <img src="src/assets/Messi.jpg" alt="Lionel Messi" width="180" />
</p>

---

## Table of Contents

- [About](#about)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Architecture & Project Structure](#architecture--project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Data](#data)
- [Running Tests & Linting](#running-tests--linting)
- [Docker / Containerization](#docker--containerization)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [Project Status](#project-status)
- [License](#license)

---

## About

**LM10 Career Intelligence** is a single-page React application that visualizes Lionel Messi's complete career goal record. The dashboard presents a curated dataset of certified career goals spanning club (FC Barcelona, Paris Saint-Germain, Inter Miami) and international (Argentina) competitions, with metadata including competition, season, venue, scoring method, match minute, and assister.

**Problem it solves:** Football analytics enthusiasts, researchers, and fans lack an interactive, filterable interface to explore Messi's goal-scoring patterns across different dimensions (season, competition, opponent, body part, goal type, venue, minute).

**Target audience:** Sports analysts, football fans, data visualization enthusiasts, and developers studying React/TypeScript dashboard patterns.

**Architectural characteristics:**
- Client-side only (no backend, no database)
- Embedded CSV dataset parsed at runtime via PapaParse
- Global React Context for cross-tab filter synchronization
- Lazy-loaded tab components for performance
- Responsive design with mobile-first breakpoints
- Motion-based animations with reduced-motion support

---

## Key Features

- **Overview Tab** — Career milestones, KPI cards (total goals, club/international splits, estimated per-90 rate), profile image, cumulative goal progression area chart, and milestone timeline (1st, 100th, 300th, 500th, 700th, 800th, 900th, last goal)
- **Club Dominance Tab** — FC Barcelona, Paris Saint-Germain & Inter Miami statistical splits with dynamic dropdown filters (season, competition, opponent, foot, goal type), seasonal bar chart, competition horizontal bar chart, minute distribution line chart, foot pie chart (clickable for cross-filtering), top assist providers, and venue/goal-type split progress bars
- **International Tab** — Argentina career registry with filters (opponent, competition type, foot, goal type), opponent bar chart (top 10, clickable), competition type pie chart (clickable), minute distribution line chart, age-at-goal area chart (longevity curve), and goal architecture splits
- **Advanced Analytics Tab** — Club vs International analytical profiles (avg goal age, assisted ratio, finishing profiles), 5-minute window goal clustering stacked bar chart, season-over-season YoY delta line chart (Club/International/Total), peak campaigns and most productive competitions spotlights
- **Goals Explorer Tab** — Paginated, sortable, filterable table of raw goal entries (20 per page) with context/foot/type/venue filters, multi-column sorting (goal number, date, minute), and filtered CSV export
- **Global Cross-Filtering** — Click any chart segment (pie slices, bars) to apply a dashboard-wide filter that persists across all tabs; badge indicator with one-click clear
- **Global Search** — Text search across opponent, competition, season, assister, and team
- **CSV Export** — Export complete dataset, club-only, international-only, or currently filtered goals
- **Responsive & Animated UI** — Tailwind CSS v4 with custom design tokens, `motion` library for transitions, dark theme with brand colors (blue/gold), reduced-motion media query support

---

## Technology Stack

| Area            | Technology |
| --------------- | ---------- |
| Framework       | React 19 + TypeScript |
| Build Tool      | Vite 6 |
| Styling         | Tailwind CSS v4 (`@tailwindcss/vite`) |
| Charts          | Recharts 3 |
| Animation       | Motion (framer-motion successor) |
| Icons           | lucide-react |
| Data Parsing    | PapaParse 5 |
| Linting         | TypeScript `tsc --noEmit` |
| CI/CD           | Not configured |

---

## Architecture & Project Structure

```mermaid
flowchart LR
    subgraph Client
        App[App.tsx] --> DashboardContext[DashboardContext]
        DashboardContext --> Overview[OverviewSection]
        DashboardContext --> Club[ClubSection]
        DashboardContext --> Intl[InternationalSection]
        DashboardContext --> Advanced[AdvancedSection]
        DashboardContext --> Explorer[ExplorerSection]
    end
    
    Data[Embedded CSV Data] --> PapaParse[PapaParse]
    PapaParse --> Goals[Goal[] Array]
    Goals --> DashboardContext
    
    Appearances[appearances.ts] --> DashboardContext
```

**Project structure:**

```
lm10-career-analysis/
├── public/                     # (empty, Vite uses index.html at root)
├── src/
│   ├── assets/
│   │   └── Messi.jpg           # Profile image
│   ├── components/
│   │   ├── OverviewSection.tsx
│   │   ├── ClubSection.tsx
│   │   ├── InternationalSection.tsx
│   │   ├── AdvancedSection.tsx
│   │   ├── ExplorerSection.tsx
│   │   ├── KPICard.tsx
│   │   └── chartTheme.ts
│   ├── context/
│   │   └── DashboardContext.tsx   # Global state (filters, goals, cross-filter, export)
│   ├── data/
│   │   ├── appearances.ts         # Historical appearance counts for per-90 calc
│   │   ├── goalsData.ts           # CSV parser, metrics, aggregations
│   │   ├── goalsRawPart1-4.ts     # Embedded CSV chunks (4 parts)
│   │   └── goalsRawPart{1-4}.ts
│   ├── types.ts                   # TypeScript interfaces (Goal, CareerStats, etc.)
│   ├── index.css                  # Tailwind v4 + custom design tokens
│   ├── App.tsx                    # Root layout, sidebar, tabs, lazy loading
│   ├── main.tsx                   # Entry point
│   └── vite-env.d.ts
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts                 # Base path for GitHub Pages
├── .gitignore
└── README.md
```

---

## Prerequisites

- **Node.js** LTS (v18+ recommended; tested with v22 in CI)
- **npm** (bundled with Node.js)

No additional system dependencies (database, Docker, etc.) are required.

---

## Installation

```bash
# 1. Clone the repository
git clone <repository-url>
cd lm10-career-analysis

# 2. Install dependencies
npm install
```

---

## Usage

### Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000` (configured in `package.json`).

### Production Build

```bash
# Build to dist/
npm run build

# Preview production build locally
npm run preview
```

The build outputs to `dist/` with the base path `/lm10-career-analysis/` for GitHub Pages deployment.

### Lint / Type Check

```bash
npm run lint
```

Runs `tsc --noEmit` for TypeScript type checking.

---

## Data

The dashboard is powered by an embedded dataset of Messi's certified career goals:

- **Source:** 4 CSV chunks (`goalsRawPart1-4.ts`) combined at build time (**934 goals through 12 Oct 2026**)
- **Scope:** Club (FC Barcelona 672, Paris Saint-Germain 32, Inter Miami CF 104) + International (Argentina 126)
- **Cutoff:** Goals through 12 October 2026 (Messi's 608th and final Inter Miami regular-season goal, vs. D.C. United)
- **Metadata per goal:** Date, season, year, age, context, team, competition, competition type, opponent, venue, home/away, result, minute, goal type, foot, assister, score after goal
- **Appearance data:** Hardcoded season-by-season club appearances (2004/05–2026/27) and calendar-year international appearances (2005–2026) for goals-per-90 calculations (2026 figures are approximations)
- **Data integrity:** Missing foot/body-part values were **mode-imputed** to `"Left"` (the modal category) — 42 goals: 4 pre-2026 unknowns + 38 new 2026 goals without a recorded body part. Foot splits therefore include imputed values; known-value counts are Left 752 / Right 110 / Header 30.

### Sources & validation

The dataset was rebuilt from primary sources and cross-checked against multiple independent references:

- **Structure, dates, competitions, body part, goal type:** goal-level CSV (`leancorv`, 2005–2025)
- **Assists, venue and score-at-goal enrichment:** FBref goal log (club + competitive internationals), cross-checked with a secondary 800-goal dataset and Transfermarkt-derived club data
- **International goals:** validated against Wikipedia's *List of international goals scored by Lionel Messi* — exact per-year match through 2025 (… = 115), plus 2026 (Zambia, Iceland, Algeria ×3, Austria ×2, Jordan, Cape Verde, Egypt, Benin = 11) for 126 total; competition split World Cup 21, WCQ 36, Copa América 14, Friendlies 55
- **2026 goals (37–38):** 27 Inter Miami (MLS 23, Concacaf Champions Cup 1, Leagues Cup 2, Campeones Cup 1) and 11 Argentina, each cross-checked between the 2026 Inter Miami CF season article (goalscorer lists → final result + score-at-goal) and FBref goal logs (venue + assister for 26/38)
- **Club totals:** FC Barcelona 672, Paris Saint-Germain 32 and Inter Miami CF 104 match published career records (Inter Miami regular-season 73, playoffs 7, Champions Cup 8, Leagues Cup 14, Campeones Cup 1, Club World Cup 1)

---

## Running Tests & Linting

| Command | Description |
| ------- | ----------- |
| `npm run lint` | TypeScript type check (`tsc --noEmit`) |

**Note:** No unit/integration test framework is currently configured. The `lint` script serves as the primary CI gate.

---

## Docker / Containerization

Docker is **not configured** for this project. The application is a static client-side build deployable to any static hosting.

---

## Deployment

The project builds to a static `dist/` directory suitable for any static hosting provider (GitHub Pages, Netlify, Vercel, Cloudflare Pages, etc.).

**GitHub Pages (manual setup):**

1. Run `npm run build` — outputs to `dist/` with base path `/lm10-career-analysis/`
2. Deploy the `dist/` directory to your preferred static hosting
3. For GitHub Pages: enable Pages → Source: "GitHub Actions" and add a workflow that runs `npm ci && npm run lint && npm run build` and deploys `dist/`

**Note:** No CI/CD workflow files exist in the repository. The `vite.config.ts` includes `base: '/lm10-career-analysis/'` for GitHub Pages project-site compatibility.

No other deployment targets (Docker, Kubernetes) are configured.

---

## Contributing

No `CONTRIBUTING.md` exists. Suggested workflow:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make changes
4. Run `npm run lint` — ensure it passes
5. Commit: `git commit -m "Add your feature"`
6. Push: `git push origin feature/your-feature`
7. Open a Pull Request

---

## Project Status

| Area | Status |
| ---- | ------ |
| Core Dashboard (5 tabs) | ✅ Implemented |
| Global Cross-Filtering | ✅ Implemented |
| CSV Export (all subsets) | ✅ Implemented |
| Goals Explorer (pagination, sort, filter) | ✅ Implemented |
| Advanced Analytics (clustering, YoY, profiles) | ✅ Implemented |
| Responsive UI + Animations | ✅ Implemented |
| GitHub Pages CI/CD | ❌ Not configured (base path only) |
| Unit/Integration Tests | ❌ Not configured |
| Docker Support | ❌ Not configured |
| LICENSE File | ❌ Not present |

---

## License

**No `LICENSE` file detected in the repository.**

This project is provided for educational and demonstration purposes. All football career data and imagery remain the property of their respective owners. If you intend to use, modify, or distribute this code, please add an appropriate license file.

---

<p align="center">
  Made with ⚽ and React — <strong>LM10 Career Intelligence</strong>
</p>