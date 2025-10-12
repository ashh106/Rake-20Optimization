import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Lightbulb } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Insight { id: string; text: string; action?: string; category?: string; priority?: "High"|"Moderate"|"Info" }

export default function AiInsightsPanel() {
  const { toast } = useToast();
  const [items, setItems] = useState<Insight[]>([]);

  useEffect(() => {
    const load = async () => {
      try { const r = await fetch("/api/insights"); const data = await r.json(); setItems(data); } catch {}
    };
    load();
  }, []);

  const apply = (ins: Insight) => {
    toast({ title: "Applied to plan", description: ins.text });
  };

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-semibold"><Lightbulb className="h-4 w-4 text-accent"/> AI Insights & Recommendations</div>
      <div className="mt-3 space-y-3">
        {items.map((i) => (
          <div key={i.id} className="border rounded-md p-2 bg-background">
            <div className="flex items-center justify-between mb-1">
              <div className="text-[11px] px-1.5 py-0.5 rounded-full border mr-2">{i.category || "Insight"}</div>
              <div className={`text-[11px] px-1.5 py-0.5 rounded-full ${i.priority==="High"?"bg-red-100 text-red-700":"bg-yellow-100 text-yellow-700"}`}>{i.priority || "Info"}</div>
            </div>
            <div className="text-sm mb-2">{i.text}</div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => apply(i)}>Auto-resolve</Button>
              <Button size="sm" variant="outline">Assign</Button>
              <Button size="sm" variant="secondary">Mark Resolved</Button>
            </div>
          </div>
        ))}
        {!items.length && <div className="text-xs text-muted-foreground">No insights available.</div>}
      </div>
    </div>
  );
}
