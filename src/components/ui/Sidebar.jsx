import {useNavigate} from "react-router-dom";
import styles from "./Sidebar.module.css";
import nebula_logo from "../../images/onboard/logo-white.svg";
import downarrow from "../../images/icons/downarrow.svg";
import create from "../../images/icons/create-new.svg";
import inbox from "../../images/nav/inbox.svg";
import dashboard from "../../images/nav/dashboard.svg";
import messages from "../../images/nav/messages.svg";
import finances from "../../images/nav/finance.svg";
import files from "../../images/nav/files.svg";
import issues from "../../images/nav/issues.svg";
import settings from "../../images/nav/settings.svg";
import React from "react"

const SideNavBar = ({}) => {

    const navigate = useNavigate();
    const projectId = "68159219cdb8524689046498";

    return <div className={`${styles['side-bar']} ${styles['side-bar-collapsible']}`}>
        <nav className={`${styles['nav-bar-burger-wrapper']}`}>
            <div className={`${styles['nav-burger-flex-item']} ${styles['nav-burger-flex-left']}`}>
                <img src={nebula_logo}/>
                {/*<img src={downarrow}/>*/}
            </div>

            <div className={styles['nav-burger-flex-item']}>
            </div>
        </nav>
        <div className={styles['menu-wrapper']}>
            <div className={styles['menu-item-capsule']}>
                <div className={styles['menu-item-children-capsule']}>
                    <div className={styles['menu-item-pill']}>
                        <img src={inbox}/>
                        <p>My Inboxes</p>
                    </div>
                </div>
            </div>
            <div className={styles['menu-item-capsule']}>
                <p>General</p>
                <div className={styles['menu-item-children-capsule']}>
                    <div className={styles['menu-item-pill']}>
                        <img src={dashboard}/>
                        <p>Dashboard</p>
                    </div>
                    <div className={styles['menu-item-pill']}>
                        <img src={messages}/>
                        <p>Messages</p>
                    </div>
                    <div className={styles['menu-item-pill']}>
                        <img src={finances}/>
                        <p>Finances</p>
                    </div>
                    <div className={styles['menu-item-pill']}>
                        <img src={files}/>
                        <p>Files & Attachment</p>
                    </div>
                    <div
                        onClick={()=>{navigate(`/app/project/${projectId}/tasks/overview`)}}
                        className={styles['menu-item-pill']}>
                        <img src={issues}/>
                        <p>Project Issues</p>
                    </div>
                    <div onClick={()=>{
                        localStorage.removeItem("nuid")
                    }} className={styles['menu-item-pill']}>
                        <img src={settings}/>
                        <p>Workspace Settings</p>
                    </div>

                    <div className={styles['menu-item-pill']}>
                        <img src={settings}/>
                        <p>App Center</p>
                    </div>

                </div>
            </div>
        </div>
    </div>
}


export default SideNavBar;