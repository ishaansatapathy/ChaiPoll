import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Home, Search } from "lucide-react";
import { Highlight } from "../../components/ui/Highlight.jsx";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#020202] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_50%_50%,rgba(239,68,68,0.1),transparent_70%)]" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 max-w-lg w-full text-center"
      >
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-[40px] bg-white/5 border border-white/10 mb-8">
           <Search className="text-white/20" size={40} />
        </div>

        <h1 className="font-display text-6xl text-white mb-4 tracking-tight">
          4<span className="text-[#ef4444]">0</span>4
        </h1>
        <p className="text-[10px] uppercase tracking-[0.4em] text-white/30 font-bold mb-8">Page Not Found</p>
        
        <div className="p-8 rounded-[32px] border border-white/5 bg-white/[0.02] backdrop-blur-3xl mb-10">
          <p className="text-white/50 leading-relaxed">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <Link to="/">
          <button className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-white text-black text-xs font-bold tracking-widest hover:bg-white/90 transition-all mx-auto">
            <Home size={16} /> Go Home
          </button>
        </Link>
      </motion.div>

      <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
         <span className="font-handwriting text-white/10 text-xl">Lost in the sauce? Head back home.</span>
      </div>
    </main>
  );
}
