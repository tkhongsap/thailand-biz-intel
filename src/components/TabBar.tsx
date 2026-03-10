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
    <nav className="flex items-center gap-0.5 md:gap-1 px-2 md:px-4 py-1.5 md:py-2 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)]/80 backdrop-blur-md tab-scroll">
      <span className="text-[7px] md:text-[8px] font-mono uppercase tracking-[0.2em] text-[var(--text-muted)] mr-1 md:mr-2 shrink-0">
        Core
      </span>
      {coreTabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`
            px-2 md:px-3 py-1 md:py-1.5 text-[11px] md:text-xs font-medium rounded-md transition-all duration-200 whitespace-nowrap shrink-0
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

      <div className="w-px h-4 bg-[var(--border-subtle)] mx-1 md:mx-2 shrink-0" />

      <span className="text-[7px] md:text-[8px] font-mono uppercase tracking-[0.2em] text-[var(--text-muted)] mr-1 md:mr-2 shrink-0">
        Adv
      </span>
      {advancedTabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`
            px-2 md:px-3 py-1 md:py-1.5 text-[11px] md:text-xs font-medium rounded-md transition-all duration-200 whitespace-nowrap shrink-0
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
