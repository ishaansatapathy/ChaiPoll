import React from "react";
import { motion } from "framer-motion";

export function ChartContainer({ title, description, children, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`surface rounded-[40px] p-8 border border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent backdrop-blur-3xl overflow-hidden relative group ${className}`}
    >
      <div className="absolute -top-10 -right-10 size-40 bg-[#ef4444]/5 blur-[80px] group-hover:bg-[#ef4444]/10 transition-colors" />

      <div className="mb-10 relative">
        <div className="flex items-center gap-3 mb-2">
          <div className="size-1 rounded-full bg-[#ef4444]" />
          <h3 className="font-display text-2xl text-white tracking-tight">{title}</h3>
        </div>
        {description && (
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold">
            {description}
          </p>
        )}
      </div>

      <div className="relative">{children}</div>
    </motion.div>
  );
}
