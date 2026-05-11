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
            className="surface rounded-3xl p-10 border border-white/10 bg-[#050505] relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
               <UserIcon size={160} />
            </div>

            <div className="flex flex-wrap items-center gap-10 relative z-10">
              <div className="relative group">
                {/* Raw hand-drawn frame instead of glow */}
                <div className="absolute -inset-3 opacity-40 group-hover:opacity-80 transition-opacity">
                   <RoughNotation type="box" show={true} color="#ef4444" strokeWidth={2} padding={8} iterations={2} />
                </div>
                
                {user?.avatar && !user.avatar.includes('default-avatar.png') ? (
                  <img 
                    src={user.avatar} 
                    alt={user.name} 
                    referrerPolicy="no-referrer"
                    className="relative h-28 w-28 rounded-2xl object-cover border border-white/10 grayscale hover:grayscale-0 transition-all duration-500" 
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className={`relative h-28 w-28 rounded-2xl bg-white/5 items-center justify-center border border-white/10 ${user?.avatar && !user.avatar.includes('default-avatar.png') ? 'hidden' : 'flex'}`}>
                  <UserIcon size={40} className="text-white/10" />
                </div>
              </div>
              
              <div className="space-y-6 flex-1 min-w-[240px]">
                <div className="relative inline-block">
                  <label className="text-[9px] uppercase tracking-[0.3em] text-white/20 font-black block mb-2">Display Name</label>
                  <RoughNotation type="underline" show={true} color="#ef4444" strokeWidth={2} padding={2} multiline={true}>
                     <h3 className="text-3xl text-white font-display tracking-tight leading-none">{user?.name || "ANONYMOUS AGENT"}</h3>
                  </RoughNotation>
                  <div className="absolute -top-1 -right-12 rotate-12">
                     <span className="font-handwriting text-[#ef4444]/40 text-sm italic">Verified Identity</span>
                  </div>
                </div>
                
                <div className="pt-4">
                  <label className="text-[9px] uppercase tracking-[0.3em] text-white/20 font-black block mb-1">Encrypted Email</label>
                  <p className="text-sm font-mono text-white/40 tracking-wider">{user?.email || "ENCRYPTED_SIGNAL_LOST"}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tactical Options */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="group surface rounded-3xl p-8 border border-white/5 bg-[#050505] hover:border-[#ef4444]/20 transition-all duration-500 relative">
              <div className="absolute top-4 right-4 h-1.5 w-1.5 rounded-full bg-amber-400 opacity-20 group-hover:opacity-100 group-hover:shadow-[0_0_10px_#fbbf24] transition-all" />
              <Zap className="text-amber-400/40 group-hover:text-amber-400 mb-6 transition-colors" size={24} />
              <h3 className="text-white text-xs font-black uppercase tracking-[0.2em] mb-3">Protocol: Fast Mode</h3>
              <p className="text-[11px] text-white/20 leading-relaxed group-hover:text-white/40 transition-colors uppercase tracking-widest">
                Optimization level 0x42 / Low-latency interface enabled.
              </p>
            </div>
            
            <div className="group surface rounded-3xl p-8 border border-white/5 bg-[#050505] hover:border-emerald-500/20 transition-all duration-500 relative">
              <div className="absolute top-4 right-4 h-1.5 w-1.5 rounded-full bg-emerald-500 opacity-20 group-hover:opacity-100 group-hover:shadow-[0_0_10px_#10b981] transition-all" />
              <Shield className="text-emerald-500/40 group-hover:text-emerald-500 mb-6 transition-colors" size={24} />
              <h3 className="text-white text-xs font-black uppercase tracking-[0.2em] mb-3">Cloak: Stealth Voting</h3>
              <p className="text-[11px] text-white/20 leading-relaxed group-hover:text-white/40 transition-colors uppercase tracking-widest">
                E2E Encryption active / Participant identity redacted.
              </p>
            </div>
          </div>
        </div>

        {/* Action Sector */}
        <div className="relative lg:pl-8">
          <div className="sticky top-8 space-y-10">
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }} 
              animate={{ opacity: 1, scale: 1 }}
              className="surface rounded-[40px] p-12 border border-white/5 bg-[#050505] relative overflow-hidden text-center group"
            >
              {/* No glow, just tactical grid */}
              <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 0)', backgroundSize: '20px 20px' }} />
              
              <div className="relative z-10 flex flex-col items-center">
                <div className="mb-10 p-6 rounded-2xl bg-white/[0.02] border border-white/5 group-hover:border-[#ef4444]/20 transition-all duration-500">
                   <LogOut className="text-white/20 group-hover:text-[#ef4444] transition-colors" size={40} />
                </div>
                
                <h3 className="font-display text-4xl text-white mb-4 leading-tight tracking-tighter">
                   Abandon <br /><span className="text-[#ef4444] italic">Station?</span>
                </h3>
                
                <div className="my-10 relative">
                   <div className="absolute -top-4 -left-4 w-full h-full opacity-40">
                      <RoughNotation type="underline" show={true} color="#ef4444" strokeWidth={1} iterations={3} />
                   </div>
                   <span className="font-handwriting text-2xl text-white/40 block">
                     "Every cup of chai saved counts."
                   </span>
                </div>

                <button 
                  onClick={handleLogout}
                  className="w-full py-5 rounded-[22px] bg-[#ef4444]/10 border border-[#ef4444]/20 text-white text-[10px] font-black tracking-[0.4em] uppercase hover:bg-[#ef4444] hover:text-white transition-all shadow-2xl active:scale-95"
                >
                  DEACTIVATE LINK
                </button>
                
                <div className="mt-10 pt-8 border-t border-white/5 w-full">
                   <p className="text-[8px] text-white/10 uppercase tracking-[0.4em] font-black">
                      Protocol 0x{Math.random().toString(16).slice(2, 8).toUpperCase()}
                   </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
