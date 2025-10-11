import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { getData, optimize, simulate, forecast, uploadData, reports, kpis, orders, stockyards, rakes, lockPlan, jobStatus, planByDate, alerts, live, audit, modelRetrain, forecastInventory } from "./routes/sail";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // SAIL prototype endpoints (stubbed)
  app.get("/api/get_data", getData);
  app.get("/api/kpis", kpis);
  app.get("/api/orders", orders);
  app.get("/api/stockyards", stockyards);
  app.get("/api/rakes", rakes);
  app.post("/api/forecast", forecast);
  app.get("/api/forecast/inventory", forecastInventory);
  app.post("/api/optimize", optimize);
  app.post("/api/simulate", simulate);
  app.post("/api/upload_data", uploadData);
  app.get("/api/reports", reports);
  app.get("/api/plans/:date", planByDate);
  app.post("/plans/:date/lock", lockPlan);
  app.get("/api/jobs/:id", jobStatus);
  app.get("/api/alerts", alerts);
  app.get("/api/live", live);
  app.post("/api/audit", audit);
  app.post("/api/model/retrain", modelRetrain);

  return app;
}
