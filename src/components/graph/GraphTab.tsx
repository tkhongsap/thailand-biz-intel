"use client";

import { useState } from "react";
import KnowledgeGraphCanvas from "./KnowledgeGraphCanvas";
import type { GraphNode } from "./KnowledgeGraphCanvas";

export default function GraphTab() {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  return (
    <div className="flex h-full">
      {/* Canvas area */}
      <div className="flex-1 relative">
        <KnowledgeGraphCanvas onNodeSelect={setSelectedNode} />
      </div>

      {/* Inspector panel placeholder (US-005) */}
      <div className="w-[300px] border-l border-[var(--border-subtle)] bg-[var(--bg-surface)]/50 backdrop-blur-sm p-4 overflow-y-auto">
        {!selectedNode ? (
          <div className="flex flex-col items-center justify-center h-full text-[var(--text-muted)]">
            <div className="w-12 h-12 rounded-full bg-[var(--bg-panel)] flex items-center justify-center mb-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <p className="text-sm font-display">Select a node to inspect</p>
            <p className="text-xs font-mono mt-1">Click any node on the graph</p>
          </div>
        ) : (
          <div className="fade-in-up">
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: selectedNode.color }}
              />
              <span className="font-display font-semibold text-sm text-[var(--text-primary)]">
                {selectedNode.label}
              </span>
              <span className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--bg-panel)] text-[var(--text-muted)]">
                {selectedNode.type}
              </span>
            </div>
            <div className="glass-card p-3 mb-3">
              <p className="font-mono text-[9px] uppercase tracking-wider text-[var(--text-muted)] mb-1">Value</p>
              <p className="font-display text-xl font-bold" style={{ color: selectedNode.color }}>
                {selectedNode.value.toLocaleString()}
              </p>
            </div>
            <p className="text-xs text-[var(--text-muted)] font-mono">
              Full inspector in US-005
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
