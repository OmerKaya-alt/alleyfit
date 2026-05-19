import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import LenisProvider from "./components/motion/LenisProvider";
import { LangProvider } from "./lib/lang";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <LangProvider>
        <LenisProvider>
          <App />
        </LenisProvider>
      </LangProvider>
    </BrowserRouter>
  </React.StrictMode>
);
