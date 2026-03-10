"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { formatBaht, formatNumber, formatMonth } from "@/lib/format";

interface Baseline {
  totalRegistrations: number;
  totalCapital: number;
  avgMonthlyRegistrations: number;
  avgMonthlyCapital: number;
  monthCount: number;
}

interface SectorData {
  id: string;
  name: string;
  icon: string;
  color: string;
  count: number;
  capital: number;
  share: number;
}

interface MonthlyPoint {
  month: string;
  count: number;
  capital: number;
}

interface SimData {
  baseline: Baseline;
  sectors: SectorData[];
  districts: { name: string; count: number; capital: number }[];
  monthlyTrend: MonthlyPoint[];
}

interface ScenarioParams {
  capitalMultiplier: number;
  growthRate: number;
  newBusinessRate: number;
  forecastMonths: number;
}

const DEFAULT_PARAMS: ScenarioParams = {
  capitalMultiplier: 1.0,
  growthRate: 0,
  newBusinessRate: 0,
  forecastMonths: 12,
};

function SliderControl({
  label,
  value,
  min,
  max,
  step,
  unit,
  color,
  onChange,
  formatValue,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  color: string;
  onChange: (v: number) => void;
  formatValue?: (v: number) => string;
}) {
  const displayValue = formatValue ? formatValue(value) : `${value}${unit}`;
  return (
    <div className="glass-card p-4 fade-in-up">
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--text-muted)]">
          {label}
        </span>
        <span className="font-display text-sm font-bold" style={{ color }}>
          {displayValue}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, ${color} ${((value - min) / (max - min)) * 100}%, var(--border-subtle) ${((value - min) / (max - min)) * 100}%)`,
        }}
      />
      <div className="flex justify-between mt-1">
        <span className="font-mono text-[9px] text-[var(--text-muted)]">{formatValue ? formatValue(min) : `${min}${unit}`}</span>
        <span className="font-mono text-[9px] text-[var(--text-muted)]">{formatValue ? formatValue(max) : `${max}${unit}`}</span>
      </div>
    </div>
  );
}

function ProjectionChart({
  historical,
  projected,
  label,
}: {
  historical: { label: string; value: number }[];
  projected: { label: string; value: number }[];
  label: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const W = rect.width;
    const H = rect.height;

    ctx.clearRect(0, 0, W, H);

    const allData = [...historical, ...projected];
    if (allData.length === 0) return;

    const maxVal = Math.max(...allData.map(d => d.value)) * 1.15;
    const padL = 50;
    const padR = 16;
    const padT = 20;
    const padB = 30;
    const chartW = W - padL - padR;
    const chartH = H - padT - padB;

    for (let i = 0; i <= 4; i++) {
      const y = padT + (chartH / 4) * i;
      ctx.strokeStyle = "rgba(30, 48, 68, 0.3)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(W - padR, y);
      ctx.stroke();

      const val = maxVal - (maxVal / 4) * i;
      ctx.fillStyle = "#475569";
      ctx.font = "10px 'JetBrains Mono'";
      ctx.textAlign = "right";
      ctx.fillText(val >= 1000 ? `${(val / 1000).toFixed(0)}K` : val.toFixed(0), padL - 8, y + 3);
    }

    const totalPoints = allData.length;
    const getX = (i: number) => padL + (chartW / (totalPoints - 1 || 1)) * i;
    const getY = (v: number) => padT + chartH - (v / maxVal) * chartH;

    if (historical.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = "#0ea5e9";
      ctx.lineWidth = 2;
      for (let i = 0; i < historical.length; i++) {
        const x = getX(i);
        const y = getY(historical[i].value);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      const grad = ctx.createLinearGradient(0, padT, 0, padT + chartH);
      grad.addColorStop(0, "rgba(14, 165, 233, 0.2)");
      grad.addColorStop(1, "rgba(14, 165, 233, 0)");
      ctx.beginPath();
      for (let i = 0; i < historical.length; i++) {
        const x = getX(i);
        const y = getY(historical[i].value);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.lineTo(getX(historical.length - 1), padT + chartH);
      ctx.lineTo(getX(0), padT + chartH);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();
    }

    if (projected.length > 0) {
      const startIdx = historical.length - 1;
      ctx.beginPath();
      ctx.strokeStyle = "#22c55e";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.moveTo(getX(startIdx), getY(historical[historical.length - 1].value));
      for (let i = 0; i < projected.length; i++) {
        const x = getX(historical.length + i);
        const y = getY(projected[i].value);
        ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      const grad2 = ctx.createLinearGradient(0, padT, 0, padT + chartH);
      grad2.addColorStop(0, "rgba(34, 197, 94, 0.1)");
      grad2.addColorStop(1, "rgba(34, 197, 94, 0)");
      ctx.beginPath();
      ctx.moveTo(getX(startIdx), getY(historical[historical.length - 1].value));
      for (let i = 0; i < projected.length; i++) {
        ctx.lineTo(getX(historical.length + i), getY(projected[i].value));
      }
      ctx.lineTo(getX(historical.length + projected.length - 1), padT + chartH);
      ctx.lineTo(getX(startIdx), padT + chartH);
      ctx.closePath();
      ctx.fillStyle = grad2;
      ctx.fill();
    }

    if (historical.length > 0 && projected.length > 0) {
      const divX = getX(historical.length - 1);
      ctx.strokeStyle = "rgba(212, 168, 67, 0.5)";
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(divX, padT);
      ctx.lineTo(divX, padT + chartH);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = "#d4a843";
      ctx.font = "9px 'JetBrains Mono'";
      ctx.textAlign = "center";
      ctx.fillText("FORECAST →", divX + 40, padT - 6);
    }

    const step = Math.max(1, Math.floor(totalPoints / 8));
    ctx.fillStyle = "#475569";
    ctx.font = "9px 'JetBrains Mono'";
    ctx.textAlign = "center";
    for (let i = 0; i < totalPoints; i += step) {
      ctx.fillText(allData[i].label, getX(i), padT + chartH + 16);
    }
    if (totalPoints > 1) {
      ctx.fillText(allData[totalPoints - 1].label, getX(totalPoints - 1), padT + chartH + 16);
    }
  }, [historical, projected]);

  return (
    <div className="glass-card p-4 fade-in-up" style={{ animationDelay: "200ms" }}>
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--text-muted)]">
          {label}
        </span>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 rounded bg-[#0ea5e9]" />
            <span className="font-mono text-[9px] text-[var(--text-muted)]">Historical</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 rounded bg-[#22c55e]" style={{ borderBottom: "1px dashed #22c55e" }} />
            <span className="font-mono text-[9px] text-[var(--text-muted)]">Projected</span>
          </div>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        className="w-full"
        style={{ height: 240 }}
      />
    </div>
  );
}

function ImpactCard({
  label,
  baselineValue,
  projectedValue,
  format,
  color,
  delay,
}: {
  label: string;
  baselineValue: number;
  projectedValue: number;
  format: (v: number) => string;
  color: string;
  delay: number;
}) {
  const change = baselineValue > 0
    ? ((projectedValue - baselineValue) / baselineValue) * 100
    : 0;
  const isPositive = change >= 0;

  return (
    <div
      className="glass-card hover-glow p-4 relative overflow-hidden fade-in-up"
      style={{ borderLeft: `4px solid ${color}`, animationDelay: `${delay}ms` }}
    >
      <div
        className="absolute top-0 left-0 w-16 h-full opacity-10"
        style={{ background: `linear-gradient(90deg, ${color}, transparent)` }}
      />
      <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-[var(--text-muted)] mb-1">
        {label}
      </p>
      <p className="font-display text-xl font-bold" style={{ color }}>
        {format(projectedValue)}
      </p>
      <div className="flex items-center gap-2 mt-1">
        <span className="font-mono text-[10px] text-[var(--text-muted)]">
          Base: {format(baselineValue)}
        </span>
        <span
          className="font-mono text-[10px] font-bold"
          style={{ color: isPositive ? "var(--accent-green)" : "var(--accent-red)" }}
        >
          {isPositive ? "+" : ""}{change.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}

function SectorImpactTable({
  sectors,
  params,
}: {
  sectors: SectorData[];
  params: ScenarioParams;
}) {
  const topSectors = sectors.slice(0, 8);
  return (
    <div className="glass-card p-4 fade-in-up" style={{ animationDelay: "300ms" }}>
      <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--text-muted)] mb-3">
        Sector Impact Projection
      </p>
      <div className="space-y-2">
        {topSectors.map((s) => {
          const projCount = Math.round(
            s.count * (1 + params.growthRate / 100) + (s.count * params.newBusinessRate / 100)
          );
          const projCapital = s.capital * params.capitalMultiplier * (1 + params.growthRate / 100);
          const countChange = s.count > 0 ? ((projCount - s.count) / s.count) * 100 : 0;

          return (
            <div key={s.id} className="flex items-center gap-3 py-1.5 border-b border-[var(--border-subtle)] last:border-0">
              <span className="text-sm">{s.icon}</span>
              <span className="font-mono text-xs text-[var(--text-primary)] flex-1 truncate">{s.name}</span>
              <div className="flex items-center gap-4">
                <span className="font-mono text-xs text-[var(--text-secondary)]">
                  {formatNumber(s.count)} → {formatNumber(projCount)}
                </span>
                <span
                  className="font-mono text-[10px] font-bold w-14 text-right"
                  style={{ color: countChange >= 0 ? "var(--accent-green)" : "var(--accent-red)" }}
                >
                  {countChange >= 0 ? "+" : ""}{countChange.toFixed(1)}%
                </span>
                <div className="w-20 h-1.5 rounded-full bg-[var(--bg-surface)] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, (projCapital / (sectors[0].capital * params.capitalMultiplier * (1 + params.growthRate / 100))) * 100)}%`,
                      backgroundColor: s.color,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function SimulatorTab() {
  const [data, setData] = useState<SimData | null>(null);
  const [loading, setLoading] = useState(true);
  const [params, setParams] = useState<ScenarioParams>(DEFAULT_PARAMS);

  useEffect(() => {
    fetch("/api/simulator")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const updateParam = useCallback((key: keyof ScenarioParams, value: number) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetParams = useCallback(() => {
    setParams(DEFAULT_PARAMS);
  }, []);

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="shimmer h-20 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="shimmer h-32 rounded-xl" />)}
        </div>
        <div className="shimmer h-72 rounded-xl" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-[var(--text-muted)] font-mono text-sm">Failed to load simulator data</p>
      </div>
    );
  }

  const { baseline, sectors, monthlyTrend } = data;

  const projRegistrations = Math.round(
    baseline.totalRegistrations * (1 + params.growthRate / 100) +
    baseline.totalRegistrations * (params.newBusinessRate / 100)
  );
  const projCapital = baseline.totalCapital * params.capitalMultiplier * (1 + params.growthRate / 100);
  const projMonthlyReg = Math.round(
    baseline.avgMonthlyRegistrations * (1 + params.growthRate / 100) +
    baseline.avgMonthlyRegistrations * (params.newBusinessRate / 100)
  );
  const projMonthlyCapital = baseline.avgMonthlyCapital * params.capitalMultiplier * (1 + params.growthRate / 100);

  const historical = monthlyTrend.map((m) => ({
    label: formatMonth(m.month),
    value: m.count,
  }));

  const lastMonth = monthlyTrend[monthlyTrend.length - 1];
  const projected: { label: string; value: number }[] = [];
  if (lastMonth) {
    const lastYM = parseInt(lastMonth.month.slice(0, 4)) * 12 + parseInt(lastMonth.month.slice(4)) - 1;
    let prevVal = lastMonth.count;
    for (let i = 1; i <= params.forecastMonths; i++) {
      const totalMonths = lastYM + i;
      const year = Math.floor(totalMonths / 12);
      const month = (totalMonths % 12) + 1;
      const monthStr = `${year}${String(month).padStart(2, "0")}`;
      const growthFactor = 1 + params.growthRate / 100 / 12;
      const newBiz = baseline.avgMonthlyRegistrations * (params.newBusinessRate / 100 / 12);
      prevVal = Math.round(prevVal * growthFactor + newBiz);
      projected.push({ label: formatMonth(monthStr), value: prevVal });
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-4 overflow-auto h-full">
      <div className="flex items-center justify-between fade-in-up">
        <div>
          <h2 className="font-display text-base md:text-lg font-semibold text-[var(--text-primary)]">
            Scenario Simulator
          </h2>
          <p className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-widest mt-0.5">
            What-if analysis engine • {baseline.monthCount} months baseline data
          </p>
        </div>
        <button
          onClick={resetParams}
          className="font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--accent-blue)] hover:border-[var(--accent-blue)] transition-colors"
        >
          Reset
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <SliderControl
          label="Capital Multiplier"
          value={params.capitalMultiplier}
          min={0.5}
          max={3.0}
          step={0.1}
          unit="x"
          color="var(--accent-gold)"
          onChange={(v) => updateParam("capitalMultiplier", v)}
          formatValue={(v) => `${v.toFixed(1)}x`}
        />
        <SliderControl
          label="Sector Growth Rate"
          value={params.growthRate}
          min={-30}
          max={50}
          step={1}
          unit="%"
          color="var(--accent-green)"
          onChange={(v) => updateParam("growthRate", v)}
          formatValue={(v) => `${v >= 0 ? "+" : ""}${v}%`}
        />
        <SliderControl
          label="New Business Inflow"
          value={params.newBusinessRate}
          min={0}
          max={50}
          step={1}
          unit="%"
          color="var(--accent-cyan)"
          onChange={(v) => updateParam("newBusinessRate", v)}
          formatValue={(v) => `+${v}%`}
        />
        <SliderControl
          label="Forecast Horizon"
          value={params.forecastMonths}
          min={3}
          max={24}
          step={1}
          unit=" mo"
          color="var(--accent-purple)"
          onChange={(v) => updateParam("forecastMonths", v)}
          formatValue={(v) => `${v} months`}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ImpactCard
          label="Total Registrations"
          baselineValue={baseline.totalRegistrations}
          projectedValue={projRegistrations}
          format={formatNumber}
          color="var(--accent-blue)"
          delay={0}
        />
        <ImpactCard
          label="Total Capital"
          baselineValue={baseline.totalCapital}
          projectedValue={projCapital}
          format={formatBaht}
          color="var(--accent-gold)"
          delay={100}
        />
        <ImpactCard
          label="Monthly Registrations"
          baselineValue={baseline.avgMonthlyRegistrations}
          projectedValue={projMonthlyReg}
          format={formatNumber}
          color="var(--accent-green)"
          delay={200}
        />
        <ImpactCard
          label="Monthly Capital"
          baselineValue={baseline.avgMonthlyCapital}
          projectedValue={projMonthlyCapital}
          format={formatBaht}
          color="var(--accent-cyan)"
          delay={300}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ProjectionChart
          historical={historical}
          projected={projected}
          label="Registration Forecast"
        />
        <SectorImpactTable sectors={sectors} params={params} />
      </div>
    </div>
  );
}
