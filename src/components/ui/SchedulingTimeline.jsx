import React from "react"
import styles from "./SchedulingTimeline.module.css"
import ProjectLayoutNavBar from "../templates/ProjectLayoutNavBar"

const SchedulingTimeline = () => {
    return <div className={styles['parent-wrapper']}>
        <ProjectLayoutNavBar/>
    </div>
}

export default SchedulingTimeline;