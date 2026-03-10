"use client";

import { useState } from "react";
import { formatBaht, formatNumber } from "@/lib/format";

interface SectorRow {
  id: string;
  name: string;
  icon: string;
  color: string;
  registrationCount: number;
  totalCapital: number;
  avgCapital: number;
  growthRate: number;
  marketShare: number;
  topDistricts: { name: string; count: number }[];
  topCompanies: { name: string; capital: number; date: string; district: string }[];
  monthlyTrend: { month: string; count: number }[];
}

type SortKey = "registrationCount" | "totalCapital" | "avgCapital" | "growthRate" | "marketShare";

interface SectorTableProps {
  sectors: SectorRow[];
}

function SparkLine({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 80;
  const h = 24;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");
  return (
    <svg width={w} height={h} className="inline-block">
      <polyline fill="none" stroke={color} strokeWidth="1.5" points={points} />
    </svg>
  );
}

export default function SectorTable({ sectors }: SectorTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("registrationCount");
  const [sortAsc, setSortAsc] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const sorted = [...sectors].sort((a, b) => {
    const diff = (a[sortKey] as number) - (b[sortKey] as number);
    return sortAsc ? diff : -diff;
  });

  const SortHeader = ({ label, field }: { label: string; field: SortKey }) => (
    <th
      onClick={() => handleSort(field)}
      className="px-3 py-2 text-left cursor-pointer hover:text-[var(--accent-blue)] transition-colors select-none"
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {sortKey === field && (
          <span className="text-[var(--accent-blue)]">{sortAsc ? "▲" : "▼"}</span>
        )}
      </span>
    </th>
  );

  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border-subtle)] font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
              <th className="px-3 py-2 text-left">Sector</th>
              <SortHeader label="Registrations" field="registrationCount" />
              <SortHeader label="Capital" field="totalCapital" />
              <SortHeader label="Avg Capital" field="avgCapital" />
              <SortHeader label="Growth" field="growthRate" />
              <SortHeader label="Share" field="marketShare" />
              <th className="px-3 py-2">Trend</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((sector) => (
              <SectorRow
                key={sector.id}
                sector={sector}
                expanded={expanded === sector.id}
                onToggle={() => setExpanded(expanded === sector.id ? null : sector.id)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SectorRow({ sector, expanded, onToggle }: { sector: SectorRow["id"] extends string ? SectorRow : never; expanded: boolean; onToggle: () => void }) {
  return (
    <>
      <tr
        onClick={onToggle}
        className="border-b border-[var(--border-subtle)]/50 hover:bg-white/[0.02] cursor-pointer transition-colors"
      >
        <td className="px-3 py-2.5">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: sector.color }} />
            <span className="font-display font-medium text-[var(--text-primary)]">
              {sector.icon} {sector.name}
            </span>
          </div>
        </td>
        <td className="px-3 py-2.5 font-mono text-[var(--accent-blue)]">
          {formatNumber(sector.registrationCount)}
        </td>
        <td className="px-3 py-2.5 font-mono text-[var(--accent-gold)]">
          {formatBaht(sector.totalCapital)}
        </td>
        <td className="px-3 py-2.5 font-mono text-[var(--text-secondary)]">
          {formatBaht(sector.avgCapital)}
        </td>
        <td className="px-3 py-2.5 font-mono">
          <span className={sector.growthRate >= 0 ? "text-[var(--accent-green)]" : "text-[var(--accent-red)]"}>
            {sector.growthRate >= 0 ? "▲" : "▼"} {Math.abs(sector.growthRate).toFixed(1)}%
          </span>
        </td>
        <td className="px-3 py-2.5 font-mono text-[var(--text-secondary)]">
          {sector.marketShare.toFixed(1)}%
        </td>
        <td className="px-3 py-2.5">
          <SparkLine data={sector.monthlyTrend.map((m) => m.count)} color={sector.color} />
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={7} className="px-4 py-3 bg-[var(--bg-surface)]/30">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 fade-in-up">
              {/* Top Companies */}
              <div className="glass-card p-3">
                <p className="font-mono text-[9px] uppercase tracking-wider text-[var(--text-muted)] mb-2">Top Companies</p>
                <div className="space-y-1.5">
                  {sector.topCompanies.slice(0, 5).map((c, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="text-[var(--text-primary)] truncate flex-1 mr-2 font-thai">{c.name}</span>
                      <span className="font-mono text-[var(--accent-gold)] whitespace-nowrap">{formatBaht(c.capital)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* District Distribution */}
              <div className="glass-card p-3">
                <p className="font-mono text-[9px] uppercase tracking-wider text-[var(--text-muted)] mb-2">District Distribution</p>
                <div className="space-y-1.5">
                  {sector.topDistricts.map((d, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="font-mono text-[9px] text-[var(--text-secondary)] w-20 truncate font-thai">{d.name}</span>
                      <div className="flex-1 h-2.5 bg-[var(--bg-panel)] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${sector.topDistricts[0] ? (d.count / sector.topDistricts[0].count) * 100 : 0}%`,
                            backgroundColor: sector.color,
                          }}
                        />
                      </div>
                      <span className="font-mono text-[9px] text-[var(--text-muted)] w-6 text-right">{d.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Monthly Trend */}
              <div className="glass-card p-3">
                <p className="font-mono text-[9px] uppercase tracking-wider text-[var(--text-muted)] mb-2">Monthly Trend</p>
                <div className="flex items-end gap-0.5 h-16">
                  {sector.monthlyTrend.map((m, i) => {
                    const max = Math.max(...sector.monthlyTrend.map((t) => t.count));
                    return (
                      <div
                        key={i}
                        className="flex-1 rounded-t"
                        style={{
                          height: `${max > 0 ? (m.count / max) * 100 : 0}%`,
                          backgroundColor: sector.color,
                          opacity: 0.7,
                        }}
                        title={`${m.month}: ${m.count}`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
