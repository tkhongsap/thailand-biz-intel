"use client";

import { useRef, useEffect } from "react";

interface SectorBubble {
  name: string;
  color: string;
  totalCapital: number;
  growthRate: number;
  registrationCount: number;
}

interface OpportunityMatrixProps {
  sectors: SectorBubble[];
}

export default function OpportunityMatrix({ sectors }: OpportunityMatrixProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || sectors.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const pad = { top: 40, right: 30, bottom: 40, left: 60 };
    const chartW = w - pad.left - pad.right;
    const chartH = h - pad.top - pad.bottom;

    ctx.clearRect(0, 0, w, h);

    // Axes ranges
    const capitals = sectors.map((s) => s.totalCapital);
    const growths = sectors.map((s) => s.growthRate);
    const counts = sectors.map((s) => s.registrationCount);

    const minCap = 0;
    const maxCap = Math.max(...capitals) * 1.1;
    const minGrowth = Math.min(...growths, -20);
    const maxGrowth = Math.max(...growths, 20);
    const maxCount = Math.max(...counts);

    const toX = (capital: number) => pad.left + (capital / maxCap) * chartW;
    const toY = (growth: number) => pad.top + chartH - ((growth - minGrowth) / (maxGrowth - minGrowth)) * chartH;

    // Grid
    ctx.strokeStyle = "rgba(30, 48, 68, 0.3)";
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + (chartH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(w - pad.right, y);
      ctx.stroke();

      const x = pad.left + (chartW / 4) * i;
      ctx.beginPath();
      ctx.moveTo(x, pad.top);
      ctx.lineTo(x, pad.top + chartH);
      ctx.stroke();
    }

    // Zero line for growth
    const zeroY = toY(0);
    if (zeroY > pad.top && zeroY < pad.top + chartH) {
      ctx.strokeStyle = "rgba(148, 163, 184, 0.3)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(pad.left, zeroY);
      ctx.lineTo(w - pad.right, zeroY);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Quadrant labels
    ctx.font = "9px 'JetBrains Mono', monospace";
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = "#94a3b8";
    ctx.textAlign = "right";
    ctx.fillText("High Growth + High Capital", w - pad.right - 4, pad.top + 14);
    ctx.textAlign = "left";
    ctx.fillText("High Growth + Low Capital", pad.left + 4, pad.top + 14);
    ctx.textAlign = "right";
    ctx.fillText("Low Growth + High Capital", w - pad.right - 4, pad.top + chartH - 4);
    ctx.globalAlpha = 1;

    // Bubbles
    for (const sector of sectors) {
      const x = toX(sector.totalCapital);
      const y = toY(sector.growthRate);
      const r = Math.max(8, Math.min(40, (sector.registrationCount / maxCount) * 40));

      // Glow
      ctx.beginPath();
      ctx.arc(x, y, r + 4, 0, Math.PI * 2);
      ctx.fillStyle = sector.color + "15";
      ctx.fill();

      // Bubble
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = sector.color + "60";
      ctx.fill();
      ctx.strokeStyle = sector.color;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Label
      ctx.font = "9px 'Space Grotesk', sans-serif";
      ctx.fillStyle = "#e2e8f0";
      ctx.textAlign = "center";
      ctx.fillText(sector.name, x, y + r + 14);
    }

    // Axis labels
    ctx.font = "10px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#94a3b8";
    ctx.textAlign = "center";
    ctx.fillText("Total Capital →", pad.left + chartW / 2, h - 8);

    ctx.save();
    ctx.translate(14, pad.top + chartH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("Growth Rate (%) →", 0, 0);
    ctx.restore();

    // Y-axis values
    ctx.textAlign = "right";
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + (chartH / 4) * i;
      const val = maxGrowth - ((maxGrowth - minGrowth) / 4) * i;
      ctx.fillText(`${val.toFixed(0)}%`, pad.left - 8, y + 3);
    }

    // X-axis values
    ctx.textAlign = "center";
    for (let i = 0; i <= 4; i++) {
      const x = pad.left + (chartW / 4) * i;
      const val = (maxCap / 4) * i;
      const label = val >= 1e9 ? (val / 1e9).toFixed(1) + "B" : (val / 1e6).toFixed(0) + "M";
      ctx.fillText("฿" + label, x, pad.top + chartH + 16);
    }

    // Title
    ctx.font = "11px 'Space Grotesk', sans-serif";
    ctx.fillStyle = "#e2e8f0";
    ctx.textAlign = "left";
    ctx.fillText("Sector Opportunity Matrix", pad.left, 16);

  }, [sectors]);

  return (
    <div className="glass-card p-4">
      <canvas
        ref={canvasRef}
        className="w-full"
        style={{ height: 300 }}
      />
    </div>
  );
}
