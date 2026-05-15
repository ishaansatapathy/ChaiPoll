import { useEffect, useState, useCallback } from "react";
import { Plus, BarChart2, Users, Activity, Mail, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { RoughNotation } from "react-rough-notation";
import { Highlight } from "../../components/ui/Highlight";
import { PollCard } from "../../components/poll/PollCard";
import { Button } from "../../components/ui/Button";
import { Skeleton, CardSkeleton } from "../../components/ui/Skeleton";
import { getMyPolls } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import Onboarding from "../../components/auth/Onboarding";

export default function Dashboard() {
  const { user } = useAuth();
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRough, setShowRough] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const { data } = await getMyPolls();
        // Support both old array format and new paginated object format
        setPolls(Array.isArray(data) ? data : data.data || []);
      } catch (error) {
        console.error("Error fetching polls", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPolls();

    const timer = setTimeout(() => setShowRough(true), 800);
    return () => clearTimeout(timer);
  }, [user]);

  const handleDeleteSuccess = useCallback((pollCode) => {
    setPolls((prev) => prev.filter((p) => p.pollCode !== pollCode));
  }, []);

  const handleResend = async () => {
    if (resending) return;
    setResending(true);
    try {
      await API.post("/auth/resend-verification");
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (err) {
      console.error("Resend failed", err);
    } finally {
      setResending(false);
    }
  };

  const totalVotes = polls.reduce((acc, poll) => acc + (poll.totalParticipants || 0), 0);
  const activePolls = polls.filter((p) => p.isActive).length;

  const analyticsSummary = [
    { label: "Total Polls", value: polls.length.toString(), icon: BarChart2, trend: "All time" },
    { label: "Total Votes", value: totalVotes.toLocaleString(), icon: Users, trend: "Growing" },
    { label: "Active Polls", value: activePolls.toString(), icon: Activity, trend: "Live" },
  ];

  return (
    <section className="py-8 relative">
      <Onboarding />
      
      {/* Decorative background */}
      <div className="absolute -top-10 -right-10 opacity-10 pointer-events-none scale-150">
        <svg width="400" height="400" viewBox="0 0 400 400">
          <path d="M50,150 Q150,50 250,150 T350,250" fill="none" stroke="white" strokeWidth="1" />
        </svg>
      </div>

      <div className="mb-12 flex flex-wrap items-end justify-between gap-6 border-b border-white/5 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="h-[1px] w-8 bg-[#ef4444]" />
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/30 font-bold">
              Overview
            </p>
          </div>
          <h1 className="font-display text-5xl font-normal tracking-[-0.05em] text-white md:text-7xl">
            <Highlight>Your</Highlight> Polls <br />
            <span className="text-white/40 italic">Dashboard</span>
          </h1>
          <div className="mt-4 flex gap-4">
            <span className="font-handwriting text-xl text-[#ef4444] -rotate-3 block">
              Your polling journey starts here.
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative group"
        >
          <div className="absolute -top-12 -left-8 pointer-events-none">
            <svg width="60" height="60" viewBox="0 0 100 100" className="text-[#ef4444] rotate-12">
              <path d="M20,80 Q40,20 80,40" fill="none" stroke="currentColor" strokeWidth="3" />
              <path d="M70,30 L80,40 L70,50" fill="none" stroke="currentColor" strokeWidth="3" />
            </svg>
            <span className="font-handwriting text-sm text-[#ef4444] absolute top-[-10px] left-[-40px] w-24 leading-tight">
              Click to create!
            </span>
          </div>
          <Button
            to="/create"
            className="h-16 px-8 rounded-2xl bg-white text-black hover:bg-[#ef4444] hover:text-white transition-all duration-500 shadow-[0_0_30px_rgba(255,255,255,0.1)] group-hover:shadow-[0_0_30px_rgba(239,68,68,0.3)]"
          >
            <span className="flex items-center gap-3 text-lg font-bold">
              <Plus size={20} strokeWidth={3} /> NEW POLL
            </span>
          </Button>
        </motion.div>
      </div>

      <div className="flex flex-wrap items-center gap-16 py-10 border-b border-white/5 mb-16">
        {analyticsSummary.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.15, duration: 0.8 }}
            className="relative"
          >
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/15 mb-3">
              {item.label}
            </p>
            <div className="flex items-baseline gap-4">
              <RoughNotation
                type="underline"
                show={showRough}
                color="#ef4444"
                strokeWidth={2}
                padding={4}
                iterations={2}
              >
                <span className="font-display text-5xl text-white tracking-tighter leading-none">
                  {item.value}
                </span>
              </RoughNotation>
              <span className="font-handwriting text-lg text-[#ef4444]/50 rotate-[-5deg]">
                {item.trend}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-16 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-3xl text-white tracking-tight">
              <RoughNotation
                type="underline"
                show={showRough}
                color="#ef4444"
                strokeWidth={3}
                iterations={2}
                padding={5}
              >
                Your Polls
              </RoughNotation>
            </h2>
            <div className="h-[1px] flex-1 mx-6 bg-white/5" />
          </div>

          {loading ? (
            <div className="grid gap-6">
              {[1, 2, 3, 4].map((i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : polls.length === 0 ? (
            <div className="border border-dashed border-white/10 rounded-3xl p-16 text-center bg-white/[0.01]">
              <div className="mb-4 inline-flex size-16 items-center justify-center rounded-full bg-white/5">
                <BarChart2 className="text-white/20" size={32} />
              </div>
              <h3 className="text-xl text-white mb-2 font-display uppercase tracking-wider">
                No polls yet
              </h3>
              <p className="text-white/40 mb-8 max-w-sm mx-auto">
                Create your first poll to see realtime analytics here.
              </p>
              <Link
                to="/create"
                className="font-handwriting text-[#ef4444] text-2xl hover:underline"
              >
                Create your first poll &rarr;
              </Link>
            </div>
          ) : (
            <div className="grid gap-6">
              {polls.map((poll) => (
                <PollCard key={poll._id} poll={poll} onDeleteSuccess={handleDeleteSuccess} />
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="relative"
        >
          <div className="sticky top-8">
            <div className="surface rounded-3xl p-8 border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent backdrop-blur-3xl overflow-hidden relative">
              <div className="absolute -top-10 -right-10 size-40 bg-[#ef4444]/10 blur-[80px]" />

              <div className="flex items-start justify-between mb-10">
                <div>
                  <h2 className="font-display text-3xl text-white leading-tight">
                    Engagement <br />
                    <span className="text-[#ef4444]">Overview</span>
                  </h2>
                  <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold mt-2">
                    Realtime data
                  </p>
                </div>
                <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                  <Activity className="text-[#ef4444] animate-pulse" size={24} />
                </div>
              </div>

              <div className="space-y-8">
                {polls.length > 0 ? (
                  polls.slice(0, 5).map((poll, idx) => {
                    const maxVotes = Math.max(…polls.map((p) => p.totalParticipants || 0), 1);
                    const percentage =
                      Math.round(((poll.totalParticipants || 0) / maxVotes) * 100) || 0;
                    return (
                      <div key={poll._id} className="relative group">
                        <div className="mb-3 flex justify-between items-end">
                          <span className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">
                            {poll.title}
                          </span>
                          <span className="font-handwriting text-[#ef4444] text-2xl tracking-wider">
                            {poll.totalParticipants || 0}
                          </span>
                        </div>
                        <div className="h-[6px] overflow-hidden rounded-full bg-white/5">
                          <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-[#ef4444] to-[#ff6b6b]"
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 1.5, delay: 0.8 + idx * 0.1, ease: "circOut" }}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-10 text-center flex flex-col items-center gap-4">
                    <p className="text-white/10 font-display text-lg uppercase tracking-widest italic">
                      Waiting for data…
                    </p>
                    <span className="font-handwriting text-[#ef4444] text-xl rotate-[-5deg]">
                      Ready for liftoff!
                    </span>
                  </div>
                )}
              </div>

              <div className="absolute bottom-4 right-8 pointer-events-none">
                <span className="font-handwriting text-[#ef4444] text-xl opacity-40">
                  Live sync
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
