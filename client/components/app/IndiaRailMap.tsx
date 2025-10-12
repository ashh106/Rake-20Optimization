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
  status?: "on_time" | "delayed" | "idle";
  progress?: number; // 0..1
}

export type NodeInfo = Record<string, { avail_t?: number; active_rakes?: number; loading_status?: "green" | "yellow" | "red"; in_transit?: { rake: string; eta: string; cost?: number }[] }>;

export default function IndiaRailMap({
  nodes,
  routes,
  nodeInfo,
}: {
  nodes: Node[];
  routes: RouteInfo[];
  nodeInfo?: NodeInfo;
}) {
  const [hover, setHover] = useState<RouteInfo | null>(null);
  const [hoverNode, setHoverNode] = useState<Node | null>(null);
  const nodeMap = useMemo(() => Object.fromEntries(nodes.map((n) => [n.id, n])), [nodes]);

  const colorFor = (s?: RouteInfo["status"]) => (s === "delayed" ? "#DC2626" : s === "idle" ? "#F59E0B" : "hsl(var(--primary))");

  return (
    <div className="relative w-full h-[420px] md:h-[480px] rounded-xl border bg-card overflow-hidden">
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="w-full h-full">
        <defs>
          <radialGradient id="bg" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="rgba(11,60,93,0.12)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        <rect x="0" y="0" width="100" height="100" fill="url(#bg)" />
        {routes.map((r) => {
          const a = nodeMap[r.from];
          const b = nodeMap[r.to];
          if (!a || !b) return null;
          const stroke = colorFor(r.status);
          const prog = r.progress ?? 0.3;
          const cx = a.x + (b.x - a.x) * prog;
          const cy = a.y + (b.y - a.y) * prog;
          return (
            <g key={r.id}>
              <motion.line
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                strokeWidth={1.2}
                stroke={stroke}
                className="[stroke-dasharray:3_3]"
                initial={{ opacity: 0, strokeDashoffset: 6 }}
                animate={{ opacity: 1, strokeDashoffset: [0, 6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                onMouseEnter={() => setHover(r)}
                onMouseLeave={() => setHover(null)}
              />
              <motion.circle r={1.4} fill={stroke} cx={a.x} cy={a.y} animate={{ cx: [a.x, b.x], cy: [a.y, b.y] }} transition={{ duration: 6, repeat: Infinity, ease: "linear" }} />
              <text x={cx + 1.5} y={cy} className="fill-foreground text-[2px]">{r.rake}</text>
            </g>
          );
        })}
        {nodes.map((n) => (
          <g key={n.id} transform={`translate(${n.x}, ${n.y})`} onMouseEnter={() => setHoverNode(n)} onMouseLeave={() => setHoverNode(null)}>
            <circle r={2} className="fill-primary" />
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
      {hoverNode && (
        <div className="absolute bottom-2 right-2 bg-popover text-popover-foreground border rounded-md px-3 py-2 text-xs shadow max-w-[260px]">
          <div className="font-semibold mb-1">{hoverNode.label}</div>
          <div>Available: {nodeInfo?.[hoverNode.id]?.avail_t?.toLocaleString("en-IN") ?? "—"} t</div>
          <div>Active rakes: {nodeInfo?.[hoverNode.id]?.active_rakes ?? "—"}</div>
          <div>Loading status: {nodeInfo?.[hoverNode.id]?.loading_status ?? "—"}</div>
        </div>
      )}
    </div>
  );
}
