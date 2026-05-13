import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import {
  Target,
  LayoutDashboard,
  Plus,
  Share2,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartContainer } from "../../components/analytics/ChartContainer";
import { motion, AnimatePresence } from "framer-motion";
import { getPollAnalytics, publishPoll, getMyPolls, exportPollData, getPollTimeSeries } from "../../services/api";
import { socket } from "../../socket/index.js";
import { AnalyticsSkeleton } from "../../components/ui/Skeleton";
import ParticipantList from "../../components/analytics/ParticipantList";
import AnalyticsHeader from "../../components/analytics/AnalyticsHeader";
import AnalyticsConsole from "../../components/analytics/AnalyticsConsole";
import SocketStatus from "../../components/analytics/SocketStatus";

function QuestionInsightCard({ title, poll, type }) {
  const insight = React.useMemo(() => {
    if (!poll?.questions?.length) return null;

    let target = null;
    let value = "";

    if (type === "consensus") {
      // Find question where the top option has the highest lead
      let maxPct = -1;
      poll.questions.forEach((q) => {
        if (!q.totalVotes) return;
        const maxVotes = Math.max(...q.options.map((o) => o.voteCount));
        const pct = (maxVotes / q.totalVotes) * 100;
        if (pct > maxPct) {
          maxPct = pct;
          target = q;
          value = `${Math.round(pct)}% agreement`;
        }
      });
    } else if (type === "engagement") {
      // Find question with most total votes
      let maxVotes = -1;
      poll.questions.forEach((q) => {
        if (q.totalVotes > maxVotes) {
          maxVotes = q.totalVotes;
          target = q;
          value = `${maxVotes} interactions`;
        }
      });
    } else if (type === "dropoff") {
      // Find question with lowest votes compared to total participants
      let minVotes = Infinity;
      poll.questions.forEach((q) => {
        if (q.totalVotes < minVotes) {
          minVotes = q.totalVotes;
          target = q;
          value = `${poll.totalParticipants - minVotes} skipped`;
        }
      });
    }

    return { target, value };
  }, [poll, type]);

  if (!insight?.target) return null;

  return (
    <div className="p-6 rounded-3xl border border-white/5 bg-white/[0.01] backdrop-blur-3xl overflow-hidden relative group">
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#ef4444]/5 blur-3xl group-hover:bg-[#ef4444]/10 transition-all" />
      <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20 mb-4">
        {title}
      </p>
      <h4 className="text-sm font-bold text-white mb-2 line-clamp-1">
        {insight.target.text}
      </h4>
      <p className="font-handwriting text-[#ef4444] text-xl">
        {insight.value}
      </p>
    </div>
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
  const [activeTab, setActiveTab] = useState("charts");
  const [publishing, setPublishing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, hasMore: false });
  const [activeVoterList, setActiveVoterList] = useState(null); // { questionId, optionId }
  // Full time-series data from the dedicated endpoint
  const [fullTimeSeries, setFullTimeSeries] = useState([]);
  const [metrics, setMetrics] = useState(null);
  // Live participation feed from socket
  const [liveParticipations, setLiveParticipations] = useState([]);

  const pollUrl = `${window.location.origin}/poll/${id}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(pollUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = async () => {
    if (!id || exporting) return;
    setExporting(true);
    try {
      const response = await exportPollData(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `poll-export-${id}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Export failed", err);
    } finally {
      setExporting(false);
    }
  };

  // Compute real metrics from recentVotes for velocity
  const recentCount = recentVotes.filter(
    (v) => new Date(v.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)
  ).length;
  const olderCount = recentVotes.filter((v) => {
    const t = new Date(v.createdAt).getTime();
    return t <= Date.now() - 24 * 60 * 60 * 1000 && t > Date.now() - 48 * 60 * 60 * 1000;
  }).length;
  const velocityPct =
    olderCount > 0
      ? Math.round(((recentCount - olderCount) / olderCount) * 100)
      : recentCount > 0
        ? 100
        : 0;
  const pollAge = poll?.createdAt
    ? Math.max(
        1,
        Math.floor((Date.now() - new Date(poll.createdAt).getTime()) / (1000 * 60 * 60 * 24))
      )
    : 0;

  useEffect(() => {
    const timer = setTimeout(() => setShowRough(true), 800);
    return () => clearTimeout(timer);
  }, []);

  // Fetch list of all polls for the sidebar
  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const { data } = await getMyPolls();
        setAllPolls(Array.isArray(data) ? data : data.data || []);
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

    const fetchData = async (pageNum = 1) => {
      setLoading(pageNum === 1);
      try {
        const [analyticsRes, timeSeriesRes] = await Promise.all([
          getPollAnalytics(id, pageNum),
          getPollTimeSeries(id).catch(() => null),
        ]);

        setPoll(analyticsRes.data.poll);
        setRecentVotes(analyticsRes.data.recentVotes || []);
        setPagination(analyticsRes.data.pagination);

        // Set full time-series from the dedicated endpoint
        if (timeSeriesRes?.data) {
          setFullTimeSeries(timeSeriesRes.data.timeSeries || []);
          setMetrics(timeSeriesRes.data.metrics || null);
        }

        if (!socket.connected) socket.connect();
        socket.emit("joinPollRoom", id);

        socket.on("pollUpdated", (updatedPoll) => {
          setPoll(updatedPoll);
        });

        // Listen for new_participation events (Fix #2)
        socket.on("new_participation", (data) => {
          setLiveParticipations((prev) => [data, ...prev].slice(0, 20));
        });
      } catch (err) {
        console.error("Error fetching analytics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData(page);

    return () => {
      socket.emit("leavePollRoom", id);
      socket.off("pollUpdated");
      socket.off("new_participation");
    };
  }, [id, page]);

  if (loading && !poll) return <AnalyticsSkeleton />;

  return (
    <section className="py-8 relative min-h-screen">
      {/* Socket connection status indicator (Fix #2) */}
      {id && <SocketStatus />}

      <div className="grid lg:grid-cols-[280px_1fr] gap-8">
        {/* Sidebar: Poll Navigator */}
        <aside className="space-y-8">
          <PollSidebar
            allPolls={allPolls}
            pollListLoading={pollListLoading}
            id={id}
          />

          {/* Share Hub */}
          {id && poll && (
            <ShareHub
              pollUrl={pollUrl}
              copied={copied}
              copyToClipboard={copyToClipboard}
            />
          )}
        </aside>

        {/* Main Content */}
        <div className="space-y-12">
          {!id ? (
            <EmptyAnalytics />
          ) : (
            <>
              <AnalyticsHeader
                poll={poll}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                exporting={exporting}
                handleExport={handleExport}
              />

              <AnalyticsConsole
                poll={poll}
                setPoll={setPoll}
                showRough={showRough}
                recentCount={recentCount}
                velocityPct={velocityPct}
                pollAge={pollAge}
                publishing={publishing}
                setPublishing={setPublishing}
                id={id}
                metrics={metrics}
              />

              {activeTab === "charts" ? (
                <ChartsTab
                  fullTimeSeries={fullTimeSeries}
                  poll={poll}
                  liveParticipations={liveParticipations}
                  recentVotes={recentVotes}
                  activeVoterList={activeVoterList}
                  setActiveVoterList={setActiveVoterList}
                />
              ) : (
                <ParticipantsTab
                  recentVotes={recentVotes}
                  pagination={pagination}
                  page={page}
                  setPage={setPage}
                />
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

/* ─── Sub-components ─── */

function PollSidebar({ allPolls, pollListLoading, id }) {
  return (
    <div className="surface rounded-3xl border border-white/5 bg-[#050505]/50 backdrop-blur-3xl p-6 sticky top-8 shadow-2xl">
      <div className="flex items-center gap-3 mb-8 px-2 border-b border-white/5 pb-4">
        <div className="p-2 rounded-lg bg-[#ef4444]/10 border border-[#ef4444]/20">
          <LayoutDashboard className="text-[#ef4444]" size={16} />
        </div>
        <h3 className="text-[10px] uppercase tracking-[0.4em] text-white/60 font-black">
          Your Polls
        </h3>
      </div>

      <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
        {pollListLoading
          ? [1, 2, 3].map((i) => (
              <div key={i} className="h-16 w-full bg-white/5 rounded-2xl animate-pulse" />
            ))
          : allPolls.map((p) => (
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
                  <motion.div
                    layoutId="activePoll"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-[#ef4444]"
                  />
                )}
                <p
                  className={`text-[9px] font-black uppercase tracking-[0.2em] mb-2 ${id === p.pollCode ? "text-[#ef4444]" : "text-white/20"}`}
                >
                  {p.pollCode}
                </p>
                <h4
                  className={`text-sm font-display tracking-tight truncate ${id === p.pollCode ? "text-white" : "text-white/40 group-hover:text-white/80"}`}
                >
                  {p.title}
                </h4>
              </Link>
            ))}
      </div>

      <Link
        to="/create"
        className="mt-8 flex items-center justify-center gap-3 w-full py-5 rounded-2xl bg-[#ef4444]/5 border border-dashed border-[#ef4444]/20 text-[10px] font-black tracking-[0.3em] text-[#ef4444] hover:text-white hover:bg-[#ef4444] transition-all uppercase"
      >
        <Plus size={14} strokeWidth={3} /> NEW POLL
      </Link>
    </div>
  );
}

function ShareHub({ pollUrl, copied, copyToClipboard }) {
  return (
    <div className="surface rounded-3xl border border-white/5 bg-[#050505]/50 backdrop-blur-3xl p-6 shadow-2xl space-y-6">
      <div className="flex items-center gap-3 px-2 border-b border-white/5 pb-4">
        <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <Share2 className="text-emerald-500" size={16} />
        </div>
        <h3 className="text-[10px] uppercase tracking-[0.4em] text-white/60 font-black">
          Share Poll
        </h3>
      </div>

      <div className="flex flex-col items-center gap-6">
        <div className="p-4 bg-white rounded-2xl shadow-[0_0_40px_rgba(255,255,255,0.1)]">
          <QRCodeCanvas
            value={pollUrl}
            size={140}
            level="H"
            includeMargin={false}
            imageSettings={{
              src: "/logo.png",
              x: undefined,
              y: undefined,
              height: 24,
              width: 24,
              excavate: true,
            }}
          />
        </div>

        <div className="w-full space-y-3">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 text-center">
            Direct Link
          </p>
          <button
            onClick={copyToClipboard}
            className="group relative w-full p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between hover:bg-white/[0.06] hover:border-white/10 transition-all overflow-hidden"
          >
            <span className="text-[10px] font-mono text-white/40 truncate pr-4">
              {pollUrl.replace(/^https?:\/\//, "")}
            </span>
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
              {copied ? (
                <Check size={14} className="text-emerald-500" />
              ) : (
                <Copy size={14} className="text-white/40" />
              )}
            </div>
            {copied && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute inset-0 bg-emerald-500 flex items-center justify-center text-[10px] font-black text-white uppercase tracking-widest"
              >
                Link Copied!
              </motion.div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function EmptyAnalytics() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center py-32 border border-dashed border-white/5 rounded-[40px] bg-white/[0.01]">
      <div className="mb-8 p-8 rounded-full bg-[#ef4444]/5 border border-[#ef4444]/10 relative">
        <div className="absolute inset-0 bg-[#ef4444]/10 blur-3xl rounded-full" />
        <Target className="text-[#ef4444]/40 relative z-10 animate-pulse" size={80} />
      </div>
      <h2 className="font-display text-5xl text-white mb-4 tracking-tighter">
        Select a Poll
      </h2>
      <p className="text-white/30 max-w-sm mx-auto font-handwriting text-2xl italic leading-relaxed">
        &quot;Choose a poll from the sidebar to view its analytics.&quot;
      </p>
    </div>
  );
}

function ChartsTab({ 
  fullTimeSeries, 
  poll, 
  liveParticipations, 
  recentVotes,
  activeVoterList,
  setActiveVoterList 
}) {
  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      {/* Live Participation Feed (Fix #2: new_participation consumer) */}
      {liveParticipations.length > 0 && (
        <div className="rounded-2xl border border-emerald-500/10 bg-emerald-500/[0.02] p-6">
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-emerald-500/60 mb-4">
            Live Participation Feed
          </p>
          <div className="flex flex-wrap gap-2">
            {liveParticipations.slice(0, 8).map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-bold text-emerald-400"
              >
                New response • {new Date(p.timestamp).toLocaleTimeString()}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Time-Series Trend Chart */}
      {fullTimeSeries.length > 1 && (
        <ChartContainer
          title="Responses Over Time"
          description="Daily response volume and cumulative trend (all data)."
        >
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={fullTimeSeries}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="rgba(255,255,255,0.1)"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fontWeight: "bold" }}
              />
              <YAxis
                stroke="rgba(255,255,255,0.1)"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fontWeight: "bold" }}
              />
              <Tooltip
                contentStyle={{
                  background: "#050505",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 20,
                  padding: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="responses"
                stroke="#ef4444"
                fill="url(#areaGrad)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="cumulative"
                stroke="rgba(255,255,255,0.15)"
                fill="none"
                strokeWidth={1.5}
                strokeDasharray="6 4"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      )}

      {/* Tactical Highlights — Per Question Insights */}
      <div className="grid md:grid-cols-3 gap-6">
        <QuestionInsightCard
          title="Strongest Consensus"
          poll={poll}
          type="consensus"
        />
        <QuestionInsightCard
          title="Most Engaged"
          poll={poll}
          type="engagement"
        />
        <QuestionInsightCard
          title="Highest Abandonment"
          poll={poll}
          type="dropoff"
        />
      </div>

      <h2 className="font-display text-3xl text-white border-l-4 border-[#ef4444] pl-6">
        Question Breakdown
      </h2>
      <div className="grid gap-10">
        {poll?.questions.map((q, idx) => (
          <ChartContainer
            key={q._id}
            title={`Q${idx + 1}: ${q.text}`}
            description={`${q.totalVotes || 0} total responses received.`}
          >
            <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-10">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={q.options}>
                  <CartesianGrid stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis
                    dataKey="text"
                    stroke="rgba(255,255,255,0.1)"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10, fontWeight: "bold" }}
                  />
                  <YAxis
                    stroke="rgba(255,255,255,0.1)"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10, fontWeight: "bold" }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#050505",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 20,
                      padding: 12,
                    }}
                    cursor={{ fill: "rgba(255,255,255,0.03)" }}
                  />
                  <Bar
                    dataKey="voteCount"
                    fill="#ef4444"
                    radius={[12, 12, 0, 0]}
                    barSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
              <div className="space-y-6">
                {q.options.map((opt, oIdx) => {
                  const percentage =
                    q.totalVotes > 0
                      ? Math.round((opt.voteCount / q.totalVotes) * 100)
                      : 0;
                  
                  const votersForOption = recentVotes.filter(v => 
                    v.responses?.some(r => 
                      String(r.questionId) === String(q._id) && 
                      r.optionIds?.some(oid => String(oid) === String(opt._id))
                    )
                  );
                  
                  const isExpanded = activeVoterList?.questionId === q._id && activeVoterList?.optionId === opt._id;

                  return (
                    <div key={opt._id} className="group relative">
                      <div className="mb-2 flex justify-between items-end">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-white/40 group-hover:text-white transition-colors uppercase tracking-wider">
                            {opt.text}
                          </span>
                          {votersForOption.length > 0 && (
                            <button 
                              type="button"
                              onClick={() => {
                                setActiveVoterList(isExpanded ? null : { questionId: q._id, optionId: opt._id });
                              }}
                              className={`text-[8px] font-black uppercase tracking-widest mt-1 transition-all ${
                                isExpanded ? "text-white opacity-100" : "text-[#ef4444] opacity-30 group-hover:opacity-100"
                              }`}
                            >
                              {isExpanded ? "Hide Voters" : `View ${votersForOption.length} Voters`}
                            </button>
                          )}
                        </div>
                        <span className="font-handwriting text-[#ef4444] text-xl">
                          {percentage}%
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                        <motion.div
                          className="h-full rounded-full bg-[#ef4444]"
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 1, delay: oIdx * 0.1 }}
                        />
                      </div>

                      {/* Voter Names Breakdown */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mt-4 overflow-hidden"
                          >
                            <div className="flex flex-wrap gap-2 pb-4 pt-2">
                              {votersForOption.map((v, vIdx) => (
                                <span 
                                  key={vIdx}
                                  className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-bold text-white/40"
                                >
                                  {v.voterId?.name || v.voterId?.displayName || "Anonymous"}
                                </span>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          </ChartContainer>
        ))}
      </div>
    </div>
  );
}

function ParticipantsTab({ recentVotes, pagination, page, setPage }) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-3xl text-white border-l-4 border-[#ef4444] pl-6">
          Participants
        </h2>
        <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold">
          Total Responses: {pagination.total}
        </p>
      </div>
      <ParticipantList votes={recentVotes} />

      {/* Pagination Controls */}
      {pagination.total > pagination.limit && (
        <div className="flex items-center justify-center gap-6 pt-8 border-t border-white/5">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-4 rounded-2xl bg-white/5 border border-white/5 text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-xs font-mono text-white/60">
            Page <span className="text-white">{page}</span> of{" "}
            {Math.ceil(pagination.total / pagination.limit)}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={!pagination.hasMore}
            className="p-4 rounded-2xl bg-white/5 border border-white/5 text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
