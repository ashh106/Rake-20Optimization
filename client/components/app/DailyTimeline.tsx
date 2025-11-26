import { useEffect, useState } from "react";
import { Clock, Flag, Train, ChevronRight } from "lucide-react";
import { TrainTimeline } from "./TrainTimeline";

interface Event { id: string; type?: string; text: string; ts: string }

// This component now serves as a wrapper that can show either the old or new timeline view
export default function DailyTimeline() {
  const [view, setView] = useState<"simple" | "detailed">("simple");
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const load = async () => { 
      try { 
        const r = await fetch("/api/live"); 
        setEvents(await r.json()); 
      } catch (error) {
        console.error("Failed to load timeline data:", error);
      } 
    };
    load();
    const interval = setInterval(load, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const toggleView = () => {
    setView(view === "simple" ? "detailed" : "simple");
  };

  // For demo purposes - in a real app, you'd get this from your data
  const trainId = "12345";

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Rake Movement Timeline</h3>
        <button 
          onClick={toggleView}
          className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          {view === "simple" ? "Detailed View" : "Simple View"}
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {view === "simple" ? (
        <SimpleTimelineView events={events} />
      ) : (
        <TrainTimeline trainId={trainId} className="mt-4" />
      )}
    </div>
  );
}

// Keep the original timeline as a simple view option
function SimpleTimelineView({ events }: { events: Event[] }) {
  const iconFor = (t?: string) => t === "alert" ? Clock : t === "dispatch" ? Train : Flag;
  
  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No timeline data available</p>
        <p className="text-xs mt-2">Loading or no events scheduled</p>
      </div>
    );
  }

  return (
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
              <div className="text-xs text-muted-foreground group-hover:text-foreground max-w-[220px]">
                {e.text}
                <div className="text-[10px] opacity-70">{new Date(e.ts).toLocaleTimeString()}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
