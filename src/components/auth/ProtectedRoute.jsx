import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-ink-950 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="animate-spin text-[#ef4444]" size={32} strokeWidth={1.5} />
          <p className="text-[10px] uppercase tracking-[0.4em] text-white/30 font-bold">
            Loading...
          </p>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}
