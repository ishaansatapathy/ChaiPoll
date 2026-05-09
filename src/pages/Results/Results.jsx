import { Navbar } from "../../components/layout/Navbar.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { voteDistribution } from "../../data/mockData.js";

export default function Results() {
  const total = voteDistribution.reduce((sum, item) => sum + item.votes, 0);

  return (
    <main className="min-h-screen bg-ink-950">
      <Navbar />
      <section className="page-shell grid min-h-screen place-items-center py-28">
        <div className="w-full max-w-4xl">
          <Badge>Published results preview</Badge>
          <h1 className="mt-5 font-display text-4xl font-normal tracking-[-0.04em] text-white md:text-6xl">Final poll outcomes</h1>
          <p className="mt-5 text-white/56">Public result page skeleton for completed polls. Counts and percentages use mock data.</p>
          <Card className="mt-8">
            <div className="mb-8 flex flex-wrap justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl text-white">Which feature matters most?</h2>
                <p className="mt-2 text-sm text-white/46">{total} total votes</p>
              </div>
            </div>
            <div className="grid gap-5">
              {voteDistribution.map((item) => (
                <div key={item.name}>
                  <div className="mb-2 flex justify-between text-sm text-white/64">
                    <span>{item.name}</span>
                    <span>{item.votes} votes · {item.percentage}%</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-white/8">
                    <div className="h-full rounded-full bg-white/72" style={{ width: `${item.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}
