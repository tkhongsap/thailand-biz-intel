"use client";

import { useEffect, useState } from "react";
import SectorTable from "./SectorTable";
import OpportunityMatrix from "./OpportunityMatrix";

interface SectorData {
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

export default function SectorsTab() {
  const [sectors, setSectors] = useState<SectorData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/sectors")
      .then((r) => r.json())
      .then((d) => { setSectors(d.sectors || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="shimmer h-64 rounded-xl" />
        <div className="shimmer h-72 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4 overflow-auto h-full">
      <SectorTable sectors={sectors} />
      <OpportunityMatrix sectors={sectors} />
    </div>
  );
}
