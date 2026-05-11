import React, { useMemo } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  Handle, 
  Position,
  MarkerType 
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion } from 'framer-motion';

// Custom Node Style for the "Warrior" theme
// Custom Node Style for the "Warrior" theme - Memoized for performance
const CustomNode = React.memo(({ data }) => {
  return (
    <div className={`px-4 py-3 rounded-2xl border backdrop-blur-xl shadow-2xl min-w-[150px] transition-all duration-300 ${
      data.type === 'root' 
      ? 'bg-[#ef4444]/10 border-[#ef4444]/40 shadow-[#ef4444]/10' 
      : data.type === 'question'
      ? 'bg-white/5 border-white/20'
      : 'bg-white/[0.02] border-white/5'
    }`}>
      <Handle type="target" position={Position.Left} className="!bg-[#ef4444] !w-2 !h-2 border-none" />
      
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-4">
          <span className="text-[8px] uppercase tracking-[0.2em] font-bold text-white/30">{data.label_top}</span>
          {data.creator && (
            <span className="text-[7px] font-bold text-[#ef4444] uppercase tracking-tighter opacity-80">BY: {data.creator}</span>
          )}
        </div>
        <span className={`text-xs font-bold tracking-tight leading-tight ${data.type === 'root' ? 'text-white text-sm' : 'text-white/80'}`}>
          {data.label}
        </span>
        {data.subtext && (
          <span className="font-handwriting text-[#ef4444] text-xs opacity-60 mt-1">{data.subtext}</span>
        )}
      </div>

      <Handle type="source" position={Position.Right} className="!bg-[#ef4444] !w-2 !h-2 border-none" />
    </div>
  );
});

const nodeTypes = {
  tactical: CustomNode,
};

export default function TacticalFlow({ poll }) {
  const { nodes, edges } = useMemo(() => {
    const nodes = [];
    const edges = [];

    // Root Node (Poll)
    nodes.push({
      id: 'root',
      type: 'tactical',
      data: { 
        type: 'root',
        label_top: 'Central Intelligence', 
        label: poll.title,
        subtext: 'Primary Nexus',
        creator: poll.createdBy?.name || 'Unknown Agent'
      },
      position: { x: 0, y: 0 },
    });

    // Vertical spacing calculation
    const qHeight = 350; // Increased spacing
    const oHeight = 150; // Increased spacing
    const xOffset = 350; // Increased horizontal distance
    
    poll.questions.forEach((q, qIdx) => {
      const qId = `q-${qIdx}`;
      const qY = (qIdx - (poll.questions.length - 1) / 2) * qHeight;

      // Question Node
      nodes.push({
        id: qId,
        type: 'tactical',
        data: { 
          type: 'question',
          label_top: `Sector 0${qIdx + 1}`, 
          label: q.text,
          subtext: q.isMandatory ? 'Required Objective' : 'Optional Data'
        },
        position: { x: xOffset, y: qY },
      });

      // Edge from Root to Question
      edges.push({
        id: `e-root-${qId}`,
        source: 'root',
        target: qId,
        animated: true,
        style: { stroke: 'rgba(239, 68, 68, 0.4)', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#ef4444' },
      });

      // Options for this Question
      q.options.forEach((opt, oIdx) => {
        const oId = `o-${qIdx}-${oIdx}`;
        const oY = qY + (oIdx - (q.options.length - 1) / 2) * oHeight;
        const percentage = q.totalVotes > 0 ? Math.round((opt.voteCount / q.totalVotes) * 100) : 0;
        const isCorrect = q.correctOptionId && opt._id.toString() === q.correctOptionId.toString();
        
        // Calculate scale: Base scale is 1.0, max is 1.25 for 100%
        const scale = 1 + (percentage / 400); 

        nodes.push({
          id: oId,
          type: 'tactical',
          data: { 
            type: 'option',
            label_top: `${percentage}% Frequency`, 
            label: opt.text,
            subtext: isCorrect ? 'TARGET OBJECTIVE' : (opt.voteCount > 0 ? `${opt.voteCount} Strikes` : 'No Signal')
          },
          position: { x: xOffset * 2, y: oY },
          style: { transform: `scale(${scale})` },
        });

        // Edge from Question to Option
        edges.push({
          id: `e-${qId}-${oId}`,
          source: qId,
          target: oId,
          label: isCorrect ? 'CORRECT PATH' : 'DIVERGENCE',
          labelStyle: { fill: isCorrect ? '#10b981' : 'rgba(255,255,255,0.2)', fontSize: 8, fontWeight: 'bold' },
          style: { 
            stroke: isCorrect ? '#10b981' : (percentage > 40 ? '#ef4444' : 'rgba(255,255,255,0.1)'), 
            strokeWidth: isCorrect || percentage > 40 ? 3 : 1 
          },
          animated: isCorrect
        });
      });
    });

    return { nodes, edges };
  }, [poll]);

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="h-[600px] w-full rounded-[40px] border border-white/5 bg-[#020202]/40 backdrop-blur-3xl overflow-hidden relative"
    >
      <div className="absolute top-8 left-8 z-20">
         <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#ef4444]">Tactical Map View</p>
         <p className="text-[8px] text-white/20 uppercase tracking-widest mt-1">Real-time Node Analysis</p>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.2}
        maxZoom={1.5}
        panOnScroll
        selectionOnDrag
      >
        <Background color="rgba(239, 68, 68, 0.05)" gap={20} size={1} />
        <Controls showInteractive={false} className="!bg-white/5 !border-white/10 !fill-white" />
      </ReactFlow>
      
      <div className="absolute bottom-8 right-8 z-20 pointer-events-none">
         <span className="font-handwriting text-white/10 text-3xl italic">ChaiCode Mapping Engine</span>
      </div>
    </motion.div>
  );
}
