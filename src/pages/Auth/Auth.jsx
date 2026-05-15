import React from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import AuthCard from "../../components/auth/AuthCard";
import { RoughNotation } from "react-rough-notation";
import heroImage from "../../../bg-image/hero-bg.png";
import RoughChaiCodeMark from "../../components/auth/RoughChaiCodeMark";

const Auth = () => {
  const { pathname } = useLocation();
  const initialSignup = pathname === "/signup";

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#070707] font-sans selection:bg-white selection:text-black">
      {/* Background Image */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.85] mix-blend-lighten">
        <img
          src={heroImage}
          alt=""
          className="h-full w-full object-cover grayscale contrast-[1.2] brightness-[0.25]"
        />
      </div>
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,rgba(190,190,190,0.14),rgba(0,0,0,0)_42%)]" />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_54%,rgba(255,255,255,0.08),rgba(0,0,0,0)_48%)]" />
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,rgba(0,0,0,0.9),rgba(0,0,0,0.35)_48%,rgba(0,0,0,0.9))]" />
      {/* very subtle full-screen pass so top area also gets texture */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.13] mix-blend-screen">
        <img
          src={heroImage}
          alt=""
          className="h-full w-full object-cover grayscale contrast-[1.22] brightness-[0.45] blur-[0.5px]"
        />
      </div>

      {/* second visible layer from same bg-image (lower section) */}
      <div
        className="absolute inset-x-0 bottom-0 h-[42%] pointer-events-none overflow-hidden opacity-[0.52] mix-blend-screen"
        style={{
          maskImage:
            "linear-gradient(to top, black 0%, black 55%, rgba(0,0,0,0.65) 78%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to top, black 0%, black 55%, rgba(0,0,0,0.65) 78%, transparent 100%)",
        }}
      >
        <img
          src={heroImage}
          alt=""
          className="h-full w-full object-cover grayscale contrast-[1.35] brightness-[0.6] blur-[0.6px] scale-[1.04]"
        />
      </div>
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_top,rgba(0,0,0,0)_40%,rgba(0,0,0,0.1)_72%,rgba(0,0,0,0.22)_100%)]" />

      <div className="relative z-10 flex min-h-screen w-full">
        {/* Left Side: Decorative Annotations — hidden on mobile */}
        <div className="relative flex-1 hidden md:flex">
          {/* Logo */}
          <div className="absolute top-[10%] left-[8%] opacity-95">
            <RoughChaiCodeMark />
          </div>

          {/* live feedback */}
          <div className="absolute top-[54%] left-[10%]">
            <RoughNotation type="box" show color="#ef4444" strokeWidth={2} padding={10}>
              <span className="font-handwriting text-[1.4rem] text-white/90">live feedback</span>
            </RoughNotation>
          </div>

          {/* realtime participation */}
          <div className="absolute top-[16%] left-[54%]">
            <RoughNotation type="underline" show color="#ffffff" strokeWidth={1.5} padding={6}>
              <span className="font-handwriting text-[1.4rem] text-white/85">
                realtime participation
              </span>
            </RoughNotation>
          </div>

          {/* better engagement */}
          <div className="absolute bottom-[6%] left-[18%]">
            <RoughNotation type="line" show color="#fff" strokeWidth={1.5} padding={8}>
              <span className="font-handwriting text-[1.4rem] text-white/90">
                better engagement
              </span>
            </RoughNotation>
          </div>

          {/* modern polling */}
          <div className="absolute bottom-[14%] left-[62%]">
            <RoughNotation type="circle" show color="#ef4444" strokeWidth={2} padding={12}>
              <span className="font-handwriting text-[1.4rem] text-white/90">modern polling</span>
            </RoughNotation>
          </div>
        </div>

        {/* Right Side: Auth Card */}
        <div className="relative flex w-full md:w-[35%] md:min-w-[380px] flex-col items-center justify-center p-6 sm:p-12 bg-gradient-to-l from-black/80 to-transparent md:border-l border-white/5">
          <div className="w-full max-w-md">
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 1.0, delay: 0.15, ease: [0.19, 1, 0.22, 1] }}
            >
              <AuthCard key={pathname} initialSignup={initialSignup} />
            </motion.div>
          </div>

          <div className="absolute bottom-8 text-white/20 text-[10px] uppercase tracking-[0.2em]">
            By continuing, you agree to our{" "}
            <a href="/terms" className="underline hover:text-white">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
