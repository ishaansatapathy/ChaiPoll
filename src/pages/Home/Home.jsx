import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { RoughNotation } from "react-rough-notation";
import { Navbar } from "../../components/layout/Navbar";
import { Button } from "../../components/ui/Button";
import { Highlight } from "../../components/ui/Highlight";
import { useSpotlight } from "../../hooks/useSpotlight.js";
import heroImage from "../../../bg-image/hero-bg.png";

import { WorkflowSection } from "../../components/showcase/WorkflowSection";
import { StickyScrollSection } from "../../components/showcase/StickyScrollSection";
import { LiveResponseSection } from "../../components/showcase/LiveResponseSection";
import { TypographySection } from "../../components/showcase/TypographySection";
import { CinematicLogo } from "../../components/ui/CinematicLogo";

export default function Home() {
  useSpotlight();
  const [showCross, setShowCross] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowCross(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="relative bg-ink-950">
      <div className="fixed inset-0 h-screen w-screen overflow-hidden">
        <img
          src={heroImage}
          alt=""
          className="h-full w-full object-cover opacity-80 grayscale contrast-110 brightness-75"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_52%,rgba(255,255,255,0.08),rgba(0,0,0,0)_45%)]" />
        <div className="absolute inset-0 shadow-[inset_70px_0_120px_#020202,inset_-70px_0_120px_#020202,inset_0_100px_130px_#020202,inset_0_-120px_150px_#020202]" />
      </div>
      <div
        className="pointer-events-none fixed inset-0 z-10 bg-black/80 [mask-image:radial-gradient(circle_340px_at_var(--spotlight-x)_var(--spotlight-y),transparent_0%,transparent_34%,rgba(0,0,0,0.35)_55%,#000_100%)]"
        aria-hidden="true"
      />
      <Navbar />

      {/* Hero Section */}
      <section className="relative z-20 grid min-h-screen place-items-center px-5 pt-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-5xl"
        >
          <p className="mb-8 text-xs font-semibold uppercase tracking-[0.16em] text-white/56">
            Realtime polling for teams
          </p>
          <h1 className="mx-auto max-w-[920px] font-display text-[clamp(3.1rem,6.4vw,5.9rem)] font-normal leading-[0.93] tracking-[-0.045em] text-white">
            Create <Highlight>Polls</Highlight> That
            <br />
            People Want To Answer
          </h1>
          <p className="mx-auto mt-10 max-w-2xl text-base leading-8 text-white/62 sm:text-lg">
            Collect responses without boring people using{" "}
            <span className="relative inline-block">
              <RoughNotation
                type="crossed-off"
                show={showCross}
                color="#ef4444"
                strokeWidth={2}
                padding={[2, 4]}
              >
                <span>boring polls</span>
              </RoughNotation>
              {showCross && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ delay: 2, duration: 0.5, type: "spring" }}
                  className="absolute -right-24 -top-12 flex flex-col items-start"
                >
                  <div className="relative">
                    <RoughNotation
                      type="circle"
                      show={true}
                      color="#ef4444"
                      strokeWidth={2}
                      padding={10}
                      animationDelay={2500}
                    >
                      <span className="font-handwriting text-2xl tracking-wide text-white">
                        ChaiPoll
                      </span>
                    </RoughNotation>

                    {/* Curly Arrow */}
                    <svg
                      className="absolute -bottom-8 -left-10 h-12 w-12 -rotate-[15deg]"
                      viewBox="0 0 50 50"
                      fill="none"
                    >
                      <motion.path
                        d="M10 40c5-15 15-25 25-25"
                        stroke="#ef4444"
                        strokeWidth="2"
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ delay: 2.3, duration: 0.6 }}
                      />
                      <motion.path
                        d="M30 10l5 5l-5 5"
                        stroke="#ef4444"
                        strokeWidth="2"
                        strokeLinecap="round"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 2.9 }}
                      />
                    </svg>
                  </div>
                </motion.div>
              )}
            </span>
            .
          </p>
          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <Button to="/create" className="gap-2">
              Create a poll <ArrowRight size={16} />
            </Button>
            <Button to="/dashboard" variant="secondary">
              View dashboard
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Showcase Sections */}
      <WorkflowSection />
      <StickyScrollSection />
      <LiveResponseSection />
      <TypographySection />

      {/* Footer */}
      <footer className="relative z-20 py-32 px-5 md:px-20 border-t border-white/5 bg-[#020202]">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <CinematicLogo size={32} />
            <div className="hidden md:block h-8 w-[1px] bg-white/5" />
            <div className="flex gap-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
              <span className="text-white/10 italic font-handwriting text-xl normal-case tracking-normal">
                "Build for the builders"
              </span>
            </div>
          </div>
          <div className="flex flex-col items-center md:items-end gap-3">
            <p className="text-[10px] uppercase tracking-[0.4em] text-white/20 font-bold">
              © 2026 ChaiPoll — Production Ready
            </p>
            <div className="h-[1px] w-12 bg-[#ef4444]/20" />
          </div>
        </div>
      </footer>
    </main>
  );
}
