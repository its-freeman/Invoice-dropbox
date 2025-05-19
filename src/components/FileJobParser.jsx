import React, { useState } from "react";
import { parseJobPdf } from "../utils/parseJobPdf";

const FileJobParser = () => {
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      const parsedJobs = await parseJobPdf(buffer);
      setJobs(parsedJobs);
      setError("");
    } catch (err) {
      console.error("Error while parsing PDF:", err);
      setError("Failed to parse the PDF. Please check the file format.");
    }
  };

  const th = {
    textAlign: "left",
    padding: "0.75rem",
    borderBottom: "2px solid #aaa",
  };

  const td = {
    padding: "0.75rem",
    verticalAlign: "top",
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "90rem", margin: "0 auto" }}>
      <h2
        style={{
          fontSize: "1.5rem",
          textAlign: "center",
          marginBottom: "1rem",
        }}
      >
        Upload Job Card
      </h2>
      <div
        /*drag and drop event */

        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files.length > 0) {
            handleFileUpload({ target: { files: e.dataTransfer.files } });
          }
        }}
        onClick={() => document.getElementById("fileInput").click()}
        style={{
          border: "2px dashed #999",
          borderRadius: "0.5rem",
          padding: "2rem",
          textAlign: "center",
          color: "#666",
          cursor: "pointer",
          marginBottom: "1.5rem",
          backgroundColor: isDragging ? "#eee" : "#fafafa",
          transition: "background 0.2s ease-in-out",
        }}
      >
        <p style={{ marginBottom: "0.5rem" }}>
          <strong>Drag and drop a PDF here</strong> or click to select one
        </p>
        <input
          type="file"
          accept=".pdf"
          id="fileInput"
          onChange={handleFileUpload}
          style={{ display: "none" }}
        />
      </div>

      {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}

      {jobs.length > 0 && (
        <div style={{ marginTop: "3rem" }}>
          {/* Order + Ref Heading */}
          <h2 style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>
            Order: {jobs[0].order}
          </h2>
          <h3 style={{ fontSize: "1.25rem", marginBottom: "1.5rem" }}>
            Reference: {jobs[0].ref}
          </h3>

          {/* Grouped Tables by Material */}
          {[...new Set(jobs.map((j) => j.material))].map((material, index) => {
            const jobsByMaterial = jobs.filter((j) => j.material === material);

            return (
              <div key={index} style={{ marginBottom: "3rem" }}>
                <h4
                  style={{
                    fontSize: "1.1rem",
                    marginBottom: "0.5rem",
                    marginTop: "1rem",
                  }}
                >
                  Material: {material}
                </h4>

                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "0.95rem",
                  }}
                >
                  <thead>
                    <tr style={{ backgroundColor: "#eaeaea" }}>
                      <th style={th}>#</th>
                      <th style={th}>Item</th>
                      <th style={th}>Quantity</th>
                      <th style={th}>Girth</th>
                      <th style={th}>Bends</th>
                      <th style={th}>Total LM</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      let lineCounter = 1;
                      return jobsByMaterial.flatMap((job, jIdx) =>
                        job.quantities.map((q, qIdx) => {
                          const lengthMM = parseFloat(q.length);
                          const totalMM =
                            !isNaN(lengthMM) && !isNaN(q.count)
                              ? lengthMM * q.count
                              : 0;
                          const totalLM = totalMM / 1000;

                          return (
                            <tr
                              key={`${jIdx}-${qIdx}`}
                              style={{ borderBottom: "1px solid #ccc" }}
                            >
                              <td style={td}>{lineCounter++}</td>
                              <td style={td}>{job.item}</td>
                              <td style={td}>
                                {q.count} x {q.length}
                              </td>
                              <td style={td}>{job.sheetWidth}</td>
                              <td style={td}>{job.bends}</td>
                              <td style={td}>{totalLM.toFixed(2)} LM</td>
                            </tr>
                          );
                        })
                      );
                    })()}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FileJobParser;
