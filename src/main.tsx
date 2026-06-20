import App from "@/App";
import { ErrorBoundary, SwUpdatePrompt } from "@/components/system";
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
