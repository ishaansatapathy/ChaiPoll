import React from "react";
import { motion } from "framer-motion";
import { RoughNotation } from "react-rough-notation";

export function AnalyticsCard({ label, value, trend, icon: Icon, showRough }) {
  return (
    <div className="surface group relative overflow-hidden rounded-3xl p-6 border border-white/5 bg-gradient-to-br from-white/[0.04] to-transparent backdrop-blur-2xl transition-all duration-500 hover:border-white/10 hover:shadow-[0_0_40px_rgba(255,255,255,0.02)]">
      {/* Background glow */}
      <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-white/5 blur-3xl group-hover:bg-white/10 transition-colors" />
      
      <div className="relative flex items-center justify-between">
        <div className="rounded-2xl bg-white/5 p-3 border border-white/5">
          {Icon && <Icon className="text-white/40 group-hover:text-white transition-colors" size={20} />}
        </div>
        <div className="flex items-center gap-2">
           <span className="text-[10px] font-bold uppercase tracking-widest text-[#ef4444] opacity-0 group-hover:opacity-100 transition-opacity duration-500">Velocity</span>
           <div className="h-1.5 w-1.5 rounded-full bg-[#ef4444] animate-pulse" />
        </div>
      </div>

      <div className="mt-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">{label}</p>
        <div className="mt-2 flex items-baseline gap-4">
          <RoughNotation
            type="box"
            show={showRough}
            color="#ef4444"
            strokeWidth={1}
            padding={4}
            iterations={1}
          >
            <h3 className="font-display text-5xl font-medium tracking-tight text-white leading-none">
              {value}
            </h3>
          </RoughNotation>
          <span className="font-handwriting text-lg text-white/40 rotate-12">{trend}</span>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2">
        <div className="h-[1px] flex-1 bg-white/5" />
        <span className="font-handwriting text-[#ef4444] text-sm opacity-0 group-hover:opacity-100 transition-opacity">Live tracking enabled</span>
      </div>
    </div>
  );
}
