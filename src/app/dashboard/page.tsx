"use client";

import AppShell from "@/components/AppShell";
import OverviewTab from "@/components/overview/OverviewTab";
import GraphTab from "@/components/graph/GraphTab";
import SectorsTab from "@/components/sectors/SectorsTab";
import DistrictsTab from "@/components/districts/DistrictsTab";
import SimulatorTab from "@/components/simulator/SimulatorTab";
import BriefingTab from "@/components/briefing/BriefingTab";
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
    case "simulator":
      return <SimulatorTab />;
    case "ai-briefing":
      return <BriefingTab />;
    default:
      return null;
  }
}

export default function DashboardPage() {
  return (
    <AppShell initialTab="overview">
      {(activeTab) => <TabContent activeTab={activeTab} />}
    </AppShell>
  );
}
