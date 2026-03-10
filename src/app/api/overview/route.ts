import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSectorForCode } from "@/lib/sectors";
import { normalizeAmphurName } from "@/lib/amphurs";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = getDb();

    // Total registrations
    const totalRow = db.prepare("SELECT COUNT(*) as count, SUM(capital_thb) as capital, AVG(capital_thb) as avg FROM dbd_registrations").get() as { count: number; capital: number; avg: number };

    // Monthly trend
    const monthlyRaw = db.prepare(
      "SELECT snapshot_month, COUNT(*) as count, SUM(capital_thb) as capital FROM dbd_registrations GROUP BY snapshot_month ORDER BY snapshot_month"
    ).all() as { snapshot_month: string; count: number; capital: number }[];

    // Sector breakdown
    const allRows = db.prepare("SELECT business_code, capital_thb FROM dbd_registrations").all() as { business_code: string; capital_thb: number }[];
    
    const sectorMap = new Map<string, { count: number; capital: number }>();
    for (const row of allRows) {
      const sector = getSectorForCode(row.business_code);
      const existing = sectorMap.get(sector.id) || { count: 0, capital: 0 };
      existing.count += 1;
      existing.capital += row.capital_thb || 0;
      sectorMap.set(sector.id, existing);
    }

    const sectorBreakdown = Array.from(sectorMap.entries())
      .map(([id, data]) => ({
        sector: id,
        sectorName: getSectorForCode("0").name, // will fix below
        count: data.count,
        capital: data.capital,
        share: totalRow.count > 0 ? (data.count / totalRow.count) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);

    // Fix sector names
    const { SECTORS, OTHER_SECTOR } = await import("@/lib/sectors");
    for (const item of sectorBreakdown) {
      const found = SECTORS.find(s => s.id === item.sector) || OTHER_SECTOR;
      item.sectorName = found.name;
    }

    const topSector = sectorBreakdown[0];

    // District breakdown
    const districtRows = db.prepare(
      "SELECT amphur, COUNT(*) as count FROM dbd_registrations GROUP BY amphur ORDER BY count DESC"
    ).all() as { amphur: string; count: number }[];

    // Normalize and merge districts
    const districtMerged = new Map<string, number>();
    for (const d of districtRows) {
      const normalized = normalizeAmphurName(d.amphur);
      districtMerged.set(normalized, (districtMerged.get(normalized) || 0) + d.count);
    }
    const topDistricts = Array.from(districtMerged.entries())
      .sort((a, b) => b[1] - a[1]);
    const topDistrict = topDistricts[0];

    // YTD vs last year
    const currentYear = "2026";
    const lastYear = "2025";
    const ytdCount = monthlyRaw.filter(m => m.snapshot_month.startsWith(currentYear)).reduce((s, m) => s + m.count, 0);
    const lastYearCount = monthlyRaw.filter(m => m.snapshot_month.startsWith(lastYear)).reduce((s, m) => s + m.count, 0);
    // Compare same months
    const currentMonths = monthlyRaw.filter(m => m.snapshot_month.startsWith(currentYear)).map(m => m.snapshot_month.slice(4));
    const lastYearSameMonths = monthlyRaw.filter(m => m.snapshot_month.startsWith(lastYear) && currentMonths.includes(m.snapshot_month.slice(4)));
    const lastYearSameCount = lastYearSameMonths.reduce((s, m) => s + m.count, 0);
    const ytdDelta = lastYearSameCount > 0 ? ((ytdCount - lastYearSameCount) / lastYearSameCount) * 100 : 0;

    return NextResponse.json({
      totalRegistrations: totalRow.count,
      totalCapital: totalRow.capital,
      avgCapital: totalRow.avg,
      topSector: topSector ? { name: topSector.sectorName, id: topSector.sector, count: topSector.count, share: topSector.share } : null,
      topDistrict: topDistrict ? { name: topDistrict[0], count: topDistrict[1] } : null,
      ytdCount,
      ytdDelta,
      monthlyTrend: monthlyRaw,
      sectorBreakdown: sectorBreakdown.map(s => ({
        sector: s.sector,
        sectorName: s.sectorName,
        count: s.count,
        capital: s.capital,
        share: parseFloat(s.share.toFixed(1)),
      })),
    });
  } catch (error) {
    console.error("Overview API error:", error);
    return NextResponse.json({ error: "Failed to fetch overview data" }, { status: 500 });
  }
}
