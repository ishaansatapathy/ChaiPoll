export function Card({ children, className = "" }) {
  return <div className={`surface rounded-xl p-5 ${className}`}>{children}</div>;
}
