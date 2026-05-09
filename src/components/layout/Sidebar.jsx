import { BarChart3, LayoutDashboard, PlusCircle, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";
import { LogoMark } from "../ui/LogoMark.jsx";

const items = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Create Poll", to: "/create", icon: PlusCircle },
  { label: "Analytics", to: "/analytics/chai-101", icon: BarChart3 },
  { label: "Settings", to: "/dashboard", icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="hidden min-h-screen w-64 border-r border-white/8 bg-black/35 px-4 py-6 lg:block">
      <div className="mb-9 flex items-center gap-3 px-2 font-semibold">
        <LogoMark />
        ChaiPoll
      </div>
      <nav className="grid gap-2">
        {items.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                isActive ? "bg-white/[0.07] text-white" : "text-white/54 hover:bg-white/[0.04] hover:text-white"
              }`
            }
          >
            <item.icon size={17} />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
