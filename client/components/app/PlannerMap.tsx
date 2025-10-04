import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

export interface Node { id: string; label: string; x: number; y: number }
export interface RakeMarker { id: string; x: number; y: number; label: string }

export default function PlannerMap({ nodes, rakes }: { nodes: Node[]; rakes: RakeMarker[] }) {
  const [markers, setMarkers] = useState<RakeMarker[]>(rakes);
  const [dragId, setDragId] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const nodeMap = useMemo(() => Object.fromEntries(nodes.map((n) => [n.id, n])), [nodes]);

  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragId || !svgRef.current) return;
    const pt = svgRef.current.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const ctm = svgRef.current.getScreenCTM();
    if (!ctm) return;
    const sp = pt.matrixTransform(ctm.inverse());
    const x = Math.max(0, Math.min(100, sp.x));
    const y = Math.max(0, Math.min(100, sp.y));
    setMarkers((ms) => ms.map((m) => (m.id === dragId ? { ...m, x, y } : m)));
  };

  return (
    <div className="relative w-full h-[360px] rounded-xl border bg-card overflow-hidden">
      <svg ref={svgRef} viewBox="0 0 100 100" className="w-full h-full" onPointerMove={onPointerMove} onPointerUp={() => setDragId(null)} onPointerLeave={() => setDragId(null)}>
        {Object.values(nodeMap).map((n) => (
          <g key={n.id} transform={`translate(${n.x}, ${n.y})`}>
            <circle r={1.8} className="fill-primary" />
            <text x={2.8} y={1.2} className="fill-foreground text-[2px]">{n.label}</text>
          </g>
        ))}
        {markers.map((m) => (
          <motion.g key={m.id} transform={`translate(${m.x}, ${m.y})`} initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
            <circle r={2.2} className="fill-accent cursor-grab" onPointerDown={() => setDragId(m.id)} />
            <text x={2.8} y={1.2} className="fill-foreground text-[2px]">{m.label}</text>
          </motion.g>
        ))}
      </svg>
    </div>
  );
}
