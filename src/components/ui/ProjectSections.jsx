import React from "react"
import styles from "./ProjectSections.module.css";
import updates from "../../images/icons/update.svg";
import {formatFullDate} from "../../utils/datetime";
import stars from "../../images/icons/ai_stars.svg"

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


                        {/*<div className={styles['ai-suggestion']}>*/}
                        {/*    <p>NEBULA SUGGESTIONS <img src={stars}/> </p>*/}
                        {/*    {update.content?.aisuggestion && (*/}
                        {/*        <div dangerouslySetInnerHTML={{__html: update.content.aisuggestion}}/>*/}
                        {/*    )}*/}

                        {/*</div>*/}

                </div>
            )}
        </div>)
}

export default ProjectSections