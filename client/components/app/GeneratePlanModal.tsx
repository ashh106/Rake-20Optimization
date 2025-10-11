import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function GeneratePlanModal({ onStart, onComplete }: { onStart: (payload: { horizon_hours: number; use_forecast: boolean; quick: boolean }) => Promise<{ job_id: string }>; onComplete: (planDate: string) => void }) {
  const [open, setOpen] = useState(false);
  const [horizon, setHorizon] = useState(24);
  const [useForecast, setUseForecast] = useState(true);
  const [quick, setQuick] = useState(true);
  const [jobId, setJobId] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  const submit = async () => {
    setRunning(true);
    const { job_id } = await onStart({ horizon_hours: horizon, use_forecast: useForecast, quick });
    setJobId(job_id);
    // Poll job
    const poll = async () => {
      const res = await fetch(`/api/jobs/${job_id}`);
      const data = await res.json();
      if (data.status === "completed" && data.result_url) {
        const match = /\/api\/plans\/(\d{4}-\d{2}-\d{2})/.exec(data.result_url);
        const date = match ? match[1] : new Date().toISOString().slice(0, 10);
        onComplete(date);
        setRunning(false);
        setOpen(false);
      } else {
        setTimeout(poll, 1000);
      }
    };
    poll();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Generate Plan</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate Optimized Plan</DialogTitle>
          <DialogDescription>Choose options and start the optimizer.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm">Horizon (hours)</label>
            <select className="h-10 rounded-md border px-2" value={horizon} onChange={(e) => setHorizon(parseInt(e.target.value, 10))}>
              <option value={24}>24</option>
              <option value={48}>48</option>
              <option value={72}>72</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3 items-center">
            <label className="text-sm">Use latest forecast</label>
            <input type="checkbox" className="h-4 w-4" checked={useForecast} onChange={(e) => setUseForecast(e.target.checked)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm">Solver mode</label>
            <select className="h-10 rounded-md border px-2" value={quick ? "quick" : "full"} onChange={(e) => setQuick(e.target.value === "quick")}> 
              <option value="quick">Quick (60s)</option>
              <option value="full">Full (120s)</option>
            </select>
          </div>
          {jobId && (
            <div className="rounded-md border p-2 text-sm">
              Job ID: <span className="font-mono">{jobId}</span> — {running ? "Running..." : "Completed"}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={submit} disabled={running}>{running ? "Starting..." : "Start"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
