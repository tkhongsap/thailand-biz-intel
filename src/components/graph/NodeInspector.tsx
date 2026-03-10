"use client";

import { useEffect, useState } from "react";
import { formatBaht, formatNumber } from "@/lib/format";
import type { GraphNode, GraphEdge } from "./KnowledgeGraphCanvas";

interface InspectorData {
  registrationCount?: number;
  totalCapital?: number;
  avgCapital?: number;
  growthRate?: number;
  marketShare?: number;
  population?: number;
  businessDensity?: number;
  topDistricts?: { name: string; count: number }[];
  topSectors?: { sector: string; count: number }[];
}

interface NodeInspectorProps {
  node: GraphNode | null;
  edges: GraphEdge[];
  allNodes: GraphNode[];
  onNodeSelect: (node: GraphNode | null) => void;
}

function MiniBarChart({ items, maxVal }: { items: { label: string; value: number; color?: string }[]; maxVal: number }) {
  return (
    <div className="space-y-1.5">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="font-mono text-[9px] text-[var(--text-secondary)] w-20 truncate">{item.label}</span>
          <div className="flex-1 h-3 bg-[var(--bg-panel)] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${maxVal > 0 ? (item.value / maxVal) * 100 : 0}%`,
                backgroundColor: item.color || "var(--accent-blue)",
              }}
            />
          </div>
          <span className="font-mono text-[9px] text-[var(--text-muted)] w-8 text-right">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function NodeInspector({ node, edges, allNodes, onNodeSelect }: NodeInspectorProps) {
  const [data, setData] = useState<InspectorData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!node) { setData(null); return; }

    setLoading(true);

    if (node.type === "sector") {
      fetch("/api/sectors")
        .then((r) => r.json())
        .then((d) => {
          const sectorId = node.id.replace("sector-", "");
          const sector = d.sectors?.find((s: { id: string }) => s.id === sectorId);
          if (sector) {
            setData({
              registrationCount: sector.registrationCount,
              totalCapital: sector.totalCapital,
              avgCapital: sector.avgCapital,
              growthRate: sector.growthRate,
              marketShare: sector.marketShare,
              topDistricts: sector.topDistricts,
            });
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else if (node.type === "district") {
      fetch("/api/districts")
        .then((r) => r.json())
        .then((d) => {
          const districtName = node.id.replace("district-", "");
          const district = d.districts?.find((dd: { name_th: string }) => dd.name_th === districtName);
          if (district) {
            setData({
              registrationCount: district.registrationCount,
              totalCapital: district.totalCapital,
              population: district.population,
              businessDensity: district.businessDensity,
              topSectors: district.topSectors,
            });
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      // Size tier node
      setData({ registrationCount: node.value });
      setLoading(false);
    }
  }, [node]);

  // Connected nodes
  const connectedEdges = node
    ? edges.filter((e) => e.source === node.id || e.target === node.id)
    : [];
  const connectedNodeIds = connectedEdges.map((e) =>
    e.source === node?.id ? e.target : e.source
  );
  const connectedNodes = allNodes.filter((n) => connectedNodeIds.includes(n.id));

  if (!node) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[var(--text-muted)]">
        <div className="w-12 h-12 rounded-full bg-[var(--bg-panel)] flex items-center justify-center mb-3">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <p className="text-sm font-display">Select a node to inspect</p>
        <p className="text-xs font-mono mt-1">Click any node on the graph</p>
      </div>
    );
  }

  return (
    <div className="fade-in-up space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: node.color }} />
        <span className="font-display font-semibold text-sm text-[var(--text-primary)] flex-1 truncate">
          {node.label}
        </span>
        <span className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--bg-panel)] text-[var(--text-muted)]">
          {node.type}
        </span>
      </div>

      {loading ? (
        <div className="space-y-2">
          <div className="shimmer h-16 rounded-lg" />
          <div className="shimmer h-20 rounded-lg" />
        </div>
      ) : data ? (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 gap-2">
            {data.registrationCount !== undefined && (
              <div className="glass-card p-2.5">
                <p className="font-mono text-[8px] uppercase tracking-wider text-[var(--text-muted)]">Registrations</p>
                <p className="font-display text-lg font-bold text-[var(--accent-blue)]">
                  {formatNumber(data.registrationCount)}
                </p>
              </div>
            )}
            {data.totalCapital !== undefined && (
              <div className="glass-card p-2.5">
                <p className="font-mono text-[8px] uppercase tracking-wider text-[var(--text-muted)]">Capital</p>
                <p className="font-display text-lg font-bold text-[var(--accent-gold)]">
                  {formatBaht(data.totalCapital)}
                </p>
              </div>
            )}
            {data.avgCapital !== undefined && (
              <div className="glass-card p-2.5">
                <p className="font-mono text-[8px] uppercase tracking-wider text-[var(--text-muted)]">Avg Capital</p>
                <p className="font-display text-sm font-bold text-[var(--accent-cyan)]">
                  {formatBaht(data.avgCapital)}
                </p>
              </div>
            )}
            {data.growthRate !== undefined && (
              <div className="glass-card p-2.5">
                <p className="font-mono text-[8px] uppercase tracking-wider text-[var(--text-muted)]">Growth YoY</p>
                <p className={`font-display text-sm font-bold ${data.growthRate >= 0 ? "text-[var(--accent-green)]" : "text-[var(--accent-red)]"}`}>
                  {data.growthRate >= 0 ? "▲" : "▼"} {Math.abs(data.growthRate).toFixed(1)}%
                </p>
              </div>
            )}
            {data.marketShare !== undefined && (
              <div className="glass-card p-2.5">
                <p className="font-mono text-[8px] uppercase tracking-wider text-[var(--text-muted)]">Market Share</p>
                <p className="font-display text-sm font-bold text-[var(--accent-purple)]">
                  {data.marketShare.toFixed(1)}%
                </p>
              </div>
            )}
            {data.population !== undefined && data.population > 0 && (
              <div className="glass-card p-2.5">
                <p className="font-mono text-[8px] uppercase tracking-wider text-[var(--text-muted)]">Population</p>
                <p className="font-display text-sm font-bold text-[var(--text-primary)]">
                  {formatNumber(data.population)}
                </p>
              </div>
            )}
            {data.businessDensity !== undefined && data.businessDensity > 0 && (
              <div className="glass-card p-2.5">
                <p className="font-mono text-[8px] uppercase tracking-wider text-[var(--text-muted)]">Biz/10K Pop</p>
                <p className="font-display text-sm font-bold text-[var(--accent-cyan)]">
                  {data.businessDensity.toFixed(1)}
                </p>
              </div>
            )}
          </div>

          {/* Mini bar charts */}
          {data.topDistricts && data.topDistricts.length > 0 && (
            <div className="glass-card p-3">
              <p className="font-mono text-[9px] uppercase tracking-wider text-[var(--text-muted)] mb-2">Top Districts</p>
              <MiniBarChart
                items={data.topDistricts.map((d) => ({ label: d.name, value: d.count, color: "var(--accent-green)" }))}
                maxVal={Math.max(...data.topDistricts.map((d) => d.count))}
              />
            </div>
          )}
          {data.topSectors && data.topSectors.length > 0 && (
            <div className="glass-card p-3">
              <p className="font-mono text-[9px] uppercase tracking-wider text-[var(--text-muted)] mb-2">Top Sectors</p>
              <MiniBarChart
                items={data.topSectors.map((s) => ({ label: s.sector, value: s.count }))}
                maxVal={Math.max(...data.topSectors.map((s) => s.count))}
              />
            </div>
          )}
        </>
      ) : null}

      {/* Connections */}
      {connectedNodes.length > 0 && (
        <div className="glass-card p-3">
          <p className="font-mono text-[9px] uppercase tracking-wider text-[var(--text-muted)] mb-2">
            Connections ({connectedNodes.length})
          </p>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {connectedNodes.map((cn) => {
              const edge = connectedEdges.find(
                (e) => e.source === cn.id || e.target === cn.id
              );
              return (
                <button
                  key={cn.id}
                  onClick={() => onNodeSelect(cn)}
                  className="flex items-center gap-2 w-full px-2 py-1 rounded hover:bg-white/5 transition-colors text-left"
                >
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cn.color }} />
                  <span className="text-xs text-[var(--text-primary)] flex-1 truncate">{cn.label}</span>
                  {edge && (
                    <span className="font-mono text-[9px] text-[var(--text-muted)]">{edge.weight}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
