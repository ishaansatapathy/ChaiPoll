import { BarChart3, Clock, Share2, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Badge } from "../ui/Badge.jsx";
import { Card } from "../ui/Card.jsx";
import { ShareModal } from "../share/ShareModal.jsx";

export function PollCard({ poll }) {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const status = poll.isActive ? "Active" : "Closed";
  const badgeVariant = poll.isActive ? "success" : "neutral";

  const expiryText = poll.expiresAt 
    ? new Date(poll.expiresAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : "No expiry";

  return (
    <>
      <Card className="transition hover:border-white/20 hover:bg-white/[0.04]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Badge variant={badgeVariant}>{status}</Badge>
            <h3 className="mt-4 font-display text-xl text-white line-clamp-1">{poll.title}</h3>
            {poll.description && (
              <p className="mt-2 text-sm leading-6 text-white/50 line-clamp-2">{poll.description}</p>
            )}
          </div>
          <button 
            onClick={() => setIsShareModalOpen(true)}
            className="rounded-full bg-white/5 p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
            title="Share Poll"
          >
            <Share2 size={16} />
          </button>
        </div>
        <div className="mt-6 flex flex-wrap gap-4 text-sm text-white/50">
          <span className="flex items-center gap-2"><BarChart3 size={15} />{poll.totalParticipants || 0} Votes</span>
          <span className="flex items-center gap-2"><Clock size={15} />{expiryText}</span>
          <span className="flex items-center gap-2"><Eye size={15} className={poll.visibility === 'public' ? 'text-emerald-400' : 'text-amber-400'} />{poll.visibility}</span>
        </div>
        <div className="mt-6 flex gap-4 text-sm font-medium">
          <Link to={`/results/${poll.pollCode}`} className="text-white transition hover:text-white/80">View Results</Link>
          <Link to={`/poll/${poll.pollCode}`} className="text-white/40 transition hover:text-white">Preview Form</Link>
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
