import { RequestHandler } from "express";

// Mock data per contracts
const KPI_SUMMARY = {
  total_cost: 1234000,
  on_time_dispatch: 94,
  rake_utilization: 89,
  avg_turnaround_hours: 26,
  penalty_savings: 24500,
  active_rakes: 14,
};

const ORDERS = [
  { order_id: "ORD-1001", customer: "Kolkata Steel", qty_t: 1000, due_date: "2025-10-05", priority: 1, mode: "rail", status: "pending", assigned_rakes: [] },
  { order_id: "ORD-1002", customer: "Patna Mills", qty_t: 800, due_date: "2025-10-06", priority: 2, mode: "either", status: "scheduled", assigned_rakes: ["R102"] },
];

const STOCKYARDS = [
  { stockyard_id: "SY-BOK", name: "Bokaro", avail_t: 1200, max_capacity: 5000, loading_rate_tph: 200, lat: 23.6693, lon: 86.1514 },
  { stockyard_id: "SY-DGP", name: "Durgapur", avail_t: 900, max_capacity: 4000, loading_rate_tph: 180, lat: 23.54, lon: 87.2926 },
];

const RAKES = [
  { rake_id: "R101", capacity_t: 1000, available_from: "2025-10-05T06:00", status: "available", home_siding: "SY-BOK" },
  { rake_id: "R102", capacity_t: 1000, available_from: "2025-10-05T09:00", status: "enroute", home_siding: "SY-DGP" },
];

export const getData: RequestHandler = (_req, res) => {
  res.json({ ok: true, message: "live data placeholder" });
};

export const kpis: RequestHandler = (_req, res) => {
  res.json(KPI_SUMMARY);
};

export const orders: RequestHandler = (req, res) => {
  const { from, to, customer, mode, priority } = req.query as Record<string, string | undefined>;
  let data = [...ORDERS];
  if (customer) data = data.filter((o) => o.customer.toLowerCase().includes(customer.toLowerCase()));
  if (mode) data = data.filter((o) => o.mode === mode);
  if (priority) data = data.filter((o) => String(o.priority) === String(priority));
  if (from) data = data.filter((o) => o.due_date >= from);
  if (to) data = data.filter((o) => o.due_date <= to);
  res.json(data);
};

export const stockyards: RequestHandler = (_req, res) => {
  res.json(STOCKYARDS);
};

export const rakes: RequestHandler = (_req, res) => {
  res.json(RAKES);
};

export const optimize: RequestHandler = (_req, res) => {
  const rows = [
    {
      rake_id: "R123",
      source: "Bokaro",
      destination: "Kolkata",
      load_tonnes: 990,
      departure: "2025-10-05T08:10",
      eta: "2025-10-05T17:55",
      cost: 53200,
      status: "On Time",
    },
    {
      rake_id: "R124",
      source: "Rourkela",
      destination: "Ranchi",
      load_tonnes: 960,
      departure: "2025-10-05T09:35",
      eta: "2025-10-05T17:40",
      cost: 49650,
      status: "On Time",
    },
  ];
  const routes = [
    { id: "r1", from: "bokaro", to: "kolkata", rake: "R123", load: 990, eta: "17:55" },
    { id: "r2", from: "rourkela", to: "ranchi", rake: "R124", load: 960, eta: "17:40" },
  ];
  res.json({ rows, routes });
};

export const simulate: RequestHandler = (req, res) => {
  const { delayMin = 15, loadDelta = 0 } = req.body || {};
  const rows = [
    {
      rake_id: "R123",
      source: "Bokaro",
      destination: "Kolkata",
      load_tonnes: 980 + Number(loadDelta || 0),
      departure: "2025-10-05T08:00",
      eta: "2025-10-05T18:00",
      cost: 54000 + Math.max(0, Number(delayMin || 0)) * 10,
      status: delayMin > 20 ? "Delayed" : "On Time",
    },
    {
      rake_id: "R124",
      source: "Rourkela",
      destination: "Ranchi",
      load_tonnes: 960,
      departure: "2025-10-05T09:30",
      eta: "2025-10-05T17:45",
      cost: 49800,
      status: "On Time",
    },
  ];
  res.json({ rows, total_cost: rows.reduce((a, b) => a + b.cost, 0) });
};

export const forecast: RequestHandler = (_req, res) => {
  res.json({ ok: true, message: "forecast complete" });
};

export const uploadData: RequestHandler = (_req, res) => {
  res.json({ ok: true });
};

export const reports: RequestHandler = (_req, res) => {
  res.json({ ok: true, data: [] });
};

export const lockPlan: RequestHandler = (req, res) => {
  const { date } = req.params;
  res.json({ ok: true, date, message: "Plan locked", exported: { csv: true, pdf: true } });
};

export const jobStatus: RequestHandler = (req, res) => {
  const { id } = req.params;
  res.json({ id, status: "completed", progress: 100 });
};
