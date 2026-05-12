export function Badge({ children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-white/68 ${className}`}
    >
      {children}
    </span>
  );
}
