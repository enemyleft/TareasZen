import React from "react";
import ReactDOM from "react-dom/client";
import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";

import { messages as enMessages } from "../locales/en/messages";
import { messages as esMessages } from "../locales/es/messages";

import App from "./App";
import "./styles.css";

i18n.load("en", enMessages);
i18n.load("es", esMessages);
i18n.activate("es");

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <I18nProvider i18n={i18n}>
      <App />
    </I18nProvider>
  </React.StrictMode>,
);
