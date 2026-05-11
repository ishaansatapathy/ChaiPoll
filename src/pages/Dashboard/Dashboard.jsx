import { useEffect, useState } from "react";
import { Plus, BarChart2, Users, Activity } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { RoughNotation } from "react-rough-notation";
import { AnalyticsCard } from "../../components/dashboard/AnalyticsCard.jsx";
import { PollCard } from "../../components/poll/PollCard.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { getMyPolls } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import CaptainOnboarding from "../../components/auth/CaptainOnboarding.jsx";

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

const SAMPLE_POLLS = [
  { _id: "s1", title: "Global Coffee Preference 2026", totalVotes: 842, isActive: true, visibility: "public", code: "COFFEE", createdAt: new Date().toISOString() },
  { _id: "s2", title: "Remote Work Neural Sync", totalVotes: 1240, isActive: true, visibility: "private", code: "REMOTE", createdAt: new Date().toISOString() },
  { _id: "s3", title: "Product Feature Prioritization", totalVotes: 512, isActive: false, visibility: "public", code: "PROD", createdAt: new Date().toISOString() },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRough, setShowRough] = useState(false);

  useEffect(() => {
    const fetchPolls = async () => {
      if (!user) {
        setPolls(SAMPLE_POLLS);
        setLoading(false);
        return;
      }

      try {
        const { data } = await getMyPolls();
        setPolls(data);
      } catch (error) {
        console.error("Error fetching polls", error);
        setPolls(SAMPLE_POLLS); // Fallback to sample on error
      } finally {
        setLoading(false);
      }
    };
    fetchPolls();
    
    const timer = setTimeout(() => setShowRough(true), 800);
    return () => clearTimeout(timer);
  }, [user]);

  const totalVotes = Array.isArray(polls) ? polls.reduce((acc, poll) => acc + (poll.totalParticipants || 0), 0) : 0;
  const activePolls = Array.isArray(polls) ? polls.filter(p => p.isActive).length : 0;
  const pollList = Array.isArray(polls) ? polls : [];

  const analyticsSummary = [
    { label: "Total Polls", value: pollList.length.toString(), icon: BarChart2, trend: user ? "Growth" : "Sample" },
    { label: "Total Votes", value: totalVotes.toLocaleString(), icon: Users, trend: user ? "Viral" : "Mock" },
    { label: "Active Polls", value: activePolls.toString(), icon: Activity, trend: user ? "Live" : "Preview" },
  ];

  return (
    <section className="py-8 relative">
      <CaptainOnboarding />
      {/* Decorative background mark */}
      <div className="absolute -top-10 -right-10 opacity-10 pointer-events-none scale-150">
        <svg width="400" height="400" viewBox="0 0 400 400">
          <path d="M50,150 Q150,50 250,150 T350,250" fill="none" stroke="white" strokeWidth="1" />
        </svg>
      </div>

      <div className="mb-12 flex flex-wrap items-end justify-between gap-6 border-b border-white/5 pb-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <div className="flex items-center gap-3 mb-2">
            <span className="h-[1px] w-8 bg-[#ef4444]" />
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/30 font-bold">Workspace v2.0</p>
          </div>
          <h1 className="font-display text-5xl font-normal tracking-[-0.05em] text-white md:text-7xl">
            <Highlight>Chai</Highlight> Command <br />
            <span className="text-white/40 italic">Center</span>
          </h1>
          <div className="mt-4 flex gap-4">
             <span className="font-handwriting text-xl text-[#ef4444] -rotate-3 block">Your polling empire starts here.</span>
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
             <span className="font-handwriting text-sm text-[#ef4444] absolute top-[-10px] left-[-40px] w-24 leading-tight">Click to create!</span>
          </div>
          <Button to="/create" className="h-16 px-8 rounded-2xl bg-white text-black hover:bg-[#ef4444] hover:text-white transition-all duration-500 shadow-[0_0_30px_rgba(255,255,255,0.1)] group-hover:shadow-[0_0_30px_rgba(239,68,68,0.3)]">
             <span className="flex items-center gap-3 text-lg font-bold">
               <Plus size={20} strokeWidth={3} /> NEW CAMPAIGN
             </span>
          </Button>
        </motion.div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {analyticsSummary.map((item, i) => (
          <motion.div 
            key={item.label} 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 + i * 0.1, duration: 0.8 }}
            className="relative"
          >
            <AnalyticsCard {...item} showRough={showRough} />
            {i === 1 && (
               <span className="absolute -bottom-6 right-4 font-handwriting text-[#ef4444] text-lg rotate-2 pointer-events-none">Peak stats.</span>
            )}
          </motion.div>
        ))}
      </div>

      <div className="mt-16 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-3xl text-white tracking-tight">
              <RoughNotation type="underline" show={showRough} color="#ef4444" strokeWidth={3} iterations={2} padding={5}>
                Active Deployments
              </RoughNotation>
            </h2>
            <div className="h-[1px] flex-1 mx-6 bg-white/5" />
          </div>
          
          {!user && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Preview Mode Active: Displaying Sample Intelligence</p>
              </div>
              <Link to="/auth" className="text-[10px] font-bold text-white underline underline-offset-4 uppercase tracking-widest hover:text-[#ef4444] transition-colors">Unlock Full Access</Link>
            </motion.div>
          )}

          {loading ? (
            <div className="flex flex-col items-center py-20 gap-4 opacity-20">
               <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin" />
               <p className="font-handwriting text-2xl tracking-widest">Scanning blockchain...</p>
            </div>
          ) : polls.length === 0 ? (
            <div className="border border-dashed border-white/10 rounded-3xl p-16 text-center bg-white/[0.01]">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
                <BarChart2 className="text-white/20" size={32} />
              </div>
              <h3 className="text-xl text-white mb-2 font-display uppercase tracking-wider">No active polls found</h3>
              <p className="text-white/40 mb-8 max-w-sm mx-auto">Start your first data collection campaign to see realtime analytics here.</p>
              <Link to="/create" className="font-handwriting text-[#ef4444] text-2xl hover:underline">Launch your first poll &rarr;</Link>
            </div>
          ) : (
            <div className="grid gap-6">
              {pollList.map((poll) => <PollCard key={poll._id} poll={poll} />)}
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
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#ef4444]/10 blur-[80px]" />
              
              <div className="flex items-start justify-between mb-10">
                <div>
                  <h2 className="font-display text-3xl text-white leading-tight">
                    Engagement <br /><span className="text-[#ef4444]">Velocity</span>
                  </h2>
                  <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold mt-2">Realtime data sync</p>
                </div>
                <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                  <Activity className="text-[#ef4444] animate-pulse" size={24} />
                </div>
              </div>

              <div className="space-y-8">
                {pollList.length > 0 ? pollList.slice(0, 5).map((poll, idx) => {
                  const maxVotes = Math.max(...pollList.map(p => p.totalVotes), 1);
                  const percentage = Math.round((poll.totalVotes / maxVotes) * 100) || 0;
                  return (
                    <div key={poll._id} className="relative group">
                      <div className="mb-3 flex justify-between items-end">
                        <span className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">{poll.title}</span>
                        <span className="font-handwriting text-[#ef4444] text-2xl tracking-wider">{poll.totalVotes}</span>
                      </div>
                      <div className="h-[6px] overflow-hidden rounded-full bg-white/5">
                        <motion.div 
                          className="h-full rounded-full bg-gradient-to-r from-[#ef4444] to-[#ff6b6b]" 
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 1.5, delay: 0.8 + (idx * 0.1), ease: "circOut" }}
                        />
                      </div>
                    </div>
                  );
                }) : (
                  <div className="py-10 text-center flex flex-col items-center gap-4">
                     <p className="text-white/10 font-display text-lg uppercase tracking-widest italic">Waiting for incoming data...</p>
                     <span className="font-handwriting text-[#ef4444] text-xl rotate-[-5deg]">Ready for liftoff!</span>
                  </div>
                )}
              </div>


              
              <div className="absolute bottom-4 right-8 pointer-events-none">
                 <span className="font-handwriting text-[#ef4444] text-xl opacity-40">Live sync</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
