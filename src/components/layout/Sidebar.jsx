import React from "react";
import { LayoutDashboard, PlusCircle, BarChart2, Settings, LogOut, User as UserIcon } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { LogoMark } from "../ui/LogoMark.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { motion } from "framer-motion";

const items = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Create Poll", to: "/create", icon: PlusCircle },
  { label: "Analytics", to: "/analytics/global", icon: BarChart2 },
  { label: "Settings", to: "/settings", icon: Settings },
];

export function Sidebar() {
  const auth = useAuth() || {}; // Safety check
  const { user, logout } = auth;
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (logout) {
      await logout();
      navigate("/");
    }
  };

  return (
    <aside className="hidden min-h-screen w-72 border-r border-white/5 bg-[#020202] lg:flex flex-col">
      <div className="p-8 border-b border-white/5">
        <div className="flex items-center gap-4 px-2">
          <LogoMark className="shadow-[0_0_20px_rgba(255,255,255,0.1)]" />
          <div>
            <h2 className="font-display text-xl font-medium tracking-tight text-white leading-none">ChaiPoll</h2>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-bold mt-1.5">Premium v2.0</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-6 space-y-1.5">
        {items.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-medium transition-all duration-300 ${
                isActive 
                ? "bg-white/[0.05] text-white shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]" 
                : "text-white/40 hover:bg-white/[0.02] hover:text-white"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div 
                    layoutId="activeTab" 
                    className="absolute left-0 w-1 h-6 bg-[#ef4444] rounded-r-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} className={isActive ? "text-[#ef4444]" : "group-hover:text-[#ef4444] transition-colors"} />
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Section */}
      <div className="p-6 mt-auto border-t border-white/5 bg-gradient-to-t from-white/[0.01] to-transparent">
        {user ? (
          <div className="flex items-center justify-between gap-3 p-4 rounded-3xl bg-white/[0.03] border border-white/5 group transition-all duration-500 hover:border-white/10">
            <div className="flex items-center gap-3 overflow-hidden">
              {user.avatar && !user.avatar.includes('default-avatar.png') ? (
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  referrerPolicy="no-referrer"
                  className="h-10 w-10 rounded-2xl object-cover ring-2 ring-white/5 group-hover:ring-[#ef4444]/20 transition-all" 
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className={`h-10 w-10 rounded-2xl bg-white/5 items-center justify-center border border-white/5 ${user.avatar && !user.avatar.includes('default-avatar.png') ? 'hidden' : 'flex'}`}>
                <UserIcon size={20} className="text-white/30" />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-white truncate">{user.name}</p>
                <p className="text-[10px] text-white/30 truncate font-handwriting tracking-wider italic">Active Session</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 rounded-xl text-white/20 hover:text-[#ef4444] hover:bg-[#ef4444]/5 transition-all"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <NavLink to="/auth" className="flex items-center justify-center gap-2 p-4 rounded-2xl border border-white/5 text-sm text-white/40 hover:text-white hover:border-white/10 transition-all">
            <LogOut size={16} /> Sign In
          </NavLink>
        )}
      </div>
    </aside>
  );
}
