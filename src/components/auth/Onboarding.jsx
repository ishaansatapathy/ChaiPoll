import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { Sparkles, ArrowRight, Zap } from "lucide-react";

export default function Onboarding() {
  const { user, setDisplayName } = useAuth();
  const [displayName, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user || user.isOnboarded) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!displayName.trim()) return;
    setIsSubmitting(true);
    try {
      await setDisplayName(displayName);
    } catch (err) {
      console.error("Onboarding error:", err);
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
          <div className="absolute -top-24 -left-24 size-64 bg-[#ef4444]/10 blur-[100px] rounded-full" />
          <div className="absolute -bottom-24 -right-24 size-64 bg-[#ef4444]/5 blur-[80px] rounded-full" />
          <div className="relative z-10 text-center">
            <div className="mb-8 inline-flex p-4 rounded-3xl bg-[#ef4444]/10 border border-[#ef4444]/20">
              <Sparkles className="text-[#ef4444]" size={40} />
            </div>
            <p className="text-[10px] uppercase tracking-[0.4em] text-white/30 font-bold mb-4">
              Quick Setup
            </p>
            <h2 className="font-display text-4xl text-white mb-6 leading-tight">
              Welcome, <br />
              <span className="text-white/40 italic">{user.name}.</span>
            </h2>
            <p className="text-lg text-white/60 mb-10 leading-relaxed font-handwriting">
              &quot;Pick a display name, this is how others will see you on ChaiPoll.&quot;
            </p>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative group">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your display name&hellip;"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl h-16 px-8 text-center text-xl font-display text-white placeholder:text-white/10 focus:outline-none focus:border-[#ef4444]/50 transition-all"
                />
                <div className="absolute inset-0 rounded-2xl border border-[#ef4444]/0 group-focus-within:border-[#ef4444]/20 pointer-events-none transition-all" />
              </div>
              <button
                type="submit"
                disabled={isSubmitting || !displayName.trim()}
                className="w-full h-16 rounded-2xl bg-[#ef4444] text-white font-bold tracking-[0.2em] hover:bg-[#ff5555] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {isSubmitting ? (
                  <Zap className="animate-spin" size={20} />
                ) : (
                  <>
                    SET UP PROFILE{" "}
                    <ArrowRight
                      size={18}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
