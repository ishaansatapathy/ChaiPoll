import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Navbar } from "../../components/layout/Navbar.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import { getPollByCode, submitVote } from "../../services/api.js";
import { socket } from "../../socket/index.js";
import { Loader2, Shield, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import PollExpired from "./PollExpired.jsx";

export default function PollView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [poll, setPoll] = useState(null);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [liveCount, setLiveCount] = useState(0);
  const isExpired = poll?.expiresAt && new Date(poll.expiresAt) < new Date();
  const needsAuth = poll?.settings?.anonymous === false && !user;

  useEffect(() => {
    let isMounted = true;
    const fetchPoll = async () => {
      try {
        const { data } = await getPollByCode(id);
        if (isMounted) {
          setPoll(data);
          if (data.settings?.isPublished) navigate(`/results/${id}`);
          if (!socket.connected) socket.connect();
          socket.emit("joinPollRoom", id);
          socket.on("participantJoined", (count) => setLiveCount(count));
          socket.on("participantLeft", (count) => setLiveCount(count));
        }
      } catch (err) { if (isMounted) setError(err.response?.data?.message || "Poll not found"); }
      finally { if (isMounted) setLoading(false); }
    };
    fetchPoll();
    return () => { isMounted = false; socket.emit("leavePollRoom", id); socket.off("participantJoined"); socket.off("participantLeft"); };
  }, [id, navigate]);

  const handleOptionSelect = (questionId, optionId) => { if (isExpired || needsAuth) return; setResponses(prev => ({ ...prev, [questionId]: optionId })); };

  const handleSubmit = async () => {
    if (needsAuth) { navigate('/auth'); return; }
    const missing = poll.questions.filter(q => q.isMandatory && !responses[q._id]);
    if (missing.length > 0) { setError(`Please answer: ${missing[0].text}`); return; }
    setSubmitting(true); setError("");
    try {
      const formatted = Object.entries(responses).map(([qId, oId]) => ({ questionId: qId, selectedOptionId: oId }));
      await submitVote({ pollCode: id, responses: formatted });
      navigate(`/results/${id}`);
    } catch (err) { setError(err.response?.data?.message || "Failed to submit response"); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="min-h-screen bg-[#020202] flex items-center justify-center"><Loader2 className="animate-spin text-[#ef4444]" /></div>;
  if (isExpired) return <PollExpired title={poll.title} />;
  if (error && !poll) return (
    <div className="min-h-screen bg-[#020202] flex flex-col items-center justify-center p-6 text-center">
      <AlertTriangle className="text-[#ef4444] mb-4" size={48} /><h1 className="text-2xl font-display text-white mb-2">Poll Not Found</h1><p className="text-white/40 max-w-md">{error}</p><Button to="/" className="mt-8">Go Home</Button>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#020202] overflow-x-hidden relative">
      <Navbar />
      <div className="fixed inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_50%_30%,rgba(239,68,68,0.15),transparent_70%)]" />
      <section className="max-w-3xl mx-auto px-6 py-32 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-wrap items-center gap-4 mb-8">
            <Badge className="bg-white/5 border-white/10 text-white/60">{poll.visibility.toUpperCase()}</Badge>
            {liveCount > 0 && <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#ef4444]"><div className="h-1.5 w-1.5 rounded-full bg-[#ef4444] animate-pulse" />{liveCount} Live Participants</div>}
          </div>
          <h1 className="font-display text-5xl font-normal tracking-tight text-white leading-tight mb-4">{poll.title}</h1>
          {poll.description && <p className="text-lg text-white/40 font-medium leading-relaxed mb-12">{poll.description}</p>}
        </motion.div>

        {needsAuth ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="surface rounded-[40px] p-12 border border-[#ef4444]/20 bg-[#ef4444]/[0.02] text-center">
            <Shield className="text-[#ef4444] mx-auto mb-6" size={48} /><h2 className="text-2xl text-white font-display mb-4">Sign In Required</h2>
            <p className="text-white/40 mb-8 max-w-sm mx-auto italic">This poll requires authentication. Please sign in to cast your vote.</p>
            <Button to="/auth" className="w-full max-w-xs mx-auto">Sign In to Vote</Button>
          </motion.div>
        ) : (
          <div className="space-y-12">
            {poll.questions.map((q, qIdx) => (
              <motion.div key={q._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: qIdx * 0.1 }} className="relative">
                <div className="mb-6 flex items-baseline gap-4">
                  <span className="font-handwriting text-3xl text-[#ef4444] opacity-40">0{qIdx + 1}</span>
                  <h3 className="text-2xl text-white font-display flex items-center gap-3">{q.text}{q.isMandatory && <span className="text-[10px] text-[#ef4444] border border-[#ef4444]/30 px-2 py-0.5 rounded uppercase font-bold">Required</span>}</h3>
                </div>
                <div className="grid gap-3">
                  {q.options.map((opt) => (
                    <div key={opt._id} onClick={() => handleOptionSelect(q._id, opt._id)} className={`group relative flex items-center gap-4 rounded-[24px] border p-6 cursor-pointer transition-all duration-500 ${responses[q._id] === opt._id ? "border-[#ef4444] bg-[#ef4444]/5 shadow-[inset_0_0_30px_rgba(239,68,68,0.05)]" : "border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10"}`}>
                      <div className={`h-6 w-6 rounded-full border-2 transition-all flex items-center justify-center ${responses[q._id] === opt._id ? "border-[#ef4444]" : "border-white/10"}`}>{responses[q._id] === opt._id && <motion.div layoutId={`dot-${q._id}`} className="h-3 w-3 rounded-full bg-[#ef4444]" />}</div>
                      <span className={`text-lg font-medium transition-colors ${responses[q._id] === opt._id ? "text-white" : "text-white/60 group-hover:text-white/80"}`}>{opt.text}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
            <div className="pt-12 border-t border-white/5">
              {error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 font-bold uppercase tracking-widest text-center flex items-center justify-center gap-2"><AlertTriangle size={16} /> {error}</motion.div>}
              <div className="relative group">
                <div className="absolute -inset-1 rounded-[32px] blur opacity-20 transition duration-1000 bg-gradient-to-r from-[#ef4444] to-[#ff6b6b] group-hover:opacity-40" />
                <button onClick={handleSubmit} disabled={submitting} className="relative w-full h-20 rounded-[32px] font-black text-xs tracking-[0.4em] transition-all duration-500 flex items-center justify-center gap-4 bg-white text-black hover:bg-[#ef4444] hover:text-white">
                  {submitting ? <Loader2 className="animate-spin" /> : <><span>SUBMIT RESPONSE</span><CheckCircle2 size={20} /></>}
                </button>
              </div>
              <div className="mt-8 text-center"><span className="font-handwriting text-white/10 text-2xl rotate-1 block italic">Your data, your voice.</span></div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
