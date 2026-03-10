export type TabId =
  | "overview"
  | "knowledge-graph"
  | "sectors"
  | "districts"
  | "capital"
  | "simulator"
  | "ai-briefing";

export interface Tab {
  id: TabId;
  label: string;
  section: "CORE" | "ADVANCED";
}

export const TABS: Tab[] = [
  { id: "overview", label: "Overview", section: "CORE" },
  { id: "knowledge-graph", label: "Knowledge Graph", section: "CORE" },
  { id: "sectors", label: "Sectors", section: "CORE" },
  { id: "districts", label: "Districts", section: "CORE" },
  { id: "capital", label: "Capital Flows", section: "ADVANCED" },
  { id: "simulator", label: "Simulator", section: "ADVANCED" },
  { id: "ai-briefing", label: "AI Briefing", section: "ADVANCED" },
];
