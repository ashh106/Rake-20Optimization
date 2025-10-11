import { useEffect, useState } from "react";
import PlannerMap from "@/components/app/PlannerMap";
import WhatIfModal from "@/components/app/WhatIfModal";
import GeneratePlanModal from "@/components/app/GeneratePlanModal";
import PlanTable, { type PlanRow } from "@/components/app/PlanTable";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { nodes } from "@/data/mock";

export default function RakePlanner() {
  const { toast } = useToast();
  const [planDate, setPlanDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [planRows, setPlanRows] = useState<PlanRow[]>([]);

  const loadPlan = async (date: string) => {
    const res = await fetch(`/api/plans/${date}`);
    const data = await res.json();
    setPlanRows(data.rakes || []);
  };

  useEffect(() => {
    loadPlan(planDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startOptimize = async ({ horizon_hours, use_forecast, quick }: { horizon_hours: number; use_forecast: boolean; quick: boolean }) => {
    const res = await fetch(`/api/optimize?quick=${quick ? "true" : "false"}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ horizon_hours, use_forecast, time_limit_seconds: quick ? 60 : 120 }) });
    const data = await res.json();
    toast({ title: "Optimization running…", description: `Job ${data.job_id}` });
    return { job_id: data.job_id as string };
  };

  const onPlanReady = async (date: string) => {
    setPlanDate(date);
    await loadPlan(date);
    toast({ title: "Plan ready — Review or Approve" });
  };

  const reRunQuick = async () => {
    const res = await fetch(`/api/optimize?quick=true`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ horizon_hours: 24, use_forecast: true, time_limit_seconds: 60 }) });
    const data = await res.json();
    toast({ title: "Quick optimize started", description: `Job ${data.job_id}` });
  };

  const approvePlan = async () => {
    const res = await fetch(`/plans/${planDate}/lock`, { method: "POST" });
    if (res.ok) {
      toast({ title: "Plan locked & exported (CSV/PDF)" });
      // Trigger mock downloads
      const csv = new Blob(["rake_id,source,destinations,load_t,wagons,dep,eta,util,cost,status\n" + planRows.map((r) => `${r.rake_id},${r.source},${r.destinations.join("|")},${r.load_tonnes},${r.wagons},${r.departure},${r.eta},${r.utilization},${r.cost},${r.status}`).join("\n")], { type: "text/csv" });
      const a1 = document.createElement("a"); a1.href = URL.createObjectURL(csv); a1.download = `plan-${planDate}.csv`; a1.click();
      const pdf = new Blob(["Plan PDF placeholder"], { type: "application/pdf" });
      const a2 = document.createElement("a"); a2.href = URL.createObjectURL(pdf); a2.download = `plan-${planDate}.pdf`; a2.click();
    }
  };

  const onEdit = async (row: PlanRow) => {
    const reason = window.prompt("Provide override reason:");
    if (!reason) return;
    await fetch("/api/audit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ user: "planner", reason, change: { rake_id: row.rake_id, edit: { source: row.source, destinations: row.destinations, load_tonnes: row.load_tonnes } } }) });
    toast({ title: "Override recorded", description: row.rake_id });
    reRunQuick();
  };

  const simulate = async (payload: { delayMin: number; loadDelta: number }) => {
    const res = await fetch("/api/simulate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await res.json();
    setPlanRows(data.rakes || []);
    toast({ title: "Simulation complete", description: `Δ Cost: ₹${(data.deltas?.cost_delta ?? 0).toLocaleString("en-IN")}` });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <GeneratePlanModal onStart={startOptimize} onComplete={onPlanReady} />
        <Button variant="secondary" onClick={reRunQuick}>Re-run Quick Optimize</Button>
        <Button variant="outline" onClick={approvePlan}>Approve & Lock</Button>
        <WhatIfModal onRun={simulate} />
      </div>
      <PlanTable rows={planRows} onEdit={onEdit} />
      <div>
        <PlannerMap nodes={nodes} rakes={planRows.map((r, i) => ({ id: r.rake_id, x: 50 + i * 5, y: 40 + i * 2, label: r.rake_id }))} />
      </div>
    </div>
  );
}
