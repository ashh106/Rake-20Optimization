import { useEffect, useState } from "react";
import RealMap from "@/components/app/RealMap";
import LiveFeed, { type FeedItem } from "@/components/app/LiveFeed";
import { Button } from "@/components/ui/button";

export default function LiveOps() {
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [playing, setPlaying] = useState(true);
  const [rakes, setRakes] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const [events, plan] = await Promise.all([
        fetch("/api/live").then((r) => r.json()),
        fetch(`/api/plans/${new Date().toISOString().slice(0, 10)}`).then((r) => r.json()),
      ]);
      setFeed(
        events.map((d: any, idx: number) => ({ id: d.id ?? String(idx), type: (d.type as any) || "info", text: d.text, time: new Date(d.ts ?? Date.now()).toLocaleTimeString() }))
      );
      setRakes(plan.rakes || []);
    };
    load();
    const t = setInterval(() => {
      if (playing) load();
    }, 4000);
    return () => clearInterval(t);
  }, [playing]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold">Live Operations Control Room</div>
          <Button size="sm" variant={playing ? "secondary" : "default"} onClick={() => setPlaying((p) => !p)}>
            {playing ? "Pause" : "Play"} Live Feed
          </Button>
        </div>
        <RealMap scenario="live" />
        <div className="rounded-xl border bg-card p-3 shadow-sm">
          <div className="text-sm font-semibold mb-2">Rakes In Motion</div>
          <div className="text-xs grid grid-cols-1 md:grid-cols-2 gap-2">
            {rakes.map((r: any) => (
              <div key={r.rake_id} className="border rounded-md p-2 flex justify-between">
                <div>
                  <div className="font-medium">
                    {r.rake_id} • {r.source} → {r.destinations?.[0]}
                  </div>
                  <div>
                    ETA {new Date(r.eta).toLocaleTimeString()} • ₹{r.cost.toLocaleString("en-IN")}
                  </div>
                </div>
                <div className={`text-xs px-1.5 py-0.5 rounded-full ${r.status.includes("delay") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>{r.status}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div>
        <LiveFeed items={feed} />
      </div>
    </div>
  );
}
