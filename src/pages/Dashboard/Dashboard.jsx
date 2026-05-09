import { Plus } from "lucide-react";
import { AnalyticsCard } from "../../components/dashboard/AnalyticsCard.jsx";
import { PollCard } from "../../components/poll/PollCard.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { analyticsSummary, mockPolls } from "../../data/mockData.js";

export default function Dashboard() {
  return (
    <section className="py-4">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.14em] text-white/38">Creator dashboard</p>
          <h1 className="mt-3 font-display text-4xl font-normal tracking-[-0.04em] text-white md:text-6xl">Poll command center</h1>
        </div>
        <Button to="/create" className="gap-2"><Plus size={16} /> New poll</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {analyticsSummary.map((item) => <AnalyticsCard key={item.label} {...item} />)}
      </div>
      <div className="mt-8 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <h2 className="mb-4 font-display text-2xl text-white">Recent polls</h2>
          <div className="grid gap-4">
            {mockPolls.map((poll) => <PollCard key={poll.id} poll={poll} />)}
          </div>
        </div>
        <div className="surface rounded-xl p-5">
          <h2 className="font-display text-2xl text-white">Participation pulse</h2>
          <div className="mt-6 grid gap-5">
            {mockPolls.map((poll) => (
              <div key={poll.id}>
                <div className="mb-2 flex justify-between text-sm text-white/58">
                  <span>{poll.title}</span>
                  <span>{poll.participation}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/8">
                  <div className="h-full rounded-full bg-white/70" style={{ width: `${poll.participation}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
