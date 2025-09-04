import React, {useEffect, useRef, useState} from "react";
import {useLocation, useParams} from "react-router-dom";
import styles from "./TaskOverview.module.css";
import Sidebar from "../../components/ui/Sidebar";
import { getProjectById } from "../../service/Project/ProjectFetcher";
import { fetchWorkspaceById } from "../../service/Workspace/workspaceFetcher";
import { getInitials } from "../../utils/helper";
import downarrow from "../../images/icons/downarrow.svg";
import {getUserById} from "../../service/User/UserFetcher";
import notification from "../../images/icons/notification.svg"
import search from "../../images/icons/search.svg"
import kanban from "../../images/icons/kanban.svg"
import list from "../../images/icons/list.svg"
import timeline from "../../images/icons/timeline.svg"
import calendar from "../../images/icons/calendar.svg"
import activity from "../../images/icons/recent_activity.svg"
import kairo from "../../images/logo/kairo.svg"
import analytics from "../../images/int_cat/analytics.svg"

import { useSearchParams } from "react-router-dom";
import add from "../../images/icons/add.svg"
import sync from "../../images/icons/sync.svg"
import dot from "../../images/icons/dotmenu.svg"
import filter from "../../images/icons/filter.svg"
import clock from "../../images/icons/clock.svg"
import sort from "../../images/icons/sort.svg"
import KanbanTasks from "../../components/ui/KanbanTasks";
import ActivityLogger from "../../components/features/ActivityLogger";
import TaskChart from "../TaskCharts";
import SideBar_Proj from "../../components/ui/SideBar_Proj";
import EnhancedTaskChart from "../EnhancedTaskCharts";
import EnhancedTaskCharts from "../EnhancedTaskCharts";
import TaskSpreadsheet from "../../components/ui/TaskSpreadSheet";
import TaskGanttView from "../../components/ui/TaskGanttView";
import TaskCalendarView from "../../components/ui/TaskCalendarView";
import TaskTimeGrid from "../../components/ui/TaskTimeGrid";
import AppCenter from "../../components/ui/AppCenter";
import axios from "axios";
import {AiOverlay} from "../Dashboard/Dashboard";
import TaskAnalytics from "../../components/ui/TaskAnalytics";
import {Kairo} from "../../components/features/Kairo";
import * as PropTypes from "prop-types";
import TaskModal from "../../components/ui/TaskModal";


const highlightMatch = (text, query) => {
    if (!query || typeof text !== 'string') return text;

    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
        part.toLowerCase() === query.toLowerCase() ? (
            <span key={index} className="highlight">{part}</span>
        ) : (
            part
        )
    );
};


const TaskOverview = () => {
    const {projectId} = useParams();
    const [project, setProject] = useState(null);
    const [workspaceData, setWorkspaceData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isKairoVisible , setKairoVisible] = useState(false)
    const navbarRef = useRef(null);
    const summaryRef = useRef(null);
    const contentRef = useRef(null);

    const [contentHeight, setContentHeight] = useState("auto");

    useEffect(() => {
        const updateHeight = () => {
            const navbarHeight = navbarRef.current?.offsetHeight || 0;
            const summaryHeight = summaryRef.current?.offsetHeight || 0;
            const remainingHeight = window.innerHeight - navbarHeight - summaryHeight;
            setContentHeight(remainingHeight);
        };

        updateHeight();
        window.addEventListener("resize", updateHeight);

        return () => window.removeEventListener("resize", updateHeight);
    }, []);
    // Fetch project by ID
    useEffect(() => {
        const fetchProject = async () => {
            try {
                const data = await getProjectById(projectId);
                setProject(data);
            } catch (err) {
                console.error("❌ Error loading project:", err);
            }
        };

        if (projectId) fetchProject();
    }, [projectId]);

    // Fetch workspace by workspaceId (after project is loaded)
    useEffect(() => {
        const getWorkspace = async () => {
            if (!project?.workspaceId) return;

            try {
                setLoading(true);
                const data = await fetchWorkspaceById(project.workspaceId);
                setWorkspaceData(data);
            } catch (err) {
                console.error("❌ Error loading workspace:", err);
            } finally {
                setLoading(false);
            }
        };

        getWorkspace();
    }, [project]);

    const location = useLocation();

    const [user, setUser] = useState(null);
    const [selectedTask, setSelectedTask] = useState(null);

    const [searchParams, setSearchParams] = useSearchParams();
    const [isAppCenterVisible , setIsAppCenterVisible ] = useState(false);
    useEffect(() => {
        const appCenterValue = new URLSearchParams(window.location.search).get("appCenter");
        setIsAppCenterVisible(appCenterValue === "true");
    }, [location.search]);


    useEffect(() => {

    }, [searchParams]);

    const userId = localStorage.getItem('nuid');
    const selectedView = searchParams.get("view") || "Kanban";



    useEffect(() => {
        if (!userId) {
            setUser(null);
            return;
        }

        let isCancelled = false;

        const fetchUser = async () => {
            try {
                const res = await axios.get(`http://localhost:5001/api/v1/users/${userId}`, {
                    headers: { Authorization: `Bearer ${userId}` }, // Use token if required
                });
                if (!isCancelled) {
                    console.log("User", res.data);
                    setUser(res.data.data);
                }
            } catch (err) {
                if (!isCancelled) {
                    setUser(null);
                    localStorage.removeItem('nuid'); // Clear invalid nuid
                }
            }
        };

        fetchUser();

        return () => {
            isCancelled = true;
        };
    }, [userId]);

    useEffect(() => {
        let isCancelled = false;

        const fetchUser = async () => {
            try {
                const userData = await getUserById(userId);
                if (!isCancelled) {
                    setUser(userData);
                }
            } catch (err) {
                if (!isCancelled) {
                    setUser(null);
                    localStorage.removeItem("nuid");
                }
            }
        };

        if (userId) fetchUser();

        return () => {
            isCancelled = true;
        };
    }, [userId]);

    if (loading) return <div className={styles['page-wrapper']}>Loading...</div>;

    const setOpenTask = (task) => {
       setSelectedTask(task)
    }



    return (
        <div className={styles['page-wrapper']}>
            <SideBar_Proj/>
            <div className={styles['page-content-parent-wrapper']}>
                <div className={styles['page-content-children-wrapper']}>
                    <nav className={styles['page-navbar-wrapper']}>
                        <div className={`${styles['navbar-flex-item']} ${styles['navbar-flex-item-left']}`}>
                            <div className={styles['workspace-pill']}>
                                <div className={styles['workspace-pill-img-wrapper']}>
                                    {workspaceData?.img ? (
                                        <img
                                            className={styles['workspace-pill-img']}
                                            src={workspaceData.img}
                                            alt="workspace"
                                        />
                                    ) : (
                                        <p className={styles['workspace-initials']}>
                                            {getInitials(workspaceData?.name)}
                                        </p>
                                    )}
                                </div>
                                <p className={styles['workspace-pill-name']}>
                                    {workspaceData?.name}
                                    <span>
                                        <img src={downarrow} alt="expand"/>
                                    </span>
                                </p>
                            </div>
                        </div>

                        <div className={`${styles['navbar-flex-item']} ${styles['navbar-flex-item-left']}`}>
                            <div className={styles['navbar-action-wrapper']}>
                                <div className={styles['action-wrapper']}>
                                    <img src={search}/>
                                </div>
                                <div className={styles['action-wrapper']}>
                                    <img src={notification}/>
                                </div>
                                <div className={styles['action-wrapper']}>
                                    <img src={user?.picture}/>
                                </div>
                            </div>
                        </div>

                    </nav>
                    <div className={styles['project-summary-bar']}>
                        <div className={styles['project-summary-bar-content']}>
                            <p className={styles['summary-subtitle']}>Projects</p>
                            <img src={downarrow} style={{transform: 'rotate(-90deg)'}}/>
                            <p className={styles['summary-title']}>{project.name}</p>
                            <img src={downarrow} style={{transform: 'rotate(-90deg)'}}/>
                            <p className={styles['summary-title']}>Tasks</p>
                        </div>
                        <div className={styles['summary-bar-right']}>
                            <div onClick={()=>{setKairoVisible(true)}} className={styles['summary-bar-ai-pill']}>
                                <img src={kairo}/>
                                <p>Ask Kairo</p>
                            </div>
                        </div>
                    </div>
                    <div className={styles['project-page-wrapper']}>
                        <div className={styles['project-section-left']}>
                            <div className={styles['section-header']}>
                                <div className={styles['section-header-details']}>
                                    <p>Tasks overview</p>
                                    <p className={styles['section-header-subtext']}>View, manage, and track all tasks
                                        across your project in one unified dashboard.</p>
                                </div>

                                <div className={styles['header-footer-flexer']}>
                                    <div className={styles['header-footer-flexer-i']}>
                                        {[
                                            {icon: kanban, label: "Kanban"},
                                            {icon: list, label: "Spreadsheet"},
                                            {icon: timeline, label: "Gantt View"},
                                            {icon: calendar, label: "Calendar"},
                                            {icon: clock, label: "Time Grid"},
                                            {icon: analytics, label: "Analytics & Reporting"},
                                            {icon: activity, label: "Activity"},
                                        ].map((view, index) => (
                                            <div
                                                className={`${styles['flexer-pill-i']} ${selectedView === view.label ? styles['active-view'] : ''}`}
                                                key={index}
                                                onClick={() => setSearchParams({ view: view.label })}
                                            >
                                                <img src={view.icon} alt={view.label}/>
                                                <p>{view.label}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className={styles['header-footer-flexer-i']}>
                                        <div className={styles['footer-i']}>
                                            {project?.teamMembers?.length > 0 ? (
                                                project.teamMembers.map((person, index) => (
                                                    <img src={person.picture}/>
                                                ))
                                            ) : (
                                                <span className={styles['no-participants']}>No participants</span>
                                            )}
                                        </div>
                                        <div className={styles['footer-i']}>
                                            <img src={add}/>
                                        </div>
                                        <div className={styles['footer-i']}/>
                                        <div className={styles['footer-i']}>
                                            <img src={sync}/>
                                        </div>
                                        <div className={styles['footer-i']}>
                                            <img src={dot}/>
                                        </div>
                                        <div className={styles['footer-i']}>
                                            Create a task
                                        </div>
                                    </div>
                                </div>

                            </div>

                            {selectedView !== "Calendar" && (
                                <div className={styles['section-config-wrapper']}>
                                    <div className={styles['sec-config-i']}>
                                        <img src={search}/>
                                        <input
                                            type="text"
                                            placeholder="Search"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                    <div className={styles['sec-config-action-wrapper']}>
                                        <div className={styles['sec-config-action-pill']}>
                                            <img src={filter}/>
                                            <p>Filter</p>
                                        </div>
                                        <div className={styles['sec-config-action-pill']}>
                                            <img src={sort}/>
                                            <p>Sort</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div
                                className={` ${styles['task-view-content-wrapper']}   ${["Calendar", "Gantt View", "Time Grid"].includes(selectedView) ? styles['expanded-view'] : ""}`}
                            >
                                {selectedView === "Kanban" && (
                                <KanbanTasks projectId={projectId} searchQuery={searchQuery} onTaskClick={setOpenTask}/>
                            )}
                                {selectedView === "Spreadsheet" && (
                                    <></>
                                )}
                                {selectedView === "Calendar" && (
                                    <TaskCalendarView projectId={projectId}/>
                                )}
                                {selectedView === "Gantt View" && (
                                    <></>
                                )}
                                {selectedView === "Time Grid" && (
                                    <TaskTimeGrid projectId={projectId}/>
                                )}
                                {selectedView === "Analytics & Reporting" && (
                                    <></>
                                )}
                                {selectedView === "Activity" && (
                                    <></>
                                )}
                            </div>
                        </div>

                        <div className={styles['project-section-right']}>
                            <div className={styles['proj-sec-right-top']}>

                            </div>
                            <div className={styles['proj-sec-right-bottom']}>

                            </div>
                        </div>
                    </div>
                </div>

            </div>


            {selectedTask && (
                <TaskModal task = {selectedTask} setSelectedTask={setSelectedTask}/>
            )}
            {isKairoVisible && <Kairo user={user} handleClose={()=>{setKairoVisible(false)}}/>}

            {/*{isKairoVisible && <AiOverlay user={user} handleClose={()=>{setKairoVisible(false)}}/>}*/}
            {/*<AppCenter onClose={() => setIsAppCenterVisible(false)} />*/}

        </div>
    );
};

export default TaskOverview;