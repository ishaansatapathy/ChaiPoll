import React, { useState } from "react";
import { motion } from "framer-motion";
import { RoughNotation } from "react-rough-notation";

export function AnalyticsCard({ label, value, trend, icon: Icon, showRough }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative overflow-hidden rounded-[32px] p-8 border border-white/5 bg-[#050505] transition-all duration-500 hover:bg-white/[0.01]"
    >
      {/* Tactical Grid Background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      
      {/* Hand-drawn Box on Hover - Our Identity */}
      <div className="absolute inset-2 pointer-events-none">
         <RoughNotation
            type="box"
            show={isHovered}
            color="#ef4444"
            strokeWidth={2}
            padding={0}
            iterations={1}
            animate={true}
         />
      </div>

      {/* Viewfinder Brackets */}
      <div className="absolute top-4 left-4 w-3 h-3 border-t border-l border-white/10" />
      <div className="absolute bottom-4 right-4 w-3 h-3 border-b border-r border-white/10" />

      {/* Header Section */}
      <div className="relative flex items-center justify-between mb-10">
        <div className="h-10 w-10 rounded-xl bg-white/[0.02] flex items-center justify-center border border-white/5">
          {Icon && <Icon className="text-white/20 group-hover:text-[#ef4444] transition-colors" size={20} />}
        </div>
        <div className="flex items-center gap-2">
           <span className="text-[8px] font-black uppercase tracking-[0.4em] text-white/20">Operational</span>
           <div className="h-1 w-1 rounded-full bg-[#ef4444] opacity-40 shadow-[0_0_8px_#ef4444]" />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative">
        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/10 mb-4">{label}</p>
        <div className="flex items-baseline gap-4">
          <h3 className="font-mono text-6xl font-normal tracking-tighter text-white leading-none">
            {value}
          </h3>
          <div className="flex flex-col">
             <span className="font-handwriting text-xl text-[#ef4444]/60 rotate-[-8deg]">{trend}</span>
             <span className="text-[7px] font-black text-white/5 uppercase tracking-widest mt-1 italic">Delta_Sync</span>
          </div>
        </div>
      </div>

      {/* Floating Annotations */}
      <div className="absolute -bottom-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rotate-[-5deg]">
         <span className="font-handwriting text-[#ef4444]/40 text-sm">"Peak Sync"</span>
      </div>
    </div>
  );
}
