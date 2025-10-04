import { RequestHandler } from "express";

export const getData: RequestHandler = (_req, res) => {
  res.json({ ok: true, message: "live data placeholder" });
};

export const optimize: RequestHandler = (_req, res) => {
  // Simulate optimization by returning slightly modified mock data
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
