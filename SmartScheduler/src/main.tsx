/// main.tsx
/// Entry point for the React application.
/// Sets up the Redux provider and renders the App component.
/// Inputs: None
/// Outputs: Renders the React application to the DOM.
/// Authors: Micheal Buckendahl
/// Creation Date: 10/24/2025

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { store } from "./redux/store.ts";
import { Provider } from "react-redux";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>
);
