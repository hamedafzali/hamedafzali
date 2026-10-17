import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { startAnalytics } from "./services/analytics";

const Stats = React.lazy(() => import("./components/Stats"));
const isStats = window.location.pathname.replace(/\/+$/, "") === "/stats";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);
root.render(
  <React.StrictMode>
    {isStats ? (
      <React.Suspense fallback={null}>
        <Stats />
      </React.Suspense>
    ) : (
      <App />
    )}
  </React.StrictMode>,
);

if (!isStats) startAnalytics();
