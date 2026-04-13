/**
 * Application Entry Point
 * 
 * Initializes the React application with:
 * - StrictMode for development warnings
 * - Global styles import
 * - Root component mounting
 */

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/globals.css";

// Mount the React application to the DOM
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
