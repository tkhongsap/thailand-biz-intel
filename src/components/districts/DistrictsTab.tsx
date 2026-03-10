"use client";

import { useEffect, useState } from "react";
import DistrictMap from "./DistrictMap";
import DistrictDetail from "./DistrictDetail";

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

export default function DistrictsTab() {
  const [districts, setDistricts] = useState<DistrictData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictData | null>(null);

  useEffect(() => {
    fetch("/api/districts")
      .then((r) => r.json())
      .then((d) => { setDistricts(d.districts || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col md:flex-row h-full p-4 gap-4">
        <div className="shimmer flex-1 rounded-xl min-h-[300px]" />
        <div className="shimmer w-full md:w-[320px] rounded-xl min-h-[200px]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-full gap-4 p-4 overflow-auto md:overflow-hidden">
      <div className="flex-1 min-h-[300px] md:min-h-0">
        <DistrictMap
          districts={districts}
          selectedDistrict={selectedDistrict}
          onSelectDistrict={setSelectedDistrict}
        />
      </div>

      <div className="w-full md:w-[320px] glass-card overflow-hidden shrink-0">
        <DistrictDetail district={selectedDistrict} />
      </div>
    </div>
  );
}
