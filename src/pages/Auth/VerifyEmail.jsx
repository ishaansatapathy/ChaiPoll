import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Loader2, Sparkles } from "lucide-react";
import API from "../../services/api";

export default function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState("verifying"); // verifying, success, error

  useEffect(() => {
    const verifyToken = async () => {
      try {
        await API.get(`/auth/verify-email/${token}`);
        setStatus("success");
      } catch (err) {
        setStatus("error");
      }
    };
    verifyToken();
  }, [token]);

  return (
    <div className="min-h-screen bg-[#020202] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Cinematic Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(239,68,68,0.05),transparent_70%)] pointer-events-none" />
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#ef4444]/5 blur-[120px] rounded-full pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="surface max-w-md w-full rounded-[40px] p-12 border border-white/5 bg-[#050505]/50 backdrop-blur-3xl shadow-2xl relative z-10 text-center"
      >
        <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
            <span className="size-1 rounded-full bg-[#ef4444]" />
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20">Security Hub</p>
            <span className="size-1 rounded-full bg-[#ef4444]" />
        </div>

        {status === "verifying" && (
          <div className="py-12 space-y-8">
            <div className="relative inline-flex">
                <div className="absolute inset-0 bg-[#ef4444]/20 blur-2xl rounded-full animate-pulse" />
                <Loader2 className="animate-spin text-[#ef4444] relative z-10" size={64} strokeWidth={1.5} />
            </div>
            <div>
                <h1 className="text-3xl font-display text-white mb-3">Verifying Account</h1>
                <p className="text-sm text-white/40 italic font-handwriting text-2xl">Confirming your identity...</p>
            </div>
          </div>
        )}

        {status === "success" && (
          <div className="py-12 space-y-8">
            <div className="relative inline-flex">
                <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full" />
                <CheckCircle2 className="text-emerald-500 relative z-10" size={64} strokeWidth={1.5} />
            </div>
            <div>
                <h1 className="text-3xl font-display text-white mb-3 tracking-tight">Verified!</h1>
                <p className="text-sm text-white/40 italic font-handwriting text-2xl leading-relaxed">
                   &quot;Welcome to the inner circle. Your account is now fully active.&quot;
                </p>
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                <Link 
                    to="/dashboard"
                    className="flex items-center justify-center gap-3 w-full py-5 rounded-[24px] bg-white text-black font-black text-[10px] tracking-[0.4em] hover:bg-[#ef4444] hover:text-white transition-all duration-500"
                >
                    <Sparkles size={16} /> ENTER DASHBOARD
                </Link>
            </motion.div>
          </div>
        )}

        {status === "error" && (
          <div className="py-12 space-y-8">
            <div className="relative inline-flex">
                <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full" />
                <XCircle className="text-red-500 relative z-10" size={64} strokeWidth={1.5} />
            </div>
            <div>
                <h1 className="text-3xl font-display text-white mb-3 tracking-tight">Failed</h1>
                <p className="text-sm text-white/40 italic font-handwriting text-2xl leading-relaxed">
                   &quot;The link is invalid or has expired.&quot;
                </p>
            </div>
            <Link 
                to="/login"
                className="flex items-center justify-center gap-3 w-full py-5 rounded-[24px] bg-white/5 border border-white/5 text-white/60 font-black text-[10px] tracking-[0.4em] hover:bg-white/10 transition-all"
            >
                BACK TO LOGIN
            </Link>
          </div>
        )}

        {/* Delicate Sketch Corners */}
        <div className="absolute top-8 left-8 size-4 border-t border-l border-white/10" />
        <div className="absolute top-8 right-8 size-4 border-t border-r border-white/10" />
        <div className="absolute bottom-8 left-8 size-4 border-b border-l border-white/10" />
        <div className="absolute bottom-8 right-8 size-4 border-b border-r border-white/10" />
      </motion.div>
    </div>
  );
}
