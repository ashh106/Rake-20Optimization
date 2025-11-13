import { RequestHandler, Request, Response } from "express";
import axios from "axios";
import { FASTAPI_BASE_URL } from "../config";
import type {
  OptimizedPlan,
  Summary,
  Dataset,
  Customer,
  CustomerProduct,
  StockyardProduct,
  StockyardLocation,
  DistanceRecord,
  ApiError,
} from "@shared/api";

// Mock data per contracts
const KPI_SUMMARY = {
  total_cost: 1234000,
  on_time_dispatch: 94,
  rake_utilization: 89,
  pending_orders: 12,
  active_rakes: 14,
  last_updated: "2025-10-03T09:00:00Z",
};

const ORDERS = [
  { order_id: "ORD-1001", customer: "Kolkata Steel", qty_t: 1000, due_date: "2025-10-05", priority: 1, mode: "rail", status: "pending", assigned_rakes: [] },
  { order_id: "ORD-1002", customer: "Patna Mills", qty_t: 800, due_date: "2025-10-06", priority: 2, mode: "either", status: "scheduled", assigned_rakes: ["R102"] },
];

const STOCKYARDS = [
  { stockyard_id: "SY-BOK", name: "Bokaro", avail_t: 1200, max_capacity: 5000, loading_rate_tph: 200, lat: 23.6693, lon: 86.1514, last_updated: "2025-10-03T08:30:00Z" },
  { stockyard_id: "SY-DGP", name: "Durgapur", avail_t: 900, max_capacity: 4000, loading_rate_tph: 180, lat: 23.54, lon: 87.2926, last_updated: "2025-10-03T08:35:00Z" },
  { stockyard_id: "SY-RKL", name: "Rourkela", avail_t: 750, max_capacity: 4200, loading_rate_tph: 170, lat: 22.227, lon: 84.864, last_updated: "2025-10-03T08:40:00Z" },
  { stockyard_id: "SY-RAN", name: "Ranchi", avail_t: 680, max_capacity: 3600, loading_rate_tph: 150, lat: 23.344, lon: 85.309, last_updated: "2025-10-03T08:45:00Z" },
  { stockyard_id: "SY-KOL", name: "Kolkata", avail_t: 500, max_capacity: 3000, loading_rate_tph: 140, lat: 22.5726, lon: 88.3639, last_updated: "2025-10-03T08:50:00Z" },
];

const RAKES = [
  { rake_id: "R101", capacity_t: 1000, available_from: "2025-10-05T06:00", status: "available", home_siding: "SY-BOK" },
  { rake_id: "R102", capacity_t: 1000, available_from: "2025-10-05T09:00", status: "enroute", home_siding: "SY-DGP" },
];

let AUDIT_LOG: Array<{ id: string; user: string; ts: string; reason: string; change: Record<string, unknown> }> = [];

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

// Generate Plan: returns a job
export const optimize: RequestHandler = (req, res) => {
  const job_id = `job-${Math.floor(Math.random() * 1000)}`;
  const quick = (req.query.quick ?? "false").toString() === "true";
  const submitted_at = new Date().toISOString();
  const time_limit_seconds = Number((req.body?.time_limit_seconds as number) ?? (quick ? 60 : 120));
  res.json({ job_id, status: "running", submitted_at, time_limit_seconds });
};

// Job polling
export const jobStatus: RequestHandler = (req, res) => {
  const { id } = req.params;
  const date = new Date().toISOString().slice(0, 10);
  res.json({ job_id: id, status: "completed", progress: 100, result_url: `/api/plans/${date}`, completed_at: new Date().toISOString() });
};

// Plan result for a date
export const planByDate: RequestHandler = (req, res) => {
  const { date } = req.params;
  const plan = {
    date,
    plan_id: `plan-${date.replace(/-/g, "")}-v1`,
    rakes: [
      { rake_id: "R101", source: "Bokaro", destinations: ["Kolkata"], load_tonnes: 980, wagons: 20, departure: `${date}T08:00`, eta: `${date}T18:00`, utilization: 98, cost: 54000, status: "validated" },
      { rake_id: "R102", source: "Durgapur", destinations: ["Patna"], load_tonnes: 950, wagons: 19, departure: `${date}T09:30`, eta: `${date}T19:45`, utilization: 95, cost: 49800, status: "pending_check" },
    ],
    summary: { total_cost: 103800, avg_util: 96 },
  } as const;
  res.json(plan);
};

export const simulate: RequestHandler = (req, res) => {
  const { overrides = [], horizon_hours = 24 } = req.body || {};
  const today = new Date().toISOString().slice(0, 10);
  const alt = {
    date: today,
    plan_id: "plan-alt",
    rakes: [
      { rake_id: "R101", source: "Bokaro", destinations: ["Kolkata"], load_tonnes: 970, wagons: 20, departure: `${today}T08:30`, eta: `${today}T18:30`, utilization: 97, cost: 54500, status: "validated" },
      { rake_id: "R102", source: "Durgapur", destinations: ["Patna"], load_tonnes: 930, wagons: 19, departure: `${today}T10:00`, eta: `${today}T20:00`, utilization: 93, cost: 50500, status: "delayed" },
    ],
    summary: { total_cost: 105000, avg_util: 95 },
    deltas: { cost_delta: 1200, utilization_delta: -1 },
    horizon_hours,
    overrides,
  };
  res.json(alt);
};

export const forecast: RequestHandler = (_req, res) => {
  res.json({ ok: true, message: "forecast complete" });
};

export const forecastSummary: RequestHandler = (_req, res) => {
  res.json({
    forecasted_dispatches: 18,
    predicted_cost_trend: "down",
    expected_utilization_pct: 91,
    delay_risk_pct: 12,
    cost_breakdown: { freight: 920000, demurrage: 18000, penalties: 6200, idle_time: 8500 },
  });
};

export const insights: RequestHandler = (_req, res) => {
  res.json([
    { id: "i1", category: "Utilization", priority: "High", text: "Add 2 more wagons to Rake R104 to reduce partial load penalty.", action: "apply_plan" },
    { id: "i2", category: "Routing", priority: "Moderate", text: "Bokaro → Durgapur rakes underutilized (74%). Reassign 1 to Kolkata.", action: "view_details" },
    { id: "i3", category: "Delay", priority: "High", text: "Next 12 hrs: Predicted congestion at Rourkela Siding S2.", action: "apply_plan" },
  ]);
};

export const forecastInventory: RequestHandler = (req, res) => {
  const { stockyard = "SY-BOK", horizon = "3" } = req.query as Record<string, string>;
  const days = Number(horizon);
  const base = STOCKYARDS.find((s) => s.stockyard_id === stockyard)?.avail_t ?? 1000;
  const series = Array.from({ length: days }).map((_, i) => ({ day: i + 1, value: Math.max(0, base + (i - 1) * 50) }));
  res.json({ stockyard, horizon: days, series });
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

export const alerts: RequestHandler = (_req, res) => {
  res.json([
    { id: "a1", type: "warning", text: "Siding S1 nearing capacity", ts: new Date().toISOString() },
    { id: "a2", type: "info", text: "Maintenance window for R102 at 18:00", ts: new Date().toISOString() },
  ]);
};

export const live: RequestHandler = (_req, res) => {
  res.json([
    { id: "e1", type: "dispatch", text: "Rake R123 dispatched from Bokaro", ts: new Date().toISOString() },
    { id: "e2", type: "maintenance", text: "Rake R110 scheduled maintenance window", ts: new Date().toISOString() },
    { id: "e3", type: "alert", text: "R102 delayed 65 min due to congestion", ts: new Date().toISOString() },
  ]);
};

export const audit: RequestHandler = (req, res) => {
  const { user = "planner", reason = "", change = {} } = req.body || {};
  const item = { id: `audit-${AUDIT_LOG.length + 1}`, user, ts: new Date().toISOString(), reason, change };
  AUDIT_LOG.push(item);
  res.json(item);
};

export const modelRetrain: RequestHandler = (_req, res) => {
  res.json({ ok: true, started_at: new Date().toISOString(), job_id: `model-${Math.floor(Math.random() * 1000)}` });
};

// ---------------- FastAPI proxy handlers ----------------
function handleProxyError(res: Response, err: unknown, fallbackMessage: string, statusCode = 500) {
  const message = err instanceof Error ? err.message : String(err);
  return res.status(statusCode).json({ status: "error", message: fallbackMessage, details: message } satisfies ApiError);
}

export async function proxyGetOptimizedPlan(_req: Request, res: Response) {
  try {
    const rsp = await axios.get<OptimizedPlan[]>(`${FASTAPI_BASE_URL}/get-optimized-plan`);
    return res.json({ status: "success", data: rsp.data });
  } catch (err) {
    return handleProxyError(res, err, "Unable to fetch data from FastAPI");
  }
}

export async function proxyGetSummary(_req: Request, res: Response) {
  try {
    const rsp = await axios.get<Summary>(`${FASTAPI_BASE_URL}/get-summary`);
    return res.json({ status: "success", data: rsp.data });
  } catch (err) {
    return handleProxyError(res, err, "Unable to fetch data from FastAPI");
  }
}

export async function proxyDownloadPlan(_req: Request, res: Response) {
  try {
    const rsp = await axios.get(`${FASTAPI_BASE_URL}/download-plan`, { responseType: "arraybuffer" });
    const contentType = rsp.headers["content-type"] || "application/octet-stream";
    const disposition = rsp.headers["content-disposition"] || 'attachment; filename="plan.csv"';
    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", disposition);
    return res.send(Buffer.from(rsp.data));
  } catch (err) {
    return handleProxyError(res, err, "Unable to fetch data from FastAPI");
  }
}

export async function proxyDatasets(_req: Request, res: Response) {
  try {
    const rsp = await axios.get<Dataset[]>(`${FASTAPI_BASE_URL}/datasets`);
    return res.json({ status: "success", data: rsp.data });
  } catch (err) {
    return handleProxyError(res, err, "Unable to fetch data from FastAPI");
  }
}

export async function proxyCustomers(_req: Request, res: Response) {
  try {
    const rsp = await axios.get<Customer[]>(`${FASTAPI_BASE_URL}/customers`);
    return res.json({ status: "success", data: rsp.data });
  } catch (err) {
    return handleProxyError(res, err, "Unable to fetch data from FastAPI");
  }
}

export async function proxyCustomerProducts(_req: Request, res: Response) {
  try {
    const rsp = await axios.get<CustomerProduct[]>(`${FASTAPI_BASE_URL}/customer_products`);
    return res.json({ status: "success", data: rsp.data });
  } catch (err) {
    return handleProxyError(res, err, "Unable to fetch data from FastAPI");
  }
}

export async function proxyStockyardProducts(_req: Request, res: Response) {
  try {
    const rsp = await axios.get<StockyardProduct[]>(`${FASTAPI_BASE_URL}/stockyard_products`);
    return res.json({ status: "success", data: rsp.data });
  } catch (err) {
    return handleProxyError(res, err, "Unable to fetch data from FastAPI");
  }
}

export async function proxyStockyardLocations(_req: Request, res: Response) {
  try {
    const rsp = await axios.get<StockyardLocation[]>(`${FASTAPI_BASE_URL}/stockyard_locations`);
    return res.json({ status: "success", data: rsp.data });
  } catch (err) {
    return handleProxyError(res, err, "Unable to fetch data from FastAPI");
  }
}

export async function proxyStockyardCustomerDistances(_req: Request, res: Response) {
  try {
    const rsp = await axios.get<DistanceRecord[]>(`${FASTAPI_BASE_URL}/stockyard_customer_distances`);
    return res.json({ status: "success", data: rsp.data });
  } catch (err) {
    return handleProxyError(res, err, "Unable to fetch data from FastAPI");
  }
}

export async function proxyBokaroStockyardDistances(_req: Request, res: Response) {
  try {
    const rsp = await axios.get<DistanceRecord[]>(`${FASTAPI_BASE_URL}/bokaro_stockyard_distances`);
    return res.json({ status: "success", data: rsp.data });
  } catch (err) {
    return handleProxyError(res, err, "Unable to fetch data from FastAPI");
  }
}
