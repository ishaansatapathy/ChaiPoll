import React from "react";
import { motion } from "framer-motion";
import { RoughNotation } from "react-rough-notation";

export function AnalyticsCard({ label, value, trend, icon: Icon, showRough }) {
  return (
    <div className="group relative overflow-hidden rounded-[32px] p-7 border border-white/5 bg-[#050505] transition-all duration-700 hover:border-[#ef4444]/30 hover:shadow-[0_0_50px_rgba(239,68,68,0.05)]">
      {/* Tactical Grid Background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      
      {/* Corner Brackets */}
      <div className="absolute top-4 left-4 w-4 h-4 border-t border-l border-white/10 group-hover:border-[#ef4444]/40 transition-colors" />
      <div className="absolute top-4 right-4 w-4 h-4 border-t border-r border-white/10 group-hover:border-[#ef4444]/40 transition-colors" />
      <div className="absolute bottom-4 left-4 w-4 h-4 border-b border-l border-white/10 group-hover:border-[#ef4444]/40 transition-colors" />
      <div className="absolute bottom-4 right-4 w-4 h-4 border-b border-r border-white/10 group-hover:border-[#ef4444]/40 transition-colors" />

      {/* Header Section */}
      <div className="relative flex items-center justify-between mb-10">
        <div className="h-12 w-12 rounded-2xl bg-white/[0.03] flex items-center justify-center border border-white/10 group-hover:border-[#ef4444]/20 transition-all duration-500">
          {Icon && <Icon className="text-white/30 group-hover:text-[#ef4444] transition-colors" size={22} />}
        </div>
        <div className="flex items-center gap-2">
           <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#ef4444] opacity-40">Operational</span>
           <div className="h-1.5 w-1.5 rounded-full bg-[#ef4444] shadow-[0_0_10px_#ef4444] animate-pulse" />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-3 group-hover:text-white/40 transition-colors">{label}</p>
        <div className="flex items-baseline gap-4">
          <RoughNotation
            type="box"
            show={showRough}
            color="#ef4444"
            strokeWidth={2}
            padding={8}
            iterations={1}
            animate={true}
          >
            <h3 className="font-display text-6xl font-normal tracking-tighter text-white leading-none">
              {value}
            </h3>
          </RoughNotation>
          <div className="flex flex-col">
             <span className="font-handwriting text-xl text-[#ef4444] rotate-[-5deg] opacity-60">{trend}</span>
             <span className="text-[8px] font-bold text-white/10 uppercase tracking-widest mt-1">Delta Sync</span>
          </div>
        </div>
      </div>

      {/* Footer Status */}
      <div className="mt-10 flex items-center gap-3">
        <div className="h-[1px] flex-1 bg-white/5 group-hover:bg-[#ef4444]/10 transition-colors" />
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/10 group-hover:text-[#ef4444]/40 transition-colors">
          Protocol Alpha-9
        </p>
      </div>
    </div>
  );
}
