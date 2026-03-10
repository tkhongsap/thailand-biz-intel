import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSectorForCode, SECTORS, OTHER_SECTOR } from "@/lib/sectors";
import { normalizeAmphurName } from "@/lib/amphurs";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = getDb();

    const allRows = db.prepare(
      "SELECT business_code, capital_thb, amphur, snapshot_month FROM dbd_registrations"
    ).all() as { business_code: string; capital_thb: number; amphur: string; snapshot_month: string }[];

    const totalCount = allRows.length;
    const totalCapital = allRows.reduce((s, r) => s + (r.capital_thb || 0), 0);

    const sectorStats = new Map<string, { count: number; capital: number; color: string; icon: string }>();
    const districtStats = new Map<string, { count: number; capital: number }>();
    const monthlyStats = new Map<string, { count: number; capital: number }>();

    for (const row of allRows) {
      const sector = getSectorForCode(row.business_code);
      const s = sectorStats.get(sector.id) || { count: 0, capital: 0, color: sector.color, icon: sector.icon };
      s.count++;
      s.capital += row.capital_thb || 0;
      sectorStats.set(sector.id, s);

      const district = normalizeAmphurName(row.amphur);
      const d = districtStats.get(district) || { count: 0, capital: 0 };
      d.count++;
      d.capital += row.capital_thb || 0;
      districtStats.set(district, d);

      const m = monthlyStats.get(row.snapshot_month) || { count: 0, capital: 0 };
      m.count++;
      m.capital += row.capital_thb || 0;
      monthlyStats.set(row.snapshot_month, m);
    }

    const allSectors = [...SECTORS, OTHER_SECTOR];
    const sectors = Array.from(sectorStats.entries())
      .map(([id, data]) => {
        const def = allSectors.find(s => s.id === id) || OTHER_SECTOR;
        return {
          id,
          name: def.name,
          icon: data.icon,
          color: data.color,
          count: data.count,
          capital: data.capital,
          share: totalCount > 0 ? parseFloat(((data.count / totalCount) * 100).toFixed(1)) : 0,
        };
      })
      .sort((a, b) => b.count - a.count);

    const districts = Array.from(districtStats.entries())
      .map(([name, data]) => ({
        name,
        count: data.count,
        capital: data.capital,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const monthlyTrend = Array.from(monthlyStats.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, data]) => ({
        month,
        count: data.count,
        capital: data.capital,
      }));

    const avgMonthlyRegistrations = monthlyTrend.length > 0
      ? Math.round(totalCount / monthlyTrend.length)
      : 0;

    const avgMonthlyCapital = monthlyTrend.length > 0
      ? totalCapital / monthlyTrend.length
      : 0;

    return NextResponse.json({
      baseline: {
        totalRegistrations: totalCount,
        totalCapital,
        avgMonthlyRegistrations,
        avgMonthlyCapital,
        monthCount: monthlyTrend.length,
      },
      sectors,
      districts,
      monthlyTrend,
    });
  } catch (error) {
    console.error("Simulator API error:", error);
    return NextResponse.json({ error: "Failed to fetch simulator data" }, { status: 500 });
  }
}
