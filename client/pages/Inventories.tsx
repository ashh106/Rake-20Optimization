import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { ChartContainer, ChartConfig } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ApiSuccess, StockyardProduct } from "@shared/api";

interface Stockyard {
  stockyard_id: string;
  name: string;
  avail_t: number;
  max_capacity: number;
  loading_rate_tph: number;
}

export default function InventoriesPage() {
  const [yards, setYards] = useState<Stockyard[]>([]);
  const [products, setProducts] = useState<StockyardProduct[]>([]);
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<Stockyard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        // Load static stockyard details (capacity, loading rate, etc.)
        const res = await fetch("/api/stockyards");
        const data: Stockyard[] = await res.json();
        setYards(data);

        // Load live inventory per stockyard/product from FastAPI proxy
        const productsRes = await fetch("/api/stockyard_products");
        if (!productsRes.ok) {
          const errorText = await productsRes.text();
          console.error("Failed to fetch stockyard products:", productsRes.status, productsRes.statusText, errorText);
          setError(`Failed to load stockyard products: ${productsRes.status} ${productsRes.statusText}`);
        } else {
          const body = (await productsRes.json()) as ApiSuccess<StockyardProduct[]> | unknown;
          if (
            typeof body === "object" &&
            body !== null &&
            "status" in body &&
            (body as ApiSuccess<StockyardProduct[]>).status === "success"
          ) {
            const payload = body as ApiSuccess<StockyardProduct[]>;
            setProducts(Array.isArray(payload.data) ? payload.data : []);
            setError(null);
          } else {
            console.error("Unexpected /api/stockyard_products response:", body);
            setError("Unexpected response format from /api/stockyard_products");
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load inventories";
        console.error("Error loading inventories:", err);
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const onOpen = (y: Stockyard) => {
    setCurrent(y);
    setOpen(true);
  };

  // Group product inventory by stockyard
  const productsByYard = useMemo(() => {
    const map = new Map<
      string | number,
      {
        stockyard_id: string | number;
        product_id: string | number;
        available_tonnes: number;
        raw: StockyardProduct;
      }[]
    >();
    for (const p of products) {
      const key = p.stockyard_id;
      const list = map.get(key) ?? [];
      list.push({
        stockyard_id: p.stockyard_id,
        product_id: p.product_id,
        available_tonnes: Number(p.quantity_available_tonnes ?? p.available_tonnes ?? 0),
        raw: p,
      });
      map.set(key, list);
    }
    return map;
  }, [products]);

  // Total available tonnes per stockyard based on product data
  const totalAvailableByYard = useMemo(() => {
    const totals = new Map<string | number, number>();
    for (const [yardId, entries] of productsByYard.entries()) {
      const sum = entries.reduce((acc, e) => acc + (Number(e.available_tonnes) || 0), 0);
      totals.set(yardId, sum);
    }
    return totals;
  }, [productsByYard]);

  const series = useMemo(() => {
    if (!current) return [] as { day: string; value: number }[];
    const base = totalAvailableByYard.get(current.stockyard_id) ?? current.avail_t;
    return Array.from({ length: 7 }).map((_, i) => ({
      day: `D${i + 1}`,
      value: Math.max(0, Math.min(current.max_capacity, base + (i - 3) * (current.loading_rate_tph / 2))),
    }));
  }, [current, totalAvailableByYard]);

  const chartConfig: ChartConfig = { inventory: { label: "Inventory", color: "hsl(var(--primary))" } };

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          <p className="font-medium">Error loading inventories</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Summary cards per stockyard (coordinates hidden) */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {yards.map((y) => {
          const totalAvailable = totalAvailableByYard.get(y.stockyard_id) ?? y.avail_t;
          return (
            <Card key={y.stockyard_id} className="cursor-pointer hover:shadow-md" onClick={() => onOpen(y)}>
              <CardHeader>
                <CardTitle className="text-base">{y.name}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm grid grid-cols-2 gap-2">
                <div>
                  <div className="text-muted-foreground">Available (t)</div>
                  <div className="font-semibold">{totalAvailable.toLocaleString("en-IN")}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Max Capacity</div>
                  <div className="font-semibold">{y.max_capacity.toLocaleString("en-IN")}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Loading Rate (tph)</div>
                  <div className="font-semibold">{y.loading_rate_tph}</div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detailed Inventories & Stockyards table from FastAPI data */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Stockyard location</TableHead>
              <TableHead>Stockyard ID</TableHead>
              <TableHead>Product ID</TableHead>
              <TableHead>Product name</TableHead>
              <TableHead className="text-right">Loading cost (₹)</TableHead>
              <TableHead className="text-right">Quantity available (t)</TableHead>
              <TableHead className="text-right">Qty / wagon (t)</TableHead>
              <TableHead>Wagon type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-6 text-center text-muted-foreground">
                  Loading stockyard products...
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-6 text-center text-muted-foreground">
                  No stockyard product data available.
                </TableCell>
              </TableRow>
            ) : (
              products.map((p, idx) => (
                <TableRow key={`${p.stockyard_id}-${p.product_id}-${idx}`}>
                  <TableCell className="font-medium">{p.cmo_stockyard_location_id ?? "—"}</TableCell>
                  <TableCell>{p.cmo_stockyard_id ?? p.stockyard_id}</TableCell>
                  <TableCell>{p.product_id}</TableCell>
                  <TableCell>{p.product_name ?? "—"}</TableCell>
                  <TableCell className="text-right">
                    {p.loading_cost != null ? `₹${Number(p.loading_cost).toLocaleString("en-IN")}` : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    {Number(p.quantity_available_tonnes ?? p.available_tonnes ?? 0).toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell className="text-right">
                    {p.quantity_per_wagon_tonnes != null ? Number(p.quantity_per_wagon_tonnes).toFixed(2) : "—"}
                  </TableCell>
                  <TableCell>{p.wagon_type_required ?? "—"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
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
                <div className="font-medium">
                  {(totalAvailableByYard.get(current.stockyard_id) ?? current.avail_t).toLocaleString("en-IN")} t
                </div>
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
