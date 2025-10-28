import React from "react";
import styles from "../ContractEditorMain.module.css";
import { CLAUSES, makeClauseBlocks } from "./templates";

const ClauseLibrary = ({ onInsert }) => {
  return (
    <div className={styles.clauseLib}>
      <div className={styles.toolboxTitle}>Clause Library</div>
      {Object.entries(CLAUSES).map(([k,v])=>(
        <button key={k} className={styles.toolItem} onClick={()=> onInsert(v.title, v.body)}>
          {v.title}
        </button>
      ))}
    </div>
  );
};

export default ClauseLibrary;
