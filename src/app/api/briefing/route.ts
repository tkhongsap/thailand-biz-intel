import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSectorForCode, SECTORS, OTHER_SECTOR } from "@/lib/sectors";
import { normalizeAmphurName } from "@/lib/amphurs";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = getDb();

    const allRows = db.prepare(
      "SELECT business_code, capital_thb, amphur, snapshot_month, company_name, registration_date FROM dbd_registrations"
    ).all() as {
      business_code: string;
      capital_thb: number;
      amphur: string;
      snapshot_month: string;
      company_name: string;
      registration_date: string;
    }[];

    const totalCount = allRows.length;
    const totalCapital = allRows.reduce((s, r) => s + (r.capital_thb || 0), 0);
    const avgCapital = totalCount > 0 ? totalCapital / totalCount : 0;

    const sectorData = new Map<string, { count: number; capital: number; y2025: number; y2026: number }>();
    const districtData = new Map<string, { count: number; capital: number; y2025: number; y2026: number }>();
    const monthlyData = new Map<string, { count: number; capital: number }>();

    for (const row of allRows) {
      const sector = getSectorForCode(row.business_code);
      const s = sectorData.get(sector.id) || { count: 0, capital: 0, y2025: 0, y2026: 0 };
      s.count++;
      s.capital += row.capital_thb || 0;
      if (row.snapshot_month.startsWith("2025")) s.y2025++;
      if (row.snapshot_month.startsWith("2026")) s.y2026++;
      sectorData.set(sector.id, s);

      const district = normalizeAmphurName(row.amphur);
      const d = districtData.get(district) || { count: 0, capital: 0, y2025: 0, y2026: 0 };
      d.count++;
      d.capital += row.capital_thb || 0;
      if (row.snapshot_month.startsWith("2025")) d.y2025++;
      if (row.snapshot_month.startsWith("2026")) d.y2026++;
      districtData.set(district, d);

      const m = monthlyData.get(row.snapshot_month) || { count: 0, capital: 0 };
      m.count++;
      m.capital += row.capital_thb || 0;
      monthlyData.set(row.snapshot_month, m);
    }

    const allSectors = [...SECTORS, OTHER_SECTOR];

    const sectorInsights = Array.from(sectorData.entries())
      .map(([id, data]) => {
        const def = allSectors.find(s => s.id === id) || OTHER_SECTOR;
        const annualized2026 = data.y2026 > 0 ? (data.y2026 / 2) * 12 : 0;
        const growthRate = data.y2025 > 0 ? ((annualized2026 - data.y2025) / data.y2025) * 100 : 0;
        return {
          id,
          name: def.name,
          icon: def.icon,
          color: def.color,
          count: data.count,
          capital: data.capital,
          growthRate: parseFloat(growthRate.toFixed(1)),
          share: parseFloat(((data.count / totalCount) * 100).toFixed(1)),
        };
      })
      .sort((a, b) => b.count - a.count);

    const topGrowing = [...sectorInsights]
      .filter(s => s.count >= 20)
      .sort((a, b) => b.growthRate - a.growthRate)
      .slice(0, 3);

    const declining = [...sectorInsights]
      .filter(s => s.count >= 20 && s.growthRate < 0)
      .sort((a, b) => a.growthRate - b.growthRate)
      .slice(0, 3);

    const districtInsights = Array.from(districtData.entries())
      .map(([name, data]) => {
        const annualized2026 = data.y2026 > 0 ? (data.y2026 / 2) * 12 : 0;
        const growthRate = data.y2025 > 0 ? ((annualized2026 - data.y2025) / data.y2025) * 100 : 0;
        return {
          name,
          count: data.count,
          capital: data.capital,
          growthRate: parseFloat(growthRate.toFixed(1)),
        };
      })
      .sort((a, b) => b.count - a.count);

    const emergingDistricts = [...districtInsights]
      .filter(d => d.count >= 10)
      .sort((a, b) => b.growthRate - a.growthRate)
      .slice(0, 3);

    const topCapitalDistricts = [...districtInsights]
      .sort((a, b) => b.capital - a.capital)
      .slice(0, 3);

    const recentNotable = allRows
      .filter(r => (r.capital_thb || 0) >= 1000000)
      .sort((a, b) => (b.capital_thb || 0) - (a.capital_thb || 0))
      .slice(0, 10)
      .map(r => ({
        name: r.company_name,
        capital: r.capital_thb,
        sector: getSectorForCode(r.business_code).name,
        sectorColor: getSectorForCode(r.business_code).color,
        district: normalizeAmphurName(r.amphur),
        date: r.registration_date,
      }));

    const monthlyTrend = Array.from(monthlyData.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, data]) => ({ month, count: data.count, capital: data.capital }));

    const latestMonth = monthlyTrend[monthlyTrend.length - 1];
    const prevMonth = monthlyTrend.length > 1 ? monthlyTrend[monthlyTrend.length - 2] : null;
    const monthOverMonth = prevMonth
      ? parseFloat((((latestMonth.count - prevMonth.count) / prevMonth.count) * 100).toFixed(1))
      : 0;

    const top5Sectors = sectorInsights.slice(0, 5);
    const top5Concentration = top5Sectors.reduce((s, sec) => s + sec.share, 0);

    const opportunities = topGrowing.map(s => ({
      type: "opportunity" as const,
      title: `${s.icon} ${s.name} Sector Accelerating`,
      description: `${s.name} shows ${s.growthRate > 0 ? "+" : ""}${s.growthRate}% annualized growth with ${s.count} registrations and ฿${(s.capital / 1_000_000).toFixed(1)}M total capital.`,
      metric: `${s.growthRate > 0 ? "+" : ""}${s.growthRate}%`,
      color: s.color,
    }));

    const risks = [
      ...declining.map(s => ({
        type: "risk" as const,
        title: `${s.icon} ${s.name} Sector Contraction`,
        description: `${s.name} registrations declining at ${s.growthRate}% annualized rate. Monitor for sustained downturn.`,
        metric: `${s.growthRate}%`,
        color: "#ef4444",
      })),
      ...(top5Concentration > 70 ? [{
        type: "risk" as const,
        title: "⚠️ High Sector Concentration",
        description: `Top 5 sectors account for ${top5Concentration.toFixed(1)}% of all registrations. Economic diversification may be limited.`,
        metric: `${top5Concentration.toFixed(0)}%`,
        color: "#f59e0b",
      }] : []),
    ];

    const trends = emergingDistricts.map(d => ({
      type: "trend" as const,
      title: `📍 ${d.name} District Emerging`,
      description: `${d.name} shows ${d.growthRate > 0 ? "+" : ""}${d.growthRate}% growth with ${d.count} registrations. Capital inflow: ฿${(d.capital / 1_000_000).toFixed(1)}M.`,
      metric: `${d.growthRate > 0 ? "+" : ""}${d.growthRate}%`,
      color: "#0ea5e9",
    }));

    return NextResponse.json({
      generatedAt: new Date().toISOString(),
      summary: {
        totalRegistrations: totalCount,
        totalCapital,
        avgCapital,
        activeSectors: sectorInsights.length,
        activeDistricts: districtInsights.length,
        latestMonthCount: latestMonth?.count || 0,
        monthOverMonth,
      },
      insights: [...opportunities, ...risks, ...trends],
      topSectors: sectorInsights.slice(0, 5),
      capitalHotspots: topCapitalDistricts,
      recentNotable,
      monthlyTrend,
    });
  } catch (error) {
    console.error("Briefing API error:", error);
    return NextResponse.json({ error: "Failed to generate briefing" }, { status: 500 });
  }
}
