import { useEffect, useRef, useState } from "react";
import L, { Map as LeafletMap, LayerGroup, Marker, Polyline, Circle } from "leaflet";
import "leaflet/dist/leaflet.css";

interface LiveRake { id: string; from: string; to: string; eta: string; status: "on_time"|"delayed"|"idle"; cost?: number }

export default function RealMap({ scenario }: { scenario: string }) {
  const mapRef = useRef<LeafletMap | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const layersRef = useRef<{ markers: LayerGroup; routes: LayerGroup; heat: LayerGroup }>({ markers: new L.LayerGroup(), routes: new L.LayerGroup(), heat: new L.LayerGroup() });
  const [toggles, setToggles] = useState({ capacities: true, active: true, maintenance: true, heatmap: false });

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;
    const map = L.map(containerRef.current, { center: [23.5, 86.0], zoom: 6, zoomControl: false });
    L.control.zoom({ position: "bottomright" }).addTo(map);
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", { attribution: "© OpenStreetMap, © CARTO" }).addTo(map);
    layersRef.current.markers.addTo(map);
    layersRef.current.routes.addTo(map);
    mapRef.current = map;
  }, []);

  useEffect(() => {
    const map = mapRef.current; if (!map) return;
    const { markers, routes, heat } = layersRef.current;
    markers.clearLayers(); routes.clearLayers(); heat.clearLayers();

    const fetchData = async () => {
      const today = new Date().toISOString().slice(0,10);
      const [syRes, planRes] = await Promise.all([fetch("/api/stockyards"), fetch(`/api/plans/${today}`)]);
      const sys = await syRes.json();
      const plan = await planRes.json();

      const byName: Record<string,{ lat:number; lon:number; avail_t:number; loading_rate_tph:number }>= {};
      for (const s of sys) byName[(s.name || "").toLowerCase()] = s;

      // Stockyard markers with tooltips
      sys.forEach((s: any) => {
        const m = L.circleMarker([s.lat, s.lon], { radius: 6, color: "#0B3C5D", weight: 2, fillOpacity: 0.9 }).addTo(markers);
        const status = ["green","yellow","red"][Math.floor(Math.random()*3)];
        m.bindTooltip(`<b>${s.name}</b><br/>Available: ${s.avail_t} t<br/>Active rakes: ${Math.floor(Math.random()*5)+1}<br/>Loading: ${s.loading_rate_tph} tph<br/>Status: ${status}`);
      });

      // Routes and moving markers per rake
      const live: LiveRake[] = plan.rakes.map((r: any, i: number) => ({ id: r.rake_id, from: r.source, to: r.destinations[0], eta: r.eta, status: i%4===0?"delayed":"on_time", cost: r.cost }));
      live.forEach((r) => {
        const a = byName[r.from.toLowerCase()] || byName["bokaro"]; const b = byName[r.to.toLowerCase()] || byName["kolkata"]; if (!a || !b) return;
        const line = L.polyline([[a.lat, a.lon],[b.lat,b.lon]], { color: r.status==="delayed"?"#DC2626":"#00b37e", weight: 2, dashArray: "6 6" }).addTo(routes) as Polyline;
        const train = L.circleMarker([a.lat, a.lon], { radius: 4, color: r.status==="delayed"?"#DC2626":"#FF7F11", fillOpacity: 1 }).addTo(routes) as Circle;
        const total = 60000; let t0 = performance.now();
        const animate = (now: number) => {
          const p = ((now - t0) % total) / total; const lat = a.lat + (b.lat - a.lat) * p; const lon = a.lon + (b.lon - a.lon) * p; train.setLatLng([lat,lon]);
          train.bindTooltip(`${r.id} → ${r.to}<br/>ETA: ${new Date(r.eta).toLocaleTimeString()}<br/>Cost: ₹${(r.cost||0).toLocaleString("en-IN")}`);
          if (toggles.active) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
      });

      // Heatmap substitute using colored circles
      if (toggles.heatmap) {
        sys.forEach((s: any) => {
          const idx = Math.random();
          const c = idx>0.66?"#8B0000":idx>0.33?"#F59E0B":"#16A34A";
          L.circle([s.lat, s.lon], { radius: 20000, color: c, weight: 1, fillColor: c, fillOpacity: 0.2 }).addTo(heat);
        });
        heat.addTo(map);
      }
    };
    fetchData();
  }, [toggles, scenario]);

  return (
    <div className="relative w-full h-[520px] rounded-xl border overflow-hidden bg-card">
      <div ref={containerRef} className="w-full h-full" />
      <div className="absolute top-3 right-3 rounded-md border bg-background/90 backdrop-blur p-2 text-xs space-y-1 shadow">
        <div className="font-semibold mb-1">Layers</div>
        <label className="flex items-center gap-2"><input type="checkbox" checked={toggles.active} onChange={e=>setToggles({...toggles, active:e.target.checked})}/> Active Rakes</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={toggles.capacities} onChange={e=>setToggles({...toggles, capacities:e.target.checked})}/> Stockyard Capacities</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={toggles.maintenance} onChange={e=>setToggles({...toggles, maintenance:e.target.checked})}/> Maintenance</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={toggles.heatmap} onChange={e=>setToggles({...toggles, heatmap:e.target.checked})}/> Cost Heatmap</label>
      </div>
    </div>
  );
}
