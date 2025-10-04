import { useState } from "react";
import RakeTable from "@/components/app/RakeTable";
import PlannerMap from "@/components/app/PlannerMap";
import WhatIfModal from "@/components/app/WhatIfModal";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { nodes, routes as initialRoutes, rakeRows as initialRows } from "@/data/mock";

export default function RakePlanner() {
  const { toast } = useToast();
  const [rows, setRows] = useState(initialRows);
  const [routes, setRoutes] = useState(initialRoutes);
  const [loading, setLoading] = useState(false);

  const optimize = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/optimize", { method: "POST" });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      if (Array.isArray(data.rows)) setRows(data.rows);
      if (Array.isArray(data.routes)) setRoutes(data.routes);
      toast({ title: "New rake plan successfully generated!" });
    } catch (e) {
      toast({ title: "Data sync delayed – retry in 5 mins", description: String(e), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const simulate = async (payload: { delayMin: number; loadDelta: number }) => {
    const res = await fetch("/api/simulate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await res.json();
    if (Array.isArray(data.rows)) setRows(data.rows);
    toast({ title: "Simulation complete", description: `New total cost: ₹${data.total_cost?.toLocaleString("en-IN")}` });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={optimize} disabled={loading}>{loading ? "Optimizing..." : "Generate New Plan"}</Button>
        <WhatIfModal onRun={simulate} />
      </div>
      <RakeTable rows={rows} />
      <div>
        <PlannerMap nodes={nodes as any} rakes={[{ id: "m1", x: 55, y: 40, label: "R123" }, { id: "m2", x: 48, y: 45, label: "R124" }]} />
      </div>
    </div>
  );
}
