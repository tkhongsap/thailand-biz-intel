# TH-BIZ INTEL — Chiang Mai Business Intelligence Dashboard

A Bloomberg-terminal-inspired business intelligence dashboard for Chiang Mai, Thailand, built with real Department of Business Development (DBD) registration data covering 4,844 businesses across 25 districts (Oct 2024 – Feb 2026).

## Stack

- **Framework**: Next.js 14.2.35 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS
- **Database**: better-sqlite3 (local SQLite at `data/db/intelligence.db`, read-only)
- **Maps**: react-leaflet / leaflet
- **Package manager**: npm

## Architecture

```
src/
├── app/
│   ├── api/          # API route handlers (overview, sectors, districts, graph, capital, geo, simulator, briefing)
│   ├── dashboard/    # Main dashboard page
│   ├── globals.css
│   └── layout.tsx
├── components/       # UI components (AppShell, tabs, charts, map, graph, simulator, briefing)
├── lib/              # db.ts, format.ts, sectors.ts, amphurs.ts
└── types/            # Shared TypeScript types
data/
└── db/
    └── intelligence.db   # SQLite database (read-only)
```

## Running

- **Dev**: `npm run dev` → http://localhost:5000
- **Workflow**: "Start application" runs `npm run dev` on port 5000 (Replit webview)

## Environment Variables

Stored in `.env`:
- `ANTHROPIC_API_KEY` — Claude API key (reserved for future live AI features)
- `AI_MODEL` — Claude model name
- `PORT` — legacy port reference (not used by Next.js scripts directly)

## Responsive Design

All 7 tabs are responsive across mobile (375px), tablet (768px), and desktop (1280px+):
- **Header**: Compact padding on mobile, subtitle hidden below `sm` breakpoint
- **TabBar**: Smaller buttons on mobile, "Adv" section label, horizontal scroll via `tab-scroll`
- **Districts/Graph**: Side panels stack below content on mobile (`flex-col md:flex-row`)
- **Simulator**: Slider grid uses `grid-cols-2 md:grid-cols-4`, reduced padding on mobile
- **Briefing**: Reduced padding on mobile (`p-4 md:p-6`)
- **Sectors**: Table has `overflow-x-auto` for horizontal scroll on narrow screens

## Replit Configuration

- Port: **5000** with `0.0.0.0` binding (required for Replit webview)
- Workflow output type: **webview**
- Node version: 20 (nodejs-20 module)
- Nix channel: stable-25_05
