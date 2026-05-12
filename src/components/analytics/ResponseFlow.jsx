import React, { useMemo } from "react";
import ReactFlow, { Background, Controls, Handle, Position, MarkerType } from "reactflow";
import "reactflow/dist/style.css";
import { motion } from "framer-motion";
import { RoughNotation } from "react-rough-notation";

const RootNode = React.memo(({ data }) => (
  <div className="px-6 py-4 rounded-2xl border border-[#ef4444]/40 bg-[#0a0a0a] shadow-[0_0_30px_rgba(239,68,68,0.08)] min-w-[200px]">
    <Handle
      type="source"
      position={Position.Right}
      className="!bg-[#ef4444] !w-2.5 !h-2.5 !border-none"
    />
    <p className="text-[8px] font-black uppercase tracking-[0.4em] text-[#ef4444]/60 mb-1">Poll</p>
    <p className="text-sm font-bold text-white tracking-tight leading-snug">{data.label}</p>
    {data.creator && (
      <p className="text-[7px] text-white/20 uppercase tracking-widest mt-2">by {data.creator}</p>
    )}
  </div>
));

const QuestionNode = React.memo(({ data }) => (
  <div className="px-5 py-4 rounded-2xl border border-white/10 bg-[#0a0a0a] min-w-[180px] max-w-[220px]">
    <Handle
      type="target"
      position={Position.Left}
      className="!bg-[#ef4444] !w-2 !h-2 !border-none"
    />
    <Handle
      type="source"
      position={Position.Right}
      className="!bg-white/30 !w-2 !h-2 !border-none"
    />
    <p className="text-[7px] font-black uppercase tracking-[0.4em] text-white/20 mb-1">
      Q{data.sectorNum}
    </p>
    <p className="text-xs font-bold text-white/80 leading-snug">{data.label}</p>
    <p className="font-handwriting text-[#ef4444]/50 text-[10px] mt-1 italic">{data.subtext}</p>
  </div>
));

const OptionNode = React.memo(({ data }) => (
  <div className="px-5 py-3 rounded-xl border border-white/5 bg-[#0a0a0a] min-w-[140px] max-w-[180px]">
    <Handle
      type="target"
      position={Position.Left}
      className="!bg-white/20 !w-2 !h-2 !border-none"
    />
    <Handle
      type="source"
      position={Position.Right}
      className="!bg-white/20 !w-1.5 !h-1.5 !border-none"
    />
    <div className="flex items-center justify-between gap-2 mb-1">
      <p className="text-[7px] font-black uppercase tracking-[0.3em] text-white/20">
        {data.percentage}%
      </p>
    </div>
    <p className="text-xs font-bold tracking-tight text-white/70">{data.label}</p>
    <p className="text-[8px] text-white/10 mt-1 font-bold">{data.voteCount} responses</p>
  </div>
));

const VoterNode = React.memo(({ data }) => (
  <div className="px-3 py-2 rounded-lg bg-transparent min-w-[100px]">
    <Handle
      type="target"
      position={Position.Left}
      className="!bg-white/10 !w-1.5 !h-1.5 !border-none"
    />
    <div className="flex flex-col items-start">
      <span className="font-handwriting text-lg text-white/90 whitespace-nowrap mb-1">
        {data.label}
      </span>
      <RoughNotation
        type="underline"
        show={true}
        color="#ef4444"
        strokeWidth={2}
        padding={1}
        iterations={3}
        animate={true}
      >
        <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20">
          Voted
        </span>
      </RoughNotation>
    </div>
    {data.email && (
      <p className="text-[7px] text-white/10 mt-1 tracking-wider font-mono truncate max-w-[120px]">
        {data.email}
      </p>
    )}
  </div>
));

const nodeTypes = { root: RootNode, question: QuestionNode, option: OptionNode, voter: VoterNode };

export default function ResponseFlow({ poll, votes = [] }) {
  const { nodes, edges } = useMemo(() => {
    const nodes = [],
      edges = [];
    if (!poll) return { nodes, edges };
    const voterMap = {};
    votes.forEach((vote) => {
      if (!vote.responses) return;
      vote.responses.forEach((resp) => {
        const key = `${resp.questionId}-${resp.selectedOptionId}`;
        if (!voterMap[key]) voterMap[key] = [];
        voterMap[key].push({
          name: vote.voterId?.name || vote.voterId?.displayName || "Anonymous",
          email: vote.voterId?.email || "",
        });
      });
    });
    const qSpacing = 400,
      oSpacing = 140,
      vSpacing = 55,
      xQ = 350,
      xO = 700,
      xV = 1050;
    const totalQ = poll.questions.length;
    const rootY = ((totalQ - 1) * qSpacing) / 2;
    nodes.push({
      id: "root",
      type: "root",
      data: { label: poll.title, creator: poll.createdBy?.name },
      position: { x: 0, y: rootY - 20 },
    });
    poll.questions.forEach((q, qIdx) => {
      const qId = `q-${qIdx}`,
        qY = qIdx * qSpacing;
      nodes.push({
        id: qId,
        type: "question",
        data: {
          sectorNum: `${qIdx + 1}`,
          label: q.text,
          subtext: q.isMandatory ? "Required" : "Optional",
        },
        position: { x: xQ, y: qY },
      });
      edges.push({
        id: `e-root-${qId}`,
        source: "root",
        target: qId,
        animated: true,
        style: { stroke: "rgba(239, 68, 68, 0.3)", strokeWidth: 2, strokeDasharray: "8 4" },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#ef4444", width: 16, height: 16 },
      });
      const sortedOpts = [...q.options];
      const totalVotes = q.totalVotes || 0;
      sortedOpts.forEach((opt, oIdx) => {
        const oId = `o-${qIdx}-${oIdx}`;
        const pct = totalVotes > 0 ? Math.round((opt.voteCount / totalVotes) * 100) : 0;
        const oGroupH = (sortedOpts.length - 1) * oSpacing;
        const oY = qY - oGroupH / 2 + oIdx * oSpacing;
        nodes.push({
          id: oId,
          type: "option",
          data: { label: opt.text, percentage: pct, voteCount: opt.voteCount },
          position: { x: xO, y: oY },
        });
        edges.push({
          id: `e-${qId}-${oId}`,
          source: qId,
          target: oId,
          style: { stroke: "rgba(239, 68, 68, 0.3)", strokeWidth: 1.5, strokeDasharray: "6 4" },
        });
        const voterKey = `${q._id}-${opt._id}`;
        const voters = voterMap[voterKey] || [];
        voters.forEach((voter, vIdx) => {
          const vId = `v-${qIdx}-${oIdx}-${vIdx}`;
          const vGroupH = (voters.length - 1) * vSpacing;
          const vY = oY - vGroupH / 2 + vIdx * vSpacing;
          nodes.push({
            id: vId,
            type: "voter",
            data: { label: voter.name, email: voter.email },
            position: { x: xV, y: vY },
          });
          edges.push({
            id: `e-${oId}-${vId}`,
            source: oId,
            target: vId,
            style: { stroke: "rgba(239, 68, 68, 0.5)", strokeWidth: 1.5, strokeDasharray: "6 4" },
          });
        });
      });
    });
    return { nodes, edges };
  }, [poll, votes]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-[700px] w-full rounded-[40px] border border-white/5 bg-[#020202]/60 backdrop-blur-3xl overflow-hidden relative"
    >
      <div className="absolute top-8 left-8 z-20">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#ef4444]">
          Response Flow
        </p>
        <p className="text-[8px] text-white/20 uppercase tracking-widest mt-1">
          Poll → Questions → Options → Voters
        </p>
      </div>
      <div className="absolute top-8 right-8 z-20 flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-6 h-0.5 bg-[#ef4444]/40" />
          <span className="text-[7px] text-white/20 uppercase tracking-widest font-bold">
            Winner Path
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-0.5 bg-white/10 border-dashed" />
          <span className="text-[7px] text-white/20 uppercase tracking-widest font-bold">
            Voter Link
          </span>
        </div>
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.15}
        maxZoom={1.5}
        panOnScroll
        selectionOnDrag
        proOptions={{ hideAttribution: true }}
      >
        <Background color="rgba(255, 255, 255, 0.02)" gap={30} size={1} />
        <Controls showInteractive={false} className="!bg-white/5 !border-white/10 !rounded-xl" />
      </ReactFlow>
      <div className="absolute bottom-8 right-8 z-20 pointer-events-none">
        <span className="font-handwriting text-white/5 text-2xl italic">ChaiPoll Intelligence</span>
      </div>
    </motion.div>
  );
}
