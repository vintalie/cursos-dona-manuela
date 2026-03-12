import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./services/push.debug";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {});
  });
}

createRoot(document.getElementById("root")!).render(<App />);
