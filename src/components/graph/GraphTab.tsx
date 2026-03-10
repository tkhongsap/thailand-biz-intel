"use client";

import { useState, useEffect } from "react";
import KnowledgeGraphCanvas from "./KnowledgeGraphCanvas";
import NodeInspector from "./NodeInspector";
import type { GraphNode, GraphEdge } from "./KnowledgeGraphCanvas";

export default function GraphTab() {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [graphData, setGraphData] = useState<{ nodes: GraphNode[]; edges: GraphEdge[] }>({ nodes: [], edges: [] });

  useEffect(() => {
    fetch("/api/graph")
      .then((r) => r.json())
      .then((d) => setGraphData({ nodes: d.nodes || [], edges: d.edges || [] }))
      .catch(() => {});
  }, []);

  return (
    <div className="flex h-full">
      {/* Canvas area */}
      <div className="flex-1 relative">
        <KnowledgeGraphCanvas onNodeSelect={setSelectedNode} />
      </div>

      {/* Inspector panel */}
      <div className="w-[300px] border-l border-[var(--border-subtle)] bg-[var(--bg-surface)]/50 backdrop-blur-sm p-4 overflow-y-auto">
        <NodeInspector
          node={selectedNode}
          edges={graphData.edges}
          allNodes={graphData.nodes}
          onNodeSelect={setSelectedNode}
        />
      </div>
    </div>
  );
}
