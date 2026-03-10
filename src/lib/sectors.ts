export interface SectorDef {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  color: string;
  codeRanges: [number, number][];
}

export const SECTORS: SectorDef[] = [
  { id: "hospitality", name: "Hospitality", nameEn: "Hotels & F&B", icon: "🏨", color: "#d4a843", codeRanges: [[55000, 55999], [56000, 56999]] },
  { id: "construction", name: "Construction", nameEn: "Construction", icon: "🏗️", color: "#f97316", codeRanges: [[41000, 41999], [42000, 42999], [43000, 43999]] },
  { id: "retail", name: "Retail", nameEn: "Retail & E-commerce", icon: "🛒", color: "#06b6d4", codeRanges: [[47000, 47999]] },
  { id: "real-estate", name: "Real Estate", nameEn: "Real Estate", icon: "🏠", color: "#22c55e", codeRanges: [[68000, 68999]] },
  { id: "tourism", name: "Tourism", nameEn: "Tourism & Travel", icon: "✈️", color: "#0ea5e9", codeRanges: [[79000, 79999]] },
  { id: "consulting", name: "Consulting", nameEn: "Consulting & Mgmt", icon: "📊", color: "#8b5cf6", codeRanges: [[70000, 70999]] },
  { id: "marketing", name: "Marketing", nameEn: "Marketing & Ads", icon: "📣", color: "#ec4899", codeRanges: [[73000, 73999]] },
  { id: "transport", name: "Transport", nameEn: "Transport & Logistics", icon: "🚛", color: "#14b8a6", codeRanges: [[49000, 49999]] },
  { id: "healthcare", name: "Healthcare", nameEn: "Healthcare (Vet)", icon: "🏥", color: "#ef4444", codeRanges: [[75000, 75999], [86000, 86999]] },
  { id: "business-services", name: "Business Services", nameEn: "Business Services", icon: "💼", color: "#6366f1", codeRanges: [[82000, 82999]] },
  { id: "wholesale", name: "Wholesale", nameEn: "Wholesale Trade", icon: "📦", color: "#f59e0b", codeRanges: [[46000, 46999]] },
  { id: "education", name: "Education", nameEn: "Education", icon: "🎓", color: "#a855f7", codeRanges: [[85000, 85999]] },
  { id: "manufacturing", name: "Manufacturing", nameEn: "Manufacturing", icon: "🏭", color: "#78716c", codeRanges: [[10000, 33999]] },
  { id: "professional", name: "Professional Services", nameEn: "Professional Svc", icon: "⚖️", color: "#84cc16", codeRanges: [[69000, 69999]] },
  { id: "services", name: "Other Services", nameEn: "Other Services", icon: "🔧", color: "#64748b", codeRanges: [[45000, 45999], [62000, 62999], [93000, 93999], [96000, 96999]] },
];

export function getSectorForCode(businessCode: string | number): SectorDef {
  const code = typeof businessCode === "string" ? parseInt(businessCode, 10) : businessCode;
  if (isNaN(code)) return OTHER_SECTOR;
  
  for (const sector of SECTORS) {
    for (const [min, max] of sector.codeRanges) {
      if (code >= min && code <= max) return sector;
    }
  }
  return OTHER_SECTOR;
}

export const OTHER_SECTOR: SectorDef = {
  id: "other",
  name: "Other",
  nameEn: "Other",
  icon: "⚙️",
  color: "#64748b",
  codeRanges: [],
};

export function getAllSectorsIncludingOther(): SectorDef[] {
  return [...SECTORS, OTHER_SECTOR];
}
