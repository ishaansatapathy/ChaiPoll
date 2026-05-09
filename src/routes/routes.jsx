import Home from "../pages/Home/Home.jsx";
import Login from "../pages/Login/Login.jsx";
import Signup from "../pages/Signup/Signup.jsx";
import Dashboard from "../pages/Dashboard/Dashboard.jsx";
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
      { path: "/login", element: <Login /> },
      { path: "/signup", element: <Signup /> },
      { path: "/poll/:id", element: <PollView /> },
      { path: "/results/:id", element: <Results /> },
    ],
  },
  {
    element: <AppLayout />,
    children: [
      { path: "/dashboard", element: <Dashboard /> },
      { path: "/create", element: <CreatePoll /> },
      { path: "/analytics/:id", element: <Analytics /> },
    ],
  },
];
