import React from "react";
import styles from "../ContractEditorMain.module.css";

const Inspector = ({ visibleValues, inspectorUpdate, alignLeft, alignRight, alignTop, alignBottom }) => {
  if (!visibleValues) return <div className={styles.inspectorEmpty}>Select an element</div>;
  const v = visibleValues;
  return (
    <div className={styles.inspector}>
      <label>X</label>
      <input type="number" value={v.x ?? ""} onChange={(e) => inspectorUpdate("x", +e.target.value)} />
      <label>Y</label>
      <input type="number" value={v.y ?? ""} onChange={(e) => inspectorUpdate("y", +e.target.value)} />
      <label>W</label>
      <input type="number" value={v.width ?? ""} onChange={(e) => inspectorUpdate("width", Math.max(1, +e.target.value))} />
      <label>H</label>
      <input type="number" value={v.height ?? ""} onChange={(e) => inspectorUpdate("height", Math.max(1, +e.target.value))} />
      <label>Opacity</label>
      <input type="range" min="0" max="1" step="0.01" value={v.opacity === "" ? 1 : v.opacity} onChange={(e) => inspectorUpdate("opacity", +e.target.value)} />
      <label>Font size</label>
      <input type="number" value={v.fontSize ?? ""} onChange={(e) => inspectorUpdate("fontSize", Math.max(8, +e.target.value))} />
      <label>BG</label>
      <input type="color" value={v.bg || "#ffffff"} onChange={(e) => inspectorUpdate("backgroundColor", e.target.value)} />
      <label>Color</label>
      <input type="color" value={v.color || "#222222"} onChange={(e) => inspectorUpdate("color", e.target.value)} />

      <div style={{ marginTop: 10, display: "flex", gap: 6 }}>
        <button onClick={() => inspectorUpdate("alignContent", "left")}>Left</button>
        <button onClick={() => inspectorUpdate("alignContent", "center")}>Center</button>
        <button onClick={() => inspectorUpdate("alignContent", "right")}>Right</button>
        <button onClick={() => inspectorUpdate("alignContent", "justify")}>Justify</button>
      </div>

      <div style={{ marginTop: 10, display: "flex", gap: 6 }}>
        <button onClick={alignLeft}>Align Left</button>
        <button onClick={alignRight}>Align Right</button>
        <button onClick={alignTop}>Align Top</button>
        <button onClick={alignBottom}>Align Bottom</button>
      </div>
    </div>
  );
};

export default Inspector;
