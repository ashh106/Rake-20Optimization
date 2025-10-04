import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function WhatIfModal({ onRun }: { onRun: (payload: { delayMin: number; loadDelta: number }) => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [delayMin, setDelayMin] = useState(15);
  const [loadDelta, setLoadDelta] = useState(0);

  const run = async () => {
    await onRun({ delayMin, loadDelta });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Simulate Delay / Change Load</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>What-if Simulation</DialogTitle>
          <DialogDescription>Adjust parameters to simulate a new plan.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm">Delay (minutes)</label>
            <input type="number" className="h-10 rounded-md border px-2" value={delayMin} onChange={(e) => setDelayMin(parseInt(e.target.value || "0", 10))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm">Load change (tonnes)</label>
            <input type="number" className="h-10 rounded-md border px-2" value={loadDelta} onChange={(e) => setLoadDelta(parseInt(e.target.value || "0", 10))} />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={run}>Run Simulation</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
