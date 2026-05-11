import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Shield, Target, Zap } from 'lucide-react';

export default function CaptainOnboarding() {
  const { user, setTacticalCallsign } = useAuth();
  const [callsign, setCallsign] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Only show if user is logged in but not onboarded
  if (!user || user.isOnboarded) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!callsign.trim()) return;
    
    setIsSubmitting(true);
    try {
      await setTacticalCallsign(callsign);
    } catch (err) {
      console.error('Onboarding failure:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-[#020202]/95 backdrop-blur-xl px-6"
      >
        <motion.div 
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="max-w-xl w-full surface rounded-[40px] border border-white/10 bg-white/[0.02] p-12 relative overflow-hidden"
        >
          {/* Background Decorative Elements */}
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#ef4444]/10 blur-[100px] rounded-full" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-[#ef4444]/5 blur-[80px] rounded-full" />
          
          <div className="relative z-10 text-center">
            <div className="mb-8 inline-flex p-4 rounded-3xl bg-[#ef4444]/10 border border-[#ef4444]/20">
               <Shield className="text-[#ef4444]" size={40} />
            </div>
            
            <p className="text-[10px] uppercase tracking-[0.4em] text-white/30 font-bold mb-4">Tactical Initialization</p>
            <h2 className="font-display text-4xl text-white mb-6 leading-tight">
              Welcome, <br />
              <span className="text-white/40 italic">Captain.</span>
            </h2>
            
            <p className="text-lg text-white/60 mb-10 leading-relaxed font-handwriting">
              "Every great commander needs a name that rings through the annals of history. How shall we address you in the Sanctum?"
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative group">
                <input 
                  type="text"
                  value={callsign}
                  onChange={(e) => setCallsign(e.target.value)}
                  placeholder="ENTER YOUR CALLSIGN..."
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl h-16 px-8 text-center text-xl font-display text-white placeholder:text-white/10 focus:outline-none focus:border-[#ef4444]/50 transition-all uppercase tracking-widest"
                  autoFocus
                />
                <div className="absolute inset-0 rounded-2xl border border-[#ef4444]/0 group-focus-within:border-[#ef4444]/20 pointer-events-none transition-all" />
              </div>

              <button 
                type="submit"
                disabled={isSubmitting || !callsign.trim()}
                className="w-full h-16 rounded-2xl bg-[#ef4444] text-white font-bold tracking-[0.2em] hover:bg-[#ff5555] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {isSubmitting ? (
                  <Zap className="animate-spin" size={20} />
                ) : (
                  <>
                    INITIALIZE PROFILE <Target size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
            
            <p className="mt-8 text-[10px] text-white/20 uppercase tracking-widest font-bold">Protocol Alpha-9 Active</p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
