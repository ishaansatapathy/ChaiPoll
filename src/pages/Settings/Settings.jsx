import React, { useState } from "react";
import { motion } from "framer-motion";
import { RoughNotation } from "react-rough-notation";
import { LogOut, User as UserIcon, Shield, Bell, Zap } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button.jsx";

function Highlight({ children }) {
  return (
    <span className="relative inline-block rounded-[2px] border border-white/14 bg-white/[0.015] px-[0.055em] pb-[0.01em]">
      {["-left-1 -top-1", "-right-1 -top-1", "-bottom-1 -left-1", "-bottom-1 -right-1"].map((pos) => (
        <span key={pos} className={`absolute ${pos} h-1 w-1 rounded-[1px] border border-white/25 bg-black`} />
      ))}
      {children}
    </span>
  );
}

export default function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showRough, setShowRough] = useState(true);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <section className="py-8 relative min-h-screen">
      <div className="mb-12 border-b border-white/5 pb-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/30 font-bold mb-3">System configuration</p>
          <h1 className="font-display text-5xl font-normal tracking-tight text-white md:text-6xl">
            Account <Highlight>Settings</Highlight>
          </h1>
        </motion.div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_0.6fr]">
        <div className="space-y-8">
          {/* Profile Section */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }}
            className="surface rounded-3xl p-8 border border-white/5 bg-white/[0.02] relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5">
               <UserIcon size={120} />
            </div>
            
            <div className="flex flex-wrap items-center gap-8 relative z-10">
              <div className="relative group">
                {/* Clean border instead of glow */}
                <div className="absolute -inset-1 border border-[#ef4444]/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                
                {user?.avatar && !user.avatar.includes('default-avatar.png') ? (
                  <img 
                    src={user.avatar} 
                    alt={user.name} 
                    referrerPolicy="no-referrer"
                    className="relative h-24 w-24 rounded-3xl object-cover border border-white/10" 
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className={`relative h-24 w-24 rounded-3xl bg-white/5 items-center justify-center border border-white/10 ${user?.avatar && !user.avatar.includes('default-avatar.png') ? 'hidden' : 'flex'}`}>
                  <UserIcon size={40} className="text-white/20" />
                </div>
              </div>
              
              <div className="space-y-4 flex-1 min-w-[200px]">
                <div className="relative inline-block">
                  <label className="text-[10px] uppercase tracking-widest text-white/30 font-bold block mb-1">Display Name</label>
                  <RoughNotation type="underline" show={true} color="#ef4444" strokeWidth={3} padding={2} iterations={2}>
                     <p className="text-2xl text-white font-medium">{user?.name || "Anonymous Warrior"}</p>
                  </RoughNotation>
                  {/* Keeping the scribble you liked */}
                  <div className="absolute -top-6 -right-16 rotate-12">
                     <span className="font-handwriting text-[#ef4444]/60 text-xl whitespace-nowrap">Verified Identity</span>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-white/30 font-bold block mb-1">Email Address</label>
                  <p className="text-lg text-white/60">{user?.email || "No email linked"}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Preferences */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="surface rounded-3xl p-6 border border-white/5 bg-white/[0.01]">
              <Zap className="text-amber-400 mb-4" size={20} />
              <h3 className="text-white font-bold mb-2 uppercase tracking-tighter">Fast Mode</h3>
              <p className="text-sm text-white/40 leading-relaxed">Optimize the interface for low-latency feedback and minimal animations.</p>
            </div>
            <div className="surface rounded-3xl p-6 border border-white/5 bg-white/[0.01]">
              <Shield className="text-emerald-400 mb-4" size={20} />
              <h3 className="text-white font-bold mb-2 uppercase tracking-tighter">Stealth Voting</h3>
              <p className="text-sm text-white/40 leading-relaxed">Enable end-to-end encryption for all participation data on your polls.</p>
            </div>
          </div>
        </div>

        {/* Danger Zone / Logout */}
        <div className="relative">
          <div className="sticky top-8 space-y-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="surface rounded-3xl p-10 border border-[#ef4444]/20 bg-[#ef4444]/[0.02] relative overflow-hidden text-center"
            >
              <div className="relative z-10 flex flex-col items-center">
                <div className="mb-6 p-4 rounded-full bg-[#ef4444]/10 border border-[#ef4444]/20">
                   <LogOut className="text-[#ef4444]" size={32} />
                </div>
                
                <h3 className="font-display text-3xl text-white mb-2 leading-tight">
                  Leaving so soon, <br /><span className="text-[#ef4444]">Warrior?</span>
                </h3>
                
                <div className="my-8 relative px-6">
                   <RoughNotation type="underline" show={true} color="#ef4444" strokeWidth={1} padding={2}>
                      <span className="font-handwriting text-2xl text-white/70 block transform -rotate-2">
                        "The battle for data never ends."
                      </span>
                   </RoughNotation>
                </div>

                <button 
                  onClick={handleLogout}
                  className="w-full h-14 rounded-2xl bg-[#ef4444] text-white font-bold text-sm tracking-widest hover:bg-[#ff5555] transition-all shadow-xl"
                >
                  ABANDON STATION
                </button>
                
                <p className="mt-6 text-[10px] text-white/20 uppercase tracking-[0.3em] font-bold">Session ID: 0x{Math.random().toString(16).slice(2, 10).toUpperCase()}</p>
              </div>
            </motion.div>
            
            <div className="px-6">
               <span className="font-handwriting text-[#ef4444] text-xl block">Every logout saves a cup of chai. ☕</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
