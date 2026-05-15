export function Input({ label, className = "", …props }) {
  return (
    <label className="grid gap-2 text-sm text-white/72">
      {label && <span>{label}</span>}
      <input
        className={`min-h-12 rounded-lg border border-white/10 bg-white/[0.035] px-4 text-white outline-none transition placeholder:text-white/28 focus:border-white/24 ${className}`}
        {…props}
      />
    </label>
  );
}

export function Textarea({ label, className = "", …props }) {
  return (
    <label className="grid gap-2 text-sm text-white/72">
      {label && <span>{label}</span>}
      <textarea
        className={`min-h-28 resize-none rounded-lg border border-white/10 bg-white/[0.035] px-4 py-3 text-white outline-none transition placeholder:text-white/28 focus:border-white/24 ${className}`}
        {…props}
      />
    </label>
  );
}
