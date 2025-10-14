import { useEffect, useState } from "react";
import { Clock, Flag, Train } from "lucide-react";

interface Event { id: string; type?: string; text: string; ts: string }

export default function DailyTimeline() {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const load = async () => { try { const r = await fetch("/api/live"); setEvents(await r.json()); } catch {} };
    load();
  }, []);

  const iconFor = (t?: string) => t === "alert" ? Clock : t === "dispatch" ? Train : Flag;

  return (
    <div className="rounded-xl border bg-card p-3 shadow-sm">
      <div className="text-sm font-semibold mb-2"></div>
      <div className="relative overflow-x-auto">
        <div className="flex items-center gap-6 min-w-max pl-2">
          {events.map((e) => {
            const Icon = iconFor(e.type);
            return (
              <div key={e.id} className="group">
                <div className="h-2 w-24 bg-muted rounded-full mb-2 relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <div className="text-xs text-muted-foreground group-hover:text-foreground max-w-[220px]">{e.text}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
