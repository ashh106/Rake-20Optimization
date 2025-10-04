import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export interface RakeRow {
  rake_id: string;
  source: string;
  destination: string;
  load_tonnes: number;
  departure: string;
  eta: string;
  cost: number;
  status: "On Time" | "Delayed" | string;
}

export default function RakeTable({ rows }: { rows: RakeRow[] }) {
  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Rake ID</TableHead>
            <TableHead>Source Yard</TableHead>
            <TableHead>Destination</TableHead>
            <TableHead className="text-right">Load (Tonnes)</TableHead>
            <TableHead>Departure</TableHead>
            <TableHead>ETA</TableHead>
            <TableHead className="text-right">Cost (₹)</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.rake_id} className={r.status === "Delayed" ? "bg-red-50/40" : "bg-green-50/30"}>
              <TableCell className="font-medium">{r.rake_id}</TableCell>
              <TableCell>{r.source}</TableCell>
              <TableCell>{r.destination}</TableCell>
              <TableCell className="text-right">{r.load_tonnes.toLocaleString("en-IN")}</TableCell>
              <TableCell>{new Date(r.departure).toLocaleString()}</TableCell>
              <TableCell>{new Date(r.eta).toLocaleString()}</TableCell>
              <TableCell className="text-right">{r.cost.toLocaleString("en-IN")}</TableCell>
              <TableCell>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${r.status === "Delayed" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>
                  {r.status}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
