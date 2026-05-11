import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Activity, Zap, TrendingUp, Users, Target, BarChart2, ChevronLeft, ChevronRight, LayoutDashboard, Search, Plus } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartContainer } from "../../components/analytics/ChartContainer.jsx";
import { AnalyticsCard } from "../../components/dashboard/AnalyticsCard.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import { motion, AnimatePresence } from "framer-motion";
import { RoughNotation } from "react-rough-notation";
import { getPollAnalytics, publishPoll, getMyPolls } from "../../services/api.js";
import { socket } from "../../socket/index.js";
import SocketStatus from "../../components/analytics/SocketStatus.jsx";
import { AnalyticsSkeleton } from "../../components/ui/Skeleton.jsx";
import ParticipantList from "../../components/analytics/ParticipantList.jsx";

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
  const navigate = useNavigate();
  const [poll, setPoll] = useState(null);
  const [allPolls, setAllPolls] = useState([]);
  const [recentVotes, setRecentVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pollListLoading, setPollListLoading] = useState(true);
  const [showRough, setShowRough] = useState(false);
  const [activeTab, setActiveTab] = useState('charts'); // 'charts' or 'participants'

  useEffect(() => {
    const timer = setTimeout(() => setShowRough(true), 800);
    return () => clearTimeout(timer);
  }, []);

  // Fetch list of all polls for the sidebar
  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const { data } = await getMyPolls();
        setAllPolls(data);
      } catch (err) {
        console.error("Failed to fetch poll list", err);
      } finally {
        setPollListLoading(false);
      }
    };
    fetchPolls();
  }, []);

  // Fetch detailed data for the selected poll
  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data } = await getPollAnalytics(id);
        setPoll(data.poll);
        setRecentVotes(data.recentVotes || []);
        
        if (!socket.connected) socket.connect();
        socket.emit("joinPollRoom", id);

        socket.on("pollUpdated", (updatedPoll) => {
          setPoll(updatedPoll);
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
    };
  }, [id]);

  if (loading && !poll) return <AnalyticsSkeleton />;

  return (
    <section className="py-8 relative min-h-screen">
      <div className="grid lg:grid-cols-[280px_1fr] gap-8">
        
        {/* Sidebar: Mission Navigator */}
        <aside className="space-y-8">
           <div className="surface rounded-3xl border border-white/5 bg-[#050505]/50 backdrop-blur-3xl p-6 sticky top-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-8 px-2 border-b border-white/5 pb-4">
                 <div className="p-2 rounded-lg bg-[#ef4444]/10 border border-[#ef4444]/20">
                    <LayoutDashboard className="text-[#ef4444]" size={16} />
                 </div>
                 <h3 className="text-[10px] uppercase tracking-[0.4em] text-white/60 font-black">Mission Control</h3>
              </div>

              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                 {pollListLoading ? (
                    [1,2,3].map(i => <div key={i} className="h-16 w-full bg-white/5 rounded-2xl animate-pulse" />)
                 ) : allPolls.map((p) => (
                    <Link 
                       key={p._id}
                       to={`/analytics/${p.pollCode}`}
                       className={`group block p-5 rounded-2xl border transition-all duration-500 relative overflow-hidden ${
                          id === p.pollCode 
                          ? "bg-[#ef4444]/10 border-[#ef4444]/40 shadow-[0_0_30px_rgba(239,68,68,0.15)]" 
                          : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10"
                       }`}
                    >
                       {id === p.pollCode && (
                          <motion.div layoutId="activeMission" className="absolute left-0 top-0 bottom-0 w-1 bg-[#ef4444]" />
                       )}
                       <p className={`text-[9px] font-black uppercase tracking-[0.2em] mb-2 ${id === p.pollCode ? "text-[#ef4444]" : "text-white/20"}`}>
                          SECTOR {p.pollCode}
                       </p>
                       <h4 className={`text-sm font-display tracking-tight truncate ${id === p.pollCode ? "text-white" : "text-white/40 group-hover:text-white/80"}`}>
                          {p.title}
                       </h4>
                    </Link>
                 ))}
              </div>

              <Link to="/create" className="mt-8 flex items-center justify-center gap-3 w-full py-5 rounded-2xl bg-[#ef4444]/5 border border-dashed border-[#ef4444]/20 text-[10px] font-black tracking-[0.3em] text-[#ef4444] hover:text-white hover:bg-[#ef4444] transition-all uppercase">
                 <Plus size={14} strokeWidth={3} /> NEW CAMPAIGN
              </Link>
           </div>
        </aside>

        {/* Main Content: Intel Sanctum */}
        <div className="space-y-12">
          {!id ? (
             <div className="h-full flex flex-col items-center justify-center text-center py-32 border border-dashed border-white/5 rounded-[40px] bg-white/[0.01]">
                <div className="mb-8 p-8 rounded-full bg-[#ef4444]/5 border border-[#ef4444]/10 relative">
                   <div className="absolute inset-0 bg-[#ef4444]/10 blur-3xl rounded-full" />
                   <Target className="text-[#ef4444]/40 relative z-10 animate-pulse" size={80} />
                </div>
                <h2 className="font-display text-5xl text-white mb-4 tracking-tighter">Select a Mission</h2>
                <p className="text-white/30 max-w-sm mx-auto font-handwriting text-2xl italic leading-relaxed">
                   "The tactical archives await your command, Captain. Choose a sector to begin."
                </p>
             </div>
          ) : (
            <>
              <div className="border-b border-white/5 pb-10 flex flex-wrap items-end justify-between gap-8">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                  <div className="flex items-center gap-3 mb-4">
                     <span className="h-[1px] w-8 bg-[#ef4444]" />
                     <p className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-black">Live Signal / {poll?.pollCode}</p>
                  </div>
                  <h1 className="font-display text-6xl font-normal tracking-tighter text-white md:text-8xl">
                    RESPONSE <span className="text-white/20 italic">HUB</span>
                  </h1>
                  <div className="mt-6 flex items-center gap-4">
                     <span className="px-3 py-1 rounded-md bg-[#ef4444]/10 border border-[#ef4444]/20 text-[10px] font-black text-[#ef4444] uppercase tracking-widest">Active Sector</span>
                     <span className="font-handwriting text-3xl text-white/40 rotate-[-1deg]">
                       {poll?.title}
                     </span>
                  </div>
                </motion.div>
                
                <div className="flex p-1.5 rounded-[22px] bg-[#050505] border border-white/10 backdrop-blur-2xl shadow-2xl">
                   <button 
                      onClick={() => setActiveTab('charts')}
                      className={`px-8 py-3 rounded-[18px] text-[10px] font-black tracking-[0.2em] uppercase transition-all duration-500 flex items-center gap-2 ${activeTab === 'charts' ? "bg-[#ef4444] text-white shadow-[0_0_20px_rgba(239,68,68,0.3)]" : "text-white/30 hover:text-white/60"}`}
                   >
                      <BarChart2 size={14} /> Analytics
                   </button>
                   <button 
                      onClick={() => setActiveTab('participants')}
                      className={`px-8 py-3 rounded-[18px] text-[10px] font-black tracking-[0.2em] uppercase transition-all duration-500 flex items-center gap-2 ${activeTab === 'participants' ? "bg-[#ef4444] text-white shadow-[0_0_20px_rgba(239,68,68,0.3)]" : "text-white/30 hover:text-white/60"}`}
                   >
                      <Users size={14} /> Participants
                   </button>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                <AnalyticsCard label="Total Participants" value={poll?.totalParticipants || 0} trend="+12%" icon={Users} showRough={showRough} />
                <AnalyticsCard label="Sector Sync" value="REALTIME" trend="Active" icon={Activity} showRough={showRough} />
                <AnalyticsCard label="Mission Status" value={new Date(poll?.expiresAt) > new Date() ? "ACTIVE" : "EXPIRED"} trend="Live" icon={Zap} showRough={showRough} />
                
                <div className="relative group overflow-hidden rounded-[32px] border border-[#ef4444]/30 bg-[#ef4444]/5 p-6 flex flex-col justify-between">
                   <div className="flex justify-between items-start">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Broadcasting</p>
                      <Activity className={`${poll?.settings?.isPublished ? "text-emerald-500" : "text-white/20"}`} size={16} />
                   </div>
                   <div>
                      <p className="text-2xl font-display text-white mb-4">{poll?.settings?.isPublished ? "PUBLISHED" : "OFFLINE"}</p>
                      <button 
                        onClick={async () => {
                          try {
                            await publishPoll(id);
                            window.location.reload();
                          } catch (err) { alert("Failed to publish"); }
                        }}
                        disabled={poll?.settings?.isPublished}
                        className={`w-full py-2.5 rounded-xl text-[10px] font-bold tracking-[0.2em] transition-all ${
                          poll?.settings?.isPublished 
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-not-allowed" 
                          : "bg-[#ef4444] text-white hover:bg-[#ff5555] active:scale-95"
                        }`}
                      >
                        {poll?.settings?.isPublished ? "VICTORY SHARED" : "PUBLISH RESULTS"}
                      </button>
                   </div>
                </div>
              </div>

              {activeTab === 'charts' ? (
                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h2 className="font-display text-3xl text-white border-l-4 border-[#ef4444] pl-6">Question-wise Intel</h2>
                  <div className="grid gap-10">
                    {poll?.questions.map((q, idx) => (
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
              ) : (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                   <div className="flex items-center justify-between">
                      <h2 className="font-display text-3xl text-white border-l-4 border-[#ef4444] pl-6">Participant Intel</h2>
                      <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Total Intercepts: {recentVotes.length}</p>
                   </div>
                   <ParticipantList votes={recentVotes} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <SocketStatus />
    </section>
  );
}
