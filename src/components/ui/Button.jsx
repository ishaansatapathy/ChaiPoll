import { Link } from "react-router-dom";

const variants = {
  primary: "border-white/20 bg-white text-black hover:bg-white/88",
  secondary: "border-white/12 bg-white/[0.035] text-white hover:bg-white/[0.07]",
  ghost: "border-transparent bg-transparent text-white/68 hover:text-white",
};

export function Button({ children, to, variant = "primary", className = "", …props }) {
  const classes = `inline-flex min-h-11 items-center justify-center rounded-full border px-5 text-sm font-semibold transition ${variants[variant]} ${className}`;

  if (to) {
    return (
      <Link to={to} className={classes} {…props}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {…props}>
      {children}
    </button>
  );
}
