import React, { useState, useEffect } from "react";
import pricingMatrix from "../data/pricingMatrix";
import {
  spanGirthPricesToMax,
  applyFoldMultipliers,
} from "../utils/pricingTools";

const PriceEditor = () => {
  const [priceAt100, setPriceAt100] = useState("");
  const [priceAt1200, setPriceAt1200] = useState("");
  const [foldPrice, setFoldPrice] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState(
    Object.keys(pricingMatrix)[0]
  );
  const [localMatrix, setLocalMatrix] = useState(() => {
    const saved = localStorage.getItem("pricingMatrix");
    return saved
      ? JSON.parse(saved)
      : JSON.parse(JSON.stringify(pricingMatrix));
  });
  const [foldChunkedView, setFoldChunkedView] = useState(() => {
    const saved = localStorage.getItem("foldChunkedView");
    return saved === null ? false : JSON.parse(saved);
  });
  const [newMaterialName, setNewMaterialName] = useState("");
  const [chunkedView, setChunkedView] = useState(() => {
    const saved = localStorage.getItem("chunkedView");
    return saved === null ? true : JSON.parse(saved);
  });

  useEffect(() => {
    localStorage.setItem("pricingMatrix", JSON.stringify(localMatrix));
  }, [localMatrix]);

  const handleSpanPrices = () => {
    const end = parseFloat(priceAt1200);
    if (isNaN(end)) return;

    const updated = { ...localMatrix };
    const folds = updated[selectedMaterial].folds;

    updated[selectedMaterial].rates = spanGirthPricesToMax(end, 1200, folds);
    setLocalMatrix(updated);
  };

  const handleApplyFolds = () => {
    const foldVal = parseFloat(foldPrice);
    if (isNaN(foldVal)) return;

    const updated = { ...localMatrix };
    const folds = updated[selectedMaterial].folds;
    const existingRates = updated[selectedMaterial].rates;

    updated[selectedMaterial].rates = applyFoldMultipliers(
      existingRates,
      foldVal,
      [0, ...folds] // ✅ This ensures fold 0 stays intact
    );

    setLocalMatrix(updated);
  };

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

  const tooltipStyle = {
    position: "absolute",
    left: "1.75rem",
    top: "-0.15rem",
    backgroundColor: "#fff",
    padding: "0.25rem 0.5rem",
    border: "1px solid #ccc",
    borderRadius: "0.25rem",
    whiteSpace: "nowrap",
    opacity: 0,
    transform: "translateX(-0.5rem)",
    transition: "all 0.2s ease-in-out",
    fontSize: "0.85rem",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    zIndex: 2,
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
          overflowX: "auto",
          width: "100%",
          maxWidth: "100%",
          marginTop: "2rem",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            minWidth: "40rem", // prevent collapse too much
            tableLayout: "auto", // allow columns to auto-resize
          }}
        >
          {/* thead + tbody */}
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
            {/* ROW 1: New Custom Top Row */}
            <tr style={{ backgroundColor: "#eaeaea" }}>
              <th
                style={{
                  ...thStyle,
                  padding: "1rem",
                  fontWeight: "500",
                  fontSize: "0.9rem",
                  textAlign: "left",
                }}
                colSpan={
                  2 +
                  [0, ...material.folds].filter(
                    (_, idx) => !foldChunkedView || idx === 0
                  ).length
                }
              >
                {/* Girth Gradient Tool */}
                <span style={{ marginRight: "0.75rem" }}>
                  Max Girth Price (e.g. 1200mm):
                </span>
                <input
                  type="number"
                  value={priceAt1200}
                  onChange={(e) => setPriceAt1200(e.target.value)}
                  style={{ width: "6rem", marginRight: "1rem" }}
                />
                <button
                  onClick={handleSpanPrices}
                  style={{
                    marginRight: "2rem",
                    backgroundColor: "#007bff",
                    color: "#fff",
                    padding: "0.25rem 0.75rem",
                    border: "none",
                    borderRadius: "0.25rem",
                    cursor: "pointer",
                  }}
                >
                  Span
                </button>

                {/* Fold Price Input + Apply */}
                <span style={{ marginRight: "0.75rem" }}>1 Fold =</span>
                <input
                  type="number"
                  value={foldPrice}
                  onChange={(e) => setFoldPrice(e.target.value)}
                  style={{ width: "5rem", marginRight: "1rem" }}
                />
                <button
                  onClick={handleApplyFolds}
                  style={{
                    backgroundColor: "#28a745",
                    color: "#fff",
                    padding: "0.25rem 0.75rem",
                    border: "none",
                    borderRadius: "0.25rem",
                    cursor: "pointer",
                  }}
                >
                  Apply
                </button>
              </th>
            </tr>

            {/* ROW 2: Girth | FOLDS (merged) | Checkboxes */}
            <tr style={{ backgroundColor: "#eaeaea" }}>
              <th style={{ ...thStyle, width: "7rem", minWidth: "7rem" }}>
                GIRTH
              </th>

              <th
                style={{
                  ...thStyle,
                  textAlign: "center",
                  backgroundColor: "#eaeaea",
                }}
                colSpan={
                  [0, ...material.folds].filter(
                    (_, idx) => !foldChunkedView || idx === 0
                  ).length
                }
              >
                FOLDS
              </th>

              <th
                style={{
                  ...thStyle,
                  width: "2.5rem",
                  padding: "0",
                  textAlign: "center",
                  verticalAlign: "top",
                }}
                rowSpan={2}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.75rem",
                  }}
                >
                  {/* Girth Chunk Toggle */}
                  <div
                    style={{
                      position: "relative",
                      width: "1.25rem",
                      height: "1.25rem",
                    }}
                    onMouseEnter={(e) => {
                      const label =
                        e.currentTarget.querySelector(".label-slide");
                      label.style.opacity = "1";
                      label.style.transform = "translateX(0)";
                    }}
                    onMouseLeave={(e) => {
                      const label =
                        e.currentTarget.querySelector(".label-slide");
                      label.style.opacity = "0";
                      label.style.transform = "translateX(-0.5rem)";
                    }}
                  >
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
                      style={{ width: "1.25rem", height: "1.25rem", margin: 0 }}
                    />
                    <span className="label-slide" style={tooltipStyle}>
                      Girth 100mm View
                    </span>
                  </div>

                  {/* Fold Chunk Toggle */}
                  <div
                    style={{
                      position: "relative",
                      width: "1.25rem",
                      height: "1.25rem",
                    }}
                    onMouseEnter={(e) => {
                      const label =
                        e.currentTarget.querySelector(".label-slide");
                      label.style.opacity = "1";
                      label.style.transform = "translateX(0)";
                    }}
                    onMouseLeave={(e) => {
                      const label =
                        e.currentTarget.querySelector(".label-slide");
                      label.style.opacity = "0";
                      label.style.transform = "translateX(-0.5rem)";
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={foldChunkedView}
                      onChange={(e) => {
                        const newValue = e.target.checked;
                        setFoldChunkedView(newValue);
                        localStorage.setItem(
                          "foldChunkedView",
                          JSON.stringify(newValue)
                        );
                      }}
                      style={{ width: "1.25rem", height: "1.25rem", margin: 0 }}
                    />
                    <span className="label-slide" style={tooltipStyle}>
                      Fold Chunked View
                    </span>
                  </div>
                </div>
              </th>
            </tr>

            {/* ROW 2: Fold Number Headers */}
            <tr style={{ backgroundColor: "#eaeaea" }}>
              <th style={thStyle}></th>
              {[0, ...material.folds]
                .filter((_, idx) => !foldChunkedView || idx === 0)
                .map((fold) => (
                  <th key={fold} style={thStyle}>
                    {fold === 0 ? "0" : fold}
                  </th>
                ))}
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

                  {[0, ...material.folds]
                    .filter((_, idx) => !foldChunkedView || idx === 0)
                    .map((fold) => (
                      <td key={fold} style={tdStyle}>
                        <input
                          type="number"
                          value={folds[fold] ?? 0}
                          onChange={(e) =>
                            handlePriceChange(girth, fold, e.target.value)
                          }
                          style={{
                            width: "100%",
                            minWidth: "4rem",
                            maxWidth: "6rem",
                            padding: "0.4rem",
                            borderRadius: "0.25rem",
                            border: "1px solid #ccc",
                            boxSizing: "border-box",
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
