import React from "react";
import ReactDOM from "react-dom/client";
import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";

import { messages } from "../locales/en/messages";

import App from "./App";
import "./styles.css";

i18n.load("en", messages);
i18n.activate("es");

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <I18nProvider i18n={i18n}>
      <App />
    </I18nProvider>
  </React.StrictMode>,
);
