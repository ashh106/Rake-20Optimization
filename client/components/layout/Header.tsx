import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Header({ currentPath }: { currentPath: string }) {
  const titleMap: Record<string, string> = {
    "/": "Rake Formation Optimization Dashboard – SAIL",
    "/planner": "Rake Formation Planner",
    "/orders": "Customer Orders",
    "/inventories": "Inventories & Stockyards",
    "/forecasts": "AI Forecasts & What-If Analysis",
    "/reports": "Reports & Insights",
    "/admin": "Admin & Data Management",
  };
  return (
    <header className="h-16 sticky top-0 z-40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b flex items-center px-4 md:px-6">
      <h1 className="text-base md:text-lg font-semibold flex-1 pr-4">{titleMap[currentPath] ?? "SAIL Dashboard"}</h1>
      <div className="hidden md:flex items-center gap-2">
        <div className="relative">
          <input
            className="h-9 w-56 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Search..."
          />
          <Search className="h-4 w-4 absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
        </div>
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
