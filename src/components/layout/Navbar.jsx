import { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Button } from "../ui/Button.jsx";
import { CinematicLogo } from "../ui/CinematicLogo.jsx";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();

  useEffect(() => {
    const unsubscribe = scrollY.on("change", (latest) => {
      setIsScrolled(latest > 50);
    });
    return () => unsubscribe();
  }, [scrollY]);

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "circOut" }}
      className="fixed inset-x-0 top-0 z-50 flex justify-center py-6 pointer-events-none"
    >
      <motion.nav
        animate={{
          width: isScrolled ? "90%" : "95%",
          y: isScrolled ? 0 : 0,
        }}
        className="pointer-events-auto flex items-center justify-between px-6 py-3 max-w-7xl w-full"
      >
        {/* Left: Logo */}
        <Link to="/" className="pointer-events-auto transition-opacity hover:opacity-80">
          <CinematicLogo size={48} />
        </Link>

        {/* Center: Floating Capsule */}
        <div className="hidden md:block">
          <div className="flex items-center gap-1 rounded-full border border-white/5 bg-white/[0.03] p-1 backdrop-blur-md shadow-2xl">
            <NavItem to="/dashboard">Dashboard</NavItem>
            <NavItem to="/create">Create</NavItem>
            <NavItem to="/results/chai-101">Results</NavItem>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          <Link 
            to="/login" 
            className="hidden sm:block text-xs font-medium uppercase tracking-widest text-white/50 hover:text-white transition-colors"
          >
            Login
          </Link>
          <Button 
            to="/signup" 
            className="h-9 px-5 text-[11px] uppercase tracking-[0.15em] font-bold bg-white text-black hover:bg-white/90 border-none rounded-full"
          >
            Start free
          </Button>
        </div>
      </motion.nav>
    </motion.header>
  );
}

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `
        relative px-6 py-2 text-[11px] uppercase tracking-[0.15em] font-bold transition-all duration-300 rounded-full
        ${isActive ? "text-white bg-white/10" : "text-white/40 hover:text-white/70 hover:bg-white/[0.02]"}
      `}
    >
      {children}
    </NavLink>
  );
}
