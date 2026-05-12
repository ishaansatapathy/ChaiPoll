import React from "react";
import { motion } from "framer-motion";
import { Clock, AlertCircle, Home } from "lucide-react";
import { Link } from "react-router-dom";

export default function PollExpired({ title }) {
  return (
    <div className="min-h-screen bg-[#020202] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_50%_50%,rgba(239,68,68,0.1),transparent_70%)]" />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 max-w-lg w-full text-center"
      >
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-[40px] bg-[#ef4444]/10 border border-[#ef4444]/20 mb-8 relative">
          <Clock className="text-[#ef4444] animate-pulse" size={40} />
          <div className="absolute -top-2 -right-2">
            <AlertCircle className="text-[#ef4444]" size={24} />
          </div>
        </div>
        <h1 className="font-display text-4xl text-white mb-4 tracking-tight">
          Poll <span className="text-[#ef4444]">Expired</span>
        </h1>
        <p className="text-[10px] uppercase tracking-[0.4em] text-white/30 font-bold mb-8">
          This poll is no longer accepting responses
        </p>
        <div className="p-8 rounded-[32px] border border-white/5 bg-white/[0.02] backdrop-blur-3xl mb-10">
          <p className="text-white/60 mb-2 text-sm uppercase tracking-widest font-bold">
            Poll Title
          </p>
          <p className="text-xl text-white font-medium">{title}</p>
          <div className="mt-6 pt-6 border-t border-white/5">
            <p className="text-xs text-white/30 leading-relaxed italic font-handwriting">
              "This poll has closed. No new responses are being accepted."
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/">
            <button className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-white text-black text-xs font-bold tracking-widest hover:bg-white/90 transition-all">
              <Home size={16} /> GO HOME
            </button>
          </Link>
          <Link to={`/results/${window.location.pathname.split("/").pop()}`}>
            <button className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-white/5 border border-white/10 text-white text-xs font-bold tracking-widest hover:bg-white/10 transition-all">
              VIEW RESULTS
            </button>
          </Link>
        </div>
      </motion.div>
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
        <span className="font-handwriting text-white/10 text-xl">Every poll has its moment.</span>
      </div>
    </div>
  );
}
