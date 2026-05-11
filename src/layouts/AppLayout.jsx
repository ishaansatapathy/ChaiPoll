import { Outlet, Navigate, useLocation, Link } from "react-router-dom";
import { Sidebar } from "../components/layout/Sidebar.jsx";
import { MobileNav } from "../components/layout/MobileNav.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { Loader2, ShieldAlert, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

  // ALLOW GUEST ACCESS: We no longer redirect to /auth here.
  // Instead, we let the user see the dashboard but with limited functionality.

  return (
    <div className="min-h-screen bg-ink-950">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.08),transparent_34%)]" />
      
      {/* Cinematic Guest Mode Banner */}
      <AnimatePresence>
        {!user && (
          <motion.div 
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="fixed top-0 left-0 right-0 z-[100] flex justify-center p-4 pointer-events-none"
          >
            <div className="pointer-events-auto flex items-center gap-6 px-6 py-3 rounded-full bg-red-500/10 border border-red-500/20 backdrop-blur-2xl shadow-[0_0_30px_rgba(239,68,68,0.15)]">
               <div className="flex items-center gap-3">
                  <ShieldAlert className="text-[#ef4444] animate-pulse" size={18} />
                  <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Guardian Mode Active</span>
               </div>
               <div className="h-4 w-[1px] bg-white/10" />
               <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest hidden sm:block">Sign in to deploy your own campaigns</p>
               <Link to="/auth">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-5 py-1.5 rounded-full bg-[#ef4444] text-white text-[9px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                  >
                    Authenticate Now
                  </motion.button>
               </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative flex flex-col lg:flex-row">
        <Sidebar />
        <main className={`min-h-screen flex-1 px-4 sm:px-6 lg:px-8 pb-32 lg:pb-10 ${!user ? 'pt-24' : 'pt-10'}`}>
          <div className="mx-auto max-w-7xl relative">
            {/* Conditional Overlay for Guest Mode (Subtle) */}
            {!user && location.pathname !== '/dashboard' && (
               <div className="absolute inset-0 pointer-events-none z-0 opacity-20">
                  <div className="h-full w-full bg-[repeating-linear-gradient(45deg,transparent,transparent_20px,rgba(255,255,255,0.02)_20px,rgba(255,255,255,0.02)_40px)]" />
               </div>
            )}
            <Outlet />
          </div>
        </main>
        <MobileNav />
      </div>
    </div>
  );
}
