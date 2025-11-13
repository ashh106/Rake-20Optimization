import { useEffect, useState } from "react";
import PlannerMap from "@/components/app/PlannerMap";
import WhatIfModal from "@/components/app/WhatIfModal";
import GeneratePlanModal from "@/components/app/GeneratePlanModal";
import PlanTable, { type PlanRow } from "@/components/app/PlanTable";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { nodes } from "@/data/mock";
import type { OptimizedPlan } from "@shared/api";

export default function RakePlanner() {
  const { toast } = useToast();
  const [planDate, setPlanDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [planRows, setPlanRows] = useState<PlanRow[]>([]);

  const loadPlan = async (_date: string) => {
    try {
      const res = await fetch(`/api/get-optimized-plan`);
      const payload = await res.json();
      const items: OptimizedPlan[] = payload?.data ?? [];
      setPlanRows(items as unknown as PlanRow[]);
    } catch (e) {
      toast({ title: "Failed to load optimized plan", description: String((e as Error)?.message ?? e), variant: "destructive" as any });
    }
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
      const header = "cmo_stockyard_location_id,product_id,customer_id,quantity_tonnes,wagons_used,distance_km,transport_cost,loading_cost,total_cost\n";
      const rows = planRows.map((r) => `${r.cmo_stockyard_location_id},${r.product_id},${r.customer_id},${r.quantity_tonnes},${r.wagons_used},${r.distance_km},${r.transport_cost},${r.loading_cost},${r.total_cost}`).join("\n");
      const csv = new Blob([header + rows], { type: "text/csv" });
      const a1 = document.createElement("a"); a1.href = URL.createObjectURL(csv); a1.download = `plan-${planDate}.csv`; a1.click();
      const pdf = new Blob(["Plan PDF placeholder"], { type: "application/pdf" });
      const a2 = document.createElement("a"); a2.href = URL.createObjectURL(pdf); a2.download = `plan-${planDate}.pdf`; a2.click();
    }
  };

  const onEdit = async (row: PlanRow) => {
    const reason = window.prompt("Provide override reason:");
    if (!reason) return;
    await fetch("/api/audit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ user: "planner", reason, change: { ref: { product_id: row.product_id, customer_id: row.customer_id, stockyard_location: row.cmo_stockyard_location_id }, edit: { quantity_tonnes: row.quantity_tonnes, wagons_used: row.wagons_used } } }) });
    toast({ title: "Override recorded", description: `${row.product_id} → ${row.customer_id}` });
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
        <PlannerMap nodes={nodes} rakes={planRows.map((r, i) => ({ id: `${r.product_id}-${r.customer_id}-${i}`, x: 50 + i * 5, y: 40 + i * 2, label: r.product_id }))} />
      </div>
    </div>
  );
}
