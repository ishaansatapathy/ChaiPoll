import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import rough from "roughjs/bundled/rough.esm.js";

export function CinematicLogo({ size = 56, showText = true, className = "" }) {
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
    <div className={`flex items-center gap-6 ${className}`}>
      <div style={{ width: size, height: size }} className="relative flex-shrink-0">
        <div className="pointer-events-none absolute -inset-4 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.14),transparent_70%)] blur-xl" />

        <motion.svg
          viewBox="0 0 128 128"
          className="h-full w-full"
          aria-hidden
          style={{
            filter: "drop-shadow(0 0 16px rgba(255,255,255,0.12))",
          }}
        >
          <defs>
            <clipPath id="logo-chai-fill-mask">
              <path d="M36 35 L84 29 L72 97 L43 98 Z" />
            </clipPath>
          </defs>

          {/* Imperfect Sketch Layer */}
          <g ref={roughLayerRef} />

          {/* Step 1: Liquid Fill Animation */}
          <motion.rect
            x="34"
            y="102"
            width="54"
            height="0"
            clipPath="url(#logo-chai-fill-mask)"
            fill="rgba(245,245,245,0.18)"
            initial={{ y: 98, height: 0, opacity: 0 }}
            animate={{ y: 45, height: 60, opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.6, ease: [0.19, 1, 0.22, 1] }}
          />

          {/* Liquid Cap (surface) */}
          <motion.ellipse
            cx="61"
            cy="46"
            rx="23"
            ry="5.5"
            fill="rgba(245,245,245,0.3)"
            clipPath="url(#logo-chai-fill-mask)"
            initial={{ opacity: 0, scaleX: 0.5 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.8, delay: 1.1, ease: [0.19, 1, 0.22, 1] }}
          />

          {/* Main Cup Outline */}
          <motion.path
            d="M36 35 L43 98 L72 97 L84 29"
            fill="rgba(255,255,255,0.02)"
            stroke={ink}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.9, ease: [0.19, 1, 0.22, 1] }}
          />

          {/* Cup Rim */}
          <motion.ellipse
            cx="61"
            cy="30"
            rx="25.5"
            ry="6.5"
            fill="none"
            stroke="rgba(255,255,255,0.85)"
            strokeWidth="2.5"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.19, 1, 0.22, 1] }}
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
            transition={{ duration: 0.8, delay: 1.3 }}
          />

          {/* Steam Animation */}
          <motion.path
            d="M55 18 C 50 12, 58 8, 55 1"
            fill="none"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="1.5"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: [0, 0.6, 0] }}
            transition={{ duration: 2, delay: 1.8, repeat: Infinity, repeatDelay: 1 }}
          />
        </motion.svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <motion.h2
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="font-display text-3xl font-normal tracking-tight text-white leading-none flex items-center gap-2"
          >
            Chai<span className="text-[#ef4444] italic font-medium">Poll</span>
          </motion.h2>
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "100%", opacity: 1 }}
            transition={{ duration: 1, delay: 1.6 }}
            className="h-[2px] bg-gradient-to-r from-[#ef4444] to-transparent mt-2 shadow-[0_0_12px_rgba(239,68,68,0.5)]"
          />
        </div>
      )}
    </div>
  );
}
