import { motion } from "framer-motion";
import { RoughNotation, RoughNotationGroup } from "react-rough-notation";

export function TypographySection() {
  return (
    <section className="relative z-20 bg-ink-950 py-60 px-5 md:px-20">
      <div className="mx-auto max-w-5xl text-center">
        <RoughNotationGroup show={true}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="space-y-24"
          >
            <div className="inline-block relative">
              <RoughNotation
                type="circle"
                color="white"
                strokeWidth={1.5}
                padding={40}
                animationDelay={500}
              >
                <h2 className="font-display text-[clamp(2.5rem,8vw,6rem)] leading-[1.1] font-normal tracking-[-0.04em] text-white italic py-4">
                  Built for <span className="not-italic">realtime</span>{" "}
                  <span className="relative inline-block">
                    <RoughNotation
                      type="underline"
                      color="white"
                      strokeWidth={1.5}
                      animationDelay={1500}
                    >
                      participation.
                    </RoughNotation>
                  </span>
                </h2>
              </RoughNotation>
            </div>
          
            <h2 className="font-display text-[clamp(2.5rem,8vw,6rem)] leading-[1] font-normal tracking-[-0.04em] text-white/30">
              Because nobody likes <br /> 
              <span className="text-white line-through decoration-white/20">boring surveys.</span>
            </h2>

            <h2 className="font-display text-[clamp(2.5rem,7vw,6rem)] leading-[1] font-normal tracking-[-0.04em] text-white underline underline-offset-8 decoration-white/10">
              Modern polling for modern teams.
            </h2>
          </motion.div>
        </RoughNotationGroup>
      </div>
    </section>
  );
}
