import React, { useState, useEffect } from "react";
import { socket } from "../../socket";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, ZapOff } from "lucide-react";

export default function SocketStatus() {
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  return (
    <div className="fixed bottom-8 left-8 z-[100] pointer-events-none">
      <AnimatePresence mode="wait">
        {isConnected ? (
          <motion.div
            key="online"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex items-center gap-3 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-xl"
          >
            <div className="relative flex size-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full size-2 bg-emerald-500"></span>
            </div>
            <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">
              Live Sync Active
            </span>
          </motion.div>
        ) : (
          <motion.div
            key="offline"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex items-center gap-3 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 backdrop-blur-xl"
          >
            <ZapOff className="text-red-400 animate-pulse" size={12} />
            <span className="text-[9px] font-bold text-red-400 uppercase tracking-widest">
              Offline - Reconnecting
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
