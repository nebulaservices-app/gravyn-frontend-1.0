import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./SideBar_Proj.module.css";

// Icons
import logo from "../../images/icons/gravyn.svg";
import dashboard from "../../images/icons/dashboard.svg";
import inbox from "../../images/icons/inbox.svg";
import notes from "../../images/icons/notes.svg";
import tasks from "../../images/icons/tasks_i.svg";
import issues from "../../images/icons/issues.svg";
import milestone from "../../images/icons/milestones_i.svg";
import messages from "../../images/icons/messages.svg";
import calendar from "../../images/icons/calendar.svg";
import files from "../../images/icons/files.svg";
import teams from "../../images/icons/teams.svg";
import settings from "../../images/icons/settings.svg";
import account from "../../images/icons/account.svg";
import help from "../../images/icons/help.svg";
import logout from "../../images/icons/logout.svg";
import topdown from "../../images/icons/topdown.svg";

import useProjectContext from "../../hook/useProjectContext";

const menuStructure = [
    {
        title: null,
        items: [
            { label: "Dashboard", icon: dashboard, path: "/app/project/68159219cdb8524689046498/overview" },
            { label: "My Inbox", icon: inbox, path: "/app/project/68159219cdb8524689046498/inbox" },
            { label: "Project Updates", icon: notes, path: "/app/project/68159219cdb8524689046498/updates" },
        ]
    },
    {
        title: "Planning & Execution",
        items: [
            { label: "Tasks", icon: tasks, path: "/app/project/68159219cdb8524689046498/tasks/overview" },
            { label: "Issues", icon: issues, path: "/app/project/68159219cdb8524689046498/issues/overview" },
            { label: "Milestones", icon: milestone, path: "/app/project/68159219cdb8524689046498/milestones" },
        ]
    },
    {
        title: "Collaboration",
        items: [
            { label: "Messages", icon: messages, path: "/app/project/68159219cdb8524689046498/messages/" },
            { label: "Calendar & Scheduling", icon: calendar, path: "/app/project/68159219cdb8524689046498/calendar-schedule" },
            { label: "Files & Documents", icon: notes, path: "/project/files" },
            { label: "Team & Roles", icon: teams, path: "/app/project/68159219cdb8524689046498/collaborate" },
        ]
    }
];

const bottomMenu = [
    { label: "Settings", icon: settings, path: "/settings" },
    { label: "Help & Support", icon: help, path: "/help" },
    { label: "Log out", icon: logout, path: "/logout" },
];

const SideBar_Proj = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { project } = useProjectContext();

    const isActive = (path) => location.pathname === path;

    const handleClick = (path) => {
        if (path === "/logout") {
            // Add logout logic here
            console.log("Logging out...");
        } else {
            navigate(path);
        }
    };

    return (
        <div className={styles['sidebar-wrapper']}>
            <div className={styles['sidebar-proj-header-wrapper']}>
                <div className={styles['sidebar-flex']}>
                    <div className={styles['sidebar-flex-i']}>
                        <div className={styles['sidebar-logo-wrapper']}>
                            <img src={logo} alt="Logo" />
                            <p>Gravyn</p>
                        </div>
                        {/*<p>{project?.name}</p>*/}
                    </div>
                </div>
                <div className={styles['sidebar-flex']}>
                    <img src={topdown} alt="Toggle" />
                </div>
            </div>

            <div className={styles['sidebar-proj-content-wrapper']}>
                <div className={styles['menu-sr-wrapper']}>

                    {/* Main Sections */}
                    <div className={styles['menu-blocks-wrapper']}>
                        {menuStructure.map((section, sIdx) => (
                            <div className={styles['menu-jr-block-wrapper']} key={sIdx}>
                                <div className={styles['menu-item-wrapper']}>
                                    <p className={styles['menu-type-title']}>{section.title}</p>
                                    <div className={styles['menu-capsule']}>
                                        {section.items.map((item, iIdx) => (
                                            <div
                                                key={iIdx}
                                                className={`${styles['menu-item-i']} ${isActive(item.path) ? styles['active'] : ""}`}
                                                onClick={() => handleClick(item.path)}
                                            >
                                                <img src={item.icon} alt={item.label} />
                                                <p>{item.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Bottom Section */}
                    <div className={`${styles['menu-blocks-wrapper']} ${styles['menu-non-collapsible-block-wrapper']}`}>
                        <div className={styles['menu-jr-block-wrapper']}>
                            <div className={styles['menu-item-wrapper']}>
                                <div className={styles['menu-capsule']}>
                                    {bottomMenu.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className={`${styles['menu-item-i']} ${isActive(item.path) ? styles['active'] : ""}`}
                                            onClick={() => handleClick(item.path)}
                                        >
                                            <img src={item.icon} alt={item.label} />
                                            <p>{item.label}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default SideBar_Proj;