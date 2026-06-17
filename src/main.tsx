import App from "@/App";
import { ErrorBoundary } from "@/components/system/ErrorBoundary";
import { SwUpdatePrompt } from "@/components/system/SwUpdatePrompt";
import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";

import "./styles/index.css";

ReactDOM.createRoot(document.querySelector("#root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <HashRouter>
        <App />
      </HashRouter>
      <SwUpdatePrompt />
    </ErrorBoundary>
  </React.StrictMode>,
);
