import { Card } from "../ui/Card.jsx";

export function ChartContainer({ title, description, children }) {
  return (
    <Card className="min-h-80">
      <div className="mb-6">
        <h3 className="font-display text-xl text-white">{title}</h3>
        {description && <p className="mt-2 text-sm text-white/48">{description}</p>}
      </div>
      {children}
    </Card>
  );
}
