/**
 * Application Entry Point
 *
 * Initializes Sentry (before anything else), then mounts the React app.
 */

import React from "react";
import ReactDOM from "react-dom/client";
import { initSentry } from "@/lib/sentry";
import App from "./App";
import "./styles/globals.css";

// Sentry must init before the React tree is created
initSentry();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
