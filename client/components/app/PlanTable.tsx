import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export interface PlanRow {
  rake_id: string;
  source: string;
  destinations: string[];
  load_tonnes: number;
  wagons: number;
  departure: string;
  eta: string;
  utilization: number;
  cost: number;
  status: string;
}

export default function PlanTable({ rows, onEdit }: { rows: PlanRow[]; onEdit: (row: PlanRow) => void }) {
  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Rake ID</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Destinations</TableHead>
            <TableHead className="text-right">Load (t)</TableHead>
            <TableHead>Wagons</TableHead>
            <TableHead>Dep</TableHead>
            <TableHead>ETA</TableHead>
            <TableHead className="text-right">Util %</TableHead>
            <TableHead className="text-right">Cost (₹)</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Edit</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.rake_id} className={r.status.includes("pending") ? "bg-yellow-50/40" : r.status.includes("delay") ? "bg-red-50/40" : ""}>
              <TableCell className="font-medium">{r.rake_id}</TableCell>
              <TableCell>{r.source}</TableCell>
              <TableCell>{r.destinations.join(", ")}</TableCell>
              <TableCell className="text-right">{r.load_tonnes.toLocaleString("en-IN")}</TableCell>
              <TableCell>{r.wagons}</TableCell>
              <TableCell>{new Date(r.departure).toLocaleString()}</TableCell>
              <TableCell>{new Date(r.eta).toLocaleString()}</TableCell>
              <TableCell className="text-right">{r.utilization}%</TableCell>
              <TableCell className="text-right">{r.cost.toLocaleString("en-IN")}</TableCell>
              <TableCell>{r.status}</TableCell>
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
