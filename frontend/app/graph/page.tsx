"use client";

import { useEffect, useState, useRef } from "react";
import { Share2, Loader2, Maximize2 } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { useRequireAuth } from "@/hooks/use-require-auth";

interface Node {
  id: string;
  label: string;
  type: string;
  color: string;
  subtitle?: string;
  x?: number;
  y?: number;
}

interface Edge {
  source: string;
  target: string;
  label: string;
  type: string;
}

interface GraphData {
  nodes: Node[];
  edges: Edge[];
}

export default function GraphPage() {
  const { checked } = useRequireAuth();
  const [data, setData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoverNode, setHoverNode] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    let cancelled = false;
    apiFetch<GraphData>("/graph")
      .then((res) => {
        if (!cancelled) {
          // Compute static circular layout positions
          const width = 800;
          const height = 600;
          const cx = width / 2;
          const cy = height / 2;

          const nodes = res.nodes;
          
          const userNode = nodes.find(n => n.type === "user");
          if (userNode) {
            userNode.x = cx;
            userNode.y = cy;
          }

          const profs = nodes.filter(n => n.type === "professor");
          const profRadius = 150;
          profs.forEach((prof, i) => {
            const angle = (i / profs.length) * 2 * Math.PI;
            prof.x = cx + profRadius * Math.cos(angle);
            prof.y = cy + profRadius * Math.sin(angle);
          });

          const papers = nodes.filter(n => n.type === "paper");
          papers.forEach((paper) => {
            // Find the professor who authored it
            const edge = res.edges.find(e => e.target === paper.id && e.type === "authored");
            if (edge) {
              const prof = profs.find(p => p.id === edge.source);
              if (prof && prof.x && prof.y) {
                // Randomly position around the professor
                const angle = Math.random() * 2 * Math.PI;
                const paperRadius = 80 + Math.random() * 40;
                paper.x = prof.x + paperRadius * Math.cos(angle);
                paper.y = prof.y + paperRadius * Math.sin(angle);
              }
            } else {
              paper.x = cx + Math.random() * 300 - 150;
              paper.y = cy + Math.random() * 300 - 150;
            }
          });

          setData({ nodes, edges: res.edges });
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  if (!checked) return null;

  return (
    <div className="max-w-[1500px] mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink-900 flex items-center gap-2">
            <Share2 size={24} className="text-brand-500" />
            Research Graph
          </h1>
          <p className="text-sm text-ink-500 mt-1">
            Visualizing your network of professors, applications, and research papers.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-ink-400">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : !data || data.nodes.length <= 1 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-ink-100 shadow-sm">
          <Share2 className="w-12 h-12 text-ink-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-ink-900">Your Graph is Empty</h3>
          <p className="text-ink-500 mt-1">Save some professors or generate applications to build your research graph.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-ink-100 shadow-sm overflow-hidden flex items-center justify-center h-[650px] relative">
          <svg ref={svgRef} width="100%" height="100%" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid meet">
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="22" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#CBD5E1" />
              </marker>
            </defs>
            
            {/* Draw Edges */}
            {data.edges.map((edge, i) => {
              const sourceNode = data.nodes.find(n => n.id === edge.source);
              const targetNode = data.nodes.find(n => n.id === edge.target);
              if (sourceNode?.x === undefined || sourceNode?.y === undefined || targetNode?.x === undefined || targetNode?.y === undefined) return null;
              
              const isHovered = hoverNode === edge.source || hoverNode === edge.target;
              
              return (
                <g key={i} className={`transition-opacity duration-300 ${hoverNode && !isHovered ? 'opacity-10' : 'opacity-100'}`}>
                  <line
                    x1={sourceNode.x}
                    y1={sourceNode.y}
                    x2={targetNode.x}
                    y2={targetNode.y}
                    stroke="#E2E8F0"
                    strokeWidth="2"
                    markerEnd="url(#arrowhead)"
                  />
                  {/* Optional edge label centered */}
                  <text
                    x={(sourceNode.x + targetNode.x) / 2}
                    y={(sourceNode.y + targetNode.y) / 2 - 5}
                    textAnchor="middle"
                    fill="#94A3B8"
                    fontSize="10"
                    className="font-medium uppercase tracking-wider"
                  >
                    {edge.label.replace('_', ' ')}
                  </text>
                </g>
              );
            })}

            {/* Draw Nodes */}
            {data.nodes.map((node) => {
              const isHovered = hoverNode === node.id;
              const isDimmed = hoverNode && hoverNode !== node.id && 
                               !data.edges.some(e => (e.source === node.id && e.target === hoverNode) || (e.target === node.id && e.source === hoverNode));
              
              const radius = node.type === "user" ? 25 : node.type === "professor" ? 20 : 15;
              
              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x || 0}, ${node.y || 0})`}
                  onMouseEnter={() => setHoverNode(node.id)}
                  onMouseLeave={() => setHoverNode(null)}
                  className={`cursor-pointer transition-opacity duration-300 ${isDimmed ? 'opacity-10' : 'opacity-100'}`}
                >
                  <circle
                    r={radius}
                    fill={node.color}
                    stroke="white"
                    strokeWidth="3"
                    className="shadow-sm"
                  />
                  <text
                    y={radius + 15}
                    textAnchor="middle"
                    fill="#334155"
                    fontSize="12"
                    fontWeight="500"
                    className="pointer-events-none"
                  >
                    {node.label}
                  </text>
                  {node.subtitle && isHovered && (
                    <text
                      y={radius + 30}
                      textAnchor="middle"
                      fill="#64748B"
                      fontSize="10"
                      className="pointer-events-none transition-opacity"
                    >
                      {node.subtitle}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
          <div className="absolute bottom-4 right-4 text-xs text-ink-400 bg-white/80 px-3 py-1.5 rounded-full shadow-sm">
            Hover nodes to highlight connections
          </div>
        </div>
      )}
    </div>
  );
}
