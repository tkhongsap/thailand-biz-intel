"use client";

import { formatBaht, formatNumber } from "@/lib/format";

interface DistrictData {
  code: string;
  name_th: string;
  name_en: string;
  registrationCount: number;
  totalCapital: number;
  avgCapital: number;
  population: number;
  businessDensity: number;
  topSectors: { sector: string; count: number }[];
  monthlyTrend: { month: string; count: number }[];
  topRegistrations: { name: string; capital: number; sector: string; date: string }[];
}

interface DistrictDetailProps {
  district: DistrictData | null;
}

export default function DistrictDetail({ district }: DistrictDetailProps) {
  if (!district) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[var(--text-muted)]">
        <div className="w-12 h-12 rounded-full bg-[var(--bg-panel)] flex items-center justify-center mb-3">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        </div>
        <p className="text-sm font-display">Click a district to explore</p>
        <p className="text-xs font-mono mt-1">Select on the map</p>
      </div>
    );
  }

  const maxSector = district.topSectors.length > 0 ? district.topSectors[0].count : 1;
  const maxTrend = district.monthlyTrend.length > 0 ? Math.max(...district.monthlyTrend.map((m) => m.count)) : 1;

  return (
    <div className="space-y-3 fade-in-up overflow-y-auto h-full p-4">
      {/* Header */}
      <div>
        <h3 className="font-display font-bold text-lg text-[var(--text-primary)]">{district.name_en}</h3>
        <p className="font-thai text-sm text-[var(--text-secondary)]">{district.name_th}</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="glass-card p-2.5 text-center">
          <p className="font-mono text-[8px] uppercase tracking-wider text-[var(--text-muted)]">Registrations</p>
          <p className="font-display text-lg font-bold text-[var(--accent-blue)]">{formatNumber(district.registrationCount)}</p>
        </div>
        <div className="glass-card p-2.5 text-center">
          <p className="font-mono text-[8px] uppercase tracking-wider text-[var(--text-muted)]">Capital</p>
          <p className="font-display text-lg font-bold text-[var(--accent-gold)]">{formatBaht(district.totalCapital)}</p>
        </div>
        <div className="glass-card p-2.5 text-center">
          <p className="font-mono text-[8px] uppercase tracking-wider text-[var(--text-muted)]">Avg Capital</p>
          <p className="font-display text-sm font-bold text-[var(--accent-cyan)]">{formatBaht(district.avgCapital)}</p>
        </div>
      </div>

      {/* Population & Density */}
      {district.population > 0 && (
        <div className="glass-card p-3 flex justify-between items-center">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-wider text-[var(--text-muted)]">Population</p>
            <p className="font-display font-semibold text-[var(--text-primary)]">{formatNumber(district.population)}</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-[9px] uppercase tracking-wider text-[var(--text-muted)]">Biz Density</p>
            <p className="font-display font-semibold text-[var(--accent-green)]">{district.businessDensity.toFixed(1)} / 10K</p>
          </div>
        </div>
      )}

      {/* Top Sectors */}
      <div className="glass-card p-3">
        <p className="font-mono text-[9px] uppercase tracking-wider text-[var(--text-muted)] mb-2">Top Sectors</p>
        <div className="space-y-1.5">
          {district.topSectors.slice(0, 5).map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="font-mono text-[9px] text-[var(--text-secondary)] w-24 truncate">{s.sector}</span>
              <div className="flex-1 h-3 bg-[var(--bg-panel)] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-[var(--accent-blue)]"
                  style={{ width: `${(s.count / maxSector) * 100}%` }}
                />
              </div>
              <span className="font-mono text-[9px] text-[var(--text-muted)] w-6 text-right">{s.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="glass-card p-3">
        <p className="font-mono text-[9px] uppercase tracking-wider text-[var(--text-muted)] mb-2">Monthly Trend</p>
        <div className="flex items-end gap-0.5 h-16">
          {district.monthlyTrend.map((m, i) => (
            <div
              key={i}
              className="flex-1 rounded-t bg-[var(--accent-blue)]"
              style={{ height: `${maxTrend > 0 ? (m.count / maxTrend) * 100 : 0}%`, opacity: 0.7 }}
              title={`${m.month}: ${m.count}`}
            />
          ))}
        </div>
      </div>

      {/* Top Registrations */}
      {district.topRegistrations.length > 0 && (
        <div className="glass-card p-3">
          <p className="font-mono text-[9px] uppercase tracking-wider text-[var(--text-muted)] mb-2">Notable Registrations</p>
          <div className="space-y-2">
            {district.topRegistrations.slice(0, 5).map((r, i) => (
              <div key={i} className="border-b border-[var(--border-subtle)]/30 pb-1.5 last:border-0">
                <p className="text-xs text-[var(--text-primary)] font-thai truncate">{r.name}</p>
                <div className="flex justify-between mt-0.5">
                  <span className="font-mono text-[9px] text-[var(--text-muted)]">{r.sector}</span>
                  <span className="font-mono text-[9px] text-[var(--accent-gold)]">{formatBaht(r.capital)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
