import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSectorForCode, SECTORS } from "@/lib/sectors";
import { normalizeAmphurName, AMPHURS } from "@/lib/amphurs";

export const dynamic = "force-dynamic";

interface GraphNode {
  id: string;
  label: string;
  type: "sector" | "district" | "size";
  color: string;
  value: number; // for sizing
  icon?: string;
}

interface GraphEdge {
  source: string;
  target: string;
  weight: number;
  label?: string;
}

export async function GET() {
  try {
    const db = getDb();
    const allRows = db.prepare(
      "SELECT business_code, capital_thb, amphur FROM dbd_registrations"
    ).all() as { business_code: string; capital_thb: number; amphur: string }[];

    // Sector aggregation
    const sectorCounts = new Map<string, number>();
    const districtCounts = new Map<string, number>();
    const sectorDistrictEdges = new Map<string, number>(); // "sector|district" -> count
    const sectorSizeEdges = new Map<string, number>(); // "sector|size" -> count

    const sizeTiers = [
      { id: "micro", label: "Micro (<100K)", min: 0, max: 100000, color: "#64748b" },
      { id: "small", label: "Small (100K-1M)", min: 100000, max: 1000000, color: "#06b6d4" },
      { id: "medium", label: "Medium (1M-10M)", min: 1000000, max: 10000000, color: "#d4a843" },
      { id: "large", label: "Large (10M+)", min: 10000000, max: Infinity, color: "#8b5cf6" },
    ];

    const getSizeTier = (capital: number) => {
      return sizeTiers.find(t => capital >= t.min && capital < t.max) || sizeTiers[0];
    };

    for (const row of allRows) {
      const sector = getSectorForCode(row.business_code);
      const district = normalizeAmphurName(row.amphur);
      const size = getSizeTier(row.capital_thb || 0);

      sectorCounts.set(sector.id, (sectorCounts.get(sector.id) || 0) + 1);
      districtCounts.set(district, (districtCounts.get(district) || 0) + 1);

      const sdKey = `sector-${sector.id}|district-${district}`;
      sectorDistrictEdges.set(sdKey, (sectorDistrictEdges.get(sdKey) || 0) + 1);

      const ssKey = `sector-${sector.id}|size-${size.id}`;
      sectorSizeEdges.set(ssKey, (sectorSizeEdges.get(ssKey) || 0) + 1);
    }

    // Top 10 sectors
    const topSectors = Array.from(sectorCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    // Top 10 districts
    const topDistricts = Array.from(districtCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    // Build nodes
    const nodes: GraphNode[] = [];

    for (const [sectorId, count] of topSectors) {
      const sectorDef = SECTORS.find(s => s.id === sectorId);
      nodes.push({
        id: `sector-${sectorId}`,
        label: sectorDef?.name || sectorId,
        type: "sector",
        color: sectorDef?.color || "#64748b",
        value: count,
        icon: sectorDef?.icon,
      });
    }

    for (const [district, count] of topDistricts) {
      const amphur = AMPHURS.find(a => a.name_th === district);
      nodes.push({
        id: `district-${district}`,
        label: amphur?.name_en || district,
        type: "district",
        color: "#22c55e",
        value: count,
      });
    }

    for (const tier of sizeTiers) {
      nodes.push({
        id: `size-${tier.id}`,
        label: tier.label,
        type: "size",
        color: tier.color,
        value: 0, // will be filled
      });
    }

    // Build edges (only for top sectors/districts)
    const topSectorIds = new Set(topSectors.map(([id]) => `sector-${id}`));
    const topDistrictIds = new Set(topDistricts.map(([name]) => `district-${name}`));

    const edges: GraphEdge[] = [];

    Array.from(sectorDistrictEdges.entries()).forEach(([key, weight]) => {
      const [source, target] = key.split("|");
      if (topSectorIds.has(source) && topDistrictIds.has(target) && weight >= 5) {
        edges.push({ source, target, weight });
      }
    });

    Array.from(sectorSizeEdges.entries()).forEach(([key, weight]) => {
      const [source, target] = key.split("|");
      if (topSectorIds.has(source)) {
        edges.push({ source, target, weight });
      }
    });

    return NextResponse.json({ nodes, edges });
  } catch (error) {
    console.error("Graph API error:", error);
    return NextResponse.json({ error: "Failed to build graph data" }, { status: 500 });
  }
}
