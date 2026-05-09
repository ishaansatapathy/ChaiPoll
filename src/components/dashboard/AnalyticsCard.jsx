import { Card } from "../ui/Card.jsx";

export function AnalyticsCard({ label, value, detail }) {
  return (
    <Card>
      <p className="text-sm text-white/48">{label}</p>
      <strong className="mt-3 block font-display text-3xl font-medium text-white">{value}</strong>
      <span className="mt-2 block text-xs text-white/42">{detail}</span>
    </Card>
  );
}
