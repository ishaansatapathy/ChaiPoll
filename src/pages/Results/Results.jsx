import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { RoughNotation } from "react-rough-notation";
import { Navbar } from "../../components/layout/Navbar.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { getPollByCode } from "../../services/api.js";
import { socket } from "../../socket/index.js";
import { Loader2, Share2, BarChart3, Trophy, Globe, Lock, LayoutGrid, Network } from "lucide-react";
import TacticalFlow from "../../components/analytics/TacticalFlow.jsx";
import SocketStatus from "../../components/analytics/SocketStatus.jsx";

function Highlight({ children }) {
  return (
    <span className="relative inline-block rounded-[2px] border border-white/14 bg-white/[0.015] px-[0.055em] pb-[0.01em]">
      {["-left-1 -top-1", "-right-1 -top-1", "-bottom-1 -left-1", "-bottom-1 -right-1"].map((pos) => (
        <span key={pos} className={`absolute ${pos} h-1 w-1 rounded-[1px] border border-white/25 bg-black`} />
      ))}
      {children}
    </span>
  );
}

export default function Results() {
  const { id } = useParams();
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showRough, setShowRough] = useState(false);
  const [viewMode, setViewMode] = useState("traditional"); // 'traditional' or 'tactical'

  useEffect(() => {
    let isMounted = true;
    
    const fetchPoll = async () => {
      try {
        const { data } = await getPollByCode(id);
        if (isMounted) {
          setPoll(data);
          
          if (!socket.connected) socket.connect();
          socket.emit("joinPollRoom", id);
          
          socket.on("pollUpdated", (updatedPoll) => {
            setPoll(updatedPoll);
          });
        }
      } catch (err) {
        if (isMounted) setError(err.response?.data?.message || "Poll not found");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchPoll();
    const timer = setTimeout(() => setShowRough(true), 1200);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      socket.emit("leavePollRoom", id);
      socket.off("pollUpdated");
    };
  }, [id]);

  if (loading) return <div className="min-h-screen bg-[#020202] flex items-center justify-center text-white/50"><Loader2 className="animate-spin text-[#ef4444]" /></div>;
  
  if (error && !poll) {
    return (
      <div className="min-h-screen bg-[#020202] flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-display text-white mb-2">Results Offline</h1>
        <p className="text-white/40 max-w-md">{error}</p>
        <Button to="/" className="mt-8">Return to Base</Button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#020202] relative overflow-hidden">
      <Navbar />

      <div className="fixed inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_50%_-20%,rgba(239,68,68,0.15),transparent_70%)]" />
      
      <section className="max-w-5xl mx-auto px-6 py-32 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="flex flex-wrap items-center justify-between gap-6 mb-12">
            <div className="flex items-center gap-4">
              <Badge className="bg-emerald-500/10 border-emerald-500/20 text-emerald-500 flex items-center gap-2">
                <Trophy size={14} /> {poll.settings?.isPublished ? "FINAL OUTCOME" : "LIVE FEED"}
              </Badge>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/40">
                 <Users size={12} /> {poll.totalParticipants || 0} Participants
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-1 rounded-2xl bg-white/[0.03] border border-white/5">
               <button 
                onClick={() => setViewMode("traditional")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold tracking-widest transition-all ${viewMode === 'traditional' ? "bg-white text-black" : "text-white/40 hover:text-white"}`}
               >
                 <LayoutGrid size={14} /> TRADITIONAL
               </button>
               <button 
                onClick={() => setViewMode("tactical")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold tracking-widest transition-all ${viewMode === 'tactical' ? "bg-[#ef4444] text-white" : "text-white/40 hover:text-white"}`}
               >
                 <Network size={14} /> TACTICAL MAP
               </button>
            </div>
          </div>

          <h1 className="font-display text-5xl font-normal tracking-tight text-white leading-tight mb-4">
            Campaign <span className="text-white/40 italic"><Highlight>Results</Highlight></span>
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
                const sortedOptions = [...q.options].sort((a, b) => b.voteCount - a.voteCount);
                const totalVotes = q.totalVotes || 0;

                return (
                  <div key={q._id} className="relative">
                    <div className="mb-8 border-l-2 border-[#ef4444] pl-6">
                       <p className="text-[10px] font-bold text-[#ef4444] uppercase tracking-[0.3em] mb-2">Question 0{qIdx + 1}</p>
                       <h2 className="text-3xl text-white font-display leading-tight">{q.text}</h2>
                    </div>

                    <Card className="p-10 border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[40px]">
                      <div className="space-y-10">
                        {sortedOptions.map((opt, index) => {
                          const percentage = totalVotes > 0 ? Math.round((opt.voteCount / totalVotes) * 100) : 0;
                          const isWinner = index === 0 && opt.voteCount > 0;

                          return (
                            <div key={opt._id} className="relative group">
                               <div className="mb-4 flex justify-between items-end">
                                  <div className="flex items-center gap-3">
                                     <span className={`text-lg font-bold transition-colors ${isWinner ? "text-white" : "text-white/40"}`}>
                                        {opt.text}
                                     </span>
                                     {isWinner && <Trophy size={16} className="text-amber-400" />}
                                  </div>
                                  <div className="text-right">
                                     <span className={`font-handwriting text-3xl block ${isWinner ? "text-[#ef4444]" : "text-white/20"}`}>
                                        {percentage}%
                                     </span>
                                     <span className="text-[9px] font-bold text-white/10 uppercase tracking-widest">{opt.voteCount} Votes</span>
                                  </div>
                               </div>
                               <div className="h-2.5 overflow-hidden rounded-full bg-white/5 relative">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    whileInView={{ width: `${percentage}%` }}
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
              key="tactical"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <TacticalFlow poll={poll} />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-32 pt-12 border-t border-white/5 text-center">
           <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/[0.02] border border-white/5">
              <Shield size={16} className="text-[#ef4444]" />
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Verified by ChaiCode Intelligence</span>
           </div>
           <div className="mt-8">
              <span className="font-handwriting text-white/10 text-2xl rotate-1 block">The victory depends on the data.</span>
           </div>
        </div>
      </section>
      <SocketStatus />
    </main>
  );
}
