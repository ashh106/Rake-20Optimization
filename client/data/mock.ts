import type { RakeRow } from "@/components/app/RakeTable";
import type { Node, RouteInfo } from "@/components/app/IndiaRailMap";
import type { FeedItem } from "@/components/app/LiveFeed";

export const kpis = {
  total_cost: 1234000,
  on_time_dispatch: 94,
  rake_utilization: 89,
  penalty_savings: 24500,
  active_rakes: 14,
};

export const nodes: Node[] = [
  { id: "bokaro", label: "Bokaro", x: 55, y: 40 },
  { id: "rourkela", label: "Rourkela", x: 48, y: 45 },
  { id: "durgapur", label: "Durgapur", x: 65, y: 38 },
  { id: "kolkata", label: "Kolkata", x: 75, y: 42 },
  { id: "ranchi", label: "Ranchi", x: 52, y: 48 },
];

export const routes: RouteInfo[] = [
  { id: "r1", from: "bokaro", to: "kolkata", rake: "R123", load: 980, eta: "18:00" },
  { id: "r2", from: "rourkela", to: "ranchi", rake: "R124", load: 960, eta: "17:45" },
  { id: "r3", from: "durgapur", to: "kolkata", rake: "R126", load: 1000, eta: "19:20" },
];

export const feed: FeedItem[] = [
  { id: "f1", type: "info", text: "Rake R123 dispatched from Bokaro (980T).", time: "2m ago" },
  { id: "f2", type: "info", text: "Rake R126 loading at Durgapur (1000T).", time: "5m ago" },
  { id: "f3", type: "alert", text: "Rail API delay detected (10 min).", time: "8m ago" },
];

export const rakeRows: RakeRow[] = [
  {
    rake_id: "R123",
    source: "Bokaro",
    destination: "Kolkata",
    load_tonnes: 980,
    departure: "2025-10-05T08:00",
    eta: "2025-10-05T18:00",
    cost: 54000,
    status: "On Time",
  },
  {
    rake_id: "R124",
    source: "Rourkela",
    destination: "Ranchi",
    load_tonnes: 960,
    departure: "2025-10-05T09:30",
    eta: "2025-10-05T17:45",
    cost: 49800,
    status: "Delayed",
  },
];
