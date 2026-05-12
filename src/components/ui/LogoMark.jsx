export function LogoMark({ className = "" }) {
  return (
    <span
      className={`flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border border-white/14 bg-gradient-to-br from-white to-white/90 ${className}`}
    >
      <svg viewBox="0 0 40 40" className="h-6 w-6" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Tea cup silhouette with poll bars */}
        <defs>
          <linearGradient id="cupGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: "#020202", stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: "#111113", stopOpacity: 1 }} />
          </linearGradient>
        </defs>

        {/* Tea cup body */}
        <path
          d="M 8 12 L 10 28 Q 10 32 14 32 L 26 32 Q 30 32 30 28 L 32 12 Z"
          fill="url(#cupGradient)"
          stroke="#020202"
          strokeWidth="0.5"
        />

        {/* Cup rim highlight */}
        <line x1="8" y1="12" x2="32" y2="12" stroke="#020202" strokeWidth="1.5" opacity="0.3" />

        {/* Poll bars inside cup - representing voting */}
        <g opacity="0.9">
          <rect x="12" y="16" width="3" height="10" fill="white" rx="1" />
          <rect x="17" y="14" width="3" height="12" fill="white" rx="1" />
          <rect x="22" y="18" width="3" height="8" fill="white" rx="1" />
        </g>

        {/* Tea handle */}
        <path
          d="M 32 16 Q 36 16 36 22 Q 36 28 32 28"
          stroke="#020202"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />

        {/* Steam effect - checkmark */}
        <g opacity="0.7">
          <path
            d="M 16 8 Q 18 4 20 6"
            stroke="#020202"
            strokeWidth="1.2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    </span>
  );
}
