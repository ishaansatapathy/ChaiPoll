import { BarChart3, Clock, Share2, Eye, Trash2, PieChart } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Badge } from "../ui/Badge.jsx";
import { Card } from "../ui/Card.jsx";
import { ShareModal } from "../share/ShareModal.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { deletePoll } from "../../services/api.js";

export function PollCard({ poll, onDeleteSuccess }) {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { user } = useAuth();

  const isOwner = user && (user._id === poll.createdBy || user._id === poll.createdBy?._id);

  const status = poll.isActive ? "Active" : "Closed";
  const badgeVariant = poll.isActive ? "success" : "neutral";

  const expiryText = poll.expiresAt
    ? new Date(poll.expiresAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "No expiry";

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this poll? This action cannot be undone."))
      return;
    setDeleting(true);
    try {
      await deletePoll(poll.pollCode);
      if (onDeleteSuccess) onDeleteSuccess(poll.pollCode);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete poll");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Card
        className={`transition duration-500 hover:border-white/20 hover:bg-white/[0.04] ${deleting ? "opacity-50 grayscale pointer-events-none" : ""}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant={badgeVariant}>{status}</Badge>
              {poll.settings?.isPublished && <Badge variant="warning">Results Published</Badge>}
            </div>
            <h3 className="mt-4 font-display text-xl text-white line-clamp-1">{poll.title}</h3>
            {poll.description && (
              <p className="mt-2 text-sm leading-6 text-white/50 line-clamp-2">
                {poll.description}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="rounded-full bg-white/5 p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
              title="Share Poll"
            >
              <Share2 size={16} />
            </button>
            {isOwner && (
              <button
                onClick={handleDelete}
                className="rounded-full bg-white/5 p-2 text-white/20 transition hover:bg-red-500/20 hover:text-red-500"
                title="Delete Poll"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-4 text-sm text-white/50">
          <span className="flex items-center gap-2">
            <BarChart3 size={15} />
            {poll.totalParticipants || 0} Votes
          </span>
          <span className="flex items-center gap-2">
            <Clock size={15} />
            {expiryText}
          </span>
          <span className="flex items-center gap-2">
            <Eye
              size={15}
              className={poll.visibility === "public" ? "text-emerald-400" : "text-amber-400"}
            />
            {poll.visibility}
          </span>
        </div>
        <div className="mt-6 pt-6 border-t border-white/5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest">
            <Link
              to={`/results/${poll.pollCode}`}
              className="text-white hover:text-[#ef4444] transition-colors"
            >
              Results
            </Link>
            <Link
              to={`/poll/${poll.pollCode}`}
              className="text-white/40 hover:text-white transition-colors"
            >
              Form Preview
            </Link>
          </div>
          {isOwner && (
            <Link
              to={`/analytics/${poll.pollCode}`}
              className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#ef4444] hover:text-[#ff5555] transition-colors"
            >
              <PieChart size={14} /> Analytics Dashboard
            </Link>
          )}
        </div>
      </Card>

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        pollCode={poll.pollCode}
      />
    </>
  );
}
