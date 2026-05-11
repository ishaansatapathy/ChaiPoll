import React from 'react';
import { motion } from 'framer-motion';
import { User, Clock, ChevronRight } from 'lucide-react';

export default function ParticipantList({ votes }) {
  if (!votes || votes.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-white/20 italic font-handwriting text-xl">No participant data has been intercepted yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {votes.map((vote, i) => (
        <motion.div 
          key={vote._id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="surface rounded-2xl border border-white/5 bg-white/[0.01] p-5 flex items-center gap-6 group hover:bg-white/[0.03] hover:border-white/10 transition-all"
        >
          {/* Avatar / Rank */}
          <div className="relative">
             <div className="absolute -inset-1 bg-gradient-to-tr from-[#ef4444] to-[#ff6b6b] rounded-full blur opacity-0 group-hover:opacity-20 transition duration-500" />
             {vote.voterId?.avatar ? (
                <img src={vote.voterId.avatar} className="relative h-12 w-12 rounded-full border border-white/10 object-cover" alt="Voter" />
             ) : (
                <div className="relative h-12 w-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                   <User className="text-white/20" size={20} />
                </div>
             )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
             <h4 className="text-white font-bold truncate">
                {vote.voterId?.callsign || vote.voterId?.name || "ANONYMOUS AGENT"}
             </h4>
             <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">
                {vote.voterId?.email || "Encrypted Signal"}
             </p>
          </div>

          {/* Choice */}
          <div className="text-right">
             <p className="text-[10px] uppercase tracking-widest text-[#ef4444] font-black mb-1">Response Sector</p>
             <p className="text-sm text-white/70 font-medium">
                {vote.responses?.[0]?.selectedOptionId ? "Captured" : "Unknown"}
             </p>
          </div>

          <div className="hidden md:flex flex-col items-end pl-6 border-l border-white/5 ml-4">
             <div className="flex items-center gap-2 text-white/20">
                <Clock size={12} />
                <span className="text-[10px] font-bold uppercase tracking-tighter">
                   {new Date(vote.createdAt).toLocaleTimeString()}
                </span>
             </div>
             <p className="text-[10px] text-white/10 mt-1 uppercase font-bold">{new Date(vote.createdAt).toLocaleDateString()}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
