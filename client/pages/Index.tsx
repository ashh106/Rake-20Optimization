import { useEffect, useState } from "react";
import KPICard from "@/components/app/KPICard";
import IndiaRailMap from "@/components/app/IndiaRailMap";
import RealMap from "@/components/app/RealMap";
import LiveFeed from "@/components/app/LiveFeed";
import ProcessPanel from "@/components/app/ProcessPanel";
import AiInsightsPanel from "@/components/app/AiInsights";
import ForecastSnapshot from "@/components/app/ForecastSnapshot";
import DailyTimeline from "@/components/app/DailyTimeline";
import { kpis as mockKpis, nodes, routes } from "@/data/mock";
import { CircleDollarSign, CheckCircle, Gauge, Shield } from "lucide-react";

export default function DashboardOverview() {
  const [kpis, setKpis] = useState(mockKpis);
  const [alerts, setAlerts] = useState([] as { id: string; type: "info" | "alert" | "maintenance" | "dispatch"; text: string; time: string }[]);
  const [nodeInfo, setNodeInfo] = useState<Record<string, { avail_t?: number; active_rakes?: number; loading_status?: "green" | "yellow" | "red" }>>({});
  const [billing, setBilling] = useState<{ freight: number; demurrage: number; penalties: number; idle_time: number } | null>(null);
  const [filterActive, setFilterActive] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [r1, r2, r3, r4] = await Promise.all([fetch("/api/kpis"), fetch("/api/alerts"), fetch("/api/stockyards"), fetch("/api/forecast/summary")]);
        if (r1.ok) setKpis(await r1.json()); else setKpis(mockKpis);
        if (r2.ok) {
          const items = await r2.json();
          setAlerts(items.map((a: any) => ({ id: a.id, type: a.type === "warning" ? "alert" : (a.type || "info"), text: a.text, time: new Date(a.ts).toLocaleTimeString() })));
        }
        if (r3.ok) {
          const yards = await r3.json();
          const info: Record<string, any> = {};
          for (const y of yards) {
            const key = (y.name || "").toLowerCase();
            info[key.includes("bokaro") ? "bokaro" : key.includes("rourkela") ? "rourkela" : key.includes("durgapur") ? "durgapur" : key.includes("ranchi") ? "ranchi" : key.includes("kolkata") ? "kolkata" : y.stockyard_id] = { avail_t: y.avail_t, active_rakes: Math.floor(Math.random() * 5) + 1, loading_status: ["green","yellow","red"][Math.floor(Math.random()*3)] };
          }
          setNodeInfo(info);
        }
        if (r4.ok) {
          const s = await r4.json();
          setBilling(s.cost_breakdown);
        }
      } catch {
        setKpis(mockKpis);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <KPICard label="Total Logistics Cost" value={kpis.total_cost} prefix="₹" icon={<CircleDollarSign className="h-4 w-4" />} onClick={() => alert("Cost breakdown")}/>
        <KPICard label="On-Time Dispatch" value={kpis.on_time_dispatch} suffix="%" icon={<CheckCircle className="h-4 w-4" />} />
        <KPICard label="Rake Utilization" value={kpis.rake_utilization} suffix="%" icon={<Gauge className="h-4 w-4" />} />
        <KPICard label="Delay Penalty Saved" value={kpis.penalty_savings} prefix="₹" icon={<Shield className="h-4 w-4" />} />
        <KPICard label="Active Rakes" value={kpis.active_rakes} icon={<Gauge className="h-4 w-4" />} onClick={() => setFilterActive((v) => !v)} />
      </div>

      <ForecastSnapshot />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <IndiaRailMap nodes={nodes} routes={routes.map(r => ({...r, status: Math.random()>0.8?"delayed":"on_time", progress: Math.random()}))} nodeInfo={nodeInfo} />
          <ProcessPanel />
          <DailyTimeline />
        </div>
        <div className="space-y-4">
          <AiInsightsPanel />
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <div className="text-sm font-semibold mb-2">Cost & Billing Snapshot</div>
            {billing ? (
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><div className="text-muted-foreground">Freight</div><div className="font-semibold">₹{billing.freight.toLocaleString("en-IN")}</div></div>
                <div><div className="text-muted-foreground">Demurrage</div><div className="font-semibold">₹{billing.demurrage.toLocaleString("en-IN")}</div></div>
                <div><div className="text-muted-foreground">Penalties</div><div className="font-semibold">₹{billing.penalties.toLocaleString("en-IN")}</div></div>
                <div><div className="text-muted-foreground">Idle Time</div><div className="font-semibold">₹{billing.idle_time.toLocaleString("en-IN")}</div></div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">Loading…</div>
            )}
          </div>
          <LiveFeed items={alerts} />
        </div>
      </div>
    </div>
  );
}
