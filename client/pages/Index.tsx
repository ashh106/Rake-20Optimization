import { useEffect, useState } from "react";
import KPICard from "@/components/app/KPICard";
import IndiaRailMap from "@/components/app/IndiaRailMap";
import RealMap from "@/components/app/RealMap";
import LiveFeed from "@/components/app/LiveFeed";
import ProcessPanel from "@/components/app/ProcessPanel";
import AiInsightsPanel from "@/components/app/AiInsights";
import ForecastSnapshot from "@/components/app/ForecastSnapshot";
import DailyTimeline from "@/components/app/DailyTimeline";
import WhatIfModal from "@/components/app/WhatIfModal";
import { kpis as mockKpis, nodes, routes } from "@/data/mock";
import { CircleDollarSign, CheckCircle, Gauge, Shield, Bell, AlertTriangle, X } from "lucide-react";

export default function DashboardOverview() {
  const [kpis, setKpis] = useState(mockKpis);
  const [alerts, setAlerts] = useState([] as { id: string; type: "info" | "alert" | "maintenance" | "dispatch"; text: string; time: string }[]);
  const [nodeInfo, setNodeInfo] = useState<Record<string, { avail_t?: number; active_rakes?: number; loading_status?: "green" | "yellow" | "red" }>>({});
  const [billing, setBilling] = useState<{ freight: number; demurrage: number; penalties: number; idle_time: number } | null>(null);
  const [filterActive, setFilterActive] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "info" | "success" | "error" } | null>(null);
  const [generating, setGenerating] = useState(false);
  const [schedule, setSchedule] = useState(
    Array.from({ length: 4 }).map((_, i) => ({
      id: `RKA-${i + 1}23${i + 1}`,
      from: 'Bokaro',
      to: ['Kolkata', 'Durgapur', 'Rourkela', 'Ranchi'][i % 4],
      goods: 'Steel Coils',
      batch: `${i + 1}2345`,
      wagons: (i + 1) * 2,
      capacityMt: (i + 1) * 2500,
      fillPct: Math.min(100, 60 + (i + 1) * 10),
      cost: (i + 1) * 1250000,
      statusIdx: i % 3,
    }))
  );

  const generateSchedule = () => {
    const choices = ['Kolkata', 'Durgapur', 'Rourkela', 'Ranchi', 'Jamshedpur'];
    const statuses = [0, 1, 2];
    const newRows = Array.from({ length: 4 }).map((_, i) => ({
      id: `RKA-${Math.floor(1000 + Math.random()*9000)}`,
      from: 'Bokaro',
      to: choices[Math.floor(Math.random()*choices.length)],
      goods: 'Steel Coils',
      batch: `${Math.floor(10000 + Math.random()*90000)}`,
      wagons: Math.floor(2 + Math.random()*10),
      capacityMt: Math.floor(20 + Math.random()*100) * 100,
      fillPct: Math.floor(60 + Math.random()*40),
      cost: Math.floor(8 + Math.random()*50) * 100000,
      statusIdx: statuses[Math.floor(Math.random()*statuses.length)],
    }));
    setSchedule(newRows);
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [r1, r2, r3, r4] = await Promise.all([fetch("/api/kpis"), fetch("/api/alerts"), fetch("/api/stockyards"), fetch("/api/forecast/summary")]);
        if (r1.ok) setKpis(await r1.json()); else setKpis(mockKpis);
        if (r2.ok) {
          const items = await r2.json();
          setAlerts(items.map((a: any) => ({ id: a.id, type: a.type === "warning" ? "alert" : (a.type || "info"), text: a.text, time: new Date(a.ts).toLocaleTimeString() })));
        }
        if (r3.ok) {
          const yards = await r3.json();
          const info: Record<string, any> = {};
          for (const y of yards) {
            const key = (y.name || "").toLowerCase();
            info[key.includes("bokaro") ? "bokaro" : key.includes("rourkela") ? "rourkela" : key.includes("durgapur") ? "durgapur" : key.includes("ranchi") ? "ranchi" : key.includes("kolkata") ? "kolkata" : y.stockyard_id] = { avail_t: y.avail_t, active_rakes: Math.floor(Math.random() * 5) + 1, loading_status: ["green","yellow","red"][Math.floor(Math.random()*3)] };
          }
          setNodeInfo(info);
        }
        if (r4.ok) {
          const s = await r4.json();
          setBilling(s.cost_breakdown);
        }
      } catch {
        setKpis(mockKpis);
      }
    };
    load();
  }, []);

  const [selectedTrain, setSelectedTrain] = useState(schedule[0]?.id || '');
const [timelineData, setTimelineData] = useState<Record<string, { text: string; status: 'success' | 'warn' | 'info' }[]>>({});

useEffect(() => {
  const data: Record<string, { text: string; status: 'success' | 'warn' | 'info' }[]> = {};
  schedule.forEach((s) => {
    data[s.id] = [
      { text: `${s.id} dispatched from ${s.from}`, status: 'success' },
      { text: `${s.id} arriving at ${s.to} delayed 10m`, status: 'warn' },
      { text: `Truck assignments pending for ${s.id}`, status: 'info' },
    ];
  });
  setTimelineData(data);

  if (!data[selectedTrain]) setSelectedTrain(schedule[0]?.id || '');
}, [schedule]);


  return (

    // ---------------------------------------------------------------------------------------------------
    <div className="space-y-4 max-w-screen-2xl mx-auto px-4 pt-4">
      {/* Page utility bar: Notification bell (dropdown) */}
    

    
      {/* Top Section:  (75%) + Mini Map (25%) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left: Daily Schedule */}
        <div className="lg:col-span-3 rounded-lg border bg-card shadow-sm relative">
  {/* Loading Overlay */}
  {generating && (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm rounded-lg">
      <div className="h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
      <p className="text-sm text-muted-foreground">Generating schedule...</p>
    </div>
  )}

  <div className="p-3 border-b">
{/* changes made here  */}

            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Daily Schedule</h3>
              <div className="flex items-center gap-2">
                <select className="h-8 text-xs rounded-md border px-2 bg-background">
                  <option>All Routes</option>
                  <option>Rail Only</option>
                  <option>Road Only</option>
                </select>
                <button
                  className="h-8 px-3 text-xs rounded-md bg-primary text-primary-foreground disabled:opacity-60"
                  onClick={async ()=>{
                    try {
                      setGenerating(true);
                      await fetch('/api/schedule/generate',{method:'POST'});
                      setTimeout(()=>{
                        setGenerating(false);
                        generateSchedule();
                        setToast({ msg: 'New optimized schedule generated.', type: 'success' });
                        setAlerts((prev)=> [{ id: String(Date.now()), type: 'info', text: 'Schedule update successful', time: new Date().toLocaleTimeString() }, ...prev].slice(0,10));
                      }, 1500);
                    } catch {
                      setGenerating(false);
                      setToast({ msg: 'Failed to generate plan', type: 'error' });
                    }
                  }}
                  disabled={generating}
                >
                  {generating ? 'Generating…' : 'Generate Schedule'}
                </button>
                <a href="/planner" className="h-8 px-3 text-xs rounded-md border bg-background">Re-Plan Shedule</a>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="border-b">
                  <th className="text-left p-3">Train #</th>
                  <th className="text-left p-3">Route</th>
                  <th className="text-left p-3">Goods</th>
                  <th className="text-left p-3">Capacity</th>
                  <th className="text-left p-3">Cost</th>
                  <th className="text-left p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {schedule.map((row) => (
                  <tr key={row.id} className="hover:bg-muted/50">
                    <td className="p-3 font-medium">{row.id}</td>
                    <td className="p-3">
                      <div>{row.from} → {row.to}</div>
                      <div className="text-xs text-muted-foreground">{row.wagons} wagons • SAIL</div>
                    </td>
                    <td className="p-3">
                      <div>{row.goods}</div>
                      <div className="text-xs text-muted-foreground">Batch #{row.batch}</div>
                    </td>
                    <td className="p-3">
                      <div>{row.capacityMt} MT</div>
                      <div className="w-full bg-muted rounded-full h-2 mt-1">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: `${row.fillPct}%` }} />
                      </div>
                    </td>
                    <td className="p-3">₹{row.cost.toLocaleString('en-IN')}</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        row.statusIdx === 0 ? 'bg-green-100 text-green-800' : row.statusIdx === 1 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {['On Time', 'In Transit', 'Delayed'][row.statusIdx]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Mini Map (1:1) */}
        <div className="rounded-lg shadow-sm border bg-card">
          <div className="p-2 border-b text-xs font-medium text-muted-foreground">Live Route Map</div>
          <div className="relative w-full z-0">
            <div className="pt-[100%]" />
            <div className="absolute inset-0 rounded-b-lg overflow-hidden">
              <RealMap scenario="current" />
            </div>
          </div>
        </div>
      </div>

      Operational Timeline below Schedule
    <div className="rounded-lg border bg-card shadow-sm">
  <div className="p-3 border-b flex items-center justify-between">
    <h3 className="font-semibold">Operational Timeline</h3>
    <div className="flex items-center gap-2">
      {/* Dropdown to select train */}
      <select
        className="h-8 text-sm rounded-md border px-2 bg-background"
        value={selectedTrain}
        onChange={(e) => setSelectedTrain(e.target.value)}
      >
        {schedule.map((s) => (
          <option key={s.id} value={s.id}>{s.id}</option>
        ))}
      </select>
      <a href="/orders" className="text-sm text-primary hover:underline">View all orders →</a>
    </div>
  </div>
  <div className="p-3">
    <ol className="relative border-l pl-6 space-y-4">
      {(timelineData[selectedTrain] || []).map((it, idx) => (
        <li key={idx} className="group">
          <span
            className={`absolute -left-2 top-1.5 h-3 w-3 rounded-full ${
              it.status === 'success' ? 'bg-green-500' : it.status === 'warn' ? 'bg-yellow-500' : 'bg-blue-500'
            }`}
          />
          <a href="/orders" className="block text-sm">
            <span className="font-medium">{it.text}</span>
            <span className="ml-2 text-xs text-muted-foreground group-hover:underline">Open in Orders</span>
          </a>
        </li>
      ))}
    </ol>
  </div>
</div>


      {/* Unified KPI Metrics Bar */}
      <div className="rounded-lg border bg-card p-3">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="p-2 border rounded-md">
            <div className="flex items-center gap-2">
              <CircleDollarSign className="h-4 w-4 opacity-70" />
              <div>
                <div className="text-xs text-muted-foreground">Total Cost</div>
                <div className="font-semibold">₹{kpis.total_cost}</div>
              </div>
            </div>
          </div>
          <div className="p-2 border rounded-md">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 opacity-70" />
              <div>
                <div className="text-xs text-muted-foreground">On-Time</div>
                <div className="font-semibold">{kpis.on_time_dispatch}%</div>
              </div>
            </div>
          </div>
          <div className="p-2 border rounded-md">
            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4 opacity-70" />
              <div>
                <div className="text-xs text-muted-foreground">Utilization</div>
                <div className="font-semibold">{kpis.rake_utilization}%</div>
              </div>
            </div>
          </div>
          <div className="p-2 border rounded-md">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 opacity-70" />
              <div>
                <div className="text-xs text-muted-foreground">Penalty Saved</div>
                <div className="font-semibold">₹{kpis.penalty_savings}</div>
              </div>
            </div>
          </div>
          <div className="p-2 border rounded-md">
            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4 opacity-70" />
              <div>
                <div className="text-xs text-muted-foreground">Active Rakes</div>
                <div className="font-semibold">{kpis.active_rakes}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column - Flow & Timeline (schedule moved above) */}
        <div className="lg:col-span-2 space-y-4">
          <ProcessPanel />
          <DailyTimeline />
        </div>
        
        {/* Right Column - Insights and Alerts */}
        <div className="space-y-4">
          <AiInsightsPanel />
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <div className="text-sm font-semibold mb-2">Cost & Billing Snapshot</div>
            {billing ? (
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><div className="text-muted-foreground">Freight</div><div className="font-semibold">₹{billing.freight.toLocaleString("en-IN")}</div></div>
                <div><div className="text-muted-foreground">Demurrage</div><div className="font-semibold">₹{billing.demurrage.toLocaleString("en-IN")}</div></div>
                <div><div className="text-muted-foreground">Penalties</div><div className="font-semibold">₹{billing.penalties.toLocaleString("en-IN")}</div></div>
                <div><div className="text-muted-foreground">Idle Time</div><div className="font-semibold">₹{billing.idle_time.toLocaleString("en-IN")}</div></div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">Loading…</div>
            )}
          </div>  
          <LiveFeed items={alerts} />
        </div>
      </div>

      {/* Slide-out Notifications Drawer */}
      {notifOpen && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/30" onClick={()=>setNotifOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-80 bg-card border-l shadow-xl z-50 flex flex-col">
            <div className="p-3 border-b flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold"><Bell className="h-4 w-4"/> Alerts & Notifications</div>
              <button className="p-1 rounded hover:bg-muted" onClick={()=>setNotifOpen(false)} aria-label="Close"><X className="h-4 w-4"/></button>
            </div>
            <div className="flex-1 overflow-auto">
              {alerts.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground">No new alerts.</div>
              ) : (
                <ul className="divide-y">
                  {alerts.map((a)=> (
                    <li key={a.id} className="p-3 text-sm">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className={`h-4 w-4 mt-0.5 ${a.type==='alert'?'text-red-500':'text-yellow-500'}`} />
                        <div>
                          <div className="font-medium">{a.text}</div>
                          <div className="text-xs text-muted-foreground">{a.time}</div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-4 left-4 z-50">
          <div className={`rounded-md shadow-lg px-3 py-2 text-sm bg-card border ${toast.type==='success'?'border-green-300':'border-red-300'}`}>
            {toast.msg}
            <button className="ml-2 text-xs text-primary underline" onClick={()=>setToast(null)}>Dismiss</button>
          </div>
        </div>
      )}
    </div>
  );
}
