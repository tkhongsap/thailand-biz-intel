# Thailand Business Intelligence Dashboard — V2 Redesign

## Vision
A CMKL-grade visual intelligence platform focused entirely on **business & economic data**. Drop weather/water/air quality. Keep the Bloomberg terminal aesthetic but make it about money, sectors, and opportunity.

## What We're Blending

### From CMKL (steal the UX patterns):
1. **Knowledge Graph** — Interactive canvas with glowing nodes and animated edges
2. **KPI Cards Row** — Top-line metrics at a glance
3. **Tabbed Navigation** — Clean section separation
4. **Performance Analytics** — Success rates, key factors, bar visualizations
5. **Sector Opportunities** — TAM, penetration, growth rates by sector
6. **Revenue Projections** — 5-year stacked charts
7. **Personas & Demand** — Population archetypes
8. **Simulator** — Interactive what-if sliders
9. **Color Palette** — Blue #0ea5e9, Gold #d4a843, Green #22c55e on dark #0f172a

### From Our Real Data (what makes ours superior):
1. **4,844 real business registrations** from DBD (Department of Business Development)
2. **Real monthly trends** — 18 months of data (Oct 2024 – Mar 2026)
3. **Real capital flows** — ฿8.6B total registered capital
4. **Real sector breakdown** — TSIC business codes mapped to sectors
5. **Real amphur-level geography** — 25 districts with actual boundaries
6. **Demographics** — Real population data by district
7. **AI Analysis** — Claude-powered insights on real data

---

## Data Architecture

### Primary: DBD Registrations (4,844 records)
- Company name, registration date, capital (THB)
- Business code (TSIC) → mapped to sectors
- Amphur, tambon, province
- Monthly snapshots

### Sector Mapping (TSIC → Human-readable sectors)
| Code Range | Sector | Icon |
|---|---|---|
| 55xxx-56xxx | Hospitality (Hotels, F&B) | 🏨 |
| 41xxx-43xxx | Construction | 🏗️ |
| 82xxx | Business Services | 💼 |
| 47xxx | Retail & E-commerce | 🛒 |
| 68xxx | Real Estate | 🏠 |
| 70xxx | Consulting & Management | 📊 |
| 79xxx | Tourism & Travel | ✈️ |
| 73xxx | Marketing & Advertising | 📣 |
| 46xxx | Wholesale Trade | 📦 |
| 49xxx | Transport & Logistics | 🚛 |
| 75xxx | Healthcare (Vet) | 🏥 |
| Others | Other | ⚙️ |

### Derived Metrics
- Registration velocity (monthly/weekly trend)
- Average capital per registration
- Sector concentration (HHI index)
- District economic density
- Capital flow patterns
- New business survival indicators
- Sector growth rates (YoY)

---

## Dashboard Layout (7 Tabs)

### Tab 1: OVERVIEW (Landing Page)
**Layout:** KPI bar + 2-column grid

**KPI Command Bar (5 cards):**
- Total Registrations YTD (count + ▲▼ vs last year)
- Total Capital Deployed (฿ + trend)
- Avg Capital per Business (฿)
- Top Sector (name + % share)
- District Activity Leader (amphur name + count)

**Left Column: Registration Trend Chart**
- 18-month bar chart (monthly registrations)
- Stacked by top 5 sectors with color coding
- Gold line overlay for cumulative capital
- Hover for details

**Right Column: Sector Donut + District Heatmap Mini**
- Donut chart: sector breakdown by count
- Small district map with color-coded business density

---

### Tab 2: KNOWLEDGE GRAPH
**Layout:** Full canvas + inspector panel

**Nodes:**
- `sector` — Top 10 business sectors (colored by growth rate)
- `district` — 25 amphurs (sized by registration count)
- `company_type` — Company sizes: Micro (<100K), Small (100K-1M), Medium (1M-10M), Large (10M+)
- `trend` — Monthly trend indicators (rising/falling/stable)

**Edges:**
- district → sector (weighted by count of that sector in that district)
- sector → company_type (capital distribution)
- district → trend (economic momentum)

**Inspector Panel (300px):**
- Node details with real stats
- Connected entities list
- Mini trend sparkline

---

### Tab 3: SECTOR ANALYSIS
**Layout:** Full-width sector table + detail expansion

**Sector Table:**
| Sector | Registrations | Capital | Avg Capital | Growth | Market Share |
|---|---|---|---|---|---|
| Hospitality | 546 | ฿890M | ฿1.6M | +12% | 11.3% |
| Construction | 380 | ฿1.2B | ฿3.2M | +8% | 7.8% |
| ... | ... | ... | ... | ... | ... |

**Click to expand:** Shows top companies, district distribution, monthly trend, AI insight for that sector.

**Sector Opportunity Matrix (CMKL-inspired):**
- X-axis: Market size (total capital)
- Y-axis: Growth rate
- Bubble size: Number of registrations
- Color: Sector
- Top-right quadrant = high opportunity sectors

---

### Tab 4: DISTRICT INTELLIGENCE
**Layout:** Interactive map + district detail panel

**Map (Leaflet):**
- Choropleth by business density or capital flow
- Click district → detail panel slides in
- Toggle between: Registration Count | Capital | Growth Rate | Sector Diversity

**District Detail Panel:**
- District name (TH/EN)
- Population + business density ratio
- Top 5 sectors in this district
- Monthly registration trend
- Notable recent registrations (high capital)
- AI-generated district brief

---

### Tab 5: CAPITAL FLOWS
**Layout:** Revenue/capital visualization (CMKL-inspired)

**Capital Timeline:**
- Stacked area chart: monthly capital by sector
- Total cumulative line
- Highlight anomalies (unusually large registrations)

**Capital Distribution:**
- Histogram: capital ranges (how many businesses at each tier)
- Micro (<100K): XX% | Small (100K-1M): XX% | Medium (1M-10M): XX% | Large (10M+): XX%

**Top Registrations Table:**
- Largest capital registrations this period
- Company name, capital, sector, district, date

---

### Tab 6: SIMULATOR
**Layout:** Interactive controls + AI prediction panel

**Controls:**
- Scenario: "New Mall Development" / "Tech Hub Launch" / "Tourism Boom" / "Economic Downturn"
- Investment Scale: ฿1M – ฿100M slider
- Target District: Dropdown
- Sector Focus: Multi-select
- Timeline: 6mo / 1yr / 3yr

**Output (AI-powered):**
- Predicted new business registrations
- Expected capital inflow
- Sector impact breakdown
- Risk assessment
- Opportunity score (1-100)
- Recommended actions

---

### Tab 7: AI BRIEFING
**Layout:** Full-width AI intelligence report

**Sections:**
- Executive Summary (2-3 sentences)
- Key Trends (bullets with data backing)
- Sector Spotlight (deep dive on fastest-growing sector)
- District Watch (notable district-level movements)
- Risk Indicators (declining sectors, capital flight)
- Opportunities (data-backed opportunity identification)
- Recommendations (3-5 actionable items)

---

## Design System

### Typography
- **Display:** Space Grotesk 700 (large numbers, KPI values)
- **Body:** Space Grotesk 400/500 (text, descriptions)
- **Data:** JetBrains Mono 400/500 (codes, tables, labels)
- **Thai:** Noto Sans Thai 400/500/600

### Colors
```
--bg-deep: #0a1520
--bg-panel: rgba(15, 23, 42, 0.6)
--bg-surface: #111827
--border-subtle: rgba(30, 48, 68, 0.6)

--accent-blue: #0ea5e9    (primary, interactive)
--accent-gold: #d4a843    (financial, highlight)
--accent-green: #22c55e   (positive, growth)
--accent-red: #ef4444     (negative, decline)
--accent-purple: #8b5cf6  (secondary, AI)
--accent-cyan: #06b6d4    (data, info)

--text-primary: #e2e8f0
--text-secondary: #94a3b8
--text-muted: #475569
```

### Effects
- Glassmorphism: `backdrop-filter: blur(12px)` + semi-transparent bg
- Glow: `box-shadow: 0 0 20px rgba(color, 0.15)`
- Animated edges: Canvas particle flow
- Staggered entry: 100ms delay between elements
- Count-up: Numbers animate from 0 to value

### Branding
- Name: **TH-BIZ INTEL** or **Chiang Mai Business Intelligence**
- Tagline: "AREA-BASED BUSINESS INTELLIGENCE"
- Logo: Shield icon with chart inside

---

## Tech Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- better-sqlite3 (DBD data)
- Canvas API (knowledge graph)
- Leaflet (district map)
- Anthropic API (AI analysis + simulator)
- Recharts or custom Canvas (charts)

---

## What's NOT Included (dropped from V1)
- ❌ Weather data/panel
- ❌ Water level data/panel
- ❌ Air quality data/panel
- ✅ Keep: Demographics (feeds into business density calculations)
- ✅ Keep: Map (but focused on business data, not environmental)
- ✅ Keep: AI Intelligence (but focused on business insights)
