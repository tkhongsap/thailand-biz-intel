"use client";

import { useEffect, useRef, useState } from "react";

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

type Metric = "registrationCount" | "totalCapital" | "businessDensity";

interface DistrictMapProps {
  districts: DistrictData[];
  selectedDistrict: DistrictData | null;
  onSelectDistrict: (d: DistrictData | null) => void;
}

// Simple canvas-based choropleth that renders district positions
// We use a simplified representation since Leaflet SSR is tricky
export default function DistrictMap({ districts, selectedDistrict, onSelectDistrict }: DistrictMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [metric, setMetric] = useState<Metric>("registrationCount");
  const [hovered, setHovered] = useState<string | null>(null);
  const [geoData, setGeoData] = useState<GeoJSON.FeatureCollection | null>(null);

  useEffect(() => {
    fetch("/api/geo")
      .then((r) => r.json())
      .then((d) => setGeoData(d))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || districts.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;

    ctx.clearRect(0, 0, w, h);

    // Get metric values
    const values = districts.map((d) => d[metric] as number);
    const maxVal = Math.max(...values);
    const minVal = Math.min(...values);

    if (geoData && geoData.features) {
      // Project GeoJSON to canvas
      // Find bounds
      let minLon = Infinity, maxLon = -Infinity, minLat = Infinity, maxLat = -Infinity;
      for (const feature of geoData.features) {
        const coords = getAllCoords(feature.geometry);
        for (const [lon, lat] of coords) {
          if (lon < minLon) minLon = lon;
          if (lon > maxLon) maxLon = lon;
          if (lat < minLat) minLat = lat;
          if (lat > maxLat) maxLat = lat;
        }
      }

      const pad = 20;
      const scaleX = (w - pad * 2) / (maxLon - minLon);
      const scaleY = (h - pad * 2) / (maxLat - minLat);
      const scale = Math.min(scaleX, scaleY);
      const offsetX = pad + ((w - pad * 2) - (maxLon - minLon) * scale) / 2;
      const offsetY = pad + ((h - pad * 2) - (maxLat - minLat) * scale) / 2;

      const project = (lon: number, lat: number): [number, number] => [
        offsetX + (lon - minLon) * scale,
        offsetY + (maxLat - lat) * scale, // flip Y
      ];

      for (const feature of geoData.features) {
        const props = feature.properties as { code?: string; name_th?: string; name_en?: string };
        const districtInfo = districts.find((d) => d.code === props?.code || d.name_th === props?.name_th);
        const val = districtInfo ? (districtInfo[metric] as number) : 0;
        const norm = maxVal > minVal ? (val - minVal) / (maxVal - minVal) : 0;

        const isHov = hovered === props?.code;
        const isSel = selectedDistrict?.code === props?.code;

        // Color scale: dark blue to bright blue
        const r2 = Math.round(10 + norm * 4);
        const g = Math.round(30 + norm * 135);
        const b = Math.round(60 + norm * 173);
        ctx.fillStyle = `rgba(${r2}, ${g}, ${b}, ${isHov || isSel ? 0.95 : 0.7})`;
        ctx.strokeStyle = isHov || isSel ? "#0ea5e9" : "rgba(30, 48, 68, 0.8)";
        ctx.lineWidth = isHov || isSel ? 2 : 0.5;

        drawGeometry(ctx, feature.geometry, project);
        ctx.fill();
        ctx.stroke();

        // Label
        const propsAny = props as Record<string, unknown>;
        if (propsAny.centroid || (districtInfo?.code)) {
          const centroid = propsAny.centroid as [number, number] | undefined;
          if (centroid) {
            const [px, py] = project(centroid[0], centroid[1]);
            ctx.font = "9px 'JetBrains Mono', monospace";
            ctx.fillStyle = norm > 0.5 ? "#fff" : "#94a3b8";
            ctx.textAlign = "center";
            ctx.fillText(props?.name_en || "", px, py);
          }
        }
      }
    }

    // Legend
    const legendW = 120;
    const legendH = 10;
    const lx = w - legendW - 16;
    const ly = h - 30;
    const grad = ctx.createLinearGradient(lx, ly, lx + legendW, ly);
    grad.addColorStop(0, "rgba(10, 30, 60, 0.7)");
    grad.addColorStop(1, "rgba(14, 165, 233, 0.9)");
    ctx.fillStyle = grad;
    ctx.fillRect(lx, ly, legendW, legendH);
    ctx.strokeStyle = "var(--border-subtle)";
    ctx.strokeRect(lx, ly, legendW, legendH);

    ctx.font = "8px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#94a3b8";
    ctx.textAlign = "left";
    ctx.fillText("Low", lx, ly + 22);
    ctx.textAlign = "right";
    ctx.fillText("High", lx + legendW, ly + 22);

  }, [districts, metric, hovered, selectedDistrict, geoData]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!geoData || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    // Hit test against district centroids
    for (const d of districts) {
      const feature = geoData.features.find((f) => {
        const props = f.properties as { code?: string; name_th?: string };
        return props?.code === d.code || props?.name_th === d.name_th;
      });
      if (feature) {
        const centroid = (feature.properties as Record<string, unknown>).centroid as [number, number] | undefined;
        if (centroid) {
          // Quick bounding check - compute projection inline
          // For simplicity, click on any part of the feature area
        }
      }
    }

    // Simplified: find closest district to click
    const w = rect.width;
    const h = rect.height;
    let minLon = Infinity, maxLon = -Infinity, minLat = Infinity, maxLat = -Infinity;
    for (const feature of geoData.features) {
      const coords = getAllCoords(feature.geometry);
      for (const [lon, lat] of coords) {
        if (lon < minLon) minLon = lon;
        if (lon > maxLon) maxLon = lon;
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
      }
    }
    const pad = 20;
    const scaleX = (w - pad * 2) / (maxLon - minLon);
    const scaleY = (h - pad * 2) / (maxLat - minLat);
    const scale = Math.min(scaleX, scaleY);
    const offsetX = pad + ((w - pad * 2) - (maxLon - minLon) * scale) / 2;
    const offsetY = pad + ((h - pad * 2) - (maxLat - minLat) * scale) / 2;

    let closest: DistrictData | null = null;
    let closestDist = 30; // max click distance
    for (const feature of geoData.features) {
      const props = feature.properties as { code?: string; name_th?: string; centroid?: [number, number] };
      if (props.centroid) {
        const px = offsetX + (props.centroid[0] - minLon) * scale;
        const py = offsetY + (maxLat - props.centroid[1]) * scale;
        const dist = Math.sqrt((mx - px) ** 2 + (my - py) ** 2);
        if (dist < closestDist) {
          closestDist = dist;
          closest = districts.find((d) => d.code === props.code || d.name_th === props.name_th) || null;
        }
      }
    }
    onSelectDistrict(closest);
  };

  const metrics: { key: Metric; label: string }[] = [
    { key: "registrationCount", label: "Registrations" },
    { key: "totalCapital", label: "Capital" },
    { key: "businessDensity", label: "Density" },
  ];

  return (
    <div className="glass-card p-4 h-full flex flex-col">
      {/* Metric toggles */}
      <div className="flex gap-1 mb-3">
        {metrics.map((m) => (
          <button
            key={m.key}
            onClick={() => setMetric(m.key)}
            className={`px-3 py-1 text-xs font-mono rounded-md transition-all ${
              metric === m.key
                ? "bg-[var(--accent-blue)]/20 text-[var(--accent-blue)] border border-[var(--accent-blue)]/30"
                : "text-[var(--text-muted)] hover:text-[var(--text-secondary)] border border-transparent"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <canvas
        ref={canvasRef}
        className="flex-1 w-full cursor-pointer"
        onClick={handleCanvasClick}
        style={{ minHeight: 300 }}
      />
    </div>
  );
}

// GeoJSON helper types and functions
// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace GeoJSON {
  interface FeatureCollection {
    type: string;
    features: Feature[];
  }
  interface Feature {
    type: string;
    properties: Record<string, unknown>;
    geometry: Geometry;
  }
  interface Geometry {
    type: string;
    coordinates: unknown;
  }
}

function getAllCoords(geometry: GeoJSON.Geometry): [number, number][] {
  const coords: [number, number][] = [];
  const extract = (arr: unknown): void => {
    if (!Array.isArray(arr)) return;
    if (arr.length >= 2 && typeof arr[0] === "number" && typeof arr[1] === "number") {
      coords.push([arr[0] as number, arr[1] as number]);
    } else {
      for (const item of arr) extract(item);
    }
  };
  extract(geometry.coordinates);
  return coords;
}

function drawGeometry(
  ctx: CanvasRenderingContext2D,
  geometry: GeoJSON.Geometry,
  project: (lon: number, lat: number) => [number, number]
) {
  const drawRing = (ring: [number, number][]) => {
    if (ring.length === 0) return;
    const [x0, y0] = project(ring[0][0], ring[0][1]);
    ctx.moveTo(x0, y0);
    for (let i = 1; i < ring.length; i++) {
      const [x, y] = project(ring[i][0], ring[i][1]);
      ctx.lineTo(x, y);
    }
    ctx.closePath();
  };

  ctx.beginPath();
  if (geometry.type === "Polygon") {
    const rings = geometry.coordinates as [number, number][][];
    for (const ring of rings) drawRing(ring);
  } else if (geometry.type === "MultiPolygon") {
    const polys = geometry.coordinates as [number, number][][][];
    for (const poly of polys) {
      for (const ring of poly) drawRing(ring);
    }
  }
}
