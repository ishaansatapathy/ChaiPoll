import Home from "../pages/Home/Home.jsx";
import Auth from "../pages/Auth/Auth.jsx";
import Dashboard from "../pages/Dashboard/Dashboard.jsx";
import Settings from "../pages/Settings/Settings.jsx";
import CreatePoll from "../pages/CreatePoll/CreatePoll.jsx";
import PollView from "../pages/PollView/PollView.jsx";
import Analytics from "../pages/Analytics/Analytics.jsx";
import Results from "../pages/Results/Results.jsx";
import { AppLayout } from "../layouts/AppLayout.jsx";
import { PublicLayout } from "../layouts/PublicLayout.jsx";

export const routes = [
  {
    element: <PublicLayout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/login", element: <Auth /> },
      { path: "/signup", element: <Auth /> },
      { path: "/auth", element: <Auth /> },
      { path: "/poll/:id", element: <PollView /> },
      { path: "/results/:id", element: <Results /> },
    ],
  },
  {
    element: <AppLayout />,
    children: [
      { path: "/dashboard", element: <Dashboard /> },
      { path: "/create", element: <CreatePoll /> },
      { path: "/analytics/global", element: <Analytics /> },
      { path: "/analytics/:id", element: <Analytics /> },
      { path: "/settings", element: <Settings /> },
    ],
  },
];
