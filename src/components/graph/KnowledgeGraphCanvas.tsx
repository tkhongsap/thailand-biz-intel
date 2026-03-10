"use client";

import { useRef, useEffect, useState, useCallback } from "react";

interface GraphNode {
  id: string;
  label: string;
  type: "sector" | "district" | "size";
  color: string;
  value: number;
  icon?: string;
  // Layout positions (computed)
  x?: number;
  y?: number;
}

interface GraphEdge {
  source: string;
  target: string;
  weight: number;
}

interface KnowledgeGraphCanvasProps {
  onNodeSelect?: (node: GraphNode | null) => void;
}

interface Particle {
  edge: GraphEdge;
  progress: number;
  speed: number;
  color: string;
}

export default function KnowledgeGraphCanvas({ onNodeSelect }: KnowledgeGraphCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const dragRef = useRef<{ dragging: boolean; lastX: number; lastY: number }>({ dragging: false, lastX: 0, lastY: 0 });
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);
  const nodesRef = useRef<GraphNode[]>([]);
  const edgesRef = useRef<GraphEdge[]>([]);

  useEffect(() => {
    fetch("/api/graph")
      .then((r) => r.json())
      .then((data) => {
        const laidOut = layoutNodes(data.nodes, data.edges);
        setNodes(laidOut);
        setEdges(data.edges);
        nodesRef.current = laidOut;
        edgesRef.current = data.edges;
        initParticles(data.edges, laidOut);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const layoutNodes = (rawNodes: GraphNode[], rawEdges: GraphEdge[]): GraphNode[] => {
    // Circular layout: sectors center ring, districts outer, sizes inner
    const sectors = rawNodes.filter((n) => n.type === "sector");
    const districts = rawNodes.filter((n) => n.type === "district");
    const sizes = rawNodes.filter((n) => n.type === "size");

    const cx = 500;
    const cy = 350;

    sectors.forEach((n, i) => {
      const angle = (i / sectors.length) * Math.PI * 2 - Math.PI / 2;
      n.x = cx + Math.cos(angle) * 180;
      n.y = cy + Math.sin(angle) * 180;
    });

    districts.forEach((n, i) => {
      const angle = (i / districts.length) * Math.PI * 2 - Math.PI / 2;
      n.x = cx + Math.cos(angle) * 320;
      n.y = cy + Math.sin(angle) * 280;
    });

    sizes.forEach((n, i) => {
      const angle = (i / sizes.length) * Math.PI * 2 - Math.PI / 4;
      n.x = cx + Math.cos(angle) * 70;
      n.y = cy + Math.sin(angle) * 70;
    });

    return rawNodes;
  };

  const initParticles = (edgeList: GraphEdge[], nodeList: GraphNode[]) => {
    const particles: Particle[] = [];
    // Create some particles on edges
    const strongEdges = edgeList.filter((e) => e.weight >= 10).slice(0, 30);
    for (const edge of strongEdges) {
      const sourceNode = nodeList.find((n) => n.id === edge.source);
      for (let i = 0; i < 2; i++) {
        particles.push({
          edge,
          progress: Math.random(),
          speed: 0.002 + Math.random() * 0.003,
          color: sourceNode?.color || "#0ea5e9",
        });
      }
    }
    particlesRef.current = particles;
  };

  // Animation loop
  useEffect(() => {
    if (loading) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);

      const w = rect.width;
      const h = rect.height;

      ctx.clearRect(0, 0, w, h);

      ctx.save();
      ctx.translate(pan.x + w / 2, pan.y + h / 2);
      ctx.scale(zoom, zoom);
      ctx.translate(-500, -350);

      const currentNodes = nodesRef.current;
      const currentEdges = edgesRef.current;

      // Draw edges
      for (const edge of currentEdges) {
        const src = currentNodes.find((n) => n.id === edge.source);
        const tgt = currentNodes.find((n) => n.id === edge.target);
        if (!src?.x || !tgt?.x || !src?.y || !tgt?.y) continue;

        const isHighlighted =
          hoveredNode === src.id || hoveredNode === tgt.id ||
          selectedNode === src.id || selectedNode === tgt.id;

        const alpha = hoveredNode || selectedNode
          ? isHighlighted ? 0.6 : 0.05
          : Math.min(0.3, edge.weight / 80);

        ctx.strokeStyle = `rgba(148, 163, 184, ${alpha})`;
        ctx.lineWidth = Math.max(0.5, Math.min(2, edge.weight / 30));

        // Bezier curve
        const midX = (src.x + tgt.x) / 2;
        const midY = (src.y + tgt.y) / 2;
        const cpX = midX + (tgt.y - src.y) * 0.1;
        const cpY = midY - (tgt.x - src.x) * 0.1;

        ctx.beginPath();
        ctx.moveTo(src.x, src.y);
        ctx.quadraticCurveTo(cpX, cpY, tgt.x, tgt.y);
        ctx.stroke();
      }

      // Draw particles
      for (const particle of particlesRef.current) {
        const src = currentNodes.find((n) => n.id === particle.edge.source);
        const tgt = currentNodes.find((n) => n.id === particle.edge.target);
        if (!src?.x || !tgt?.x || !src?.y || !tgt?.y) continue;

        const t = particle.progress;
        const midX = (src.x + tgt.x) / 2 + (tgt.y - src.y) * 0.1;
        const midY = (src.y + tgt.y) / 2 - (tgt.x - src.x) * 0.1;

        const px = (1 - t) * (1 - t) * src.x + 2 * (1 - t) * t * midX + t * t * tgt.x;
        const py = (1 - t) * (1 - t) * src.y + 2 * (1 - t) * t * midY + t * t * tgt.y;

        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = 0.7;
        ctx.fill();
        ctx.globalAlpha = 1;

        // Glow
        ctx.beginPath();
        ctx.arc(px, py, 5, 0, Math.PI * 2);
        ctx.fillStyle = particle.color + "30";
        ctx.fill();

        particle.progress += particle.speed;
        if (particle.progress > 1) particle.progress = 0;
      }

      // Draw nodes
      for (const node of currentNodes) {
        if (node.x === undefined || node.y === undefined) continue;

        const isHovered = hoveredNode === node.id;
        const isSelected = selectedNode === node.id;
        const isDimmed = (hoveredNode || selectedNode) && !isHovered && !isSelected &&
          !currentEdges.some(
            (e) =>
              ((e.source === (hoveredNode || selectedNode)) && e.target === node.id) ||
              ((e.target === (hoveredNode || selectedNode)) && e.source === node.id)
          );

        ctx.globalAlpha = isDimmed ? 0.2 : 1;

        if (node.type === "sector") {
          const r = 20 + node.value / 60;
          // Glow
          ctx.beginPath();
          ctx.arc(node.x, node.y, r + 6, 0, Math.PI * 2);
          ctx.fillStyle = node.color + "20";
          ctx.fill();
          if (isHovered || isSelected) {
            ctx.beginPath();
            ctx.arc(node.x, node.y, r + 10, 0, Math.PI * 2);
            ctx.fillStyle = node.color + "30";
            ctx.fill();
          }
          // Node
          ctx.beginPath();
          ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
          ctx.fillStyle = node.color + "cc";
          ctx.fill();
          ctx.strokeStyle = node.color;
          ctx.lineWidth = isSelected ? 3 : 1.5;
          ctx.stroke();
        } else if (node.type === "district") {
          const s = 14 + node.value / 80;
          ctx.beginPath();
          ctx.roundRect(node.x - s, node.y - s * 0.7, s * 2, s * 1.4, 4);
          ctx.fillStyle = node.color + "aa";
          ctx.fill();
          ctx.strokeStyle = node.color;
          ctx.lineWidth = isSelected ? 2.5 : 1;
          ctx.stroke();
        } else {
          // Size tier - diamond
          const s = 12;
          ctx.beginPath();
          ctx.moveTo(node.x, node.y - s);
          ctx.lineTo(node.x + s, node.y);
          ctx.lineTo(node.x, node.y + s);
          ctx.lineTo(node.x - s, node.y);
          ctx.closePath();
          ctx.fillStyle = node.color + "bb";
          ctx.fill();
          ctx.strokeStyle = node.color;
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Label
        ctx.font = node.type === "sector" ? "11px 'Space Grotesk', sans-serif" : "9px 'JetBrains Mono', monospace";
        ctx.fillStyle = "#e2e8f0";
        ctx.textAlign = "center";
        const labelY = node.type === "sector" ? node.y + 32 + node.value / 60 : node.y + 22;
        ctx.fillText(node.label, node.x, labelY);

        ctx.globalAlpha = 1;
      }

      // Tooltip
      if (hoveredNode) {
        const hNode = currentNodes.find((n) => n.id === hoveredNode);
        if (hNode?.x !== undefined && hNode?.y !== undefined) {
          const text = `${hNode.label} (${hNode.value})`;
          ctx.font = "11px 'Space Grotesk', sans-serif";
          const tw = ctx.measureText(text).width;
          const tx = hNode.x - tw / 2 - 8;
          const ty = hNode.y - 45;
          ctx.fillStyle = "rgba(10, 21, 32, 0.9)";
          ctx.beginPath();
          ctx.roundRect(tx, ty, tw + 16, 24, 6);
          ctx.fill();
          ctx.strokeStyle = hNode.color;
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.fillStyle = "#e2e8f0";
          ctx.fillText(text, hNode.x, ty + 16);
        }
      }

      ctx.restore();

      // Legend
      ctx.font = "10px 'JetBrains Mono', monospace";
      const legendItems = [
        { label: "Sector", color: "#0ea5e9", shape: "circle" as const },
        { label: "District", color: "#22c55e", shape: "rect" as const },
        { label: "Size Tier", color: "#d4a843", shape: "diamond" as const },
      ];
      legendItems.forEach((item, i) => {
        const lx = 16;
        const ly = h - 60 + i * 20;

        ctx.fillStyle = item.color;
        if (item.shape === "circle") {
          ctx.beginPath();
          ctx.arc(lx + 5, ly + 5, 5, 0, Math.PI * 2);
          ctx.fill();
        } else if (item.shape === "rect") {
          ctx.fillRect(lx, ly, 10, 10);
        } else {
          ctx.beginPath();
          ctx.moveTo(lx + 5, ly);
          ctx.lineTo(lx + 10, ly + 5);
          ctx.lineTo(lx + 5, ly + 10);
          ctx.lineTo(lx, ly + 5);
          ctx.closePath();
          ctx.fill();
        }

        ctx.fillStyle = "#94a3b8";
        ctx.textAlign = "left";
        ctx.fillText(item.label, lx + 16, ly + 9);
      });

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [loading, hoveredNode, selectedNode, pan, zoom]);

  const screenToCanvas = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      const sx = clientX - rect.left;
      const sy = clientY - rect.top;
      const cx = (sx - pan.x - rect.width / 2) / zoom + 500;
      const cy = (sy - pan.y - rect.height / 2) / zoom + 350;
      return { x: cx, y: cy };
    },
    [pan, zoom]
  );

  const findNodeAt = useCallback(
    (cx: number, cy: number): GraphNode | null => {
      for (const node of [...nodesRef.current].reverse()) {
        if (node.x === undefined || node.y === undefined) continue;
        const dist = Math.sqrt((cx - node.x) ** 2 + (cy - node.y) ** 2);
        const hitRadius = node.type === "sector" ? 25 + node.value / 60 : 20;
        if (dist < hitRadius) return node;
      }
      return null;
    },
    []
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (dragRef.current.dragging) {
        const dx = e.clientX - dragRef.current.lastX;
        const dy = e.clientY - dragRef.current.lastY;
        setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
        dragRef.current.lastX = e.clientX;
        dragRef.current.lastY = e.clientY;
        return;
      }
      const { x, y } = screenToCanvas(e.clientX, e.clientY);
      const node = findNodeAt(x, y);
      setHoveredNode(node?.id || null);
      const canvas = canvasRef.current;
      if (canvas) canvas.style.cursor = node ? "pointer" : "grab";
    },
    [screenToCanvas, findNodeAt]
  );

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    dragRef.current = { dragging: true, lastX: e.clientX, lastY: e.clientY };
  }, []);

  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      const wasDragging = dragRef.current.dragging;
      const dx = Math.abs(e.clientX - dragRef.current.lastX);
      const dy = Math.abs(e.clientY - dragRef.current.lastY);
      dragRef.current.dragging = false;

      // Only select on click (not drag)
      if (wasDragging && dx < 3 && dy < 3) {
        // This was a click disguised as mouseup
      }
      if (dx < 5 && dy < 5) {
        const { x, y } = screenToCanvas(e.clientX, e.clientY);
        const node = findNodeAt(x, y);
        setSelectedNode(node?.id || null);
        onNodeSelect?.(node);
      }
    },
    [screenToCanvas, findNodeAt, onNodeSelect]
  );

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((z) => Math.max(0.3, Math.min(3, z - e.deltaY * 0.001)));
  }, []);

  if (loading) {
    return <div className="w-full h-full shimmer" />;
  }

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full grid-bg"
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      style={{ cursor: "grab" }}
    />
  );
}

export type { GraphNode, GraphEdge };
