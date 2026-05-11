import React, { useMemo, useCallback } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  Handle, 
  Position,
  MarkerType 
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion } from 'framer-motion';
import { RoughNotation } from 'react-rough-notation';

// === CUSTOM NODE: Poll Root ===
const RootNode = React.memo(({ data }) => (
  <div className="px-6 py-4 rounded-2xl border border-[#ef4444]/40 bg-[#0a0a0a] shadow-[0_0_30px_rgba(239,68,68,0.08)] min-w-[200px]">
    <Handle type="source" position={Position.Right} className="!bg-[#ef4444] !w-2.5 !h-2.5 !border-none" />
    <p className="text-[8px] font-black uppercase tracking-[0.4em] text-[#ef4444]/60 mb-1">Campaign HQ</p>
    <p className="text-sm font-bold text-white tracking-tight leading-snug">{data.label}</p>
    {data.creator && (
      <p className="text-[7px] text-white/20 uppercase tracking-widest mt-2">by {data.creator}</p>
    )}
  </div>
));

// === CUSTOM NODE: Question ===
const QuestionNode = React.memo(({ data }) => (
  <div className="px-5 py-4 rounded-2xl border border-white/10 bg-[#0a0a0a] min-w-[180px] max-w-[220px]">
    <Handle type="target" position={Position.Left} className="!bg-[#ef4444] !w-2 !h-2 !border-none" />
    <Handle type="source" position={Position.Right} className="!bg-white/30 !w-2 !h-2 !border-none" />
    <p className="text-[7px] font-black uppercase tracking-[0.4em] text-white/20 mb-1">Sector {data.sectorNum}</p>
    <p className="text-xs font-bold text-white/80 leading-snug">{data.label}</p>
    <p className="font-handwriting text-[#ef4444]/50 text-[10px] mt-1 italic">{data.subtext}</p>
  </div>
));

// === CUSTOM NODE: Option ===
const OptionNode = React.memo(({ data }) => {
  const isWinner = data.isWinner;
  return (
    <div className={`px-5 py-3 rounded-xl border min-w-[140px] max-w-[180px] ${
      isWinner 
        ? 'border-[#ef4444]/30 bg-[#ef4444]/[0.06]' 
        : 'border-white/5 bg-[#0a0a0a]'
    }`}>
      <Handle type="target" position={Position.Left} className="!bg-white/20 !w-2 !h-2 !border-none" />
      <Handle type="source" position={Position.Right} className="!bg-white/20 !w-1.5 !h-1.5 !border-none" />
      <div className="flex items-center justify-between gap-2 mb-1">
        <p className="text-[7px] font-black uppercase tracking-[0.3em] text-white/20">{data.percentage}% freq</p>
        {isWinner && <span className="text-[7px] text-amber-400 font-black">🏆</span>}
      </div>
      <p className={`text-xs font-bold tracking-tight ${isWinner ? 'text-white' : 'text-white/60'}`}>{data.label}</p>
      <p className="text-[8px] text-white/10 mt-1 font-bold">{data.voteCount} strikes</p>
    </div>
  );
});

// === CUSTOM NODE: Voter (with RoughNotation) ===
const VoterNode = React.memo(({ data }) => (
  <div className="px-3 py-2 rounded-lg bg-transparent min-w-[100px]">
    <Handle type="target" position={Position.Left} className="!bg-white/10 !w-1.5 !h-1.5 !border-none" />
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
        <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20">Voted</span>
      </RoughNotation>
    </div>
    {data.email && (
      <p className="text-[7px] text-white/10 mt-1 tracking-wider font-mono truncate max-w-[120px]">{data.email}</p>
    )}
  </div>
));

const nodeTypes = {
  root: RootNode,
  question: QuestionNode,
  option: OptionNode,
  voter: VoterNode,
};

// Notation types to cycle through for variety
const notationTypes = ['underline', 'box', 'circle', 'highlight'];

export default function TacticalFlow({ poll, votes = [] }) {
  const { nodes, edges } = useMemo(() => {
    const nodes = [];
    const edges = [];

    if (!poll) return { nodes, edges };

    // Build a lookup: questionId -> optionId -> [voter names]
    const voterMap = {};
    votes.forEach(vote => {
      if (!vote.responses) return;
      vote.responses.forEach(resp => {
        const key = `${resp.questionId}-${resp.selectedOptionId}`;
        if (!voterMap[key]) voterMap[key] = [];
        const voterName = vote.voterId?.name || vote.voterId?.callsign || 'Anonymous';
        const voterEmail = vote.voterId?.email || '';
        voterMap[key].push({ name: voterName, email: voterEmail });
      });
    });

    // === Layout Constants ===
    const questionSpacing = 400;
    const optionSpacing = 140;
    const voterSpacing = 55;
    const xQuestion = 350;
    const xOption = 700;
    const xVoter = 1050;

    // === Root Node ===
    const totalQuestions = poll.questions.length;
    const rootY = ((totalQuestions - 1) * questionSpacing) / 2;

    nodes.push({
      id: 'root',
      type: 'root',
      data: { 
        label: poll.title,
        creator: poll.createdBy?.name
      },
      position: { x: 0, y: rootY - 20 },
    });

    // === Questions, Options, Voters ===
    poll.questions.forEach((q, qIdx) => {
      const qId = `q-${qIdx}`;
      const qY = qIdx * questionSpacing;

      nodes.push({
        id: qId,
        type: 'question',
        data: { 
          sectorNum: `0${qIdx + 1}`,
          label: q.text,
          subtext: q.isMandatory ? 'Required' : 'Optional'
        },
        position: { x: xQuestion, y: qY },
      });

      edges.push({
        id: `e-root-${qId}`,
        source: 'root',
        target: qId,
        animated: true,
        style: { stroke: 'rgba(239, 68, 68, 0.3)', strokeWidth: 2, strokeDasharray: '8 4' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#ef4444', width: 16, height: 16 },
      });

      // Sort options by vote count (winner first)
      const sortedOptions = [...q.options].sort((a, b) => b.voteCount - a.voteCount);
      const totalVotes = q.totalVotes || 0;

      sortedOptions.forEach((opt, oIdx) => {
        const oId = `o-${qIdx}-${oIdx}`;
        const percentage = totalVotes > 0 ? Math.round((opt.voteCount / totalVotes) * 100) : 0;
        const isWinner = oIdx === 0 && opt.voteCount > 0;
        
        // Center options around the question
        const optionGroupHeight = (sortedOptions.length - 1) * optionSpacing;
        const oY = qY - optionGroupHeight / 2 + oIdx * optionSpacing;

        nodes.push({
          id: oId,
          type: 'option',
          data: { 
            label: opt.text,
            percentage,
            voteCount: opt.voteCount,
            isWinner,
          },
          position: { x: xOption, y: oY },
        });

        edges.push({
          id: `e-${qId}-${oId}`,
          source: qId,
          target: oId,
          style: { 
            stroke: isWinner ? 'rgba(239, 68, 68, 0.4)' : 'rgba(255,255,255,0.06)', 
            strokeWidth: isWinner ? 2.5 : 1,
          },
          animated: isWinner,
        });

        // === Voter Leaf Nodes ===
        const voterKey = `${q._id}-${opt._id}`;
        const voters = voterMap[voterKey] || [];
        
        voters.forEach((voter, vIdx) => {
          const vId = `v-${qIdx}-${oIdx}-${vIdx}`;
          const voterGroupHeight = (voters.length - 1) * voterSpacing;
          const vY = oY - voterGroupHeight / 2 + vIdx * voterSpacing;

          nodes.push({
            id: vId,
            type: 'voter',
            data: {
              label: voter.name,
              email: voter.email,
              notationType: notationTypes[vIdx % notationTypes.length],
            },
            position: { x: xVoter, y: vY },
          });

          edges.push({
            id: `e-${oId}-${vId}`,
            source: oId,
            target: vId,
            style: { 
              stroke: 'rgba(255,255,255,0.04)', 
              strokeWidth: 1,
              strokeDasharray: '4 4',
            },
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
      {/* Header */}
      <div className="absolute top-8 left-8 z-20">
         <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#ef4444]">Tactical Flowchart</p>
         <p className="text-[8px] text-white/20 uppercase tracking-widest mt-1">Poll → Questions → Options → Voters</p>
      </div>

      {/* Legend */}
      <div className="absolute top-8 right-8 z-20 flex items-center gap-6">
         <div className="flex items-center gap-2">
            <div className="w-6 h-0.5 bg-[#ef4444]/40" />
            <span className="text-[7px] text-white/20 uppercase tracking-widest font-bold">Winner Path</span>
         </div>
         <div className="flex items-center gap-2">
            <div className="w-6 h-0.5 bg-white/10 border-dashed" />
            <span className="text-[7px] text-white/20 uppercase tracking-widest font-bold">Voter Link</span>
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
         <span className="font-handwriting text-white/5 text-2xl italic">ChaiCode Intelligence</span>
      </div>
    </motion.div>
  );
}
