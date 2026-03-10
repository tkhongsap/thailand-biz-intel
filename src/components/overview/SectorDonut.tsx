"use client";

import { useRef, useEffect } from "react";
import { SECTORS, OTHER_SECTOR } from "@/lib/sectors";

interface SectorData {
  sector: string;
  sectorName: string;
  count: number;
  capital: number;
  share: number;
}

interface SectorDonutProps {
  data: SectorData[];
  totalCount: number;
}

export default function SectorDonut({ data, totalCount }: SectorDonutProps) {
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

    const size = Math.min(rect.width, rect.height * 0.65);
    const cx = rect.width / 2;
    const cy = size / 2 + 10;
    const outerR = size / 2 - 10;
    const innerR = outerR * 0.6;

    ctx.clearRect(0, 0, rect.width, rect.height);

    // Draw donut
    let startAngle = -Math.PI / 2;
    const topSectors = data.slice(0, 8);
    const otherCount = data.slice(8).reduce((s, d) => s + d.count, 0);
    const segments = [...topSectors];
    if (otherCount > 0) {
      segments.push({ sector: "other", sectorName: "Other", count: otherCount, capital: 0, share: (otherCount / totalCount) * 100 });
    }

    for (const seg of segments) {
      const sliceAngle = (seg.count / totalCount) * Math.PI * 2;
      const sectorDef = SECTORS.find(s => s.id === seg.sector) || OTHER_SECTOR;

      ctx.beginPath();
      ctx.arc(cx, cy, outerR, startAngle, startAngle + sliceAngle);
      ctx.arc(cx, cy, innerR, startAngle + sliceAngle, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = sectorDef.color;
      ctx.fill();

      // Subtle gap between slices
      ctx.strokeStyle = "#0a1520";
      ctx.lineWidth = 2;
      ctx.stroke();

      startAngle += sliceAngle;
    }

    // Center text
    ctx.font = "bold 24px 'Space Grotesk', sans-serif";
    ctx.fillStyle = "#e2e8f0";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(totalCount.toLocaleString(), cx, cy - 6);
    ctx.font = "10px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#94a3b8";
    ctx.fillText("TOTAL", cx, cy + 14);

    // Legend below donut
    const legendStartY = size + 20;
    const legendCols = 2;
    const colWidth = rect.width / legendCols;
    segments.slice(0, 8).forEach((seg, i) => {
      const col = i % legendCols;
      const row = Math.floor(i / legendCols);
      const x = col * colWidth + 12;
      const y = legendStartY + row * 18;

      const sectorDef = SECTORS.find(s => s.id === seg.sector) || OTHER_SECTOR;

      ctx.fillStyle = sectorDef.color;
      ctx.beginPath();
      ctx.arc(x + 4, y + 4, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = "10px 'Space Grotesk', sans-serif";
      ctx.fillStyle = "#e2e8f0";
      ctx.textAlign = "left";
      ctx.fillText(seg.sectorName, x + 14, y + 8);

      ctx.font = "9px 'JetBrains Mono', monospace";
      ctx.fillStyle = "#94a3b8";
      ctx.fillText(`${seg.share.toFixed(1)}%`, x + colWidth - 60, y + 8);
    });

  }, [data, totalCount]);

  return (
    <div className="glass-card p-4 h-full">
      <p className="text-xs font-display font-medium text-[var(--text-primary)] mb-2">
        Sector Distribution
      </p>
      <canvas
        ref={canvasRef}
        className="w-full"
        style={{ minHeight: 280, height: "100%" }}
      />
    </div>
  );
}
