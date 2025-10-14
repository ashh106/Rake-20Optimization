// import { Bell, Search } from "lucide-react";
// import { Button } from "@/components/ui/button";

// export default function Header({ currentPath }: { currentPath: string }) {
//   const titleMap: Record<string, string> = {
//     "/": "Rake Formation Optimization Dashboard – SAIL",
//     "/planner": "Rake Formation Planner",
//     "/orders": "Customer Orders",
//     "/inventories": "Inventories & Stockyards",
//     "/live": "Live Operations",
//     "/forecasts": "AI Forecasts & What-If Analysis",
//     "/reports": "Reports & Insights",
//     "/admin": "Admin & Data Management",
//   };
//   return (
//     <header className="h-16 sticky top-0 z-40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b flex items-center px-4 md:px-6">
//       <h1 className="text-base md:text-lg font-semibold flex-1 pr-4">{titleMap[currentPath] ?? "SAIL Dashboard"}</h1>
//       <div className="hidden md:flex items-center gap-2">
//         <div className="relative">
//           <input
//             className="h-9 w-56 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
//             placeholder="Search..."
//           />
//           <Search className="h-4 w-4 absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
//         </div>
//         <Button variant="ghost" size="icon" aria-label="Notifications">
//           <Bell className="h-5 w-5" />
//         </Button>
//       </div>
//     </header>
//   );
// }

import { Bell, Search } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function Header({ currentPath }: { currentPath: string }) {
  const titleMap: Record<string, string> = {
    "/": "Rake Formation Optimization Dashboard – SAIL",
    "/planner": "Rake Formation Planner",
    "/orders": "Customer Orders",
    "/inventories": "Inventories & Stockyards",
    "/live": "Live Operations",
    "/forecasts": "AI Forecasts & What-If Analysis",
    "/reports": "Reports & Insights",
    "/admin": "Admin & Data Management",
  };

  const [notifOpen, setNotifOpen] = useState(false);
  const [alerts, setAlerts] = useState([
    { id: "1", type: "alert", text: "Train delayed at Rourkela", time: "10:15 AM" },
    { id: "2", type: "maintenance", text: "Scheduled maintenance in Bokaro", time: "11:00 AM" },
  ]);

  return (
    <header className="h-16 sticky top-0 z-40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b flex items-center px-4 md:px-6">
      <h1 className="text-base md:text-lg font-semibold flex-1 pr-4">{titleMap[currentPath] ?? "SAIL Dashboard"}</h1>

      <div className="hidden md:flex items-center gap-2">
        {/* Notification dropdown */}
        <div className="flex justify-end relative">
          <button
            className="relative inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
            onClick={() => setNotifOpen((v) => !v)}
            aria-label="Open notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Alerts</span>
            {alerts.length > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
                {Math.min(9, alerts.length)}
              </span>
            )}
          </button>
          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 rounded-lg border bg-card shadow-lg z-50">
              <div className="p-2 text-xs font-medium text-muted-foreground">Latest Alerts</div>
              <ul className="max-h-80 overflow-auto divide-y">
                {alerts.slice(0, 5).map((a) => (
                  <li key={a.id} className="p-3 text-sm">
                    <div className="flex items-start gap-2">
                      <span
                        className={`mt-1 h-2.5 w-2.5 rounded-full ${
                          a.type === "alert"
                            ? "bg-red-500"
                            : a.type === "maintenance"
                            ? "bg-yellow-500"
                            : "bg-blue-500"
                        }`}
                      />
                      <div>
                        <div className="font-medium">{a.text}</div>
                        <div className="text-xs text-muted-foreground">{a.time}</div>
                      </div>
                    </div>
                  </li>
                ))}
                {alerts.length === 0 && (
                  <li className="p-3 text-sm text-muted-foreground">No new alerts</li>
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Search input */}
        <div className="relative">
          <input
            className="h-9 w-56 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Search..."
          />
          <Search className="h-4 w-4 absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>
    </header>
  );
}
