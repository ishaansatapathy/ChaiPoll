import Home from "../pages/Home/Home";
import Auth from "../pages/Auth/Auth";
import Dashboard from "../pages/Dashboard/Dashboard";
import Settings from "../pages/Settings/Settings";
import CreatePoll from "../pages/CreatePoll/CreatePoll";
import PollView from "../pages/PollView/PollView";
import Analytics from "../pages/Analytics/Analytics";
import Results from "../pages/Results/Results";
import AdminDashboard from "../pages/AdminDashboard/AdminDashboard";
import NotFound from "../pages/NotFound/NotFound";
import ResetPassword from "../pages/Auth/ResetPassword";
import VerifyEmail from "../pages/Auth/VerifyEmail";
import { AppLayout } from "../layouts/AppLayout";
import { PublicLayout } from "../layouts/PublicLayout";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import AdminRoute from "../components/auth/AdminRoute";

export const routes = [
  {
    element: <PublicLayout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/login", element: <Auth /> },
      { path: "/signup", element: <Auth /> },
      { path: "/auth", element: <Auth /> },
      { path: "/reset-password/:token", element: <ResetPassword /> },
      { path: "/verify-email/:token", element: <VerifyEmail /> },
      { path: "/poll/:id", element: <PollView /> },
      { path: "/results/:id", element: <Results /> },
      { path: "*", element: <NotFound /> },
    ],
  },
  {
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: "/dashboard", element: <Dashboard /> },
      { path: "/create", element: <CreatePoll /> },
      { path: "/analytics/global", element: <Analytics /> },
      { path: "/analytics/:id", element: <Analytics /> },
      { path: "/settings", element: <Settings /> },
      {
        path: "/admin",
        element: (
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        ),
      },
    ],
  },
];
