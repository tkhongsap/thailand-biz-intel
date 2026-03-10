# TH-BIZ INTEL — Chiang Mai Business Intelligence Dashboard

A premium, Bloomberg-terminal-inspired business intelligence dashboard for Chiang Mai, Thailand. Built with real Department of Business Development (DBD) registration data.

![Dark Theme](https://img.shields.io/badge/theme-dark-0a1520) ![Next.js](https://img.shields.io/badge/Next.js-14-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## 🎯 Overview

Real-time analysis of **4,844 business registrations** across 25 districts in Chiang Mai, covering Oct 2024 – Feb 2026. Features sector analysis, knowledge graph visualization, district intelligence, and capital flow tracking.

## 📊 Dashboard Tabs

| Tab | Description |
|-----|-------------|
| **Overview** | KPI command bar (5 cards), registration trend chart, sector donut |
| **Knowledge Graph** | Interactive Canvas-based node graph with sector/district/size relationships, particle animations, and inspector panel |
| **Sectors** | Sortable sector table with expandable details, opportunity bubble matrix |
| **Districts** | Choropleth map with metric toggles, district detail panel |
| **Capital Flows** | Monthly capital by sector, distribution histogram, top registrations |
| **Simulator** | Coming soon — scenario modeling |
| **AI Briefing** | Coming soon — AI-powered insights |

## 🏗 Architecture

```
src/
├── app/
│   ├── api/          # API routes (overview, sectors, districts, graph, capital, geo)
│   ├── dashboard/    # Main dashboard page
│   └── layout.tsx    # Root layout (dark theme, fonts)
├── components/
│   ├── overview/     # KPI cards, trend chart, sector donut
│   ├── graph/        # Knowledge graph canvas, node inspector
│   ├── sectors/      # Sector table, opportunity matrix
│   └── districts/    # District map, detail panel
├── lib/
│   ├── db.ts         # SQLite singleton (better-sqlite3)
│   ├── sectors.ts    # TSIC sector mapping (15 sectors)
│   ├── amphurs.ts    # Amphur data + name normalization
│   └── format.ts     # Number/currency/date formatters
└── types/
    └── index.ts      # Tab types and configuration
```

## 📁 Data Sources

| File | Description |
|------|-------------|
| `data/db/intelligence.db` | SQLite — 4,844 DBD registrations |
| `data/geo/chiang-mai-boundaries.json` | GeoJSON — 25 district boundaries |
| `data/geo/chiang-mai-amphurs.json` | Amphur centroids and names |
| `data/geo/chiang-mai-population.csv` | District population data (2023) |

## 🎨 Design System

- **Theme**: Dark Bloomberg terminal aesthetic
- **Fonts**: Space Grotesk (display), JetBrains Mono (data), Noto Sans Thai
- **Colors**: Blue `#0ea5e9`, Gold `#d4a843`, Green `#22c55e`, Red `#ef4444`, Purple `#8b5cf6`, Cyan `#06b6d4`
- **Effects**: Glassmorphism (backdrop-blur), animated particles, staggered fade-in, shimmer loading

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Development
npm run dev      # http://localhost:3300

# Production build
npm run build
npm start
```

## 🔧 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS + CSS custom properties
- **Database**: better-sqlite3 (readonly)
- **Charts**: Custom Canvas API (no heavy chart libraries)
- **Maps**: Canvas-based choropleth with GeoJSON rendering
- **Icons**: Lucide React

## 📈 Key Metrics

- **4,844** registered businesses
- **17** months of data (Oct 2024 – Feb 2026)
- **25** districts
- **15** sector categories (TSIC-mapped)
- **฿8.6B+** total registered capital

---

Built with 🔨 by Builder for CMKL-grade intelligence.
