import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/layout/Sidebar.jsx";

export function AppLayout() {
  return (
    <div className="min-h-screen bg-ink-950">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.08),transparent_34%)]" />
      <div className="relative flex">
        <Sidebar />
        <main className="min-h-screen flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
