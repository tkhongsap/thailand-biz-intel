"use client";

import { useEffect, useState, useRef } from "react";
import { formatBaht, formatNumber, formatMonth } from "@/lib/format";

interface BriefingSummary {
  totalRegistrations: number;
  totalCapital: number;
  avgCapital: number;
  activeSectors: number;
  activeDistricts: number;
  latestMonthCount: number;
  monthOverMonth: number;
}

interface Insight {
  type: "opportunity" | "risk" | "trend";
  title: string;
  description: string;
  metric: string;
  color: string;
}

interface SectorInfo {
  id: string;
  name: string;
  icon: string;
  color: string;
  count: number;
  capital: number;
  growthRate: number;
  share: number;
}

interface NotableRegistration {
  name: string;
  capital: number;
  sector: string;
  sectorColor: string;
  district: string;
  date: string;
}

interface BriefingData {
  generatedAt: string;
  summary: BriefingSummary;
  insights: Insight[];
  topSectors: SectorInfo[];
  capitalHotspots: { name: string; count: number; capital: number; growthRate: number }[];
  recentNotable: NotableRegistration[];
  monthlyTrend: { month: string; count: number; capital: number }[];
}

function TypewriterText({ text, speed = 15, delay = 0 }: { text: string; speed?: number; delay?: number }) {
  const [displayed, setDisplayed] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const startTimer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(startTimer);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    if (displayed.length >= text.length) return;
    const timer = setTimeout(() => {
      setDisplayed(text.slice(0, displayed.length + 1));
    }, speed);
    return () => clearTimeout(timer);
  }, [displayed, text, speed, started]);

  return (
    <span>
      {displayed}
      {displayed.length < text.length && started && (
        <span className="animate-pulse text-[var(--accent-blue)]">▊</span>
      )}
    </span>
  );
}

function ScanlineBar() {
  return (
    <div className="w-full h-px relative overflow-hidden my-4">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--accent-blue)] to-transparent opacity-30" />
      <div
        className="absolute top-0 h-full w-16 bg-gradient-to-r from-transparent via-[var(--accent-blue)] to-transparent opacity-60"
        style={{ animation: "scanline 3s linear infinite" }}
      />
    </div>
  );
}

function InsightCard({ insight, delay }: { insight: Insight; delay: number }) {
  const typeColors = {
    opportunity: { bg: "rgba(34, 197, 94, 0.08)", border: "rgba(34, 197, 94, 0.3)", label: "#22c55e", labelText: "OPPORTUNITY" },
    risk: { bg: "rgba(239, 68, 68, 0.08)", border: "rgba(239, 68, 68, 0.3)", label: "#ef4444", labelText: "RISK" },
    trend: { bg: "rgba(14, 165, 233, 0.08)", border: "rgba(14, 165, 233, 0.3)", label: "#0ea5e9", labelText: "TREND" },
  };

  const style = typeColors[insight.type];

  return (
    <div
      className="glass-card hover-glow p-4 fade-in-up relative overflow-hidden"
      style={{ animationDelay: `${delay}ms`, background: style.bg, borderColor: style.border }}
    >
      <div className="flex items-start justify-between mb-2">
        <span
          className="font-mono text-[9px] uppercase tracking-[0.15em] px-2 py-0.5 rounded-full"
          style={{ color: style.label, background: `${style.label}15`, border: `1px solid ${style.label}30` }}
        >
          {style.labelText}
        </span>
        <span className="font-display text-lg font-bold" style={{ color: insight.color }}>
          {insight.metric}
        </span>
      </div>
      <p className="font-display text-sm font-semibold text-[var(--text-primary)] mb-1.5">
        {insight.title}
      </p>
      <p className="font-mono text-[11px] text-[var(--text-secondary)] leading-relaxed">
        {insight.description}
      </p>
    </div>
  );
}

function SectorBriefRow({ sector, maxCount }: { sector: SectorInfo; maxCount: number }) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-[var(--border-subtle)] last:border-0">
      <span className="text-sm">{sector.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-[var(--text-primary)] truncate">{sector.name}</span>
          <span
            className="font-mono text-[10px] font-bold"
            style={{ color: sector.growthRate >= 0 ? "var(--accent-green)" : "var(--accent-red)" }}
          >
            {sector.growthRate >= 0 ? "▲" : "▼"} {Math.abs(sector.growthRate)}%
          </span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex-1 h-1 rounded-full bg-[var(--bg-surface)] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${(sector.count / maxCount) * 100}%`,
                backgroundColor: sector.color,
              }}
            />
          </div>
          <span className="font-mono text-[9px] text-[var(--text-muted)] w-16 text-right">
            {formatNumber(sector.count)} biz
          </span>
        </div>
      </div>
    </div>
  );
}

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length < 2) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const W = rect.width;
    const H = rect.height;

    const max = Math.max(...data) * 1.1;
    const min = Math.min(...data) * 0.9;
    const range = max - min || 1;

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    for (let i = 0; i < data.length; i++) {
      const x = (i / (data.length - 1)) * W;
      const y = H - ((data[i] - min) / range) * H;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, `${color}30`);
    grad.addColorStop(1, `${color}00`);
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();
  }, [data, color]);

  return <canvas ref={canvasRef} className="w-full" style={{ height: 32 }} />;
}

export default function BriefingTab() {
  const [data, setData] = useState<BriefingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/briefing")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <div className="shimmer h-12 rounded-xl w-3/4" />
        <div className="shimmer h-6 rounded-xl w-1/2" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="shimmer h-24 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="shimmer h-32 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-[var(--text-muted)] font-mono text-sm">Failed to generate briefing</p>
      </div>
    );
  }

  const { summary, insights, topSectors, capitalHotspots, recentNotable, monthlyTrend } = data;
  const generatedDate = new Date(data.generatedAt);
  const maxSectorCount = topSectors.length > 0 ? topSectors[0].count : 1;

  const opportunities = insights.filter(i => i.type === "opportunity");
  const risks = insights.filter(i => i.type === "risk");
  const trends = insights.filter(i => i.type === "trend");

  return (
    <div className="p-4 md:p-6 space-y-4 overflow-auto h-full">
      <div className="fade-in-up">
        <div className="flex items-center gap-3 mb-1">
          <div className="live-badge">Intelligence Active</div>
          <span className="font-mono text-[9px] text-[var(--text-muted)]">
            Generated {generatedDate.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
        <h2 className="font-display text-xl font-bold text-[var(--text-primary)] mt-2">
          <TypewriterText text="Chiang Mai Business Intelligence Briefing" speed={20} />
        </h2>
        <p className="font-mono text-[11px] text-[var(--text-secondary)] mt-1">
          <TypewriterText
            text={`Analyzing ${formatNumber(summary.totalRegistrations)} registrations across ${summary.activeSectors} sectors and ${summary.activeDistricts} districts.`}
            speed={12}
            delay={800}
          />
        </p>
      </div>

      <ScanlineBar />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card hover-glow p-4 fade-in-up" style={{ borderLeft: "4px solid var(--accent-blue)", animationDelay: "100ms" }}>
          <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-[var(--text-muted)] mb-1">Total Registrations</p>
          <p className="font-display text-2xl font-bold text-[var(--accent-blue)]">{formatNumber(summary.totalRegistrations)}</p>
          <p className="font-mono text-[10px] text-[var(--text-secondary)] mt-1">{summary.activeSectors} active sectors</p>
        </div>
        <div className="glass-card hover-glow p-4 fade-in-up" style={{ borderLeft: "4px solid var(--accent-gold)", animationDelay: "200ms" }}>
          <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-[var(--text-muted)] mb-1">Total Capital</p>
          <p className="font-display text-2xl font-bold text-[var(--accent-gold)]">{formatBaht(summary.totalCapital)}</p>
          <p className="font-mono text-[10px] text-[var(--text-secondary)] mt-1">Avg {formatBaht(summary.avgCapital)} / biz</p>
        </div>
        <div className="glass-card hover-glow p-4 fade-in-up" style={{ borderLeft: "4px solid var(--accent-green)", animationDelay: "300ms" }}>
          <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-[var(--text-muted)] mb-1">Latest Month</p>
          <p className="font-display text-2xl font-bold text-[var(--accent-green)]">{formatNumber(summary.latestMonthCount)}</p>
          <p className="font-mono text-[10px] mt-1" style={{ color: summary.monthOverMonth >= 0 ? "var(--accent-green)" : "var(--accent-red)" }}>
            {summary.monthOverMonth >= 0 ? "+" : ""}{summary.monthOverMonth}% MoM
          </p>
        </div>
        <div className="glass-card hover-glow p-4 fade-in-up" style={{ borderLeft: "4px solid var(--accent-cyan)", animationDelay: "400ms" }}>
          <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-[var(--text-muted)] mb-1">Activity Trend</p>
          <MiniSparkline data={monthlyTrend.map(m => m.count)} color="#06b6d4" />
        </div>
      </div>

      <ScanlineBar />

      {opportunities.length > 0 && (
        <div className="space-y-2 fade-in-up" style={{ animationDelay: "200ms" }}>
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--accent-green)]">
            ● Opportunities Detected
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {opportunities.map((insight, i) => (
              <InsightCard key={i} insight={insight} delay={250 + i * 80} />
            ))}
          </div>
        </div>
      )}

      {risks.length > 0 && (
        <div className="space-y-2 fade-in-up" style={{ animationDelay: "350ms" }}>
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--accent-red)]">
            ● Risk Signals
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {risks.map((insight, i) => (
              <InsightCard key={i} insight={insight} delay={400 + i * 80} />
            ))}
          </div>
        </div>
      )}

      {trends.length > 0 && (
        <div className="space-y-2 fade-in-up" style={{ animationDelay: "450ms" }}>
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--accent-blue)]">
            ● Emerging Trends
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {trends.map((insight, i) => (
              <InsightCard key={i} insight={insight} delay={500 + i * 80} />
            ))}
          </div>
        </div>
      )}

      <ScanlineBar />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card p-4 fade-in-up" style={{ animationDelay: "550ms" }}>
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--text-muted)] mb-3">
            Sector Performance Matrix
          </p>
          <div className="space-y-0">
            {topSectors.map((sector) => (
              <SectorBriefRow key={sector.id} sector={sector} maxCount={maxSectorCount} />
            ))}
          </div>
        </div>

        <div className="glass-card p-4 fade-in-up" style={{ animationDelay: "600ms" }}>
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--text-muted)] mb-3">
            Capital Concentration Hotspots
          </p>
          <div className="space-y-3">
            {capitalHotspots.map((district, i) => (
              <div key={district.name} className="flex items-center gap-3">
                <span className="font-display text-lg font-bold text-[var(--accent-gold)] w-6">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-[var(--text-primary)]">{district.name}</span>
                    <span className="font-display text-sm font-bold text-[var(--accent-gold)]">
                      {formatBaht(district.capital)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-[9px] text-[var(--text-muted)]">
                      {formatNumber(district.count)} registrations
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card p-4 fade-in-up" style={{ animationDelay: "650ms" }}>
        <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--text-muted)] mb-3">
          Notable High-Capital Registrations
        </p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border-subtle)]">
                <th className="font-mono text-[9px] uppercase tracking-widest text-[var(--text-muted)] text-left py-2 px-2">Company</th>
                <th className="font-mono text-[9px] uppercase tracking-widest text-[var(--text-muted)] text-left py-2 px-2">Sector</th>
                <th className="font-mono text-[9px] uppercase tracking-widest text-[var(--text-muted)] text-left py-2 px-2">District</th>
                <th className="font-mono text-[9px] uppercase tracking-widest text-[var(--text-muted)] text-right py-2 px-2">Capital</th>
              </tr>
            </thead>
            <tbody>
              {recentNotable.slice(0, 8).map((reg, i) => (
                <tr key={i} className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[rgba(14,165,233,0.05)] transition-colors">
                  <td className="font-mono text-[11px] text-[var(--text-primary)] py-2 px-2 max-w-[200px] truncate">
                    {reg.name}
                  </td>
                  <td className="py-2 px-2">
                    <span
                      className="font-mono text-[10px] px-1.5 py-0.5 rounded"
                      style={{ color: reg.sectorColor, background: `${reg.sectorColor}15` }}
                    >
                      {reg.sector}
                    </span>
                  </td>
                  <td className="font-mono text-[11px] text-[var(--text-secondary)] py-2 px-2">{reg.district}</td>
                  <td className="font-display text-sm font-bold text-[var(--accent-gold)] text-right py-2 px-2">
                    {formatBaht(reg.capital)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-center py-2 fade-in-up" style={{ animationDelay: "700ms" }}>
        <p className="font-mono text-[9px] text-[var(--text-muted)] uppercase tracking-widest">
          End of Briefing • Data Source: Department of Business Development (DBD)
        </p>
      </div>
    </div>
  );
}
