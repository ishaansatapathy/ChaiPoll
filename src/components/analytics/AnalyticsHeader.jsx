import React from "react";
import { motion } from "framer-motion";
import { BarChart2, Users, Download } from "lucide-react";

export default function AnalyticsHeader({
  poll,
  activeTab,
  setActiveTab,
  exporting,
  handleExport,
}) {
  return (
    <div className="border-b border-white/5 pb-10 flex flex-wrap items-end justify-between gap-8">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <div className="flex items-center gap-3 mb-4">
          <span className="h-[1px] w-8 bg-[#ef4444]" />
          <p className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-black">
            Live Data / {poll?.pollCode}
          </p>
        </div>
        <h1 className="font-display text-6xl font-normal tracking-tighter text-white md:text-8xl">
          ANALYTICS <span className="text-white/20 italic">HUB</span>
        </h1>
        <div className="mt-6 flex items-center gap-4">
          <span className="px-3 py-1 rounded-md bg-[#ef4444]/10 border border-[#ef4444]/20 text-[10px] font-black text-[#ef4444] uppercase tracking-widest">
            Active
          </span>
          <span className="font-handwriting text-3xl text-white/40 rotate-[-1deg]">
            {poll?.title}
          </span>
        </div>
      </motion.div>

      <div className="flex items-center gap-4">
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-3 px-6 py-4 rounded-[22px] bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-500 uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all shadow-xl disabled:opacity-50"
        >
          <Download size={14} /> {exporting ? "Exporting..." : "Export CSV"}
        </button>

        <div className="flex p-1.5 rounded-[22px] bg-[#050505] border border-white/10 backdrop-blur-2xl shadow-2xl">
          <button
            onClick={() => setActiveTab("charts")}
            className={`px-8 py-3 rounded-[18px] text-[10px] font-black tracking-[0.2em] uppercase transition-all duration-500 flex items-center gap-2 ${activeTab === "charts" ? "bg-[#ef4444] text-white shadow-[0_0_20px_rgba(239,68,68,0.3)]" : "text-white/30 hover:text-white/60"}`}
          >
            <BarChart2 size={14} /> Analytics
          </button>
          <button
            onClick={() => setActiveTab("participants")}
            className={`px-8 py-3 rounded-[18px] text-[10px] font-black tracking-[0.2em] uppercase transition-all duration-500 flex items-center gap-2 ${activeTab === "participants" ? "bg-[#ef4444] text-white shadow-[0_0_20px_rgba(239,68,68,0.3)]" : "text-white/30 hover:text-white/60"}`}
          >
            <Users size={14} /> Participants
          </button>
        </div>
      </div>
    </div>
  );
}
