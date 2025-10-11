import { useEffect, useState } from "react";
import PlannerMap from "@/components/app/PlannerMap";
import LiveFeed, { type FeedItem } from "@/components/app/LiveFeed";
import { nodes } from "@/data/mock";

export default function LiveOps() {
  const [feed, setFeed] = useState<FeedItem[]>([]);

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/live");
      const data = await res.json();
      setFeed(data.map((d: any, idx: number) => ({ id: d.id ?? String(idx), type: d.text?.toLowerCase().includes("delay") ? "alert" : "info", text: d.text, time: new Date(d.ts ?? Date.now()).toLocaleTimeString() })));
    };
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2">
        <PlannerMap nodes={nodes} rakes={[{ id: "m1", x: 55, y: 40, label: "R123" }]} />
      </div>
      <div>
        <LiveFeed items={feed} />
      </div>
    </div>
  );
}
