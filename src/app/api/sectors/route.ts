import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSectorForCode, SECTORS, OTHER_SECTOR, type SectorDef } from "@/lib/sectors";
import { normalizeAmphurName } from "@/lib/amphurs";

export const dynamic = "force-dynamic";

interface Row {
  business_code: string;
  capital_thb: number;
  amphur: string;
  snapshot_month: string;
  company_name: string;
  registration_date: string;
}

export async function GET() {
  try {
    const db = getDb();
    const allRows = db.prepare(
      "SELECT business_code, capital_thb, amphur, snapshot_month, company_name, registration_date FROM dbd_registrations"
    ).all() as Row[];

    const totalCount = allRows.length;

    // Group by sector
    const sectorData = new Map<string, {
      def: SectorDef;
      count: number;
      capital: number;
      districts: Map<string, number>;
      monthly: Map<string, number>;
      companies: { name: string; capital: number; date: string; district: string }[];
      yearCounts: Map<string, number>;
    }>();

    for (const row of allRows) {
      const sector = getSectorForCode(row.business_code);
      if (!sectorData.has(sector.id)) {
        sectorData.set(sector.id, {
          def: sector,
          count: 0,
          capital: 0,
          districts: new Map(),
          monthly: new Map(),
          companies: [],
          yearCounts: new Map(),
        });
      }
      const data = sectorData.get(sector.id)!;
      data.count++;
      data.capital += row.capital_thb || 0;

      const district = normalizeAmphurName(row.amphur);
      data.districts.set(district, (data.districts.get(district) || 0) + 1);
      data.monthly.set(row.snapshot_month, (data.monthly.get(row.snapshot_month) || 0) + 1);

      const year = row.snapshot_month.slice(0, 4);
      data.yearCounts.set(year, (data.yearCounts.get(year) || 0) + 1);

      data.companies.push({
        name: row.company_name,
        capital: row.capital_thb || 0,
        date: row.registration_date,
        district,
      });
    }

    const result = Array.from(sectorData.values()).map((data) => {
      const topDistricts = Array.from(data.districts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));

      const monthlyTrend = Array.from(data.monthly.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([month, count]) => ({ month, count }));

      // Growth rate: compare 2026 vs 2025 (annualized)
      const count2025 = data.yearCounts.get("2025") || 0;
      const count2026 = data.yearCounts.get("2026") || 0;
      // Annualize 2026 (2 months) to compare with 2025 (12 months)
      const months2026 = 2; // Jan + Feb
      const annualized2026 = months2026 > 0 ? (count2026 / months2026) * 12 : 0;
      const growthRate = count2025 > 0 ? ((annualized2026 - count2025) / count2025) * 100 : 0;

      const topCompanies = data.companies
        .sort((a, b) => b.capital - a.capital)
        .slice(0, 10);

      return {
        id: data.def.id,
        name: data.def.name,
        icon: data.def.icon,
        color: data.def.color,
        registrationCount: data.count,
        totalCapital: data.capital,
        avgCapital: data.count > 0 ? data.capital / data.count : 0,
        growthRate: parseFloat(growthRate.toFixed(1)),
        marketShare: parseFloat(((data.count / totalCount) * 100).toFixed(1)),
        topDistricts,
        monthlyTrend,
        topCompanies,
      };
    }).sort((a, b) => b.registrationCount - a.registrationCount);

    return NextResponse.json({ sectors: result });
  } catch (error) {
    console.error("Sectors API error:", error);
    return NextResponse.json({ error: "Failed to fetch sector data" }, { status: 500 });
  }
}
