import { FileQuestion } from "lucide-react";
import { Button } from "./Button.jsx";

export function EmptyState({ title, description, actionLabel, actionTo }) {
  return (
    <div className="surface grid place-items-center rounded-xl px-6 py-14 text-center">
      <div className="mb-5 grid h-12 w-12 place-items-center rounded-lg border border-white/10 bg-white/[0.04]">
        <FileQuestion size={20} className="text-white/70" />
      </div>
      <h3 className="font-display text-2xl text-white">{title}</h3>
      <p className="mt-3 max-w-md text-sm leading-6 text-white/54">{description}</p>
      {actionLabel && (
        <Button to={actionTo} className="mt-6">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
