import React from "react";
import FileJobParser from "./components/FileJobParser";

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
      <FileJobParser />
    </div>
  );
}

export default App;
