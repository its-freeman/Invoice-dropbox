import React, { useState, useEffect } from "react";
import pricingMatrix from "../data/pricingMatrix";

const PriceEditor = () => {
  const [selectedMaterial, setSelectedMaterial] = useState(
    Object.keys(pricingMatrix)[0]
  );
  const [localMatrix, setLocalMatrix] = useState(() => {
    const saved = localStorage.getItem("pricingMatrix");
    return saved
      ? JSON.parse(saved)
      : JSON.parse(JSON.stringify(pricingMatrix));
  });

  useEffect(() => {
    localStorage.setItem("pricingMatrix", JSON.stringify(localMatrix));
  }, [localMatrix]);

  const [newMaterialName, setNewMaterialName] = useState("");
  const [chunkedView, setChunkedView] = useState(() => {
    const saved = localStorage.getItem("chunkedView");
    return saved === null ? true : JSON.parse(saved);
  });
  const material = localMatrix[selectedMaterial];

  const handlePriceChange = (girth, fold, value) => {
    const updated = { ...localMatrix };
    updated[selectedMaterial].rates[girth][fold] = parseFloat(value) || 0;
    setLocalMatrix(updated);
  };

  const applyBulkIncrease = (percent) => {
    const updated = { ...localMatrix };
    const rates = updated[selectedMaterial].rates;
    for (let girth in rates) {
      for (let fold in rates[girth]) {
        rates[girth][fold] = +(
          rates[girth][fold] *
          (1 + percent / 100)
        ).toFixed(2);
      }
    }
    setLocalMatrix(updated);
  };

  const addNewMaterial = () => {
    if (!newMaterialName.trim()) return;

    const girths = Array.from({ length: 1200 }, (_, i) => `${i + 1}`);
    const defaultFolds = Array.from({ length: 10 }, (_, i) => i + 1);
    const newRates = {};

    girths.forEach((g) => {
      newRates[g] = {};
      defaultFolds.forEach((f) => {
        newRates[g][f] = 0;
      });
    });

    const updated = {
      ...localMatrix,
      [newMaterialName]: {
        baseRateMultiplier: 1,
        folds: defaultFolds,
        rates: newRates,
      },
    };

    setLocalMatrix(updated);
    setSelectedMaterial(newMaterialName);
    setNewMaterialName("");
  };

  const materialOptions = Object.keys(localMatrix);
  const addNewFold = () => {
    const updated = { ...localMatrix };
    const material = updated[selectedMaterial];
    const nextFold = Math.max(...material.folds) + 1;
    material.folds.push(nextFold);

    for (let girth in material.rates) {
      material.rates[girth][nextFold] = 0;
    }

    setLocalMatrix(updated);
  };

  const removeLastFold = () => {
    const updated = { ...localMatrix };
    const material = updated[selectedMaterial];

    if (material.folds.length <= 1) return; // prevent removing all folds

    const lastFold = material.folds[material.folds.length - 1];
    material.folds.pop();

    for (let girth in material.rates) {
      delete material.rates[girth][lastFold];
    }

    setLocalMatrix(updated);
  };
  const deleteSelectedMaterial = () => {
    if (
      !window.confirm(`Are you sure you want to delete "${selectedMaterial}"?`)
    )
      return;

    const updated = { ...localMatrix };
    delete updated[selectedMaterial];

    const remainingMaterials = Object.keys(updated);
    const newSelected =
      remainingMaterials.length > 0 ? remainingMaterials[0] : null;

    setLocalMatrix(updated);
    setSelectedMaterial(newSelected);
  };

  return (
    <div
      style={{
        padding: "2rem",
        width: "100%",
        maxWidth: "100%",
        margin: "0 auto",
      }}
    >
      <h2 style={{ marginBottom: "1rem" }}>Material Pricing Editor</h2>

      {/* Add New Material */}
      <div style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="New Material Name"
          value={newMaterialName}
          onChange={(e) => setNewMaterialName(e.target.value)}
          style={{
            padding: "0.5rem",
            fontSize: "1rem",
            width: "20rem",
            marginRight: "1rem",
          }}
        />
        <button
          onClick={addNewMaterial}
          style={{
            backgroundColor: "#007bff",
            color: "#fff",
            padding: "0.5rem 1rem",
            borderRadius: "0.5rem",
            border: "none",
            cursor: "pointer",
          }}
        >
          Add Material
        </button>
      </div>

      {/* Material Selector */}
      <select
        value={selectedMaterial}
        onChange={(e) => setSelectedMaterial(e.target.value)}
        style={{ padding: "1rem", fontSize: "1rem", marginBottom: "1rem" }}
      >
        {materialOptions.map((mat) => (
          <option key={mat} value={mat}>
            {mat}
          </option>
        ))}
      </select>

      {/* Bulk % Increase */}
      <button
        onClick={() => applyBulkIncrease(5)}
        style={{
          marginLeft: "1rem",
          backgroundColor: "#28a745",
          color: "#fff",
          padding: "0.5rem 1rem",
          borderRadius: "0.5rem",
          border: "none",
          cursor: "pointer",
        }}
      >
        +5% All Rates
      </button>
      {/*Add-remove Fold Button*/}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          marginLeft: "1rem",
          backgroundColor: "#f1f1f1",
          borderRadius: "0.5rem",
          padding: "0.25rem 0.5rem",
        }}
      >
        <button
          onClick={removeLastFold}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#dc3545", // or #28a745 for +
            color: "#fff",
            border: "none",
            borderRadius: "0.25rem",
            width: "2rem",
            height: "2rem",
            fontWeight: "bold",
            fontSize: "1.2rem",
            lineHeight: "1",
            padding: "0",
            cursor: "pointer",
          }}
        >
          −
        </button>
        <span style={{ fontSize: "0.95rem", fontWeight: "500" }}>
          Fold Count
        </span>
        <button
          onClick={addNewFold}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#28a745",
            color: "#fff",
            border: "none",
            borderRadius: "0.25rem",
            width: "2rem",
            height: "2rem",
            fontWeight: "bold",
            fontSize: "1.2rem",
            lineHeight: "1",
            padding: "0",
            cursor: "pointer",
          }}
        >
          +
        </button>
      </div>
      {/*Delete Material Button*/}
      <button
        onClick={deleteSelectedMaterial}
        style={{
          marginLeft: "1rem",
          backgroundColor: "#ff4d4f",
          color: "#fff",
          padding: "0.5rem 1rem",
          borderRadius: "0.5rem",
          border: "none",
          cursor: "pointer",
        }}
        disabled={!selectedMaterial}
      >
        Delete Material
      </button>

      {/* Pricing Table Chunked view*/}
      <div
        style={{
          width: "100%",
          maxWidth: "100%",
          overflowX: "hidden",
          marginTop: "1rem",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            tableLayout: "fixed", // KEY: enables column auto-shrink
          }}
        >
          {/* thead + tbody */}
        </table>
      </div>

      <div
        style={{
          overflowX: "auto",
          maxWidth: "100%",
          width: "100%",
          marginTop: "2rem",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            minWidth: "100%",
          }}
        >
          {/* thead + tbody stay as-is */}
        </table>
      </div>

      {material ? (
        <table
          style={{
            marginTop: "2rem",
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr>
              <th style={{ ...thStyle, width: "7rem", minWidth: "7rem" }}>
                Girth
              </th>

              {material.folds.map((fold) => (
                <th key={fold} style={thStyle}>
                  {fold} Fold
                </th>
              ))}
              <th style={{ ...thStyle, textAlign: "right" }} colSpan="2">
                <label style={{ fontSize: "0.85rem", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={chunkedView}
                    onChange={(e) => {
                      const newValue = e.target.checked;
                      setChunkedView(newValue);
                      localStorage.setItem(
                        "chunkedView",
                        JSON.stringify(newValue)
                      );
                    }}
                    style={{ marginRight: "0.5rem", cursor: "pointer" }}
                  />
                  Chunked View
                </label>
              </th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(material.rates)
              .filter(([girth]) => {
                if (chunkedView) return parseInt(girth) % 100 === 0;
                return true;
              })
              .map(([girth, folds]) => (
                <tr key={girth}>
                  <td style={{ ...tdStyle, width: "7rem", minWidth: "7rem" }}>
                    {girth} mm
                  </td>

                  {material.folds.map((fold) => (
                    <td key={fold} style={tdStyle}>
                      <input
                        type="number"
                        value={folds[fold] ?? 0}
                        onChange={(e) =>
                          handlePriceChange(girth, fold, e.target.value)
                        }
                        style={{
                          width: "6rem",
                          padding: "0.4rem",
                          borderRadius: "0.25rem",
                          border: "1px solid #ccc",
                        }}
                      />
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      ) : (
        <p style={{ marginTop: "2rem", fontSize: "1.1rem", color: "#555" }}>
          No materials available. Please add a new material to begin.
        </p>
      )}
    </div>
  );
};

const thStyle = {
  padding: "0.75rem",
  backgroundColor: "#eaeaea",
  borderBottom: "2px solid #ccc",
  textAlign: "left",
  overflow: "hidden",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
};

const tdStyle = {
  padding: "0.75rem",
  borderBottom: "1px solid #ddd",
  overflow: "hidden",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
};

export default PriceEditor;
