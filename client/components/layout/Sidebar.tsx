import { NavLink } from "react-router-dom";
import { LayoutDashboard, Train, LineChart, BarChart3, Shield } from "lucide-react";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/planner", label: "Rake Planner", icon: Train },
  { to: "/orders", label: "Orders", icon: ListChecks },
  { to: "/inventories", label: "Inventories", icon: BarChart3 },
  { to: "/forecasts", label: "Forecasts & Simulations", icon: LineChart },
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/admin", label: "Admin Panel", icon: Shield },
];

export default function Sidebar() {
  return (
    <aside className="hidden md:flex md:flex-col w-64 shrink-0 h-screen sticky top-0 bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="h-16 flex items-center gap-2 px-5 border-b border-sidebar-border">
        <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground grid place-items-center font-bold">S</div>
        <div className="text-lg font-semibold leading-tight">
          SAIL
          <div className="text-xs text-muted-foreground">Rake Optimization</div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto py-3">
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-5 py-2.5 text-sm transition-colors ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-foreground border-l-4 border-primary"
                  : "hover:bg-sidebar-accent hover:text-sidebar-foreground"
              }`
            }
          >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-4 text-xs text-muted-foreground border-t border-sidebar-border">
        Steel Authority of India Ltd
      </div>
    </aside>
  );
}
