import { AlertCircle, Clock, Train, TriangleAlert } from "lucide-react";

export interface FeedItem {
  id: string;
  type: "info" | "alert";
  text: string;
  time: string;
}

export default function LiveFeed({ items }: { items: FeedItem[] }) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Train className="h-4 w-4 text-primary" /> Live Operations Feed
      </div>
      <div className="mt-3 space-y-2 max-h-[420px] overflow-y-auto pr-1">
        {items.map((i) => (
          <div key={i.id} className="flex items-start gap-3 rounded-md border p-2 bg-background">
            {i.type === "alert" ? (
              <TriangleAlert className="h-4 w-4 text-accent" />
            ) : (
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            )}
            <div className="text-sm flex-1">{i.text}</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" /> {i.time}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
