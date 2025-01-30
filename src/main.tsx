import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { Application } from "./Application";

const element = document.getElementById("app-root");
const root = createRoot(element!);

root.render(
  <StrictMode>
    <Application />
  </StrictMode>,
);
