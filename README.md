# ⚽ LM10 — Lionel Messi Career Intelligence
<p align="center">
  <img src="src/assets/LM10.jpg" alt="Lionel Messi" width="180" />
</p>

An interactive sports-analytics dashboard that explores the exhaustive goals repository of Lionel Messi’s professional football career. Built with **React 19**, **TypeScript**, **Vite**, **Tailwind CSS v4**, and **Recharts**, the platform isolates club-level dominance (FC Barcelona & Paris Saint-Germain) from his legendary international exploits with Argentina, with rich cross-filtering, advanced analytics, and a browsable goals explorer.


---

## ✨ Features

- **Overview Tab** — Career milestones, KPI cards, a profile picture, and a high-level summary of Messi’s goal-scoring legacy.
- **Club Dominance Tab** — Statistical splits for FC Barcelona and Paris Saint-Germain (competitions, seasons, venues, methods).
- **International Tab** — Argentina career registry with dedicated filters and breakdowns.
- **Advanced Analytics Tab** — Goal clustering, minute-by-minute progression, and goals-per-90 rate analysis.
- **Goals Explorer Tab** — Browse, search, and query the raw goals list, with CSV export.
- **Global Cross-Filtering** — Click any chart segment or use global parameters to cross-filter performance data across the dashboard.
- **CSV Export** — Export the filtered goals dataset for external analysis.
- **Responsive & Animated UI** — Built with Tailwind CSS and the `motion` library for a polished, fluid experience.

## 🧱 Tech Stack

| Category      | Technology                                |
| ------------- | ----------------------------------------- |
| Framework     | React 19 + TypeScript                     |
| Build Tool    | Vite 6                                    |
| Styling       | Tailwind CSS v4 (`@tailwindcss/vite`)     |
| Charts        | Recharts 3                                |
| Animation     | Motion                                     |
| Icons         | lucide-react                              |
| Data Parsing  | papaparse                                 |

## 🚀 Getting Started

### Prerequisites

- **Node.js** (LTS recommended)

### Run Locally

1. **Clone the repository**
   ```bash
   git clone https://github.com/Mohaiminul2/lm10-career-analysis.git
    cd lm10-career-analysis
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`.

### Build for Production

```bash
npm run build      # Output to dist/
npm run preview    # Preview the production build locally
```

### Lint / Type Check

```bash
npm run lint       # Runs tsc --noEmit
```

## 📁 Project Structure

```
lm10-career-analysis/
├── src/
│   ├── assets/                 # Static assets (profile image, etc.)
│   ├── components/             # UI sections & components
│   │   ├── OverviewSection.tsx
│   │   ├── ClubSection.tsx
│   │   ├── InternationalSection.tsx
│   │   ├── AdvancedSection.tsx
│   │   ├── ExplorerSection.tsx
│   │   └── KPICard.tsx
│   ├── context/                # Global dashboard state (filters, search, stats)
│   ├── data/                   # Goals dataset & appearance data
│   ├── types.ts                # Shared TypeScript types
│   ├── App.tsx                 # Root layout & tab navigation
│   └── main.tsx
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## 📊 Data

The dashboard is powered by a curated dataset of Messi’s certified career goals, including club (Barcelona, PSG) and international (Argentina) records, with metadata such as competition, season, venue, scoring method, and match minute. Figures reflect the career totals shown in the app (e.g., 820+ certified goals across 1033+ matches).

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -m "Add your feature"`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a Pull Request.

Please ensure `npm run lint` passes before submitting.

## 📜 License

This project is provided for educational and demonstration purposes. All football career data and imagery remain the property of their respective owners. See the `LICENSE` file for details (if applicable).

---

<p align="center">
  Made with ⚽ and React — <strong>LM10 Career Intelligence</strong>
</p>
