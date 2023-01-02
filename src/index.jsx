import React from "react";
import { createRoot } from "react-dom/client";
import App from "https://khskhs6991.github.io/yolo_react/src/App.jsx";
import "https://khskhs6991.github.io/yolo_react/src/style/index.css";

const root = createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
