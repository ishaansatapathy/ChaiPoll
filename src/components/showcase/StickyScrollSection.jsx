import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { RoughNotation, RoughNotationGroup } from "react-rough-notation";

const slides = [
  {
    title: "Realtime analytics",
    description: "Watch responses pour in with millisecond precision. Our dashboard updates live without refresh.",
    preview: (
      <div className="h-full w-full bg-ink-900 rounded-xl border border-white/5 p-8 flex flex-col justify-center gap-6 overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="h-4 w-32 bg-white/10 rounded" />
          <div className="h-4 w-12 bg-white/20 rounded" />
        </div>
        <div className="flex items-end gap-2 h-40">
          {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              whileInView={{ height: `${h}%` }}
              className="flex-1 bg-white/10 rounded-t"
              transition={{ delay: i * 0.1, duration: 0.5 }}
            />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-12 bg-white/5 rounded" />
          <div className="h-12 bg-white/5 rounded" />
        </div>
      </div>
    ),
  },
  {
    title: "Anonymous responses",
    description: "Privacy first. Collect honest feedback without compromising identity. Secure and encrypted.",
    preview: (
      <div className="h-full w-full bg-ink-900 rounded-xl border border-white/5 p-8 flex flex-col items-center justify-center text-center">
        <RoughNotation type="box" show={true} color="#ef4444" strokeWidth={2} padding={20} animationDelay={500}>
          <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </RoughNotation>
        <h4 className="text-xl text-white mb-2 mt-4">End-to-End Encryption</h4>
        <p className="text-sm text-white/40 max-w-[200px]">Data is hashed and anonymized before storage.</p>
      </div>
    ),
  },
  {
    title: "Publish results instantly",
    description: "Generate beautiful public links to share findings with your community or stakeholders.",
    preview: (
      <div className="h-full w-full bg-ink-900 rounded-xl border border-white/5 p-8 flex flex-col justify-center">
        <div className="p-4 bg-white/5 border border-white/10 rounded-lg mb-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded bg-white/10" />
            <div className="h-3 w-40 bg-white/20 rounded" />
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-2 w-full bg-white/10 rounded" />
          <div className="h-2 w-full bg-white/10 rounded" />
          <div className="h-2 w-2/3 bg-white/10 rounded" />
        </div>
        <div className="mt-8 flex justify-end">
          <RoughNotation type="box" show={true} color="white" strokeWidth={1} padding={6}>
            <div className="px-4 py-2 bg-white text-black text-xs font-bold rounded">SHARE LINK</div>
          </RoughNotation>
        </div>
      </div>
    ),
  },
];

export function StickyScrollSection() {
  const containerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      const index = Math.min(
        slides.length - 1,
        Math.floor(latest * slides.length)
      );
      setActiveIndex(index);
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  return (
    <section ref={containerRef} className="relative z-20 bg-ink-950 min-h-[300vh]">
      <div className="sticky top-0 h-screen w-full flex items-center px-5 md:px-20 overflow-hidden">
        <div className="mx-auto max-w-7xl w-full grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
          {/* Left: Text Content */}
          <div className="relative h-[400px]">
            {slides.map((slide, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: activeIndex === index ? 1 : 0,
                  y: activeIndex === index ? 0 : 20,
                  pointerEvents: activeIndex === index ? "auto" : "none"
                }}
                transition={{ duration: 0.6, ease: "circOut" }}
                className="absolute inset-0 flex flex-col justify-center"
              >
                <span className="text-xs font-bold text-white/30 uppercase tracking-[0.2em] mb-4">Feature 0{index + 1}</span>
                <h2 className="font-display text-5xl md:text-6xl font-normal text-white mb-6">
                  {slide.title}
                </h2>
                <p className="text-lg text-white/50 max-w-md leading-relaxed">
                  {slide.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Right: Preview Window */}
          <div className="relative aspect-square md:aspect-[4/3] w-full">
            <RoughNotationGroup show={true}>
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                transition={{ duration: 0.8, ease: "circOut" }}
                className="h-full w-full"
              >
                {slides[activeIndex].preview}
              </motion.div>
            </RoughNotationGroup>

            {/* Subtle glass effect border */}
            <div className="absolute inset-0 pointer-events-none rounded-xl border border-white/5 shadow-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
