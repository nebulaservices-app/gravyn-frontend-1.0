import React from "react";
import styles from "../ContractEditorMain.module.css";

const CenterTools = ({ tool, setTool, onBold, onItalic, onUnderline, onBullets, onNumbers, onLeft, onCenter, onRight, onPickImage, onExportPdf }) => {
  return (
    <div className={styles.centerTools}>
      <div className={styles.centerToolsInner}>
        <button onMouseDown={(e)=>e.preventDefault()} onClick={onBold}>Bold</button>
        <button onMouseDown={(e)=>e.preventDefault()} onClick={onItalic}>Italic</button>
        <button onMouseDown={(e)=>e.preventDefault()} onClick={onUnderline}>Underline</button>
        <button onMouseDown={(e)=>e.preventDefault()} onClick={onBullets}>• List</button>
        <button onMouseDown={(e)=>e.preventDefault()} onClick={onNumbers}>1. List</button>
        <button onMouseDown={(e)=>e.preventDefault()} onClick={onLeft}>Left</button>
        <button onMouseDown={(e)=>e.preventDefault()} onClick={onCenter}>Center</button>
        <button onMouseDown={(e)=>e.preventDefault()} onClick={onRight}>Right</button>
        <div className={styles.centerSplit} />
        <button onClick={() => setTool("select")} className={tool==="select"?styles.centerActive:""}>Select</button>
        <button onClick={() => setTool("heading")} className={tool==="heading"?styles.centerActive:""}>H1</button>
        <button onClick={() => setTool("paragraph")} className={tool==="paragraph"?styles.centerActive:""}>Text</button>
        <button onClick={() => setTool("rectangle")} className={tool==="rectangle"?styles.centerActive:""}>Rect</button>
        <button onClick={() => setTool("circle")} className={tool==="circle"?styles.centerActive:""}>Circle</button>
        <button onClick={() => setTool("line")} className={tool==="line"?styles.centerActive:""}>Line</button>
        <button onClick={() => setTool("pan")} className={tool==="pan"?styles.centerActive:""}>Pan</button>
        <div className={styles.centerSplit} />
        <button onClick={onPickImage}>Image</button>
        <button onClick={onExportPdf}>PDF</button>
      </div>
    </div>
  );
};

export default CenterTools;
