"use client";

import { useEffect, useState } from "react";
import KPICard from "./KPICard";
import TrendChart from "./TrendChart";
import SectorDonut from "./SectorDonut";
import { formatBaht, formatNumber, formatPercent } from "@/lib/format";

interface OverviewData {
  totalRegistrations: number;
  totalCapital: number;
  avgCapital: number;
  topSector: { name: string; id: string; count: number; share: number } | null;
  topDistrict: { name: string; count: number } | null;
  ytdCount: number;
  ytdDelta: number;
  monthlyTrend: { snapshot_month: string; count: number; capital: number }[];
  sectorBreakdown: { sector: string; sectorName: string; count: number; capital: number; share: number }[];
}

export default function OverviewTab() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/overview")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="shimmer h-24 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="shimmer h-80 rounded-xl md:col-span-3" />
          <div className="shimmer h-80 rounded-xl md:col-span-2" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-[var(--text-muted)] font-mono text-sm">Failed to load overview data</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4 overflow-auto h-full">
      {/* KPI Command Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <KPICard
          label="Registrations YTD"
          value={formatNumber(data.ytdCount)}
          subtitle={`${formatPercent(data.ytdDelta)} vs last year`}
          accentColor="var(--accent-blue)"
          delay={0}
        />
        <KPICard
          label="Total Capital"
          value={formatBaht(data.totalCapital)}
          subtitle={`${formatNumber(data.totalRegistrations)} businesses`}
          accentColor="var(--accent-gold)"
          delay={100}
        />
        <KPICard
          label="Avg Capital / Biz"
          value={formatBaht(data.avgCapital)}
          subtitle="Per registration"
          accentColor="var(--accent-cyan)"
          delay={200}
        />
        <KPICard
          label="Top Sector"
          value={data.topSector?.name || "—"}
          subtitle={data.topSector ? `${data.topSector.share.toFixed(1)}% share` : ""}
          accentColor="var(--accent-green)"
          delay={300}
        />
        <KPICard
          label="Top District"
          value={data.topDistrict?.name || "—"}
          subtitle={data.topDistrict ? `${formatNumber(data.topDistrict.count)} registrations` : ""}
          accentColor="var(--accent-purple)"
          delay={400}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4" style={{ minHeight: 320 }}>
        <div className="md:col-span-3">
          <TrendChart data={data.monthlyTrend} />
        </div>
        <div className="md:col-span-2">
          <SectorDonut
            data={data.sectorBreakdown}
            totalCount={data.totalRegistrations}
          />
        </div>
      </div>
    </div>
  );
}
