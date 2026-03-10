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
    <div className="flex flex-col md:flex-row h-full overflow-auto md:overflow-hidden">
      <div className="flex-1 relative min-h-[300px] md:min-h-0">
        <KnowledgeGraphCanvas onNodeSelect={setSelectedNode} />
      </div>

      <div className="w-full md:w-[300px] border-t md:border-t-0 md:border-l border-[var(--border-subtle)] bg-[var(--bg-surface)]/50 backdrop-blur-sm p-4 overflow-y-auto shrink-0">
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
