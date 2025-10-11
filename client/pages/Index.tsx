import { useEffect, useState } from "react";
import KPICard from "@/components/app/KPICard";
import IndiaRailMap from "@/components/app/IndiaRailMap";
import LiveFeed from "@/components/app/LiveFeed";
import ProcessPanel from "@/components/app/ProcessPanel";
import { kpis as mockKpis, nodes, routes } from "@/data/mock";
import { CircleDollarSign, CheckCircle, Gauge, Shield } from "lucide-react";

export default function DashboardOverview() {
  const [kpis, setKpis] = useState(mockKpis);
  const [alerts, setAlerts] = useState([] as { id: string; type: "info" | "alert"; text: string; time: string }[]);

  useEffect(() => {
    const load = async () => {
      try {
        const [r1, r2] = await Promise.all([fetch("/api/kpis"), fetch("/api/alerts")]);
        if (r1.ok) setKpis(await r1.json()); else setKpis(mockKpis);
        if (r2.ok) {
          const items = await r2.json();
          setAlerts(items.map((a: any) => ({ id: a.id, type: a.type === "warning" ? "alert" : "info", text: a.text, time: new Date(a.ts).toLocaleTimeString() })));
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
        <KPICard label="Total Logistics Cost" value={kpis.total_cost} prefix="₹" icon={<CircleDollarSign className="h-4 w-4" />} />
        <KPICard label="On-Time Dispatch" value={kpis.on_time_dispatch} suffix="%" icon={<CheckCircle className="h-4 w-4" />} />
        <KPICard label="Rake Utilization" value={kpis.rake_utilization} suffix="%" icon={<Gauge className="h-4 w-4" />} />
        <KPICard label="Delay Penalty Saved" value={kpis.penalty_savings} prefix="₹" icon={<Shield className="h-4 w-4" />} />
        <KPICard label="Active Rakes" value={kpis.active_rakes} icon={<Gauge className="h-4 w-4" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <IndiaRailMap nodes={nodes} routes={routes} />
          <ProcessPanel />
        </div>
        <div>
          <LiveFeed items={alerts} />
        </div>
      </div>
    </div>
  );
}
