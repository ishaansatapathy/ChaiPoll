import { useState, useEffect } from "react";
import { Outlet, Navigate, useLocation, Link } from "react-router-dom";
import { Sidebar } from "../components/layout/Sidebar.jsx";
import { MobileNav } from "../components/layout/MobileNav.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { Loader2, ShieldAlert, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { RoughNotation } from "react-rough-notation";

export function AppLayout() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [showNotation, setShowNotation] = useState(false);

  useEffect(() => {
    if (!user) {
      const timer = setTimeout(() => setShowNotation(true), 1200);
      return () => clearTimeout(timer);
    }
  }, [user]);

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

  return (
    <div className="min-h-screen bg-ink-950">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.08),transparent_34%)]" />
      
      {/* Cinematic Identity Reveal Banner */}
      <AnimatePresence>
        {!user && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="fixed top-6 left-0 right-0 z-[100] flex justify-center px-4 pointer-events-none"
          >
            <div className="pointer-events-auto flex flex-col items-center gap-2">
              <div className="flex items-center gap-5 px-6 py-2.5 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-3xl shadow-2xl">
                 <div className="flex items-center gap-3">
                    <Zap className="text-[#ef4444]" size={14} />
                    <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em]">Status: Unidentified</span>
                 </div>
                 
                 <div className="h-4 w-[1px] bg-white/10" />
                 
                 <div className="flex items-center gap-4">
                    <p className="text-[11px] text-white font-medium tracking-tight">
                      <RoughNotation 
                        type="underline" 
                        show={showNotation} 
                        color="#ef4444" 
                        strokeWidth={2}
                        padding={2}
                      >
                        Reveal your identity
                      </RoughNotation>
                      <span className="text-white/30 ml-2">to deploy campaigns</span>
                    </p>
                    
                    <Link to="/auth">
                       <button className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-white text-black text-[9px] font-black uppercase tracking-widest hover:bg-[#ef4444] hover:text-white transition-all duration-500">
                         AUTHENTICATE
                       </button>
                    </Link>
                 </div>
              </div>
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.2 }}
                transition={{ delay: 2 }}
                className="font-handwriting text-[#ef4444] text-sm italic"
              >
                The nexus is waiting for your signal.
              </motion.span>
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
