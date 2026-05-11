import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import rough from "roughjs/bundled/rough.esm.js";

export default function RoughChaiCodeMark({ className = "" }) {
  const roughLayerRef = useRef(null);
  const ink = "rgba(255,255,255,0.9)";

  const path = {
    hidden: { pathLength: 0, opacity: 0 },
    show: (i) => ({
      pathLength: 1,
      opacity: 1,
      transition: {
        duration: 0.62,
        delay: 0.14 + i * 0.12,
        ease: [0.19, 1, 0.22, 1],
      },
    }),
  };

  useEffect(() => {
    const g = roughLayerRef.current;
    if (!g?.ownerSVGElement) return;

    while (g.firstChild) g.removeChild(g.firstChild);

    const rc = rough.svg(g.ownerSVGElement);
    const common = {
      stroke: "rgba(255,255,255,0.26)",
      strokeWidth: 1,
      roughness: 1.25,
      bowing: 1.05,
      seed: 77,
    };

    const cupShadowPass = rc.path("M36 35 L43 98 L72 97 L84 29", common);
    const rimShadowPass = rc.ellipse(61, 30, 50, 12, {
      ...common,
      strokeWidth: 0.95,
      roughness: 1.4,
    });
    const underlinePass = rc.path("M24 111 C 45 114, 77 112, 99 110", {
      ...common,
      strokeWidth: 0.8,
      roughness: 1.4,
    });

    g.appendChild(cupShadowPass);
    g.appendChild(rimShadowPass);
    g.appendChild(underlinePass);
  }, []);

  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      <div className="pointer-events-none absolute -inset-x-8 -inset-y-7 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.06),rgba(0,0,0,0)_65%)] blur-xl" />
      <div className="pointer-events-none absolute -inset-x-10 -inset-y-9 rounded-full bg-[radial-gradient(circle_at_50%_40%,rgba(255,255,255,0.04),rgba(0,0,0,0)_60%)]" />

      <div className="relative h-36 w-36">
        <motion.svg
          viewBox="0 0 128 128"
          className="h-full w-full"
          aria-hidden
          style={{
            filter: "drop-shadow(0 0 14px rgba(255,255,255,0.06))",
          }}
        >
          <defs>
            <clipPath id="chai-fill-mask">
              <path d="M36 35 L84 29 L72 97 L43 98 Z" />
            </clipPath>
            <clipPath id="text-reveal">
              <motion.rect
                x="14"
                y="92"
                width="96"
                height="28"
                initial={{ width: 0 }}
                animate={{ width: 96 }}
                transition={{ duration: 1, delay: 3.9, ease: [0.19, 1, 0.22, 1] }}
              />
            </clipPath>
          </defs>

          {/* rough.js imperfect pass */}
          <g ref={roughLayerRef} />

          {/* Step 3: chai fill */}
          <motion.rect
            x="34"
            y="102"
            width="54"
            height="0"
            clipPath="url(#chai-fill-mask)"
            fill="rgba(245,245,245,0.16)"
            initial={{ y: 98, height: 0, opacity: 0 }}
            animate={{ y: 47, height: 58, opacity: 1 }}
            transition={{ duration: 1.35, delay: 2.0, ease: [0.19, 1, 0.22, 1] }}
          />

          {/* top liquid cap for glass-like chai shape */}
          <motion.ellipse
            cx="61"
            cy="48"
            rx="23"
            ry="5.6"
            fill="rgba(245,245,245,0.28)"
            clipPath="url(#chai-fill-mask)"
            initial={{ opacity: 0, scaleX: 0.68, y: 1 }}
            animate={{ opacity: 1, scaleX: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 2.45, ease: [0.19, 1, 0.22, 1] }}
          />

          <motion.path
            d="M36 35 L43 98 L72 97 L84 29"
            fill="rgba(255,255,255,0.02)"
            stroke={ink}
            strokeWidth="2.65"
            strokeLinecap="round"
            strokeLinejoin="round"
            variants={path}
            custom={0}
            initial="hidden"
            animate="show"
          />
          {/* open glass rim */}
          <motion.ellipse
            cx="61"
            cy="30"
            rx="25.5"
            ry="6.5"
            fill="none"
            stroke="rgba(255,255,255,0.62)"
            strokeWidth="1.9"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.92, delay: 0.35, ease: [0.19, 1, 0.22, 1] }}
          />
          {/* Top straight line removed; only oval opening kept */}
          {/* Handle removed intentionally as requested */}

          {/* Step 4: subtle steam */}
          <motion.path
            d="M53 18 C 48 12, 56 8, 53 1"
            fill="none"
            stroke="rgba(255,255,255,0.58)"
            strokeWidth="1.5"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0, y: 2 }}
            animate={{ pathLength: 1, opacity: [0, 0.75, 0.45], y: [2, 0, -1] }}
            transition={{ duration: 1.15, delay: 3.05, ease: [0.19, 1, 0.22, 1] }}
          />
          <motion.path
            d="M61 16 C 57 10, 64 7, 61 1"
            fill="none"
            stroke="rgba(255,255,255,0.46)"
            strokeWidth="1.2"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0, y: 3 }}
            animate={{ pathLength: 1, opacity: [0, 0.65, 0.35], y: [3, 1, -1] }}
            transition={{ duration: 1.2, delay: 3.2, ease: [0.19, 1, 0.22, 1] }}
          />

          {/* Step 2: code symbol */}
          <motion.path
            d="M54 58 L45 64 L54 70"
            fill="none"
            stroke={ink}
            strokeWidth="2.9"
            strokeLinecap="round"
            strokeLinejoin="round"
            variants={path}
            custom={4}
            initial="hidden"
            animate="show"
          />
          <motion.path
            d="M66 55 L61 75"
            fill="none"
            stroke={ink}
            strokeWidth="2.9"
            strokeLinecap="round"
            variants={path}
            custom={5}
            initial="hidden"
            animate="show"
          />
          <motion.path
            d="M70 58 L79 64 L70 70"
            fill="none"
            stroke={ink}
            strokeWidth="2.9"
            strokeLinecap="round"
            strokeLinejoin="round"
            variants={path}
            custom={6}
            initial="hidden"
            animate="show"
          />

          {/* Step 5: handwritten wordmark + underline */}
          <g clipPath="url(#text-reveal)">
            <motion.text
              x="20"
              y="109"
              fill="rgba(255,255,255,0.74)"
              className="font-handwriting"
              style={{ fontSize: "12px", letterSpacing: "0.35px" }}
              initial={{ opacity: 0, x: 2 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, delay: 3.95, ease: [0.19, 1, 0.22, 1] }}
            >
              ChaiPoll
            </motion.text>
            <motion.path
              d="M24 111 C 45 114, 77 112, 99 110"
              fill="none"
              stroke="rgba(255,255,255,0.52)"
              strokeWidth="0.95"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.85, delay: 4.15, ease: [0.19, 1, 0.22, 1] }}
            />
          </g>
        </motion.svg>
      </div>
    </div>
  );
}

