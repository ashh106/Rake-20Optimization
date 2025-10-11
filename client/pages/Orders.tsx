import { useEffect, useMemo, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";

interface Order {
  order_id: string;
  customer: string;
  qty_t: number;
  due_date: string;
  priority: number;
  mode: "rail" | "road" | "either" | string;
  status: string;
  assigned_rakes: string[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [from, setFrom] = useState("2025-10-05");
  const [to, setTo] = useState("2025-10-06");
  const [customer, setCustomer] = useState("");
  const [mode, setMode] = useState("");
  const [priority, setPriority] = useState("");
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<Order | null>(null);

  const load = async () => {
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (customer) params.set("customer", customer);
    if (mode) params.set("mode", mode);
    if (priority) params.set("priority", priority);
    const res = await fetch(`/api/orders?${params.toString()}`);
    const data: Order[] = await res.json();
    setOrders(data);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const uniqueCustomers = useMemo(() => Array.from(new Set(orders.map((o) => o.customer))), [orders]);

  const onView = (o: Order) => {
    setCurrent(o);
    setOpen(true);
  };

  const onAssign = (o: Order) => {
    const next = { ...o, assigned_rakes: o.assigned_rakes.concat(["R101"]) };
    setOrders((all) => all.map((x) => (x.order_id === o.order_id ? next : x)));
  };

  const onUnassign = (o: Order) => {
    const next = { ...o, assigned_rakes: o.assigned_rakes.slice(0, -1) };
    setOrders((all) => all.map((x) => (x.order_id === o.order_id ? next : x)));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
        <div className="flex flex-col gap-1">
          <label className="text-xs">From</label>
          <input type="date" className="h-9 rounded-md border px-2" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs">To</label>
          <input type="date" className="h-9 rounded-md border px-2" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs">Customer</label>
          <select className="h-9 rounded-md border px-2" value={customer} onChange={(e) => setCustomer(e.target.value)}>
            <option value="">All</option>
            {uniqueCustomers.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs">Mode</label>
          <select className="h-9 rounded-md border px-2" value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="">Any</option>
            <option value="rail">Rail</option>
            <option value="road">Road</option>
            <option value="either">Either</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs">Priority</label>
          <select className="h-9 rounded-md border px-2" value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="">Any</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
          </select>
        </div>
        <div className="flex items-end">
          <Button className="w-full" onClick={load}>Apply Filters</Button>
        </div>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead className="text-right">Qty (t)</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Mode</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assigned Rakes</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((o) => (
              <TableRow key={o.order_id} className="hover:bg-muted/30">
                <TableCell className="font-medium">{o.order_id}</TableCell>
                <TableCell>{o.customer}</TableCell>
                <TableCell className="text-right">{o.qty_t.toLocaleString("en-IN")}</TableCell>
                <TableCell>{o.due_date}</TableCell>
                <TableCell>{o.priority}</TableCell>
                <TableCell className="capitalize">{o.mode}</TableCell>
                <TableCell className="capitalize">{o.status}</TableCell>
                <TableCell>{o.assigned_rakes.join(", ") || "—"}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button size="sm" variant="outline" onClick={() => onView(o)}>Details</Button>
                  <Button size="sm" onClick={() => onAssign(o)}>Assign</Button>
                  <Button size="sm" variant="secondary" onClick={() => onUnassign(o)} disabled={!o.assigned_rakes.length}>Unassign</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Order Details</DrawerTitle>
          </DrawerHeader>
          {current && (
            <div className="px-6 pb-6 text-sm grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <div className="text-muted-foreground">Order ID</div>
                <div className="font-medium">{current.order_id}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Customer</div>
                <div className="font-medium">{current.customer}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Quantity (t)</div>
                <div className="font-medium">{current.qty_t.toLocaleString("en-IN")}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Due Date</div>
                <div className="font-medium">{current.due_date}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Mode</div>
                <div className="font-medium capitalize">{current.mode}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Priority</div>
                <div className="font-medium">{current.priority}</div>
              </div>
              <div className="md:col-span-2">
                <div className="text-muted-foreground">Assigned Rakes</div>
                <div className="font-medium">{current.assigned_rakes.join(", ") || "None"}</div>
              </div>
            </div>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
}
