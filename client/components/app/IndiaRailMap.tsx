import { useMemo, useState } from "react";
import { motion } from "framer-motion";

export interface Node {
  id: string;
  label: string;
  x: number; // 0..100 relative
  y: number; // 0..100 relative
}
export interface RouteInfo {
  id: string;
  from: string;
  to: string;
  rake: string;
  load: number;
  eta: string;
}

export default function IndiaRailMap({
  nodes,
  routes,
}: {
  nodes: Node[];
  routes: RouteInfo[];
}) {
  const [hover, setHover] = useState<RouteInfo | null>(null);
  const nodeMap = useMemo(() => Object.fromEntries(nodes.map((n) => [n.id, n])), [nodes]);

  return (
    <div className="relative w-full h-[380px] md:h-[460px] rounded-xl border bg-card overflow-hidden">
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="w-full h-full">
        <defs>
          <radialGradient id="bg" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="rgba(11,60,93,0.08)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        <rect x="0" y="0" width="100" height="100" fill="url(#bg)" />
        {routes.map((r) => {
          const a = nodeMap[r.from];
          const b = nodeMap[r.to];
          if (!a || !b) return null;
          return (
            <motion.line
              key={r.id}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              strokeWidth={1.2}
              stroke="hsl(var(--primary))"
              className="[stroke-dasharray:3_3]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              onMouseEnter={() => setHover(r)}
              onMouseLeave={() => setHover(null)}
            />
          );
        })}
        {nodes.map((n) => (
          <g key={n.id} transform={`translate(${n.x}, ${n.y})`}>
            <circle r={1.8} className="fill-primary" />
            <text x={2.8} y={1.2} className="fill-foreground text-[2px]">
              {n.label}
            </text>
          </g>
        ))}
      </svg>
      {hover && (
        <div className="absolute bottom-2 left-2 bg-popover text-popover-foreground border rounded-md px-3 py-2 text-xs shadow">
          Rake {hover.rake} • Load {hover.load}T • ETA {hover.eta}
        </div>
      )}
    </div>
  );
}
