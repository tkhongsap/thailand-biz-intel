"use client";

import AppShell from "@/components/AppShell";
import OverviewTab from "@/components/overview/OverviewTab";
import GraphTab from "@/components/graph/GraphTab";
import SectorsTab from "@/components/sectors/SectorsTab";
import DistrictsTab from "@/components/districts/DistrictsTab";
import type { TabId } from "@/types";

function TabContent({ activeTab }: { activeTab: TabId }) {
  switch (activeTab) {
    case "overview":
      return <OverviewTab />;
    case "knowledge-graph":
      return <GraphTab />;
    case "sectors":
      return <SectorsTab />;
    case "districts":
      return <DistrictsTab />;
    default:
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="font-mono text-xs text-[var(--text-muted)] uppercase tracking-widest mb-2">
              Active Module
            </p>
            <p className="text-lg font-display font-semibold text-[var(--text-primary)]">
              {activeTab.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
            </p>
            <p className="text-sm text-[var(--text-secondary)] mt-1 font-mono">
              Coming soon
            </p>
          </div>
        </div>
      );
  }
}

export default function DashboardPage() {
  return (
    <AppShell initialTab="overview">
      {(activeTab) => <TabContent activeTab={activeTab} />}
    </AppShell>
  );
}
