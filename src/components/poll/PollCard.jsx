import { BarChart3, Clock, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "../ui/Badge.jsx";
import { Card } from "../ui/Card.jsx";

export function PollCard({ poll }) {
  return (
    <Card className="transition hover:border-white/18 hover:bg-white/[0.055]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Badge>{poll.status}</Badge>
          <h3 className="mt-4 font-display text-xl text-white">{poll.title}</h3>
          <p className="mt-2 text-sm leading-6 text-white/52">{poll.description}</p>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-3 gap-3 text-sm text-white/56">
        <span className="flex items-center gap-2"><MessageSquare size={15} />{poll.responses}</span>
        <span className="flex items-center gap-2"><BarChart3 size={15} />{poll.participation}%</span>
        <span className="flex items-center gap-2"><Clock size={15} />{poll.expiresAt}</span>
      </div>
      <div className="mt-6 flex gap-3 text-sm font-semibold">
        <Link to={`/analytics/${poll.id}`} className="text-white hover:text-white/78">Analytics</Link>
        <Link to={`/poll/${poll.id}`} className="text-white/50 hover:text-white">Public view</Link>
      </div>
    </Card>
  );
}
