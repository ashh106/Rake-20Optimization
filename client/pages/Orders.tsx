import { useEffect, useMemo, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import type { CustomerProduct, ApiSuccess } from "@shared/api";

export default function OrdersPage() {
  const [orders, setOrders] = useState<CustomerProduct[]>([]);
  const [allOrders, setAllOrders] = useState<CustomerProduct[]>([]);
  const [customerLocationFilter, setCustomerLocationFilter] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<CustomerProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const normalizeCustomerProduct = (raw: CustomerProduct | (CustomerProduct & { product_list: unknown; quantity_list: unknown })) => {
    const normalized: CustomerProduct = {
      customer_id: raw.customer_id,
      customer_location_id: raw.customer_location_id,
      product_list: [],
      quantity_list: [],
      priority_weight: Number(raw.priority_weight ?? 0),
    };

    const rawProducts = (raw as any).product_list;
    if (Array.isArray(rawProducts)) {
      normalized.product_list = rawProducts as (string | number)[];
    } else if (typeof rawProducts === "string") {
      try {
        const parsed = JSON.parse(rawProducts);
        normalized.product_list = Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        normalized.product_list = rawProducts ? [rawProducts] : [];
      }
    }

    const rawQuantities = (raw as any).quantity_list;
    if (Array.isArray(rawQuantities)) {
      normalized.quantity_list = rawQuantities.map((q) => Number(q) || 0);
    } else if (typeof rawQuantities === "string") {
      try {
        const parsed = JSON.parse(rawQuantities);
        if (Array.isArray(parsed)) {
          normalized.quantity_list = parsed.map((q: unknown) => Number(q) || 0);
        } else {
          const n = Number(parsed);
          normalized.quantity_list = Number.isFinite(n) ? [n] : [];
        }
      } catch {
        const parts = rawQuantities
          .split(",")
          .map((s) => Number(s.trim()))
          .filter((n) => !Number.isNaN(n));
        normalized.quantity_list = parts;
      }
    }

    return normalized;
  };

  const loadAll = async () => {
    try {
      const res = await fetch(`/api/customer_products`);
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Failed to fetch customer products:", res.status, res.statusText, errorText);
        setError(`Failed to load data: ${res.status} ${res.statusText}`);
        setLoading(false);
        return;
      }
      const response = await res.json();
      if (response.status === "success" && Array.isArray(response.data)) {
        setAllOrders(response.data.map((o: CustomerProduct) => normalizeCustomerProduct(o)));
        setError(null);
      } else if (response.status === "error") {
        setError(response.message || "Failed to load customer products");
        console.error("API error:", response);
        setLoading(false);
      } else {
        setError("Unexpected response format from server");
        console.error("Unexpected response format:", response);
        setLoading(false);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to load customer products";
      setError(errorMessage);
      console.error("Failed to load customer products:", error);
      setLoading(false);
    }
  };

  const load = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (customerLocationFilter) {
        params.set("customer_location_id", customerLocationFilter);
      }
      const res = await fetch(`/api/customer_products?${params.toString()}`);
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Failed to fetch customer products:", res.status, res.statusText, errorText);
        setError(`Failed to load data: ${res.status} ${res.statusText}`);
        setLoading(false);
        return;
      }
      const response = await res.json();
      if (response.status === "success" && Array.isArray(response.data)) {
        setOrders(response.data.map((o: CustomerProduct) => normalizeCustomerProduct(o)));
        setError(null);
      } else if (response.status === "error") {
        setError(response.message || "Failed to load customer products");
        console.error("API error:", response);
      } else {
        setError("Unexpected response format from server");
        console.error("Unexpected response format:", response);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to load customer products";
      setError(errorMessage);
      console.error("Failed to load customer products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerLocationFilter]);

  const uniqueCustomerLocations = useMemo(
    () => Array.from(new Set(allOrders.map((o) => String(o.customer_location_id)))).sort(),
    [allOrders]
  );

  const onView = (o: CustomerProduct) => {
    setCurrent(o);
    setOpen(true);
  };

  const totalQuantity = (order: CustomerProduct) => {
    if (!order.quantity_list || !Array.isArray(order.quantity_list)) {
      return 0;
    }
    return order.quantity_list.reduce((sum, qty) => sum + (Number(qty) || 0), 0);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        <div className="flex flex-col gap-1">
          <label className="text-xs">Customer Location ID</label>
          <select
            className="h-9 rounded-md border px-2"
            value={customerLocationFilter}
            onChange={(e) => setCustomerLocationFilter(e.target.value)}
          >
            <option value="">All Locations</option>
            {uniqueCustomerLocations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <Button className="w-full" onClick={load} disabled={loading}>
            {loading ? "Loading..." : "Refresh"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          <p className="font-medium">Error loading data</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {loading && orders.length === 0 && !error && (
        <div className="rounded-xl border bg-card shadow-sm p-8 text-center text-muted-foreground">
          Loading customer orders...
        </div>
      )}

      {!loading && orders.length === 0 && !error && (
        <div className="rounded-xl border bg-card shadow-sm p-8 text-center text-muted-foreground">
          No customer orders found.
        </div>
      )}

      {orders.length > 0 && (
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer ID</TableHead>
              <TableHead>Customer Location ID</TableHead>
              <TableHead>Product List</TableHead>
              <TableHead className="text-right">Quantity List (t)</TableHead>
              <TableHead className="text-right">Total Qty (t)</TableHead>
              <TableHead className="text-right">Priority Weight</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((o, idx) => (
              <TableRow key={`${o.customer_id}-${o.customer_location_id}-${idx}`} className="hover:bg-muted/30">
                <TableCell className="font-medium">{o.customer_id}</TableCell>
                <TableCell>{o.customer_location_id}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {Array.isArray(o.product_list) && o.product_list.length > 0 ? (
                      o.product_list.map((product, i) => (
                        <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-muted">
                          {product}
                        </span>
                      ))
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-col items-end gap-1">
                    {Array.isArray(o.quantity_list) && o.quantity_list.length > 0 ? (
                      o.quantity_list.map((qty, i) => (
                        <span key={i} className="text-sm">
                          {Number(qty).toLocaleString("en-IN")}
                        </span>
                      ))
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {totalQuantity(o).toLocaleString("en-IN")}
                </TableCell>
                <TableCell className="text-right">{o.priority_weight ?? "—"}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button size="sm" variant="outline" onClick={() => onView(o)}>
                    Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      )}

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Customer Order Details</DrawerTitle>
          </DrawerHeader>
          {current && (
            <div className="px-6 pb-6 text-sm grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <div className="text-muted-foreground">Customer ID</div>
                <div className="font-medium">{current.customer_id}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Customer Location ID</div>
                <div className="font-medium">{current.customer_location_id}</div>
              </div>
              <div className="md:col-span-2">
                <div className="text-muted-foreground mb-2">Products & Quantities</div>
                <div className="space-y-2">
                  {Array.isArray(current.product_list) && current.product_list.length > 0 ? (
                    current.product_list.map((product, i) => (
                      <div key={i} className="flex justify-between items-center p-2 bg-muted rounded">
                        <span className="font-medium">Product: {product}</span>
                        <span className="text-muted-foreground">
                          Quantity: {Number(current.quantity_list?.[i] || 0).toLocaleString("en-IN")} t
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-muted-foreground text-sm">No products available</div>
                  )}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Total Quantity (t)</div>
                <div className="font-medium">{totalQuantity(current).toLocaleString("en-IN")}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Priority Weight</div>
                <div className="font-medium">{current.priority_weight}</div>
              </div>
            </div>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
}
