import React, {useState} from "react"
import useProjectContext from "../../hook/useProjectContext";
import styles from "./CollaborationSpace.module.css"
import allproject from "../../images/icons/allprojects.svg";
import slash from "../../images/icons/slash.svg";
import projecticon from "../../images/icons/project.svg";
import star_fav from "../../images/icons/star-fav.svg";
import star_nofav from "../../images/icons/star-nofav.svg";
import dot from "../../images/icons/dot.svg";
import warning from "../../images/icons/warning.svg";
import triage from "../../images/icons/aitriage.svg";
import kairo from "../../images/logo/kairo.svg";
import gitlab from "../../images/int_icon/gitlab.svg";
import kanban from "../../images/icons/kanban.svg";
import spreadsheet from "../../images/icons/spreadsheet.svg";
import team from "../../images/icons/teams.svg"
import calendar from "../../images/icons/calendar.svg";

const CollaborationSpace = () => {

    const {user, project} = useProjectContext();
    const toggleFav = () => setIsFav((prev) => !prev);
    const [isFav, setIsFav] = useState(false);


    return <>
        <div className={styles['collaboration-space-wrapper']}>
            <div className={styles['issue-nav-bar']}>
                <div className={styles['nav-capsule']}>
                    <div className={styles['nav-pill-i']}>
                        <img src={allproject}/><p>All Projects</p>
                    </div>
                    <img src={slash}/>
                    <div className={styles['nav-pill-i']}>
                        <img src={projecticon}/><p>{project?.name}</p>
                        <img
                            onClick={toggleFav}
                            className={styles['star']}
                            src={isFav ? star_fav : star_nofav}
                        />
                        <img className={styles['dot']} src={dot}/>
                    </div>
                    <img src={slash}/>
                    <div className={styles['nav-pill-i']}>
                        <img src={team}/><p>Team Members & Roles</p>
                    </div>
                </div>
                <div className={styles['nav-capsule']}>
                    <div className={styles['nav-pill-i']}>
                        <img src={kairo}/>
                        <p>Ask Kairo</p>
                    </div>
                </div>
            </div>
            <div className={styles['collaboration-space-header']}>
                <div className={styles['header-details']}>
                    <p>Collaborator Space</p>
                    <p>Manage all individuals and teams involved in this project, with precise roles and
                        permissions.</p>
                </div>
                <div className={styles['header-context-footer']}>
                    <div className={styles['header-context-capsule']}>
                        <div
                            className={`${styles['header-menu-pill']}`}
                        >
                            <img src={kanban}/>
                            <p className={styles['menu-pill-text']}>Project Members</p>
                        </div>
                        <div
                            className={`${styles['header-menu-pill']}`}
                        >
                            <img src={team}/>
                            <p className={styles['menu-pill-text']}>Teams</p>
                        </div>
                    </div>
                    <div className={styles['header-context-capsule']}></div>
                </div>

            </div>
            <div className={styles['collaboration-space-content']}>

            </div>
        </div>
    </>
}


export default CollaborationSpace;