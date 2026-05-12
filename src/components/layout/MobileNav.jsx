import React from "react";
import { LayoutDashboard, PlusCircle, BarChart2, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";

const items = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Create", to: "/create", icon: PlusCircle },
  { label: "Analytics", to: "/analytics/global", icon: BarChart2 },
  { label: "Settings", to: "/settings", icon: Settings },
];

export function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-white/5 bg-[#020202]/80 px-4 py-3 backdrop-blur-2xl lg:hidden">
      {items.map((item) => (
        <NavLink
          key={item.label}
          to={item.to}
          className={({ isActive }) =>
            `relative flex flex-col items-center gap-1 transition-all duration-300 ${
              isActive ? "text-[#ef4444]" : "text-white/40"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[9px] font-bold uppercase tracking-widest">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="mobileNavActive"
                  className="absolute -top-3 h-1 w-8 rounded-full bg-[#ef4444] shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                />
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
