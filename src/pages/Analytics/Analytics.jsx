import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Activity, Zap, TrendingUp, Users, Target, BarChart2 } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartContainer } from "../../components/analytics/ChartContainer.jsx";
import { AnalyticsCard } from "../../components/dashboard/AnalyticsCard.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import { motion, AnimatePresence } from "framer-motion";
import { RoughNotation } from "react-rough-notation";
import { getPollAnalytics, publishPoll } from "../../services/api.js";
import { socket } from "../../socket/index.js";
import { Loader2 } from "lucide-react";
import SocketStatus from "../../components/analytics/SocketStatus.jsx";
import { AnalyticsSkeleton } from "../../components/ui/Skeleton.jsx";

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

export default function Analytics() {
  const { id } = useParams();
  const [poll, setPoll] = useState(null);
  const [recentVotes, setRecentVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRough, setShowRough] = useState(false);
  const [liveActivity, setLiveActivity] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => setShowRough(true), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await getPollAnalytics(id);
        setPoll(data.poll);
        setRecentVotes(data.recentVotes || []);
        
        // Socket setup
        if (!socket.connected) socket.connect();
        socket.emit("joinPollRoom", id);

        socket.on("pollUpdated", (updatedPoll) => {
          setPoll(updatedPoll);
        });

        socket.on("new_participation", (activity) => {
          setLiveActivity(prev => [activity, ...prev].slice(0, 5));
        });

      } catch (err) {
        console.error("Error fetching analytics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      socket.emit("leavePollRoom", id);
      socket.off("pollUpdated");
      socket.off("new_participation");
    };
  }, [id]);

  if (loading) return <AnalyticsSkeleton />;
  if (!poll) return <div className="min-h-screen bg-[#020202] flex items-center justify-center text-white/40 font-display text-2xl">Sanctum Offline. Poll not found.</div>;

  return (
    <section className="py-8 relative">
      <div className="mb-12 border-b border-white/5 pb-10 flex flex-wrap items-end justify-between gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/30 font-bold mb-3">Live Intelligence</p>
          <h1 className="font-display text-5xl font-normal tracking-tight text-white md:text-7xl">
            RESPONSE <span className="text-white/40 italic"><Highlight>Sanctum</Highlight></span>
          </h1>
          <div className="mt-4 relative inline-block">
             <span className="font-handwriting text-2xl text-[#ef4444] rotate-[-1deg] block">
               Analyzing the campaign: {poll.title}
             </span>
          </div>
        </motion.div>
        
        <div className="flex items-center gap-4 p-4 rounded-3xl bg-white/[0.03] border border-white/5 backdrop-blur-xl">
           <Activity className="text-[#ef4444] animate-pulse" size={20} />
           <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Neural Link Active</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <AnalyticsCard label="Total Participants" value={poll.totalParticipants || 0} trend="+12%" icon={Users} showRough={showRough} />
        <AnalyticsCard label="Questions Deployed" value={poll.questions.length} trend="Stable" icon={Target} showRough={showRough} />
        <AnalyticsCard label="Mission Status" value={new Date(poll.expiresAt) > new Date() ? "ACTIVE" : "EXPIRED"} trend="Live" icon={Zap} showRough={showRough} />
        
        <div className="relative group overflow-hidden rounded-[32px] border border-[#ef4444]/30 bg-[#ef4444]/5 p-6 flex flex-col justify-between">
           <div className="flex justify-between items-start">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Broadcasting</p>
              <Activity className={`${poll.settings?.isPublished ? "text-emerald-500" : "text-white/20"}`} size={16} />
           </div>
           <div>
              <p className="text-2xl font-display text-white mb-4">{poll.settings?.isPublished ? "PUBLISHED" : "OFFLINE"}</p>
              <button 
                onClick={async () => {
                  try {
                    await publishPoll(id);
                    window.location.reload();
                  } catch (err) { alert("Failed to publish"); }
                }}
                disabled={poll.settings?.isPublished}
                className={`w-full py-2.5 rounded-xl text-[10px] font-bold tracking-[0.2em] transition-all ${
                  poll.settings?.isPublished 
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-not-allowed" 
                  : "bg-[#ef4444] text-white hover:bg-[#ff5555] active:scale-95"
                }`}
              >
                {poll.settings?.isPublished ? "VICTORY SHARED" : "PUBLISH RESULTS"}
              </button>
           </div>
        </div>
      </div>

      <div className="mt-16 space-y-12">
        <h2 className="font-display text-3xl text-white border-l-4 border-[#ef4444] pl-6">Question-wise Intel</h2>
        
        <div className="grid gap-10">
          {poll.questions.map((q, idx) => (
            <ChartContainer 
              key={q._id} 
              title={`Q${idx + 1}: ${q.text}`} 
              description={`${q.totalVotes || 0} total responses received for this sector.`}
            >
              <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-10">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={q.options}>
                    <CartesianGrid stroke="rgba(255,255,255,0.03)" vertical={false} />
                    <XAxis dataKey="text" stroke="rgba(255,255,255,0.1)" tickLine={false} axisLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                    <YAxis stroke="rgba(255,255,255,0.1)" tickLine={false} axisLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                    <Tooltip 
                      contentStyle={{ background: "#050505", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: 12 }}
                      cursor={{fill: 'rgba(255,255,255,0.03)'}}
                    />
                    <Bar dataKey="voteCount" fill="#ef4444" radius={[12, 12, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>

                <div className="space-y-6">
                  {q.options.map((opt, oIdx) => {
                    const percentage = q.totalVotes > 0 ? Math.round((opt.voteCount / q.totalVotes) * 100) : 0;
                    return (
                      <div key={opt._id} className="group relative">
                        <div className="mb-2 flex justify-between items-end">
                          <span className="text-xs font-bold text-white/40 group-hover:text-white transition-colors uppercase tracking-wider">{opt.text}</span>
                          <span className="font-handwriting text-[#ef4444] text-xl">{percentage}%</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                          <motion.div 
                            className="h-full rounded-full bg-[#ef4444]" 
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 1, delay: oIdx * 0.1 }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </ChartContainer>
          ))}
        </div>
      </div>

      <div className="mt-16 grid gap-10 lg:grid-cols-[1fr_0.6fr]">
        <ChartContainer title="Live Participation Stream" description="Incoming data packets from the field">
          <div className="grid gap-4 mt-4">
            <AnimatePresence>
              {liveActivity.length > 0 ? liveActivity.map((activity, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="group flex items-center gap-4 rounded-[20px] border border-white/5 bg-white/[0.01] p-5 transition-all hover:bg-white/[0.03] hover:border-white/10"
                >
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-sm text-white/40 group-hover:text-white/70 transition-colors font-medium">
                    New submission detected from {activity.location || "Sector-7"}
                  </span>
                  <span className="ml-auto text-[10px] text-white/10 font-bold">RECENT</span>
                </motion.div>
              )) : (
                <p className="text-white/20 italic font-handwriting text-xl text-center py-10">Monitoring the frequency for incoming data...</p>
              )}
            </AnimatePresence>
          </div>
        </ChartContainer>

        <div className="space-y-6">
           <ChartContainer title="Status Report">
              <div className="space-y-4">
                 <div className="flex justify-between items-center p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                    <span className="text-[10px] uppercase font-bold text-white/40 tracking-widest">Encryption</span>
                    <span className="text-[10px] font-bold text-emerald-400">ACTIVE</span>
                 </div>
                 <div className="flex justify-between items-center p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                    <span className="text-[10px] uppercase font-bold text-white/40 tracking-widest">Sync Rate</span>
                    <span className="text-[10px] font-bold text-[#ef4444]">0.2ms</span>
                 </div>
                 <div className="flex justify-between items-center p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                    <span className="text-[10px] uppercase font-bold text-white/40 tracking-widest">Protocol</span>
                    <span className="text-[10px] font-bold text-white">CHAI-v2</span>
                 </div>
              </div>
           </ChartContainer>
           
           <div className="px-6 relative">
              <span className="font-handwriting text-[#ef4444] text-xl opacity-30 transform -rotate-12 block">The victory depends on the data.</span>
           </div>
        </div>
      </div>
      <SocketStatus />
    </section>
  );
}
