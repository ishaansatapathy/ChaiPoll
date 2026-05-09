import { Link, NavLink } from "react-router-dom";
import { Button } from "../ui/Button.jsx";
import { LogoMark } from "../ui/LogoMark.jsx";

export function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-30">
      <nav className="page-shell flex h-20 items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-3 font-semibold text-white">
          <LogoMark />
          <span>ChaiPoll</span>
        </Link>
        <div className="hidden items-center gap-7 text-sm font-medium text-white/58 md:flex">
          <NavLink to="/dashboard" className="hover:text-white">Dashboard</NavLink>
          <NavLink to="/create" className="hover:text-white">Create</NavLink>
          <NavLink to="/results/chai-101" className="hover:text-white">Results</NavLink>
        </div>
        <div className="flex items-center gap-3">
          <Button to="/login" variant="ghost" className="hidden sm:inline-flex">Login</Button>
          <Button to="/signup">Start free</Button>
        </div>
      </nav>
    </header>
  );
}
