import React, {useState, useEffect, useCallback} from "react";
import styles from "./IssueOverview.module.css";
import useProjectContext from "../../hook/useProjectContext";
import { fetchIssues, updateIssue } from "../../service/Issues/issuesService";
import { updateAITriageConfig } from "../../service/aiTriageService";

// --- Icons ---
import downarrow from "../../images/icons/downarrow.svg";
import kairo from "../../images/logo/kairo.svg";
import allproject from "../../images/icons/allprojects.svg";
import projecticon from "../../images/icons/project.svg";
import slash from "../../images/icons/slash.svg";
import star_nofav from "../../images/icons/star-nofav.svg";
import star_fav from "../../images/icons/star-fav.svg";
import dot from "../../images/icons/dot.svg";
import warning from "../../images/icons/warning.svg";
import triage from "../../images/icons/aitriage.svg";
import gitlab from "../../images/int_icon/gitlab.svg";
import kanban from "../../images/icons/kanban.svg";
import spreadsheet from "../../images/icons/spreadsheet.svg";
import calendar from "../../images/icons/calendar.svg";
import search from "../../images/icons/search.svg";
import filter from "../../images/icons/filter.svg";
import sort from "../../images/icons/sort.svg";
import add from "../../images/icons/add.svg";
import sync from "../../images/icons/sync.svg";
import closed from "../../images/icons/issue_status/closed.svg";
import confirmed from "../../images/icons/issue_status/confirmed.svg";
import pending from "../../images/icons/issue_status/pending.svg";
import planned from "../../images/icons/issue_status/planned.svg";
import progress from "../../images/icons/issue_status/progress.svg";
import resolved from "../../images/icons/issue_status/resolved.svg";
import triaged from "../../images/icons/issue_status/triaged.svg";
import nebula_aitriage from "../../images/aitriage/nebula_aitriage.svg";
import autotriagemode from "../../images/aitriage/autotriagemode.svg";
import manultriagemode from "../../images/aitriage/manualtriagemode.svg";
import check from "../../images/aitriage/check.svg";
import close from "../../images/icons/close.svg";
import dotIcon from "../../images/icons/dot.svg"; // Avoid name collision

import github from "../../images/int_icon/github.svg"

// --- Components ---
import Kanban from "./Kanban";
import AppCenter from "./AppCenter";
import TaskCalendarView from "./TaskCalendarView";
import UniversalCalendarView from "./UniversalCalendarView";
import UniversalSpreadsheetView from "./UniversalSpreadsheetView";
import SideActionBarTower from "./SideActionBarTower";
import CalendarScheduling from "./CalendarScheduling";
import SelectedIntegration from "./AppAddOnModal";
import IssueModalWrapper from "./IssueModalWrapper";
import { formatFullDate } from "../../utils/datetime";

// ==========================
// AI Triage Modal Component
// ==========================
const AITriage = ({ projectId = "68159219cdb8524689046498", onSuccess }) => {
    const [selectedMode, setSelectedMode] = useState("auto");

    const featuresList = [
        "Continuously scan for high-severity, blocker, or security issues",
        "Auto-label and triage issues close to their due dates",
        "Suggest triage directly in your issue list or via drag-and-drop to the Triage column",
        "Help your team stay focused on what’s urgent — with zero manual effort"
    ];

    const triageModes = [
        {
            key: "auto",
            title: "Auto Triage Mode",
            description: "Nebula automatically scans and triages urgent, blocking, or high-priority issues — helping your team stay focused without manual effort.",
            image: autotriagemode
        },
        {
            key: "manual",
            title: "Manual Triage Mode",
            description: "Manually manage your issue flow with a dedicated Triaged column in Kanban or Spreadsheet view — for teams that prefer full control.",
            image: manultriagemode
        }
    ];

    const handleEnable = async () => {
        try {
            alert('Enabling AI TRIAGE...');
            await updateAITriageConfig(projectId, {
                isEnabled: true,
                mode: selectedMode
            });
            onSuccess?.();
            alert('Enabled AI TRIAGE...');
        } catch (err) {
            console.error("Failed to enable AITriage", err);
        }
    };

    return (
        <div className={styles["ai-triage-overlay-wrapper"]}>
            <div className={styles["ai-triage-wrapper"]}>
                <div className={styles["ai-triage-header"]}>
                    <img src={nebula_aitriage} alt="AI Triage Icon" />
                    <p className={styles["header-heading"]}>Connect AI Triage with Nebula</p>
                    <p className={styles["header-subheading"]}>
                        Supercharge your issue workflow with Nebula’s built-in AI — automatically detect, label,
                        and prioritize critical issues so you never miss what matters.
                    </p>
                </div>

                <div className={styles["ai-triage-feature-list"]}>
                    {featuresList.map((feature, index) => (
                        <div key={index} className={styles["feature-item"]}>
                            <img src={check} />
                            <p>{feature}</p>
                        </div>
                    ))}
                </div>

                <div className={styles["ai-triage-mode-selector"]}>
                    <p className={styles["mode-heading"]}>Choose Triage Mode for the Issues</p>
                    <div className={styles["mode-wrapper"]}>
                        {triageModes.map((mode) => (
                            <div
                                key={mode.key}
                                className={`${styles["mode-card"]} ${selectedMode === mode.key ? styles["active"] : ""}`}
                                onClick={() => setSelectedMode(mode.key)}
                            >
                                <img src={mode.image} alt={`${mode.title} icon`} />
                                <div>
                                    <p className={styles["mode-title"]}>{mode.title}</p>
                                    <p className={styles["mode-description"]}>{mode.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles["note-wrapper"]}>
                    <p>
                        Each AI Triage action uses 2,000–3,000 tokens from your monthly AI token pool. Basic plan users get 3,00,000 tokens to share between Kairo and AI Triage.
                    </p>
                </div>

                <div className={styles["action-wrapper"]}>
                    <div className={styles["cancel-wrapper"]}>Cancel</div>
                    <div className={styles["enable-wrapper"]} onClick={handleEnable}>
                        Enable AITriage
                    </div>
                </div>
            </div>
        </div>
    );
};

// ISSUE MODAL OVERVIEW


const IssueModal = ({selectedIssue , setSelectedIssue}) =>{




    return<>
        <div
            onClick={()=>{setSelectedIssue(null)}}
            className={styles['issue-modal-overlay']}>
            <div className={styles['issue-modal-wrapper']}>
                <header className={styles['issue-modal-header']}></header>
                <main className={styles['issue-modal-content']}>
                    <div className={styles['issue-modal-header-wrapper']}>
                        <div className={styles['issue-header-text-wrapper']}>
                            <p>{selectedIssue.title}</p>
                            <p>{selectedIssue.description}</p>
                        </div>
                        <div className={styles['issue-capsule-wrapper']}>
                            <div className={styles['issue-pill-wrapper']}>
                                <img src={github}/>
                                <p>Github Code Collaboration</p>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    </>
}


// ==========================
// Issues Overview Component
// ==========================
const IssuesOverview = ({ onCreateIssue }) => {
    // --- Context / State ---
    const {
        user,
        project,
        workspaceData,
        selectedView,
        setSearchParams
    } = useProjectContext();



    const [activeProject , setActiveProject] = useState(project)

    // UI + logic state
    const [isFav, setIsFav] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [toggleActiveTriage, setToggleTriage] = useState(activeProject?.aiTriage?.enabled || false);
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAITriageOpen, setAITriageOpen] = useState(false);
    const [activeView, setActiveView] = useState("kanban");
    const [groupBy, setGroupBy] = useState("status");
    const [selectedIntegration, setSelectedIntegration] = useState();
    const [isAppCenterOpen, setAppCenterOpen] = useState(false);
    const [isOpenIssueModal, setIsOpenIssueModal] = useState(false);


    const [selectedIssue , setSelectedIssue] = useState(null);


    // --- Label Maps ---
    const labelMap = {
        status: {
            new: "New",
            acknowledged: "Acknowledged",
            in_progress: "In Progress",
            resolved: "Resolved",
            closed: "Closed",
            deferred: "Deferred",
            duplicate: "Duplicate",
            blocked: "Blocked"
        },
        severity: {
            critical: "Critical",
            high: "High",
            medium: "Medium",
            low: "Low"
        }
    };

    const statusMapper = [
        { key: "pending", label: "Pending", icon: pending },
        { key: "triaged", label: "Triaged", icon: triaged },
        { key: "confirmed", label: "Confirmed", icon: confirmed },
        { key: "planned", label: "Planned", icon: planned },
        { key: "in_progress", label: "In Progress", icon: progress },
        { key: "resolved", label: "Resolved", icon: resolved },
        { key: "closed", label: "Closed", icon: closed }
    ];

    // --- Allowed transitions ---
    const allowedTransitions = {
        pending: ["triaged"],
        triaged: ["confirmed", "closed"],
        confirmed: ["planned", "closed"],
        planned: ["in_progress", "closed"],
        in_progress: ["resolved", "closed"],
        resolved: ["closed", "reopened"],
        closed: ["reopened"],
        reopened: ["planned", "in_progress"]
    };



    // --- Effect: Fetch issues on project/session change ---
    useEffect(() => {
        if (!project?._id) return;
        const loadIssues = async () => {
            try {
                setLoading(true);
                const issuesList = await fetchIssues({ projectId: project._id });
                setIssues(issuesList);
            } catch (error) {
                console.error("Failed to load issues:", error.message);
            } finally {
                setLoading(false);
            }
        };
        loadIssues();
    }, [project]);

    // --- Filtered list by search ---
    const filteredIssues = issues.filter((issue) =>
        issue.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // --- Kanban/Drag handler ---
    const handleCardMove = async (movedItem, fromGroup, toGroup) => {
        const updated = issues.map((issue) =>
            issue._id === movedItem._id ? { ...issue, [groupBy]: toGroup } : issue
        );
        setIssues(updated);
        try {
            await updateIssue(movedItem._id, { [groupBy]: toGroup });
        } catch (err) {
            console.error("Failed to update issue:", err.message);
        }
    };

    // --- Fav and triage toggles ---
    const toggleFav = () => setIsFav((prev) => !prev);



    const toggleTriage = () => {
        if (toggleActiveTriage) {
            setToggleTriage(false);
        } else {
            setToggleTriage(true);
            setAITriageOpen(true);
        }
    };

    const handleSuccessAITriage = () => setAITriageOpen(false);

    const openIssueModal = () => {
        setIsOpenIssueModal(true);
    }

    //SelectedIssue

    useEffect(() => {
        if(selectedIssue !== null){

        }

    }, [selectedIssue]);




    // Hotkey handler for Control + I
    const handleKeyDown = useCallback((e) => {
        if ((e.ctrlKey || e.metaKey) && (e.key === "i" || e.key === "I")) {
            e.preventDefault();
            setIsOpenIssueModal(true);
        }

        if ((e.ctrlKey || e.metaKey) && (e.shiftKey) && (e.key === "x" || e.key === "x")) {
            e.preventDefault();
            setIsOpenIssueModal(false);
        }
    }, []);

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

    // --- UI Render ---
    return (
        <div className={styles["issue-overview-wrapper"]}>
            {/* Navigation Bar */}
            <div className={styles["issue-nav-bar"]}>
                <div className={styles["nav-capsule"]}>
                    <div className={styles["nav-pill-i"]}>
                        <img src={allproject} /><p>All Projects</p>
                    </div>
                    <img src={slash} />
                    <div className={styles["nav-pill-i"]}>
                        <img src={projecticon} /><p>{project?.name}</p>
                        <img onClick={toggleFav} className={styles["star"]} src={isFav ? star_fav : star_nofav} />
                        <img className={styles["dot"]} src={dot} />
                    </div>
                    <img src={slash} />
                    <div className={styles["nav-pill-i"]}>
                        <img src={warning} /><p>Issues</p>
                    </div>
                </div>
                <div className={styles["nav-capsule"]}>
                    {/*<div className={styles["nav-pill-i"]}>*/}
                    {/*    <img src={triage} />*/}
                    {/*    <p>AITriage</p>*/}
                    {/*    <div*/}
                    {/*        onClick={toggleTriage}*/}
                    {/*        className={`${styles["toggle-wrapper"]} ${styles[toggleActiveTriage ? "active" : ""]}`}*/}
                    {/*    >*/}
                    {/*        <div className={styles["switch"]}>*/}
                    {/*        </div>*/}
                    {/*    </div>*/}
                    {/*</div>*/}
                    <div className={styles["nav-pill-i"]}>
                        <img src={kairo} />
                        <p>Ask Kairo</p>
                    </div>
                </div>
            </div>

            {/* Main Body */}
            <div className={styles["issue-main"]}>
                <div className={styles["issue-main-wrapper"]}>



                    <div className={styles['issue-main-i-wrapper']}>




                    {/* <div className={styles["issue-header-notification-bar"]}>
                        <img src={gitlab} />
                        <p>2 High severity & Critical issues are pulled from Gitlab</p>
                    </div> */}

                    <div className={styles['issue-main-i-content-wrapper']}>

                    {/* Header */}
                    <div className={styles["issue-header-wrapper"]}>
                             <div className={styles["context-text-wrapper"]}>
                                <p className={styles["header-heading"]}>Issues Overview</p>
                                <p className={styles["header-subheading"]}>
                                    Track, triage, and manage all project issues in one centralized view.
                                </p>
                            </div>
                            <div className={styles["header-context-footer"]}>
                                <div className={styles["header-context-capsule"]}>
                                    <div className={`${styles["header-menu-pill"]} ${activeView === "kanban" ? styles["active"] : ""}`}
                                         onClick={() => setActiveView("kanban")}>
                                        <img src={kanban} />
                                        <p className={styles["menu-pill-text"]}>Kanban</p>
                                    </div>
                                    <div className={`${styles["header-menu-pill"]} ${activeView === "spreadsheet" ? styles["active"] : ""}`}
                                         onClick={() => setActiveView("spreadsheet")}>
                                        <img src={spreadsheet} />
                                        <p className={styles["menu-pill-text"]}>Spreadsheet</p>
                                    </div>
                                    <div className={`${styles["header-menu-pill"]} ${activeView === "calendar" ? styles["active"] : ""}`}
                                         onClick={() => setActiveView("calendar")}>
                                        <img src={calendar} />
                                        <p className={styles["menu-pill-text"]}>Calendar</p>
                                    </div>
                                </div>
                                <div className={styles["header-footer-flexer-i"]}>
                                    <div className={styles["footer-i"]}>
                                        {project?.teamMembers?.length > 0 ? (
                                            project.teamMembers.map((person, index) => (
                                                <img key={index} src={person.picture} alt={person.name || ""} />
                                            ))
                                        ) : (
                                            <span className={styles["no-participants"]}>No participants</span>
                                        )}
                                    </div>
                                    <div className={styles["footer-i"]}>
                                        <img src={add} />
                                    </div>
                                    <div className={styles["footer-i"]}></div>
                                    <div className={styles["footer-i"]}>
                                        <img src={sync} />
                                    </div>
                                    <div className={styles["footer-i"]}>
                                        <img src={dotIcon} />
                                    </div>
                                    <div
                                        className={styles["footer-i"]}
                                        onClick={openIssueModal}
                                    >
                                        Raise an issue
                                    </div>
                                </div>
                            </div>
                       
                    </div>

                    {/* Issue Content */}
                    <div className={styles["issue-content-wrapper"]}>
                        {/* Search & Filters */}
                        <div className={styles["section-config-wrapper"]}>
                            <div className={styles["sec-config-i"]}>
                                <img src={search} />
                                <input
                                    type="text"
                                    placeholder="Search"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className={styles["sec-config-action-wrapper"]}>
                                <div className={styles["sec-config-action-pill"]}>
                                    <img src={filter} />
                                    <p>Filter</p>
                                </div>
                                <div className={styles["sec-config-action-pill"]}>
                                    <img src={sort} />
                                    <p>Sort</p>
                                </div>
                            </div>
                        </div>

                        {/* View Switcher */}
                        <div
                            className={
                                `${styles["view-wrapper"]} ` +
                                (activeView === "kanban" ? styles["kanban-view"] : "") +
                                (activeView === "spreadsheet" ? ` ${styles["spreadsheet-view"]}` : "") +
                                (activeView === "calendar" ? ` ${styles["calendar-view"]}` : "")
                            }
                        >
                            {activeView === "kanban" ? (
                                <Kanban
                                    data={filteredIssues}
                                    groupBy={groupBy}
                                    titleKey="title"
                                    descriptionKey="description"
                                    searchQuery={searchQuery}
                                    onCardClick={(card) => {
                                        setSelectedIssue(card)
                                    }}
                                    onAddClick={(group) => console.log("Add to", group)}
                                    statusLabels={labelMap[groupBy] || {}}
                                    onCardMove={handleCardMove}
                                    entity="issues"
                                />
                            ) : activeView === "spreadsheet" ? (
                                <UniversalSpreadsheetView
                                    data={issues}
                                    columns={[
                                        { key: "title", label: "Title", editable: true },
                                        { key: "status", label: "Status", editable: true },
                                        { key: "severity", label: "Severity" },
                                        { key: "dueDate", label: "Due Date" }
                                    ]}
                                    statusMapper={statusMapper}
                                    searchQuery={searchQuery}
                                />
                            ) : (
                                <UniversalCalendarView
                                    projectId={project._id}
                                    fetchEntitiesByProjectId={fetchIssues}
                                    updateEntity={updateIssue}
                                    type={"issues"}
                                />
                            )}
                        </div>
                    </div>


                    </div>
                    </div>




                    {selectedIntegration &&
                        <SelectedIntegration
                            selectedIntegration={selectedIntegration}
                            setSelectedIntegration={setSelectedIntegration}
                        />
                    }
                </div>
                <div className={styles["issue-actionbar-wrapper"]}>
                    <SideActionBarTower
                        setAppCenterOpen={setAppCenterOpen}
                        onIntegrationSelect={(integrationSelection)=>{
                            setSelectedIntegration((integrationSelection))
                        }}
                    />
                </div>
            </div>


            {selectedIssue && <IssueModal selectedIssue={selectedIssue} setSelectedIssue={setSelectedIssue}/> }
            {isOpenIssueModal && <IssueModalWrapper setOpenIssueModal={setIsOpenIssueModal} />}
            {isAITriageOpen && <AITriage projectId={"68159219cdb8524689046498"} onSuccess={handleSuccessAITriage} />}
            {isAppCenterOpen && <AppCenter onClose={() => setAppCenterOpen(false)} />}


        </div>
    );
};

export default IssuesOverview;
