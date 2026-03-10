"use client";

import { useState } from "react";
import Header from "./Header";
import TabBar from "./TabBar";
import type { TabId } from "@/types";

interface AppShellProps {
  initialTab?: TabId;
  children?: (activeTab: TabId) => React.ReactNode;
}

export default function AppShell({ initialTab = "overview", children }: AppShellProps) {
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header />
      <main className="flex-1 overflow-auto">
        {children ? children(activeTab) : (
          <div className="flex items-center justify-center h-full text-[var(--text-muted)]">
            <p className="font-mono text-sm">Select a tab to begin</p>
          </div>
        )}
      </main>
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
