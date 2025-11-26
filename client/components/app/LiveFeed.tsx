import { AlertCircle, Clock, Train, TriangleAlert, Wrench } from "lucide-react";

export interface FeedItem {
  id: string;
  type: "info" | "alert" | "maintenance" | "dispatch";
  text: string;
  time: string;
}

export default function LiveFeed({ items }: { items: FeedItem[] }) {
  const icon = (t: FeedItem["type"]) =>
    t === "alert" ? (
      <TriangleAlert className="h-4 w-4 text-red-600" />
    ) : t === "maintenance" ? (
      <Wrench className="h-4 w-4 text-blue-600" />
    ) : t === "dispatch" ? (
      <Train className="h-4 w-4 text-green-600" />
    ) : (
      <AlertCircle className="h-4 w-4 text-muted-foreground" />
    );

  if (!items.length) {
    return (
      <div className="rounded-xl border bg-card p-4 shadow-sm text-xs text-muted-foreground">
        No live events yet.
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Train className="h-4 w-4 text-primary" /> Live Operations Feed
      </div>
      <div className="mt-3 space-y-2 max-h-[420px] overflow-y-auto pr-1">
        {items.map((i) => (
          <div
            key={i.id}
            className={`flex items-start gap-3 rounded-md border p-2 bg-background ${
              i.type === "alert"
                ? "border-red-200"
                : i.type === "maintenance"
                ? "border-blue-200"
                : i.type === "dispatch"
                ? "border-green-200"
                : ""
            }`}
         >
            {icon(i.type)}
            <div className="text-sm flex-1">{i.text}</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" /> {i.time}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 text-right">
        <a href="/live" className="text-xs text-primary hover:underline">
          View All Events →
        </a>
      </div>
    </div>
  );
}
