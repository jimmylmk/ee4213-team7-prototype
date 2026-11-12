import { createHashRouter } from "react-router";
import { LandingPage } from "./LandingPage";
import { Dashboard } from "./components/Dashboard";

export const router = createHashRouter([
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
