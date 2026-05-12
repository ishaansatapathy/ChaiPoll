import { useEffect } from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import Lenis from "lenis";
import { useAuth } from "../context/AuthContext";

export function PublicLayout() {
  const { user, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  // If user is already logged in and trying to access auth pages, redirect to dashboard
  const authPaths = ["/login", "/signup", "/auth"];
  if (!loading && user && authPaths.includes(location.pathname)) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="bg-ink-950">
      <Outlet />
    </div>
  );
}
