import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSectorForCode } from "@/lib/sectors";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = getDb();
    const allRows = db.prepare(
      "SELECT business_code, capital_thb, snapshot_month, company_name, amphur, registration_date FROM dbd_registrations ORDER BY capital_thb DESC"
    ).all() as {
      business_code: string;
      capital_thb: number;
      snapshot_month: string;
      company_name: string;
      amphur: string;
      registration_date: string;
    }[];

    // Monthly capital by sector
    const monthlyMap = new Map<string, Map<string, number>>();
    for (const row of allRows) {
      const sector = getSectorForCode(row.business_code);
      if (!monthlyMap.has(row.snapshot_month)) {
        monthlyMap.set(row.snapshot_month, new Map());
      }
      const sectorMap = monthlyMap.get(row.snapshot_month)!;
      sectorMap.set(sector.name, (sectorMap.get(sector.name) || 0) + (row.capital_thb || 0));
    }

    const monthlyCapital = Array.from(monthlyMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, sectors]) => ({
        month,
        sectors: Array.from(sectors.entries())
          .map(([name, capital]) => ({ name, capital }))
          .sort((a, b) => b.capital - a.capital),
      }));

    // Capital distribution
    const ranges = [
      { label: "Micro (<100K)", min: 0, max: 100000 },
      { label: "Small (100K-1M)", min: 100000, max: 1000000 },
      { label: "Medium (1M-10M)", min: 1000000, max: 10000000 },
      { label: "Large (10M+)", min: 10000000, max: Infinity },
    ];

    const capitalDistribution = ranges.map((range) => {
      const matching = allRows.filter(
        (r) => (r.capital_thb || 0) >= range.min && (r.capital_thb || 0) < range.max
      );
      return {
        range: range.label,
        count: matching.length,
        totalCapital: matching.reduce((s, r) => s + (r.capital_thb || 0), 0),
      };
    });

    // Top 20 registrations by capital
    const topRegistrations = allRows.slice(0, 20).map((row) => ({
      name: row.company_name,
      capital: row.capital_thb,
      sector: getSectorForCode(row.business_code).name,
      district: row.amphur,
      date: row.registration_date,
    }));

    return NextResponse.json({
      monthlyCapital,
      capitalDistribution,
      topRegistrations,
    });
  } catch (error) {
    console.error("Capital API error:", error);
    return NextResponse.json({ error: "Failed to fetch capital data" }, { status: 500 });
  }
}
