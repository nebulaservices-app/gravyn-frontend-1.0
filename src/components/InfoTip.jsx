import React from "react"
import info from "../images/icons/info.svg";

import styles from "./flows/projectCreation/ProjectCreationModalFlow.module.css"

/* ----------------------- Utilities ----------------------- */
function InfoTip({ text }) {
  return (
    <span className={styles.tip} role="tooltip" aria-label={text}>
      <span className={styles.tipIcon}><img src={info} alt="" /></span>
      <span className={styles.tipBubble}>{text}</span>
    </span>
  );
}

export default InfoTip