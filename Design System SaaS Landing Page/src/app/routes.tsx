import { createBrowserRouter } from "react-router";
import { LandingPage } from "./LandingPage";
import { Dashboard } from "./components/Dashboard";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/dashboard",
    Component: Dashboard,
  },
  {
    path: "*",
    Component: LandingPage,
  },
]);
