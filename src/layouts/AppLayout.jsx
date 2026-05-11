import { Outlet, Navigate, useLocation } from "react-router-dom";
import { Sidebar } from "../components/layout/Sidebar.jsx";
import { MobileNav } from "../components/layout/MobileNav.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export function AppLayout() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-ink-950 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="fixed inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_50%_40%,rgba(239,68,68,0.1),transparent_60%)]" />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 flex flex-col items-center gap-6"
        >
          <Loader2 className="animate-spin text-[#ef4444]" size={40} strokeWidth={1.5} />
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-[0.4em] text-white/30 font-bold mb-1">Authenticating</p>
            <p className="font-handwriting text-[#ef4444] text-xl opacity-60">Syncing with nexus...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    // Save the intended location to redirect back after login
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen bg-ink-950">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.08),transparent_34%)]" />
      <div className="relative flex flex-col lg:flex-row">
        <Sidebar />
        <main className="min-h-screen flex-1 px-4 py-10 sm:px-6 lg:px-8 pb-32 lg:pb-10">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
        <MobileNav />
      </div>
    </div>
  );
}

