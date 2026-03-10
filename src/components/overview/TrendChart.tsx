"use client";

import { useRef, useEffect } from "react";

interface MonthlyData {
  snapshot_month: string;
  count: number;
  capital: number;
}

interface TrendChartProps {
  data: MonthlyData[];
}

export default function TrendChart({ data }: TrendChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const padding = { top: 30, right: 60, bottom: 40, left: 50 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    // Clear
    ctx.clearRect(0, 0, w, h);

    const maxCount = Math.max(...data.map((d) => d.count)) * 1.1;
    const maxCapital = Math.max(...data.map((d) => d.capital)) * 1.1;
    const barWidth = Math.max((chartW / data.length) * 0.6, 8);
    const barGap = chartW / data.length;

    // Grid lines
    ctx.strokeStyle = "rgba(30, 48, 68, 0.3)";
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(w - padding.right, y);
      ctx.stroke();
    }

    // Y-axis labels (count)
    ctx.font = "10px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#94a3b8";
    ctx.textAlign = "right";
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartH / 4) * i;
      const val = Math.round(maxCount - (maxCount / 4) * i);
      ctx.fillText(val.toString(), padding.left - 8, y + 3);
    }

    // Bars
    data.forEach((d, i) => {
      const x = padding.left + i * barGap + (barGap - barWidth) / 2;
      const barH = (d.count / maxCount) * chartH;
      const y = padding.top + chartH - barH;

      // Bar gradient
      const grad = ctx.createLinearGradient(x, y, x, y + barH);
      grad.addColorStop(0, "#0ea5e9");
      grad.addColorStop(1, "rgba(14, 165, 233, 0.3)");
      ctx.fillStyle = grad;

      // Rounded top
      const radius = Math.min(3, barWidth / 2);
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + barWidth - radius, y);
      ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius);
      ctx.lineTo(x + barWidth, y + barH);
      ctx.lineTo(x, y + barH);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.fill();

      // X-axis labels (every 2nd)
      if (i % 2 === 0) {
        ctx.save();
        ctx.font = "9px 'JetBrains Mono', monospace";
        ctx.fillStyle = "#475569";
        ctx.textAlign = "center";
        const monthStr = d.snapshot_month;
        const label = monthStr.slice(4) + "/" + monthStr.slice(2, 4);
        ctx.fillText(label, x + barWidth / 2, padding.top + chartH + 16);
        ctx.restore();
      }
    });

    // Capital line overlay
    ctx.strokeStyle = "#d4a843";
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.beginPath();
    data.forEach((d, i) => {
      const x = padding.left + i * barGap + barGap / 2;
      const y = padding.top + chartH - (d.capital / maxCapital) * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Capital line glow
    ctx.strokeStyle = "rgba(212, 168, 67, 0.3)";
    ctx.lineWidth = 6;
    ctx.beginPath();
    data.forEach((d, i) => {
      const x = padding.left + i * barGap + barGap / 2;
      const y = padding.top + chartH - (d.capital / maxCapital) * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Right Y-axis labels (capital)
    ctx.font = "10px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#d4a843";
    ctx.textAlign = "left";
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartH / 4) * i;
      const val = maxCapital - (maxCapital / 4) * i;
      const label = val >= 1e9 ? (val / 1e9).toFixed(1) + "B" : (val / 1e6).toFixed(0) + "M";
      ctx.fillText("฿" + label, w - padding.right + 8, y + 3);
    }

    // Title
    ctx.font = "11px 'Space Grotesk', sans-serif";
    ctx.fillStyle = "#e2e8f0";
    ctx.textAlign = "left";
    ctx.fillText("Registration Trend (Monthly)", padding.left, 16);

    // Legend
    ctx.fillStyle = "#0ea5e9";
    ctx.fillRect(w - padding.right - 120, 6, 10, 10);
    ctx.fillStyle = "#94a3b8";
    ctx.font = "9px 'JetBrains Mono', monospace";
    ctx.fillText("Registrations", w - padding.right - 106, 14);

    ctx.strokeStyle = "#d4a843";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(w - padding.right - 50, 11);
    ctx.lineTo(w - padding.right - 38, 11);
    ctx.stroke();
    ctx.fillStyle = "#d4a843";
    ctx.fillText("Capital", w - padding.right - 34, 14);

  }, [data]);

  return (
    <div className="glass-card p-4 h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ minHeight: 280 }}
      />
    </div>
  );
}
