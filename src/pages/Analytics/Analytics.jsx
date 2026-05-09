import { Activity } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartContainer } from "../../components/analytics/ChartContainer.jsx";
import { AnalyticsCard } from "../../components/dashboard/AnalyticsCard.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import { analyticsSummary, timelineData, voteDistribution } from "../../data/mockData.js";

export default function Analytics() {
  return (
    <section className="py-4">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.14em] text-white/38">Live analytics</p>
          <h1 className="mt-3 font-display text-4xl font-normal tracking-[-0.04em] text-white md:text-6xl">Response intelligence</h1>
        </div>
        <Badge className="gap-2"><Activity size={13} /> Socket placeholder</Badge>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {analyticsSummary.map((item) => <AnalyticsCard key={item.label} {...item} />)}
      </div>
      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <ChartContainer title="Response timeline" description="Mock realtime response activity over the last week.">
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={timelineData}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.36)" tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,0.36)" tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "#090909", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8 }} />
              <Area type="monotone" dataKey="responses" stroke="#f1f1f1" fill="rgba(255,255,255,0.16)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
        <ChartContainer title="Vote distribution" description="Question-wise option counts using placeholder data.">
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={voteDistribution}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.36)" tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,0.36)" tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "#090909", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8 }} />
              <Bar dataKey="votes" fill="rgba(255,255,255,0.72)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <ChartContainer title="Participation percentages">
          <div className="grid gap-5">
            {voteDistribution.map((item) => (
              <div key={item.name}>
                <div className="mb-2 flex justify-between text-sm text-white/58">
                  <span>{item.name}</span>
                  <span>{item.percentage}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/8">
                  <div className="h-full rounded-full bg-white/70" style={{ width: `${item.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </ChartContainer>
        <ChartContainer title="Live activity placeholder" description="Socket.IO events will stream here once the backend exists.">
          <div className="grid gap-3 text-sm text-white/54">
            <span className="rounded-lg border border-white/8 bg-white/[0.025] p-4">New response received from public link</span>
            <span className="rounded-lg border border-white/8 bg-white/[0.025] p-4">Analytics cards awaiting realtime subscription</span>
            <span className="rounded-lg border border-white/8 bg-white/[0.025] p-4">Publish-results workflow placeholder</span>
          </div>
        </ChartContainer>
      </div>
    </section>
  );
}
