import React from "react";
import styles from "../ContractEditorMain.module.css";

const VariablePanel = ({ schema, values, onChange }) => {
  return (
    <div className={styles.variablePanel}>
      <div className={styles.toolboxTitle}>Variables</div>
      {schema.map(f => (
        <div key={f.key} className={styles.varRow}>
          <label>{f.label}</label>
          <input
            type={f.type==="number"?"number": f.type==="date"?"date":"text"}
            value={values[f.key] ?? f.default ?? ""}
            onChange={(e)=>onChange(f.key, e.target.value)}
          />
        </div>
      ))}
    </div>
  );
};

export default VariablePanel;
