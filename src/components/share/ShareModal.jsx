import { QRCodeSVG } from "qrcode.react";
import { Copy, X, Check } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const ShareModal = ({ isOpen, onClose, pollCode }) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/poll/${pollCode}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a] shadow-2xl"
          >
            <div className="p-6 pb-0">
              <button
                onClick={onClose}
                className="absolute right-4 top-4 rounded-full p-2 text-white/40 transition hover:bg-white/10 hover:text-white"
              >
                <X size={20} />
              </button>
              <h2 className="font-display text-2xl text-white">Share Poll</h2>
              <p className="mt-2 text-sm text-white/50">
                Scan the QR code or copy the link below to invite participants.
              </p>
            </div>

            <div className="p-6">
              <div className="mx-auto mb-6 flex aspect-square max-w-[200px] items-center justify-center rounded-xl bg-white p-4">
                <QRCodeSVG
                  value={shareUrl}
                  size={168}
                  bgColor={"#ffffff"}
                  fgColor={"#000000"}
                  level={"Q"}
                  includeMargin={false}
                />
              </div>

              <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-2">
                <div className="flex-1 overflow-hidden px-2">
                  <p className="truncate text-sm font-mono text-white/70">{shareUrl}</p>
                </div>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center justify-center rounded-md bg-white/10 p-2 text-white transition hover:bg-white/20"
                >
                  {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
