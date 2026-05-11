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
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="relative group overflow-hidden"
        >
          {/* Tactical Border Animation */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#ef4444]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="surface rounded-2xl border border-white/5 bg-white/[0.01] p-5 flex items-center gap-6 backdrop-blur-xl relative z-10">
            {/* Avatar with Status Ring */}
            <div className="relative">
               <div className="absolute -inset-1 bg-[#ef4444] rounded-full blur-[2px] opacity-20 group-hover:opacity-40 transition-opacity" />
               {vote.voterId?.avatar ? (
                  <img src={vote.voterId.avatar} className="relative h-14 w-14 rounded-full border-2 border-white/10 object-cover p-0.5" alt="Voter" />
               ) : (
                  <div className="relative h-14 w-14 rounded-full bg-white/5 flex items-center justify-center border-2 border-white/10">
                     <User className="text-white/20" size={24} />
                  </div>
               )}
               <div className="absolute bottom-0 right-0 h-3 w-3 bg-emerald-500 rounded-full border-2 border-[#020202] shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            </div>

            {/* Info Section */}
            <div className="flex-1 min-w-0">
               <div className="flex items-center gap-3 mb-1">
                  <h4 className="text-white font-display text-lg tracking-tight truncate">
                     {vote.voterId?.callsign || vote.voterId?.name || "ANONYMOUS AGENT"}
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[8px] font-black text-white/40 uppercase tracking-tighter">Verified Participation</span>
               </div>
               <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-bold">
                  {vote.voterId?.email || "Encrypted Signal Intercepted"}
               </p>
            </div>

            {/* Response Sector */}
            <div className="hidden sm:block text-right px-8 border-x border-white/5">
               <p className="text-[9px] uppercase tracking-widest text-[#ef4444] font-black mb-1">Response Sector</p>
               <p className="text-sm text-white font-medium flex items-center justify-end gap-2">
                  <Target size={14} className="text-white/20" /> Captured
               </p>
            </div>

            {/* Timestamp */}
            <div className="flex flex-col items-end min-w-[100px]">
               <div className="flex items-center gap-2 text-white">
                  <Clock size={12} className="text-[#ef4444]" />
                  <span className="text-[11px] font-bold uppercase tracking-widest">
                     {new Date(vote.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
               </div>
               <p className="text-[9px] text-white/20 mt-1 uppercase font-black tracking-tighter">{new Date(vote.createdAt).toLocaleDateString()}</p>
            </div>
            
            <ChevronRight className="text-white/10 group-hover:text-white/40 transition-colors" size={20} />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
