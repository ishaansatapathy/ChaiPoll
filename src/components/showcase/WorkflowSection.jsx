import { motion } from "framer-motion";
import { RoughNotation, RoughNotationGroup } from "react-rough-notation";

const workflowSteps = [
  { id: 1, label: "Create Poll", description: "Design in seconds" },
  { id: 2, label: "Share Link", description: "One click distribution" },
  { id: 3, label: "Collect Responses", description: "Realtime data flow" },
  { id: 4, label: "Live Analytics", description: "Deep insights" },
  { id: 5, label: "Publish Results", description: "Close the loop" },
];

export function WorkflowSection() {
  return (
    <section className="relative z-20 bg-ink-950 py-32 px-5 md:px-20">
      <RoughNotationGroup show={true}>
        <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
          {/* Left: Editorial Text */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="inline-block">
              <RoughNotation type="box" color="white" strokeWidth={1} padding={24} multiline={true}>
                <h2 className="font-display text-5xl md:text-7xl font-normal tracking-tight text-white leading-[1.2] py-2">
                  A workflow <br />
                  that feels like <br />
                  <RoughNotation
                    type="underline"
                    color="#ef4444"
                    strokeWidth={3}
                    animationDelay={1000}
                  >
                    magic.
                  </RoughNotation>
                </h2>
              </RoughNotation>
            </div>
            <p className="mt-16 text-lg text-white/50 max-w-md leading-relaxed">
              From the first question to the final report, every step is{" "}
              <span className="relative inline-block">
                <RoughNotation
                  type="box"
                  color="white"
                  strokeWidth={1}
                  padding={4}
                  animationDelay={2000}
                >
                  crafted for speed
                </RoughNotation>
              </span>{" "}
              and clarity. No friction, just flow.
            </p>
          </motion.div>

          {/* Right: Animated Workflow */}
          <div className="relative h-[500px] flex flex-col justify-between">
            {workflowSteps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
                className="relative flex items-center gap-6 group"
              >
                <RoughNotation
                  type="circle"
                  color={index === 2 ? "#ef4444" : "white"}
                  strokeWidth={2}
                  padding={8}
                  animationDelay={index * 200 + 1500}
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm font-medium text-white transition-colors group-hover:border-white/30 group-hover:bg-white/10">
                    {step.id}
                  </div>
                </RoughNotation>
                <div>
                  <h3 className="text-xl font-medium text-white">{step.label}</h3>
                  <p className="text-sm text-white/40">{step.description}</p>
                </div>

                {index < workflowSteps.length - 1 && (
                  <svg className="absolute left-6 top-12 h-16 w-px" viewBox="0 0 1 64" fill="none">
                    <motion.line
                      x1="0.5"
                      y1="0"
                      x2="0.5"
                      y2="64"
                      stroke="white"
                      strokeOpacity="0.1"
                      strokeDasharray="4 4"
                      initial={{ pathLength: 0 }}
                      whileInView={{ pathLength: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.15 + 0.3, duration: 0.8 }}
                    />
                  </svg>
                )}
              </motion.div>
            ))}

            {/* Hand-drawn arrow annotation */}
            <motion.div
              initial={{ opacity: 0, rotate: -15 }}
              whileInView={{ opacity: 1, rotate: -10 }}
              viewport={{ once: true }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="absolute -right-10 top-1/2 -translate-y-1/2 hidden lg:block"
            >
              <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
                <path
                  d="M10 80C30 80 50 20 90 20"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  strokeOpacity="0.4"
                />
                <path d="M82 15L90 20L82 25" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" />
              </svg>
              <span className="absolute top-0 right-0 font-handwriting text-white/40 text-sm whitespace-nowrap translate-x-full">
                Automated sync
              </span>
            </motion.div>
          </div>
        </div>
      </RoughNotationGroup>
    </section>
  );
}
