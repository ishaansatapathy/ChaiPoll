import { motion } from "framer-motion";
import { RoughNotation } from "react-rough-notation";

const nodes = [
  { id: 1, label: "User Input", x: "10%", y: "20%", type: "source" },
  { id: 2, label: "Encryption Engine", x: "40%", y: "40%", type: "process" },
  { id: 3, label: "Secure Storage", x: "70%", y: "20%", type: "storage" },
  { id: 4, label: "Live Dashboard", x: "40%", y: "70%", type: "output" },
  { id: 5, label: "Global Sync", x: "80%", y: "60%", type: "process" },
];

const connections = [
  { from: 1, to: 2, path: "M 15 25 Q 25 25, 35 40" },
  { from: 2, to: 3, path: "M 45 40 Q 55 20, 65 25" },
  { from: 2, to: 4, path: "M 40 45 Q 40 55, 40 65" },
  { from: 3, to: 5, path: "M 75 25 Q 85 40, 80 55" },
  { from: 4, to: 5, path: "M 45 75 Q 65 75, 75 65" },
];

export function IntegrationArchitecture() {
  return (
    <section className="relative z-20 bg-ink-950 py-60 px-5 md:px-20 overflow-hidden min-h-screen flex items-center">
      <div className="mx-auto max-w-7xl w-full relative h-[600px]">
        {/* Editorial Title */}
        <div className="absolute top-0 left-0 z-10">
          <h2 className="font-display text-4xl md:text-6xl font-normal text-white/90">
            A architecture <br />
            built for <br />
            <RoughNotation type="underline" show={true} color="#ef4444" strokeWidth={2}>
              reliability.
            </RoughNotation>
          </h2>
          <p className="mt-6 text-white/30 max-w-xs font-handwriting">
            Every node is a promise. Every path is a secure tunnel.
          </p>
        </div>

        {/* The Flow Diagram */}
        <div className="absolute inset-0">
          <svg
            className="w-full h-full opacity-20"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {connections.map((conn, i) => (
              <motion.path
                key={i}
                d={conn.path}
                stroke="white"
                strokeWidth="0.2"
                fill="none"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, delay: i * 0.2, ease: "easeInOut" }}
              />
            ))}
          </svg>

          {nodes.map((node) => (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: node.id * 0.1 }}
              className="absolute group cursor-default"
              style={{ left: node.x, top: node.y }}
            >
              <div className="flex flex-col items-center -translate-x-1/2 -translate-y-1/2">
                <div className="h-4 w-4 rounded-full border border-white/40 bg-ink-950 shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all group-hover:scale-150 group-hover:border-white group-hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]" />
                <span className="mt-4 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold whitespace-nowrap transition-colors group-hover:text-white">
                  {node.label}
                </span>

                {/* Subtle hand-drawn annotation for type */}
                <span className="mt-1 font-handwriting text-[12px] text-[#ef4444] opacity-0 group-hover:opacity-100 transition-opacity">
                  {node.type}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Parallax Background Text */}
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          whileInView={{ opacity: 0.05, x: 0 }}
          className="absolute -bottom-20 -right-20 pointer-events-none select-none"
        >
          <span className="font-display text-[20rem] text-white font-bold italic">Flow</span>
        </motion.div>
      </div>
    </section>
  );
}
