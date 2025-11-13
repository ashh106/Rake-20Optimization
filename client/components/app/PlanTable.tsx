import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export interface PlanRow {
  cmo_stockyard_location_id: string;
  product_id: string;
  customer_id: string;
  quantity_tonnes: number;
  wagons_used: number;
  distance_km: number;
  transport_cost: number;
  loading_cost: number;
  total_cost: number;
}

export default function PlanTable({ rows, onEdit }: { rows: PlanRow[]; onEdit: (row: PlanRow) => void }) {
  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Stockyard location</TableHead>
            <TableHead>Product id</TableHead>
            <TableHead>Customer id</TableHead>
            <TableHead className="text-right">Quantity (tonnes)</TableHead>
            <TableHead className="text-right">Wagons used</TableHead>
            <TableHead className="text-right">Distance (km)</TableHead>
            <TableHead className="text-right">Transport cost</TableHead>
            <TableHead className="text-right">Loading cost</TableHead>
            <TableHead className="text-right">Total cost</TableHead>
            <TableHead className="text-right">Edit</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r, idx) => (
            <TableRow key={`${r.product_id}-${r.customer_id}-${idx}`}>
              <TableCell className="font-medium">{r.cmo_stockyard_location_id}</TableCell>
              <TableCell>{r.product_id}</TableCell>
              <TableCell>{r.customer_id}</TableCell>
              <TableCell className="text-right">{r.quantity_tonnes.toLocaleString("en-IN")}</TableCell>
              <TableCell className="text-right">{r.wagons_used}</TableCell>
              <TableCell className="text-right">{r.distance_km}</TableCell>
              <TableCell className="text-right">{r.transport_cost.toLocaleString("en-IN")}</TableCell>
              <TableCell className="text-right">{r.loading_cost.toLocaleString("en-IN")}</TableCell>
              <TableCell className="text-right">{r.total_cost.toLocaleString("en-IN")}</TableCell>
              <TableCell className="text-right">
                <Button size="sm" variant="outline" onClick={() => onEdit(r)}>Edit</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
