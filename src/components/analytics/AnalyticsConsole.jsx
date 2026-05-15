import React from "react";
import { motion } from "framer-motion";
import { RoughNotation } from "react-rough-notation";
import { TrendingUp, Zap, Activity, Clock, Percent } from "lucide-react";
import { publishPoll } from "../../services/api";

export default function AnalyticsConsole({
  poll,
  setPoll,
  showRough,
  recentCount,
  velocityPct,
  pollAge,
  publishing,
  setPublishing,
  id,
  metrics,
}) {
  return (
    <div className="relative group overflow-hidden rounded-[40px] border border-white/5 bg-[#050505]/60 backdrop-blur-3xl p-10 shadow-2xl">
      {/* Subtle Grid Background */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative z-10 grid lg:grid-cols-[1.4fr_1fr] gap-16">
        {/* Left Sector: Core Intel */}
        <div className="space-y-10">
          <div className="flex items-center gap-3">
            <div className="h-1.5 w-1.5 rounded-full bg-[#ef4444] shadow-[0_0_10px_#ef4444]" />
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/40">
              Poll Data / Active
            </p>
          </div>

          <div className="flex items-start gap-12">
            <div className="relative">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-4">
                Total Responses
              </p>
              <RoughNotation
                type="circle"
                show={showRough}
                color="#ef4444"
                strokeWidth={2}
                padding={20}
                iterations={2}
              >
                <h2 className="text-7xl font-mono font-normal tracking-tighter text-white leading-none">
                  {poll?.totalParticipants || 0}
                </h2>
              </RoughNotation>
              <div className="absolute -bottom-6 -right-4 rotate-[-5deg]">
                <span className="font-handwriting text-xl text-[#ef4444]/60 whitespace-nowrap">
                  &quot;Live Data Feed&quot;
                </span>
              </div>
            </div>

            <div className="pt-8 space-y-4">
              <div className="flex items-center gap-2">
                <TrendingUp
                  size={14}
                  className={velocityPct >= 0 ? "text-emerald-500" : "text-red-400"}
                />
                <span
                  className={`text-[10px] font-black uppercase tracking-widest ${velocityPct >= 0 ? "text-emerald-500" : "text-red-400"}`}
                >
                  {velocityPct >= 0 ? "+" : ""}
                  {velocityPct}% 24h
                </span>
              </div>
              <div className="h-[1px] w-12 bg-white/10" />
              <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest leading-relaxed max-w-[140px]">
                {recentCount} responses in the last 24 hours
              </p>
            </div>
          </div>

          <div className="flex gap-16 pt-10 border-t border-white/5">
            <div className="relative">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/10 mb-3">
                Status
              </p>
              <div className="flex items-center gap-3">
                <Zap size={16} className="text-[#ef4444]/60" />
                <RoughNotation
                  type="underline"
                  show={showRough}
                  color="#ef4444"
                  strokeWidth={2}
                  padding={2}
                >
                  <span className="text-sm font-mono text-white uppercase tracking-wider">
                    {poll?.expiresAt && new Date(poll.expiresAt) < new Date()
                      ? "EXPIRED"
                      : poll?.isActive
                        ? "ACTIVE"
                        : "CLOSED"}
                  </span>
                </RoughNotation>
              </div>
            </div>
            <div className="relative">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/10 mb-3">
                Age
              </p>
              <div className="flex items-center gap-3">
                <Activity size={16} className="text-emerald-500/60" />
                <span className="text-sm font-mono text-white uppercase tracking-wider">
                  {pollAge}d live
                </span>
              </div>
            </div>
            {/* New metrics from time-series endpoint */}
            {metrics && (
              <>
                <div className="relative">
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/10 mb-3">
                    Completion
                  </p>
                  <div className="flex items-center gap-3">
                    <Percent size={16} className="text-blue-400/60" />
                    <span className="text-sm font-mono text-white uppercase tracking-wider">
                      {metrics.completionRate}%
                    </span>
                  </div>
                </div>
                <div className="relative">
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/10 mb-3">
                    Avg Response
                  </p>
                  <div className="flex items-center gap-3">
                    <Clock size={16} className="text-amber-400/60" />
                    <span className="text-sm font-mono text-white uppercase tracking-wider">
                      {metrics.avgResponseMinutes < 60
                        ? `${metrics.avgResponseMinutes}m`
                        : `${Math.round(metrics.avgResponseMinutes / 60)}h`}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Section: Visual Data */}
        <div className="flex flex-col justify-between border-l border-white/5 pl-16 py-2">
          <div className="space-y-10">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/10 mb-2">
                  Results
                </p>
                <h3 className="text-xl font-mono text-white tracking-widest">
                  {poll?.settings?.isPublished ? "PUBLISHED" : "PRIVATE"}
                </h3>
              </div>
              <div
                className={`p-2.5 rounded-lg border ${poll?.settings?.isPublished ? "bg-emerald-500/5 border-emerald-500/20" : "bg-white/5 border-white/5"}`}
              >
                <Activity
                  className={
                    poll?.settings?.isPublished ? "text-emerald-500" : "text-white/10"
                  }
                  size={16}
                />
              </div>
            </div>

            <div className="h-24 flex items-center justify-center bg-white/[0.01] rounded-3xl border border-white/5 relative overflow-hidden group/wave">
              <div className="absolute inset-0 flex items-center justify-center gap-1.5 opacity-20">
                {[...Array(16)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: [8, 32, 8] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.08 }}
                    className="w-0.5 bg-[#ef4444] rounded-full"
                  />
                ))}
              </div>
              <p className="relative z-10 text-[8px] font-black uppercase tracking-[0.5em] text-white/30 group-hover/wave:text-[#ef4444] transition-colors">
                Live_Stream
              </p>
            </div>
          </div>

          <button
            onClick={async () => {
              setPublishing(true);
              try {
                const { data } = await publishPoll(id);
                setPoll(data.poll);
              } catch (err) {
                alert("Failed to publish");
              } finally {
                setPublishing(false);
              }
            }}
            disabled={poll?.settings?.isPublished || publishing}
            className={`w-full py-4 rounded-2xl text-[9px] font-black tracking-[0.4em] transition-all duration-500 ${
              poll?.settings?.isPublished
                ? "bg-emerald-500/5 text-emerald-500/40 border border-emerald-500/10 cursor-not-allowed"
                : "bg-[#ef4444] text-white hover:bg-[#ff4444] shadow-xl active:scale-[0.98]"
            }`}
          >
            {publishing
              ? "PUBLISHING..."
              : poll?.settings?.isPublished
                ? "RESULTS PUBLISHED"
                : "PUBLISH RESULTS"}
          </button>
        </div>
      </div>

      {/* Delicate Sketch Corners */}
      <div className="absolute top-6 left-6 size-4 border-t border-l border-white/10" />
      <div className="absolute top-6 right-6 size-4 border-t border-r border-white/10" />
      <div className="absolute bottom-6 left-6 size-4 border-b border-l border-white/10" />
      <div className="absolute bottom-6 right-6 size-4 border-b border-r border-white/10" />
    </div>
  );
}
