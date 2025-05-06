import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import PriceAdmin from "./components/PriceAdmin.jsx"; // make sure this file exists

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/pricing" element={<PriceAdmin />} />
      </Routes>
    </Router>
  </StrictMode>
);
