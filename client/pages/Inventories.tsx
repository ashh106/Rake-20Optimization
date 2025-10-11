import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { ChartContainer, ChartConfig } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

interface Stockyard {
  stockyard_id: string;
  name: string;
  avail_t: number;
  max_capacity: number;
  loading_rate_tph: number;
  lat: number;
  lon: number;
}

export default function InventoriesPage() {
  const [yards, setYards] = useState<Stockyard[]>([]);
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<Stockyard | null>(null);

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/stockyards");
      const data: Stockyard[] = await res.json();
      setYards(data);
    };
    load();
  }, []);

  const onOpen = (y: Stockyard) => {
    setCurrent(y);
    setOpen(true);
  };

  const series = useMemo(() => {
    if (!current) return [] as { day: string; value: number }[];
    const base = current.avail_t;
    return Array.from({ length: 7 }).map((_, i) => ({ day: `D${i + 1}`, value: Math.max(0, Math.min(current.max_capacity, base + (i - 3) * (current.loading_rate_tph / 2))) }));
  }, [current]);

  const chartConfig: ChartConfig = { inventory: { label: "Inventory", color: "hsl(var(--primary))" } };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {yards.map((y) => (
          <Card key={y.stockyard_id} className="cursor-pointer hover:shadow-md" onClick={() => onOpen(y)}>
            <CardHeader>
              <CardTitle className="text-base">{y.name}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm grid grid-cols-2 gap-2">
              <div>
                <div className="text-muted-foreground">Available (t)</div>
                <div className="font-semibold">{y.avail_t.toLocaleString("en-IN")}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Max Capacity</div>
                <div className="font-semibold">{y.max_capacity.toLocaleString("en-IN")}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Loading Rate (tph)</div>
                <div className="font-semibold">{y.loading_rate_tph}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Coords</div>
                <div className="font-semibold">{y.lat.toFixed(3)}, {y.lon.toFixed(3)}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Stockyard Details</DrawerTitle>
          </DrawerHeader>
          {current && (
            <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="md:col-span-1 space-y-2">
                <div className="text-muted-foreground">Name</div>
                <div className="font-medium">{current.name}</div>
                <div className="text-muted-foreground">Available</div>
                <div className="font-medium">{current.avail_t.toLocaleString("en-IN")} t</div>
                <div className="text-muted-foreground">Max Capacity</div>
                <div className="font-medium">{current.max_capacity.toLocaleString("en-IN")} t</div>
                <div className="text-muted-foreground">Loading Rate</div>
                <div className="font-medium">{current.loading_rate_tph} tph</div>
              </div>
              <div className="md:col-span-2">
                <div className="text-sm font-semibold mb-2">Inventory (next 7 days)</div>
                <ChartContainer config={chartConfig} className="w-full h-56">
                  <BarChart data={series}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="day" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} />
                    <Bar dataKey="value" fill="var(--color-inventory)" radius={6} />
                  </BarChart>
                </ChartContainer>
              </div>
            </div>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
}
