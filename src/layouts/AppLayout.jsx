import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/layout/Sidebar.jsx";
import { MobileNav } from "../components/layout/MobileNav.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export function AppLayout() {
  useAuth();

  return (
    <div className="min-h-screen bg-ink-950">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.08),transparent_34%)]" />
      <div className="relative flex flex-col lg:flex-row">
        <Sidebar />
        <main className="min-h-screen flex-1 px-4 sm:px-6 lg:px-8 pb-32 lg:pb-10 pt-10">
          <div className="mx-auto max-w-7xl relative">
            <Outlet />
          </div>
        </main>
        <MobileNav />
      </div>
    </div>
  );
}
