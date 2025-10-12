import { useEffect, useState } from "react";
import { ArrowDownRight, ArrowUpRight, TrendingDown, TrendingUp } from "lucide-react";

interface Summary { forecasted_dispatches: number; predicted_cost_trend: "up"|"down"; expected_utilization_pct: number; delay_risk_pct: number; cost_breakdown: { freight: number; demurrage: number; penalties: number; idle_time: number } }

export default function ForecastSnapshot() {
  const [data, setData] = useState<Summary | null>(null);

  useEffect(() => { (async () => { try { const r = await fetch("/api/forecast/summary"); setData(await r.json()); } catch {} })(); }, []);

  if (!data) return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">Loading forecast…</div>
  );

  const TrendIcon = data.predicted_cost_trend === "down" ? ArrowDownRight : ArrowUpRight;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="text-xs text-muted-foreground">Forecasted Dispatches</div>
        <div className="text-xl font-semibold">{data.forecasted_dispatches}</div>
      </div>
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="text-xs text-muted-foreground">Predicted Cost Trend</div>
        <div className="flex items-center gap-2 text-xl font-semibold">
          <TrendIcon className={data.predicted_cost_trend === "down" ? "text-green-600" : "text-red-600"} />
          {data.predicted_cost_trend.toUpperCase()}
        </div>
      </div>
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="text-xs text-muted-foreground">Expected Utilization</div>
        <div className="text-xl font-semibold">{data.expected_utilization_pct}%</div>
      </div>
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="text-xs text-muted-foreground">Delay Risk</div>
        <div className="text-xl font-semibold">{data.delay_risk_pct}%</div>
      </div>
    </div>
  );
}
