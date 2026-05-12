import Home from "../pages/Home/Home.jsx";
import Auth from "../pages/Auth/Auth.jsx";
import Dashboard from "../pages/Dashboard/Dashboard.jsx";
import Settings from "../pages/Settings/Settings.jsx";
import CreatePoll from "../pages/CreatePoll/CreatePoll.jsx";
import PollView from "../pages/PollView/PollView.jsx";
import Analytics from "../pages/Analytics/Analytics.jsx";
import Results from "../pages/Results/Results.jsx";
import AdminDashboard from "../pages/AdminDashboard/AdminDashboard.jsx";
import NotFound from "../pages/NotFound/NotFound.jsx";
import ResetPassword from "../pages/Auth/ResetPassword.jsx";
import VerifyEmail from "../pages/Auth/VerifyEmail.jsx";
import { AppLayout } from "../layouts/AppLayout.jsx";
import { PublicLayout } from "../layouts/PublicLayout.jsx";
import ProtectedRoute from "../components/auth/ProtectedRoute.jsx";

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
      { path: "/admin", element: <AdminDashboard /> },
    ],
  },
];
