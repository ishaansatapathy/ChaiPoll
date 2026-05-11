import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import rough from "roughjs/bundled/rough.esm.js";

export function CinematicLogo({ size = 40, showText = true, className = "" }) {
  const roughLayerRef = useRef(null);
  const ink = "rgba(255,255,255,0.9)";

  useEffect(() => {
    const g = roughLayerRef.current;
    if (!g?.ownerSVGElement) return;

    while (g.firstChild) g.removeChild(g.firstChild);

    const rc = rough.svg(g.ownerSVGElement);
    const common = {
      stroke: "rgba(255,255,255,0.2)",
      strokeWidth: 0.8,
      roughness: 1.5,
      bowing: 1.2,
      seed: 42,
    };

    const cupPass = rc.path("M36 35 L43 98 L72 97 L84 29", common);
    const rimPass = rc.ellipse(61, 30, 50, 12, common);
    
    g.appendChild(cupPass);
    g.appendChild(rimPass);
  }, [size]);

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div style={{ width: size, height: size }} className="relative flex-shrink-0">
        <div className="pointer-events-none absolute -inset-2 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.1),transparent_70%)] blur-md" />
        
        <motion.svg
          viewBox="0 0 128 128"
          className="h-full w-full"
          aria-hidden
        >
          <g ref={roughLayerRef} />
          
          <motion.path
            d="M36 35 L43 98 L72 97 L84 29"
            fill="rgba(255,255,255,0.02)"
            stroke={ink}
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
          />
          <motion.ellipse
            cx="61"
            cy="30"
            rx="25.5"
            ry="6.5"
            fill="none"
            stroke="rgba(255,255,255,0.8)"
            strokeWidth="2.5"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.19, 1, 0.22, 1] }}
          />
          
          {/* Internal Code Symbol */}
          <motion.path
            d="M54 58 L45 64 L54 70 M66 55 L61 75 M70 58 L79 64 L70 70"
            fill="none"
            stroke={ink}
            strokeWidth="3.5"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          />
        </motion.svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <motion.h2 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="font-display text-xl font-medium tracking-tight text-white leading-none flex items-center gap-1"
          >
            Chai<span className="text-[#ef4444] italic">Poll</span>
          </motion.h2>
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "100%", opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="h-[1px] bg-gradient-to-r from-[#ef4444] to-transparent mt-1"
          />
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ delay: 1.5 }}
            className="text-[9px] uppercase tracking-[0.3em] text-white font-bold mt-1"
          >
            Nexus Protocol
          </motion.p>
        </div>
      )}
    </div>
  );
}
