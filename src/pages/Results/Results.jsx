import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "../../components/layout/Navbar";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Highlight } from "../../components/ui/Highlight";
import { getPollByCode, getPollAnalytics } from "../../services/api";
import { socket } from "../../socket/index.js";
import { Loader2, Trophy, Users, Shield, LayoutGrid, Network } from "lucide-react";
import ResponseFlow from "../../components/analytics/ResponseFlow";

export default function Results() {
  const { id } = useParams();
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [votes, setVotes] = useState([]);
  const [viewMode, setViewMode] = useState("traditional");

  useEffect(() => {
    let isMounted = true;
    const fetchPoll = async () => {
      try {
        const { data } = await getPollByCode(id);
        if (isMounted) {
          setPoll(data);
          try {
            const ar = await getPollAnalytics(id);
            setVotes(ar.data.recentVotes || []);
          } catch {
            /* analytics optional */
          }
          if (!socket.connected) socket.connect();
          socket.emit("joinPollRoom", id);
          socket.on("pollUpdated", (u) => setPoll(u));
        }
      } catch (err) {
        if (isMounted) setError(err.response?.data?.message || "Poll not found");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchPoll();
    return () => {
      isMounted = false;
      socket.emit("leavePollRoom", id);
      socket.off("pollUpdated");
    };
  }, [id]);

  if (loading)
    return (
      <div className="min-h-screen bg-[#020202] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#ef4444]" />
      </div>
    );
  if (error && !poll)
    return (
      <div className="min-h-screen bg-[#020202] flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-display text-white mb-2">Results Unavailable</h1>
        <p className="text-white/40 max-w-md">{error}</p>
        <Button to="/" className="mt-8">
          Go Home
        </Button>
      </div>
    );

  return (
    <main className="min-h-screen bg-[#020202] relative overflow-hidden">
      <Navbar />
      <div className="fixed inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_50%_-20%,rgba(239,68,68,0.15),transparent_70%)]" />
      <section className="max-w-5xl mx-auto px-6 py-32 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-wrap items-center justify-between gap-6 mb-12">
            <div className="flex items-center gap-4">
              <Badge className="bg-emerald-500/10 border-emerald-500/20 text-emerald-500 flex items-center gap-2">
                <Trophy size={14} /> {poll.settings?.isPublished ? "FINAL RESULTS" : "LIVE RESULTS"}
              </Badge>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/40">
                <Users size={12} /> {poll.totalParticipants || 0} Participants
              </div>
            </div>
            <div className="flex items-center gap-3 p-1 rounded-2xl bg-white/[0.03] border border-white/5">
              <button
                onClick={() => setViewMode("traditional")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold tracking-widest transition-all ${viewMode === "traditional" ? "bg-white text-black" : "text-white/40 hover:text-white"}`}
              >
                <LayoutGrid size={14} /> CHART VIEW
              </button>
              <button
                onClick={() => setViewMode("tactical")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold tracking-widest transition-all ${viewMode === "tactical" ? "bg-[#ef4444] text-white" : "text-white/40 hover:text-white"}`}
              >
                <Network size={14} /> FLOW VIEW
              </button>
            </div>
          </div>
          <h1 className="font-display text-5xl font-normal tracking-tight text-white leading-tight mb-4">
            Poll{" "}
            <span className="text-white/40 italic">
              <Highlight>Results</Highlight>
            </span>
          </h1>
          <p className="text-xl text-white/60 font-medium mb-16">{poll.title}</p>
        </motion.div>
        <AnimatePresence mode="wait">
          {viewMode === "traditional" ? (
            <motion.div
              key="traditional"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-20"
            >
              {poll.questions.map((q, qIdx) => {
                const sorted = [...q.options].sort((a, b) => b.voteCount - a.voteCount);
                const total = q.totalVotes || 0;
                return (
                  <div key={q._id} className="relative">
                    <div className="mb-8 border-l-2 border-[#ef4444] pl-6">
                      <p className="text-[10px] font-bold text-[#ef4444] uppercase tracking-[0.3em] mb-2">
                        Question {qIdx + 1}
                      </p>
                      <h2 className="text-3xl text-white font-display leading-tight">{q.text}</h2>
                    </div>
                    <Card className="p-10 border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[40px]">
                      <div className="space-y-10">
                        {sorted.map((opt, i) => {
                          const pct = total > 0 ? Math.round((opt.voteCount / total) * 100) : 0;
                          const isWinner = i === 0 && opt.voteCount > 0;
                          return (
                            <div key={opt._id} className="relative group">
                              <div className="mb-4 flex justify-between items-end">
                                <div className="flex items-center gap-3">
                                  <span
                                    className={`text-lg font-bold transition-colors ${isWinner ? "text-white" : "text-white/40"}`}
                                  >
                                    {opt.text}
                                  </span>
                                  {isWinner && <Trophy size={16} className="text-amber-400" />}
                                </div>
                                <div className="text-right">
                                  <span
                                    className={`font-handwriting text-3xl block ${isWinner ? "text-[#ef4444]" : "text-white/20"}`}
                                  >
                                    {pct}%
                                  </span>
                                  <span className="text-[9px] font-bold text-white/10 uppercase tracking-widest">
                                    {opt.voteCount} Votes
                                  </span>
                                </div>
                              </div>
                              <div className="h-2.5 overflow-hidden rounded-full bg-white/5 relative">
                                <motion.div
                                  initial={{ width: 0 }}
                                  whileInView={{ width: `${pct}%` }}
                                  transition={{ duration: 1.5, ease: "circOut" }}
                                  className={`h-full rounded-full ${isWinner ? "bg-gradient-to-r from-[#ef4444] to-[#ff6b6b] shadow-[0_0_20px_rgba(239,68,68,0.3)]" : "bg-white/10"}`}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </Card>
                  </div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key="flow"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <ResponseFlow poll={poll} votes={votes} />
            </motion.div>
          )}
        </AnimatePresence>
        <div className="mt-32 pt-12 border-t border-white/5 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/[0.02] border border-white/5">
            <Shield size={16} className="text-[#ef4444]" />
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
              Verified by ChaiPoll
            </span>
          </div>
          <div className="mt-8">
            <span className="font-handwriting text-white/10 text-2xl rotate-1 block">
              Data-driven decisions start here.
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}
