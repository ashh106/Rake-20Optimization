import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const DATASETS = [
  { key: "bokaro_stockyard_distances", label: "Bokaro stockyard distances", path: "/api/datasets/bokaro_stockyard_distances" },
  { key: "customer_locations", label: "Customer locations", path: "/api/datasets/customer_locations" },
  { key: "customer_priority", label: "Customer priority", path: "/api/datasets/customer_priority" },
  { key: "customer_products", label: "Customer products", path: "/api/datasets/customer_products" },
  { key: "customers", label: "Customers", path: "/api/datasets/customers" },
  { key: "product_wagon_compatibility", label: "Product–wagon compatibility", path: "/api/datasets/product_wagon_compatibility" },
  { key: "stockyard_customer_distances", label: "Stockyard–customer distances", path: "/api/datasets/stockyard_customer_distances" },
  { key: "stockyard_locations", label: "Stockyard locations", path: "/api/datasets/stockyard_locations" },
  { key: "stockyard_products", label: "Stockyard products", path: "/api/datasets/stockyard_products" },
  { key: "stockyard_rakes", label: "Stockyard rakes", path: "/api/datasets/stockyard_rakes" },
  { key: "stockyard_replenishment", label: "Stockyard replenishment", path: "/api/datasets/stockyard_replenishment" },
  { key: "stockyard_wagons", label: "Stockyard wagons", path: "/api/datasets/stockyard_wagons" },
  { key: "stockyards", label: "Stockyards master", path: "/api/datasets/stockyards" },
] as const;

export default function AdminDataManagementPage() {
  const { toast } = useToast();
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File | null>>({});
  const [loadingKey, setLoadingKey] = useState<string | null>(null);

  const handleFileChange = (key: string, fileList: FileList | null) => {
    const file = fileList?.[0] ?? null;
    setSelectedFiles((prev) => ({ ...prev, [key]: file }));
  };

  const handleApply = async (datasetKey: string) => {
    const cfg = DATASETS.find((d) => d.key === datasetKey);
    if (!cfg) return;

    const file = selectedFiles[datasetKey];
    if (!file) {
      toast({ title: "No JSON selected", description: `Choose a JSON file for ${cfg.label} before applying.`, variant: "destructive" as any });
      return;
    }

    try {
      setLoadingKey(datasetKey);
      const text = await file.text();

      try {
        JSON.parse(text);
      } catch {
        toast({ title: "Invalid JSON", description: "The selected file is not valid JSON.", variant: "destructive" as any });
        return;
      }

      const res = await fetch(cfg.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: text,
      });

      if (!res.ok) {
        const detail = await res.text();
        toast({
          title: `POST failed for ${cfg.label}`,
          description: detail || `${res.status} ${res.statusText}`,
          variant: "destructive" as any,
        });
        return;
      }

      const body = await res.json().catch(() => undefined as unknown);
      const status = (body as any)?.status;

      if (status && status !== "success") {
        toast({
          title: `POST error for ${cfg.label}`,
          description: (body as any)?.message ?? "Backend reported an error.",
          variant: "destructive" as any,
        });
        return;
      }

      toast({
        title: `POST applied to ${cfg.label}`,
        description: "Dataset synchronized with backend.",
      });
    } catch (err) {
      toast({
        title: `Failed to call POST for dataset`,
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive" as any,
      });
    } finally {
      setLoadingKey(null);
    }
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Admin &amp; Data Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>
            Upload curated JSON files for each dataset and push them to the FastAPI service via POST. Use this to load or
            refresh master data from your approved sources.
          </p>
        </CardContent>
      </Card>

      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="grid grid-cols-[2fr,1.5fr,auto] items-center gap-3 px-4 py-2 text-xs font-medium bg-muted/50 border-b">
          <div>Dataset</div>
          <div>JSON file</div>
          <div className="text-center">Apply (POST)</div>
        </div>
        <div className="divide-y">
          {DATASETS.map((d) => (
            <div key={d.key} className="grid grid-cols-[2fr,1.5fr,auto] items-center gap-3 px-4 py-3 text-sm">
              <div>
                <div className="font-medium">{d.label}</div>
                <div className="text-xs text-muted-foreground break-all">{d.path}</div>
              </div>
              <div>
                <input
                  type="file"
                  accept="application/json,.json"
                  className="block w-full text-xs"
                  onChange={(e) => handleFileChange(d.key, e.target.files)}
                />
              </div>
              <div className="flex justify-center">
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={loadingKey === d.key}
                  onClick={() => handleApply(d.key)}
                >
                  {loadingKey === d.key ? "Applying…" : "Apply"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
