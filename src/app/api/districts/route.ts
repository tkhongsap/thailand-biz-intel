import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSectorForCode } from "@/lib/sectors";
import { normalizeAmphurName, AMPHURS } from "@/lib/amphurs";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

interface Row {
  business_code: string;
  capital_thb: number;
  amphur: string;
  snapshot_month: string;
  company_name: string;
  registration_date: string;
}

function loadPopulationData(): Map<string, number> {
  const csvPath = path.join(process.cwd(), "data", "geo", "chiang-mai-population.csv");
  const csv = fs.readFileSync(csvPath, "utf-8");
  const lines = csv.split("\n").slice(1); // skip header
  const popMap = new Map<string, number>();

  for (const line of lines) {
    if (!line.trim()) continue;
    const parts = line.split(",");
    // ADM2_EN is at index 6, ADM2_PCODE at 7, T_TL at 10
    const nameEn = parts[6]?.trim();
    const totalPop = parseInt(parts[10]?.replace(/"/g, "").replace(/,/g, ""), 10);
    if (nameEn && !isNaN(totalPop)) {
      popMap.set(nameEn, totalPop);
    }
  }
  return popMap;
}

export async function GET() {
  try {
    const db = getDb();
    const allRows = db.prepare(
      "SELECT business_code, capital_thb, amphur, snapshot_month, company_name, registration_date FROM dbd_registrations"
    ).all() as Row[];

    const popMap = loadPopulationData();

    // Group by normalized amphur
    const districtData = new Map<string, {
      count: number;
      capital: number;
      sectors: Map<string, number>;
      monthly: Map<string, number>;
      recentRegistrations: { name: string; capital: number; sector: string; date: string }[];
    }>();

    for (const row of allRows) {
      const amphurName = normalizeAmphurName(row.amphur);
      if (!districtData.has(amphurName)) {
        districtData.set(amphurName, {
          count: 0,
          capital: 0,
          sectors: new Map(),
          monthly: new Map(),
          recentRegistrations: [],
        });
      }
      const data = districtData.get(amphurName)!;
      data.count++;
      data.capital += row.capital_thb || 0;

      const sector = getSectorForCode(row.business_code);
      data.sectors.set(sector.name, (data.sectors.get(sector.name) || 0) + 1);
      data.monthly.set(row.snapshot_month, (data.monthly.get(row.snapshot_month) || 0) + 1);

      data.recentRegistrations.push({
        name: row.company_name,
        capital: row.capital_thb || 0,
        sector: sector.name,
        date: row.registration_date,
      });
    }

    const result = Array.from(districtData.entries()).map(([name_th, data]) => {
      const amphur = AMPHURS.find((a) => a.name_th === name_th);
      const nameEn = amphur?.name_en || name_th;
      const population = popMap.get(nameEn) || 0;
      const businessDensity = population > 0 ? (data.count / population) * 10000 : 0;

      const topSectors = Array.from(data.sectors.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([sector, count]) => ({ sector, count }));

      const monthlyTrend = Array.from(data.monthly.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([month, count]) => ({ month, count }));

      const topRegistrations = data.recentRegistrations
        .sort((a, b) => b.capital - a.capital)
        .slice(0, 5);

      return {
        code: amphur?.code || "",
        name_th,
        name_en: nameEn,
        lat: amphur?.lat || 0,
        lon: amphur?.lon || 0,
        registrationCount: data.count,
        totalCapital: data.capital,
        avgCapital: data.count > 0 ? data.capital / data.count : 0,
        population,
        businessDensity: parseFloat(businessDensity.toFixed(1)),
        topSectors,
        monthlyTrend,
        topRegistrations,
      };
    }).sort((a, b) => b.registrationCount - a.registrationCount);

    return NextResponse.json({ districts: result });
  } catch (error) {
    console.error("Districts API error:", error);
    return NextResponse.json({ error: "Failed to fetch district data" }, { status: 500 });
  }
}
