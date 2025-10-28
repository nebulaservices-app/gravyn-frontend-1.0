import React from "react"
import styles from "./DashboardOverview.module.css";
import updates from "../../images/icons/update.svg";
import {formatFullDate} from "../../utils/datetime";
import stars from "../../images/icons/ai_stars.svg"
import gravynLogo from "../../images/icons/gravyn.svg"

const ProjectSections = ({update , project}) => {
    return (
        <div className={styles['project-updates-content']}>
            {update && (
                <div className={styles['project-update-visual']}>
                    {(update.content?.sections || update.sections || []).map((section, i) => (
                        <div key={section.type + i} className={styles['update-section-item']}>
                            {/* Render summary as HTML */}
                            <div
                                className={styles['section-summary']}
                                dangerouslySetInnerHTML={{__html: section.summary}}
                            />
                        </div>

                    ))}

                    {/* <div className={styles['project-update-ai-wrapper']}>

                        <div className={styles['gravyn-pill']}><img src={gravynLogo}/><p>Gravyn Suggests</p></div>

                        {update.content?.aisuggestion && (
                                 <div 
                                 className={styles['project-update-ai']}
                                 dangerouslySetInnerHTML={{__html: update.content.aisuggestion}}/>
                         )}

                    </div> */}


      

                </div>
            )}
        </div>)
}

export default ProjectSections