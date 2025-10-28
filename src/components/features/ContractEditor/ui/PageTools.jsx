import React from "react";
import styles from "../ContractEditorMain.module.css";

const PageTools = ({ page, onChangeSize, onToggleHeader, onToggleFooter }) => {
  return (
    <div className={styles.pageTools}>
      <span>Page</span>
      <select onChange={(e)=>onChangeSize(e.target.value)}>
        <option value="A4">A4</option>
        <option value="LETTER">Letter</option>
      </select>
      <label><input type="checkbox" checked={!!page.header?.enabled} onChange={(e)=>onToggleHeader(e.target.checked)} /> Header</label>
      <label><input type="checkbox" checked={!!page.footer?.enabled} onChange={(e)=>onToggleFooter(e.target.checked)} /> Footer</label>
    </div>
  );
};

export default PageTools;
