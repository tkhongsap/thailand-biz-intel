"use client";

import { TABS, type TabId } from "@/types";

interface TabBarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export default function TabBar({ activeTab, onTabChange }: TabBarProps) {
  const coreTabs = TABS.filter((t) => t.section === "CORE");
  const advancedTabs = TABS.filter((t) => t.section === "ADVANCED");

  return (
    <nav className="flex items-center gap-1 px-4 py-2 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)]/80 backdrop-blur-md">
      {/* CORE section */}
      <span className="text-[8px] font-mono uppercase tracking-[0.2em] text-[var(--text-muted)] mr-2">
        Core
      </span>
      {coreTabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`
            px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200
            ${
              activeTab === tab.id
                ? "text-[var(--accent-blue)] bg-[var(--accent-blue)]/10 border-b-2 border-[var(--accent-blue)]"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5"
            }
          `}
        >
          {tab.label}
        </button>
      ))}

      {/* Divider */}
      <div className="w-px h-4 bg-[var(--border-subtle)] mx-2" />

      {/* ADVANCED section */}
      <span className="text-[8px] font-mono uppercase tracking-[0.2em] text-[var(--text-muted)] mr-2">
        Advanced
      </span>
      {advancedTabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`
            px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200
            ${
              activeTab === tab.id
                ? "text-[var(--accent-blue)] bg-[var(--accent-blue)]/10 border-b-2 border-[var(--accent-blue)]"
                : "text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-white/5"
            }
          `}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
