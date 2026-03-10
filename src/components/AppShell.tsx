"use client";

import { useState, useEffect } from "react";
import Header from "./Header";
import TabBar from "./TabBar";
import { TABS, type TabId } from "@/types";

interface AppShellProps {
  initialTab?: TabId;
  children?: (activeTab: TabId) => React.ReactNode;
}

export default function AppShell({ initialTab = "overview", children }: AppShellProps) {
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);

  // Tab persistence via URL query param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get("tab") as TabId;
    if (tabParam && TABS.some((t) => t.id === tabParam)) {
      setActiveTab(tabParam);
    }
  }, []);

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    window.history.replaceState({}, "", url.toString());
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header />
      <main className="flex-1 overflow-hidden">
        <div className="h-full transition-opacity duration-300">
          {children ? children(activeTab) : (
            <div className="flex items-center justify-center h-full text-[var(--text-muted)]">
              <p className="font-mono text-sm">Select a tab to begin</p>
            </div>
          )}
        </div>
      </main>
      <TabBar activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}
