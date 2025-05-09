import React from "react";
import FileJobParser from "./components/FileJobParser";
import PriceEditor from "./components/PriceEditor";

function App() {
  return (
    <div
      style={{
        padding: "2rem",
        maxWidth: "100%",
        width: "90rem",
        margin: "0 auto",
      }}
    >
      <h1 style={{ fontSize: "2.5rem", marginBottom: "2rem" }}>
        PDF Job Parser Tool
      </h1>

      {/* Job Parser */}
      <FileJobParser />

      <hr style={{ margin: "4rem 0", borderColor: "#ccc" }} />
      <div
        style={{
          position: "absolute",
          top: "1rem",
          right: "1rem",
          opacity: 0.2,
          transition: "opacity 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = 0.2)}
      >
        <a
          href="/pricing"
          style={{
            textDecoration: "none",
            background: "#333",
            color: "#fff",
            padding: "0.5rem 1rem",
            borderRadius: "0.5rem",
            fontSize: "0.875rem",
          }}
        >
          Pricing Admin
        </a>
      </div>
    </div>
  );
}

export default App;
