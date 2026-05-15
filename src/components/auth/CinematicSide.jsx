import React from "react";
import { motion } from "framer-motion";
import { RoughNotation } from "react-rough-notation";

const CinematicSide = () => {
  return (
    <div className="relative h-full w-full max-w-2xl">
      {/* Top Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-0 left-0 flex items-center gap-3"
      >
        <div className="size-10 rounded-xl bg-white flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.1)]">
          <div className="size-4 rounded-full border-2 border-black" />
        </div>
        <span className="text-2xl font-semibold tracking-tight text-white">ChaiPoll</span>
      </motion.div>

      {/* Main Content Area */}
      <div className="flex h-full flex-col justify-center gap-12">
        {/* Large Typography with Annotations */}
        <div className="grid gap-4">
          <motion.h1
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-8xl font-semibold tracking-tighter text-white"
          >
            <RoughNotation
              type="highlight"
              show={true}
              color="rgba(255,255,255,0.05)"
              strokeWidth={10}
              padding={10}
            >
              Chai.
            </RoughNotation>
          </motion.h1>

          <motion.h1
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-8xl font-semibold tracking-tighter text-white"
          >
            Poll.
          </motion.h1>

          <motion.h1
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-8xl font-semibold tracking-tighter text-white"
          >
            <RoughNotation type="underline" show={true} color="#ef4444" strokeWidth={3} padding={5}>
              AI.
            </RoughNotation>
          </motion.h1>
        </div>

        {/* Space reserved for other content if needed */}
        <div className="relative">
          {/* Floating Analytics Fragments */}
          <FloatingFragment
            src="/assets/auth/poll_cards.png"
            className="absolute -top-20 right-20 w-64 opacity-60 blur-[1px]"
            delay={1}
          />
        </div>
      </div>

      {/* Modern Polling Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.4, scale: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-0 left-0 flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-6 py-3 backdrop-blur-xl"
      >
        <div className="size-2 rounded-full bg-white animate-pulse" />
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white">
          Better Engagement
        </span>
      </motion.div>
    </div>
  );
};

const FloatingFragment = ({ src, className, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{
      opacity: 0.6,
      y: [0, -15, 0],
    }}
    transition={{
      opacity: { delay, duration: 1 },
      y: { repeat: Infinity, duration: 6, ease: "easeInOut" },
    }}
    className={className}
  >
    <img src={src} alt="" className="w-full grayscale brightness-125" />
  </motion.div>
);

export default CinematicSide;
