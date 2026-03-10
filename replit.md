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
│   ├── api/          # API route handlers (overview, sectors, districts, graph, capital, geo)
│   ├── dashboard/    # Main dashboard page
│   ├── globals.css
│   └── layout.tsx
├── components/       # UI components (AppShell, tabs, charts, map, graph)
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
- `ANTHROPIC_API_KEY` — Claude API key (for future AI Briefing tab)
- `AI_MODEL` — Claude model name
- `PORT` — legacy port reference (not used by Next.js scripts directly)

## Replit Configuration

- Port: **5000** with `0.0.0.0` binding (required for Replit webview)
- Workflow output type: **webview**
- Node version: 20 (nodejs-20 module)
- Nix channel: stable-25_05
