import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ReportRow {
  id: string;
  name: string;
  type: string;
  period: string;
  status: string;
}

export default function ReportsPage() {
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/reports");
        if (!res.ok) {
          const text = await res.text();
          setError(text || `${res.status} ${res.statusText}`);
          setLoading(false);
          return;
        }
        const body = await res.json();
        const data = Array.isArray(body?.data) ? body.data : [];
        const mapped: ReportRow[] = data.map((r: any, idx: number) => ({
          id: String(r.id ?? `RPT-${idx + 1}`),
          name: String(r.name ?? r.title ?? "KPI Summary"),
          type: String(r.type ?? "Operational"),
          period: String(r.period ?? "Last 7 days"),
          status: String(r.status ?? "Ready"),
        }));
        setRows(mapped);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Reports &amp; Insights</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          View generated KPI and operations reports. As the optimization engine runs, new report snapshots will appear here.
        </CardContent>
      </Card>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Report</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={4} className="py-6 text-center text-muted-foreground text-sm">
                  Loading reports...
                </TableCell>
              </TableRow>
            )}
            {!loading && error && (
              <TableRow>
                <TableCell colSpan={4} className="py-6 text-center text-red-700 text-sm">
                  {error}
                </TableCell>
              </TableRow>
            )}
            {!loading && !error && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="py-6 text-center text-muted-foreground text-sm">
                  No reports available yet.
                </TableCell>
              </TableRow>
            )}
            {!loading && !error &&
              rows.map((r) => (
                <TableRow key={r.id} className="hover:bg-muted/40">
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell>{r.type}</TableCell>
                  <TableCell>{r.period}</TableCell>
                  <TableCell>{r.status}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
