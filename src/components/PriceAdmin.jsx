import React from "react";
import PriceEditor from "./PriceEditor";

const PriceAdmin = () => {
  return (
    <div
      style={{
        padding: "2rem",
        maxWidth: "100%",
        width: "90rem",
        margin: "0 auto",
      }}
    >
      {/* Top-right Return Button */}
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
          href="/"
          style={{
            textDecoration: "none",
            background: "#333",
            color: "#fff",
            padding: "0.5rem 1rem",
            borderRadius: "0.5rem",
            fontSize: "0.875rem",
          }}
        >
          Back to Job Parser
        </a>
      </div>

      {/* Heading + Editor */}
      <h1 style={{ fontSize: "2rem", marginBottom: "2rem" }}>
        Manage Pricing Lists
      </h1>
      <PriceEditor />
    </div>
  );
};

export default PriceAdmin;
