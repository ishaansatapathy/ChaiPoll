import { motion } from "framer-motion";
import { RoughNotation, RoughNotationGroup } from "react-rough-notation";

const bubbles = [
  { size: 120, x: "10%", y: "20%", delay: 0, label: "Yes" },
  { size: 80, x: "70%", y: "15%", delay: 1, label: "No" },
  { size: 100, x: "40%", y: "60%", delay: 0.5, label: "Maybe" },
  { size: 60, x: "85%", y: "70%", delay: 1.5, label: "Agree" },
  { size: 90, x: "15%", y: "75%", delay: 2, label: "Disagree" },
];

export function LiveResponseSection() {
  return (
    <section className="relative z-20 bg-ink-950 py-32 px-5 md:px-20 overflow-hidden min-h-screen flex items-center">
      <RoughNotationGroup show={true}>
        <div className="mx-auto max-w-7xl w-full relative">
          <div className="text-center relative z-10">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-display text-6xl md:text-8xl font-normal text-white mb-8"
            >
              Alive with <br /> 
              <span className="relative inline-block">
                <RoughNotation
                  type="underline"
                  color="white"
                  strokeWidth={2}
                  animationDelay={500}
                >
                  Part
                </RoughNotation>
              </span>
              icipation.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 0.5 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="text-lg text-white max-w-lg mx-auto"
            >
              Every vote is a pulse. Watch your community engage in realtime with fluid, organic motion.
            </motion.p>
          </div>

          {/* Floating System */}
          <div className="absolute inset-0 pointer-events-none">
            {bubbles.map((bubble, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ 
                  opacity: 0.15, 
                  scale: 1,
                }}
                animate={{
                  y: [0, -20, 0],
                  x: [0, 10, 0],
                }}
                transition={{
                  duration: 5 + i,
                  repeat: Infinity,
                  repeatType: "mirror",
                  ease: "easeInOut",
                }}
                className="absolute rounded-full border border-white/20 bg-white/5 backdrop-blur-sm flex items-center justify-center text-xs font-bold tracking-widest uppercase text-white/40"
                style={{
                  width: bubble.size,
                  height: bubble.size,
                  left: bubble.x,
                  top: bubble.y,
                }}
              >
                {bubble.label}
              </motion.div>
            ))}

            {/* Particles */}
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={`p-${i}`}
                className="absolute h-1 w-1 bg-white/20 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  opacity: [0, 0.4, 0],
                  scale: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2 + Math.random() * 4,
                  repeat: Infinity,
                  delay: Math.random() * 5,
                }}
              />
            ))}
          </div>
        </div>
      </RoughNotationGroup>
    </section>
  );
}
