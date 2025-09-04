import React, { useRef, useEffect, useState } from "react";
import stylesdark from "./IssueModalWrapper.module.css";
import styleslight from "./IssueModalWrapperLight.module.css";
import close from "../../images/icons/close.svg";
import issues from "../../images/icons/issues.svg";
import aitriage from "../../images/icons/aitriage.svg";
import projectIcon from '../../images/icons/project.svg';
import low from "../../images/icons/issues_severity/low.svg";
import medium from "../../images/icons/issues_severity/medium.svg";
import critical from "../../images/icons/issues_severity/critical.svg";
import severe from "../../images/icons/issues_severity/severe.svg";
import tagsIcon from "../../images/icons/tags.svg";
import calendar from "../../images/icons/calendar.svg";
import { formatFullDate } from "../../utils/datetime";
import bug from "../../images/icons/bug_i.svg";
import improvement from "../../images/icons/wrench_i.svg";
import performance from "../../images/icons/rocket_i.svg";
import warning from "../../images/icons/warning_i.svg";
import info from "../../images/icons/bulb_i.svg";
import security from "../../images/icons/lock_i.svg";
import design from "../../images/icons/design_i.svg";
import {fetchTasksByProjectId} from "../../service/Tasks/taskService";
import useProjectContext from "../../hook/useProjectContext";

import taskIcon from "../../images/icons/tasks_i.svg"
import {createIssue} from "../../service/Issues/issuesService";
import {SnackbarProvider, useSnackbar} from "../../context/SnackbarProvider";

// --- Project/context injection if you use it ---
// const {project} = useProjectContext();
// In this demo, we'll pass project as a prop or define as below:

// ---- Constants ----
const ISSUE_TYPES = [
    { icon: bug, label: "Bug", tip: "A broken feature or something not working as expected." },
    { icon: improvement, label: "Improvement", tip: "Request to improve an existing part." },
    { icon: performance, label: "Performance", tip: "Slow or inefficient part of the app." },
    { icon: warning, label: "Warning", tip: "Potential risk or caution needed." },
    { icon: info, label: "Information", tip: "Sharing information or clarification." },
    { icon: security, label: "Security", tip: "Vulnerability or security concern." },
    { icon: design, label: "Design Flaws", tip: "Inconsistency/problem in UX/UI." }
];

const SEVERITY_LEVELS = [
    { label: "Low", icon: low, color: "#FFFFFF", tip: "Minor inconvenience, low urgency." },
    { label: "Medium", icon: medium, color: "#FFFFFF", tip: "Noticeable impact, moderate urgency." },
    { label: "Critical", icon: critical, color: "#FFFFFF", tip: "Blocks major user workflows." },
    { label: "Severe", icon: severe, color: "#FFFFFF", tip: "App-breaking/urgent attention needed." }
];

const tagColors = [
    "#1e90ff", "#22c55e", "#f59e42", "#a78bfa", "#f43f5e", "#06b6d4",
    "#fde047", "#10b981", "#f87171", "#6366f1", "#eab308", "#84cc16"
];
function getColorForTag(tag) {
    let sum = 0;
    for (let i = 0; i < tag.length; i++) sum += tag.charCodeAt(i);
    return tagColors[sum % tagColors.length];
}

function getDateForDueOption(option) {
    const today = new Date();
    if (option === "Today") return today;
    if (option === "Tomorrow") { const d = new Date(today); d.setDate(today.getDate() + 1); return d; }
    if (option === "Next Week") { const d = new Date(today); d.setDate(today.getDate() + 7); return d; }
    if (option && /^\d{4}-\d{2}-\d{2}$/.test(option)) return new Date(option);
    return null;
}


// Tooltip only on popover item hover (NOT on footer chip)
function TooltipPopover({ children, tip }) {
    const [hovered, setHovered] = useState(false);
    return (
        <span style={{ position: "relative", display: "inline-block" }}
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
        >
      {children}
            {hovered && (
                <span style={{
                    position: "absolute",
                    top: "110%",
                    left: 0,
                    background: "#232942",
                    color: "#fff",
                    borderRadius: 6,
                    fontSize: 12,
                    padding: "7px 13px",
                    whiteSpace: "pre-line",
                    zIndex: 3000,
                    boxShadow: "0 2px 12px 0 #191d26ac",
                    minWidth: 170, maxWidth: 250
                }}>
          {tip}
        </span>
            )}
    </span>
    );
}

// --- POPUP positioning
function useFieldPopover() {
    const triggerRef = useRef(null);
    const [show, setShow] = useState(false);
    const [pos, setPos] = useState({ top: 0, left: 0, width: 160 });
    const open = () => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setPos({ top: rect.bottom + window.scrollY + 2, left: rect.left + window.scrollX, width: Math.max(rect.width, 180) });
        }
        setShow(true);
    };
    const close = () => setShow(false);

    useEffect(() => {
        if (!show) return;
        const handler = e => {
            if (!triggerRef.current) return;
            if (document.getElementById("popover-root")?.contains(e.target)) return;
            if (triggerRef.current.contains(e.target)) return;
            setShow(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [show]);
    return { show, open, close, pos, triggerRef };
}

// --- Main modal ---
const issueTitleExamples = [
    "App crashes when opening profile",
    "Unable to reset password via email link",
    "Slow loading times on dashboard page",
    "Feature request: Export data to PDF",
    "Incorrect total displayed in shopping cart"
];

// Example: Receive project as prop or context, fallback to hardcoded data
const TASKS = [
    { id: 1, name: "Auth refactor" },
    { id: 2, name: "SEO Improvements" }
];

// ------------- MAIN COMPONENT -------------
const IssueModalWrapper = ({ setOpenIssueModal}) => {
    const [randomPlaceholder, setRandomPlaceholder] = useState(issueTitleExamples[0]);
    const titleRef = useRef(null);
    const descRef = useRef(null);


    const[mode, setMode] = useState("dark")
    const styles = mode === "light" ? styleslight : stylesdark;




    //Issue Field

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [linkedTask, setLinkedTask] = useState(null);
    const [issueType, setIssueType] = useState(ISSUE_TYPES[0]);
    const [dueDate, setDueDate] = useState("");
    const [tagsList, setTagsList] = useState([]);
    const [tagInput, setTagInput] = useState("");
    const [severity, setSeverity] = useState(SEVERITY_LEVELS[0]);
    const [assigneeSearch, setAssigneeSearch] = useState("");
    const [linkSearch, setLinkSearch] = useState("");
    const [tasks, setTasks] = useState([]);


    // --- popover hooks
    const projectPopover = useFieldPopover();
    const typePopover = useFieldPopover();
    const severityPopover = useFieldPopover();
    const duePopover = useFieldPopover();
    const tagsPopover = useFieldPopover();
    const assignPopover = useFieldPopover();
    const {project, loading} = useProjectContext();



    const [linkedProject, setLinkedProject] = useState(null);
    const [assignee, setAssignee] = useState(null);









    const buildIssuePayload = () => {
        // Example assignment logic (adjust as your UI supports team vs user!)
        // If you have assignMode + selectedUsers + selectedTeams:
        // const assignMode = "user" or "team";
        // const selectedUsers = [...] (array of user ids)
        // const selectedTeams = [...] (array of team ids)
        // For now, use assignee as single-user or replace with your assignment structure:
        let assignedTo = null;
        if (assignee) {
            assignedTo = {
                mode: "user",
                users: [assignee._id || assignee.id],
                teams: []
            };
        }
        // Example if you want to support team assignment (adjust as needed)
        // assignedTo = { mode: "team", users: [], teams: ["teamid123"] };

        // Build main payload
        const payload = {
            title: title.trim(),
            description: description.trim(),
            type: issueType.label,
            severity: severity.label,
            dueDate: dueDate ? (getDateForDueOption(dueDate)?.toISOString?.() ?? null) : null,
            tags: tagsList,
            assignedTo,
            status : "pending",
            projectId: project?._id,
            task: linkedTask?._id || linkedTask?.id || null,
            ref: linkedProject?._id ? { type: "project", id: linkedProject._id } : null,
            attachments : [],
            comments : []
            // optionally include more:
            // module: "Deployments",
            // source: "github",
            // attachments: [], // add if you support uploads
            // comments: []     // usually not in create, managed by backend
        };
        return payload;
    };

    const { showSnackbar } = useSnackbar();

    const handleCreateIssue = async () => {
        const issueData = buildIssuePayload();


        // Validate required fields before sending to backend
        if (!issueData.title.trim()) {
            showSnackbar({
                templateData: { message: "Issue title cannot be empty!" },
                variant: "error", // You can add a variant prop if your templates support it
                duration: 3000,
            });
            return; // Stop execution if validation fails
        }
        if (!issueData.description.trim()) {
            showSnackbar({
                templateData: { message: "Please provide a description for the issue." },
                variant: "error",
                duration: 3000,
            });
            return;
        }


        try {
            // Call your backend service to create the issue
            const response = await createIssue(issueData); // Assuming createIssue returns the response object

            // --- Success Case ---
            // Assuming createIssue service returns a successful response like { message: "Issue created", id: "..." }
            if (response && response.message === "Issue created") {
                showSnackbar({
                    templateKey: 'issues-creation',
                    templateData: {
                        title: issueData.title,
                        details: `ID: ${response.id || 'N/A'}`, // Use ID from backend response
                        onView: () => {
                            console.log(`Navigating to issue ${response.id}`);
                            // Example: navigate to the new issue detail page
                            // history.push(`/issues/${response.id}`);
                            setOpenIssueModal(false); // Close the modal on success
                        },
                    },
                    duration: 7000, // Show success for 7 seconds
                });
                setOpenIssueModal(false); // Close modal on successful creation
                // Optionally, clear form fields after successful submission
                setTitle("");
                setDescription("");
                setLinkedTask(null);
                setIssueType(ISSUE_TYPES[0]);
                setDueDate("");
                setTagsList([]);
                setTagInput("");
                setSeverity(SEVERITY_LEVELS[0]);
                setAssigneeSearch("");
                setLinkSearch("");
                setAssignee(null);
                setLinkedProject(project); // Reset linked project to current project context
            } else {
                // Handle unexpected successful responses if any
                showSnackbar({
                    templateData: { message: "Issue creation completed with an unexpected status." },
                    variant: "warning",
                    duration: 5000,
                });
            }

        } catch (e) {
            // --- Error Case ---
            console.error("Failed to create issue:", e);
            let errorMessage = "An unknown error occurred while creating the issue.";
            let errorTitle = "Issue Creation Failed";

            // Check for specific error messages from the backend
            if (e.response && e.response.data && e.response.data.error) {
                errorMessage = e.response.data.error; // Use error message from your backend
            } else if (e.message) {
                errorMessage = e.message; // Use generic error message (e.g., network error)
            }

            showSnackbar({
                templateKey: 'issues-creation', // Re-using for error feedback, or create a specific 'error-template'
                templateData: {
                    title: errorTitle,
                    details: errorMessage,
                    onView: () => console.log('See console for details'), // Action for error toast
                },
                variant: "error", // For styling purposes in your templates
                duration: 10000, // Show error for longer
            });
        }
    };


    useEffect(() => {
        if (project) {
            setLinkedProject(project);
            setAssignee(project.teamMembers && project.teamMembers.length > 0 ? project.teamMembers[0] : null);
        }
    }, [project]);

    useEffect(() => {
        console.log("Project data" , linkedProject)
    }, [linkedProject]);


// Fetch tasks when project._id changes
    useEffect(() => {
        if (!linkedProject?._id) return; // Defensive
        let mounted = true;
        fetchTasksByProjectId(linkedProject?._id)
            .then(res => {
                if (mounted) setTasks(res || []);
            })
            .catch(() => {
                if (mounted) setTasks([]);
            });
        return () => { mounted = false; };
    }, [linkedProject?._id]);




    useEffect(() => {
        console.log("Tasks" , tasks)
    }, [tasks]);


    // Placeholder cycle
    useEffect(() => {
        if (titleRef.current) titleRef.current.focus();
        const interval = setInterval(() => {
            setRandomPlaceholder(prev => {
                let nextIdx = Math.floor(Math.random() * issueTitleExamples.length);
                while (issueTitleExamples[nextIdx] === prev && issueTitleExamples.length > 1) {
                    nextIdx = Math.floor(Math.random() * issueTitleExamples.length);
                }
                return issueTitleExamples[nextIdx];
            });
        }, 6000);
        return () => clearInterval(interval);
    }, []);

    const handleTitleKeyDown = e => {
        if (e.key === "Enter") {
            e.preventDefault();
            if (descRef.current) descRef.current.focus();
        }
    };

    const handleKeyDown = e => {
        // Shift + Enter submits, anywhere
        if (e.key === "Enter" && e.shiftKey) {
            e.preventDefault();
            // Optionally: Validate inputs before submit here if you want
            handleCreateIssue();
        }
        // (Optional: for single Enter, keep your original focus-shift for title)
        if (e.key === "Enter" && !e.shiftKey && e.target === titleRef.current) {
            e.preventDefault();
            if (descRef.current) descRef.current.focus();
        }
    };

    const handleModalKeyDown = (e) => {
        if (e.key === "Enter" && e.shiftKey) {
            e.preventDefault();
            handleCreateIssue();
        }
    };



    // Tags logic
    const handleAddTag = () => {
        const tag = tagInput.trim();
        if (tag && !tagsList.includes(tag)) setTagsList([...tagsList, tag]);
        setTagInput("");
    };
    const handleRemoveTag = tagToRemove => setTagsList(tagsList.filter(tag => tag !== tagToRemove));

    // --- Filters
    const filteredProjects = linkSearch.trim()
        ? [project].filter(p => p.name.toLowerCase().includes(linkSearch.toLowerCase()))
        : [project];
    const filteredTasks = linkSearch.trim()
        ? tasks.filter(t => t.name.toLowerCase().includes(linkSearch.toLowerCase()))
        : tasks;


    const filteredUsers = linkedProject && linkedProject.teamMembers
        ? (assigneeSearch.trim()
            ? linkedProject.teamMembers.filter(u =>
                u.name.toLowerCase().includes(assigneeSearch.toLowerCase()))
            : linkedProject.teamMembers)
        : [];

    return (
        <div className={styles['issue-modal-overlay']}
             tabIndex={-1}   // So the div can receive key events even if nothing inside is focused
             onKeyDown={handleModalKeyDown}>
            <div className={styles['issue-modal-wrapper']}>
                {/* Header */}
                <div className={styles['issue-modal-header']}>
                    <div className={styles['issue-modal-header-i']}>
                        <img src={issues} alt="Issue icon" />
                        <p>Raise an issue</p>
                    </div>
                    <div className={styles['issue-modal-header-i']}>
                        <img src={close} alt="Close" style={{ cursor: "pointer" }} onClick={() => setOpenIssueModal(false)} />
                    </div>
                </div>
                {/* Content */}
                <div className={styles['issue-modal-content']}>
                    <div className={styles['issue-modal-content-i']}>
                        <div className={styles['issue-form-wrapper']}>
                            <input
                                ref={titleRef}
                                className={styles['issue-title-input']}
                                placeholder={`Enter a specific title for your issue (e.g., "${randomPlaceholder}")`}
                                onKeyDown={handleTitleKeyDown}
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                            />
                            <textarea
                                ref={descRef}
                                className={styles['issue-description-textarea']}
                                placeholder="Please describe your concern or situation in detail (up to 250 words)"
                                rows={2}
                                style={{overflowY: "auto"}}
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                onInput={e => {
                                    const el = e.target;
                                    el.style.height = "auto";
                                    el.style.height = Math.min(el.scrollHeight, 200) + "px";
                                }}
                            />

                            {/* Footer fields */}
                            <div className={styles['issue-modal-footer']}>
                                {/* Linked Project/Task */}
                                <div
                                    ref={projectPopover.triggerRef}
                                    className={styles['issue-modal-footer-i']}
                                    onClick={projectPopover.open}
                                    style={{cursor: "pointer", position: "relative"}}>
                                    <img src={
                                        linkedTask
                                            ? taskIcon
                                            : projectIcon
                                    } alt={linkedTask ? "Task icon" : "Project icon"}/>
                                    <p>
                                        {linkedTask
                                            ? `${linkedTask.title || linkedTask.name}`
                                            : linkedProject
                                                ? `Project: ${linkedProject.name}`
                                                : "Link Project/Task"}
                                    </p>
                                </div>

                                {/* Issue Type */}
                                <div
                                    ref={typePopover.triggerRef}
                                    className={styles['issue-modal-footer-i']}
                                    onClick={typePopover.open}
                                    style={{cursor: "pointer", position: "relative"}}>
                                    <img src={issueType.icon}/>
                                    <p>{issueType.label}</p>
                                </div>

                                {/* Severity */}
                                <div
                                    ref={severityPopover.triggerRef}
                                    className={styles['issue-modal-footer-i']}
                                    onClick={severityPopover.open}
                                    style={{cursor: "pointer", position: "relative"}}>
                                    <img src={severity.icon}/>
                                    <p>{severity.label}</p>
                                </div>

                                {/* Due Date (shows resolved shortcut) */}
                                <div
                                    ref={duePopover.triggerRef}
                                    className={styles['issue-modal-footer-i']}
                                    onClick={duePopover.open}
                                    style={{cursor: "pointer", position: "relative"}}>
                                    <img src={calendar}/>
                                    <p>
                                        {dueDate
                                            ? (["Today", "Tomorrow", "Next Week"].includes(dueDate)
                                                ? `${dueDate} (${formatFullDate(getDateForDueOption(dueDate))})`
                                                : dueDate
                                                    ? formatFullDate(getDateForDueOption(dueDate))
                                                    : "Due Date")
                                            : "Due Date"}
                                    </p>
                                </div>

                                {/* Assignee */}
                                <div
                                    ref={assignPopover.triggerRef}
                                    className={styles['issue-modal-footer-i']}
                                    onClick={assignPopover.open}
                                    style={{cursor: "pointer", position: "relative", minWidth: 70}}>
                                    <img src={assignee?.picture || ""} alt="Assign user"
                                         style={{height: "15px", borderRadius: "50%"}}/>
                                    <p>{assignee ? assignee.name : "Assign"}</p>
                                </div>

                                {/* Labels/Tags */}
                                <div
                                    ref={tagsPopover.triggerRef}
                                    className={`${styles['issue-modal-footer-i']} ${styles['issue-modal-footer-tag']}`}
                                    onClick={tagsPopover.open}
                                    style={{cursor: "pointer", position: "relative", minWidth: 90, zIndex: 15}}
                                >
                                    <img src={tagsIcon} alt="Tags"/>
                                    {tagsList.length === 0 ?
                                        <p className={styles['tags-p']}>Add Labels</p> :
                                        <div style={{display: "flex"}}>
                                            {tagsList.map(tag => (
                                                <p
                                                    key={tag}
                                                    className={styles['tags-chip']}
                                                    style={{
                                                        fontWeight: 500,
                                                        cursor: "pointer",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: "3.5px"
                                                    }}
                                                    title="Edit tags"
                                                >
                                                    <span style={{
                                                        display: "inline-block",
                                                        width: 7, height: 7, borderRadius: "2.5px",
                                                        background: getColorForTag(tag), marginRight: 5, flexShrink: 0
                                                    }}/>
                                                    {tag}
                                                </p>
                                            ))}
                                        </div>
                                    }
                                </div>
                            </div>
                            {/* <button className={styles['submit-btn']} onClick={submitIssue}>Submit</button> */}
                        </div>
                        <div className={styles['issue-modal-action-wrapper']}>
                            <div className={styles['issue-modal-action-wrapper-i']}>
                                <div className={styles['issue-modal-note-wrapper']}>
                                    <img src={aitriage} alt="AI Triage"/>
                                    <p>Describe your issue in detail so our AI can automatically triage and route it to
                                        the
                                        right team for faster resolution.</p>
                                </div>

                            </div>
                            <div className={styles['issue-modal-action-wrapper-i']}>
                                <div className={styles['action-buttons-wrapper']}>
                                    {/*<button className={styles['cancel-btn']}>Cancel</button>*/}
                                    <button
                                        onClick={handleCreateIssue}
                                        className={styles['create-btn']}>Create Issue</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={styles['issue-modal-content-i']}></div>
                </div>
            </div>

            {/* --- PROJECT/TASK POPOVER --- */}
            {projectPopover.show && (
                <div
                    id="popover-root"
                    className={styles['popover-menu']}
                    style={{position: "absolute", top: projectPopover.pos.top, left: projectPopover.pos.left, width : "400px" , zIndex: 1500 }}>
                    <div style={{ padding: "10px 0" }}>
                        <div style={{ fontWeight: 500, fontSize: 12, padding: "5px 20px 7px 20px", color: "#999" }}>Select Project</div>
                        <input
                            style={{ marginLeft: 20, marginBottom: 8, marginTop: 2, padding: "3px 8px", width: "80%" }}
                            placeholder="Search project/task"
                            value={linkSearch}
                            onChange={e => setLinkSearch(e.target.value)}
                        />
                        {filteredProjects.map(proj => (
                            <div
                                key={proj._id}
                                className={proj === linkedProject && !linkedTask ? styles['selected'] : undefined}
                                style={{ padding: "10px 20px", cursor: "pointer" }}
                                onClick={() => { setLinkedProject(proj); setLinkedTask(null); setLinkSearch(""); projectPopover.close(); }}>
                                {proj.name}
                            </div>
                        ))}
                        <div style={{ fontWeight: 500, fontSize: 12, padding: "15px 20px 7px 20px", color: "#999" }}>Or Link to Task</div>
                        {filteredTasks.map(task => (
                            <div
                                key={task._id || task.id} // try both
                                className={task === linkedTask ? styles['selected'] : undefined}
                                style={{ padding: "10px 20px", cursor: "pointer" }}
                                onClick={() => { setLinkedTask(task); setLinkedProject(null); setLinkSearch(""); projectPopover.close(); }}
                            >
                                {task.title || task.title || JSON.stringify(task)}
                            </div>
                        ))}
                        {filteredTasks.length === 0 && (
                            <div className={styles['popover-empty']}>No tasks found for this project</div>
                        )}



                        {(filteredProjects.length === 0 && filteredTasks.length === 0) && (
                            <div className={styles['popover-empty']}>No match found</div>
                        )}
                    </div>
                </div>
            )}

            {/* --- ISSUE TYPE POPOVER --- */}
            {typePopover.show && (
                <div
                    id="popover-root"
                    className={styles['popover-menu']}
                    style={{
                        position: "absolute",
                        top: typePopover.pos.top,
                        left: typePopover.pos.left,
                        minWidth: typePopover.pos.width,
                        zIndex: 1500
                    }}>
                    <div className={styles['popover-header']}>
                        <p className={styles['popover-title']}>Select issue type</p>
                    </div>
                    <div className={styles['type-list']}>
                        {ISSUE_TYPES.map(t =>
                            <div
                                key={t.label}
                                className={`${t.label === issueType.label ? styles['selected'] : undefined} ${styles['type-list-item']}`}
                                onClick={() => {
                                    setIssueType(t); typePopover.close();
                                }}
                                style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", padding: "8px 15px" }}
                            >
                                <TooltipPopover tip={t.tip}>
                                    <img src={t.icon} alt={t.label} />
                                </TooltipPopover>
                                <p>{t.label}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* --- SEVERITY POPOVER --- */}
            {severityPopover.show && (
                <div
                    id="popover-root"
                    className={styles['popover-menu']}
                    style={{
                        position: "absolute",
                        top: severityPopover.pos.top,
                        left: severityPopover.pos.left,
                        minWidth: severityPopover.pos.width,
                        zIndex: 1500
                    }}
                >
                    <div className={styles['popover-header']}>
                        <p className={styles['popover-title']}>Select Severity</p>
                    </div>
                    <div className={styles['severity-list']}>
                        {SEVERITY_LEVELS.map(s => (
                            <div
                                key={s.label}
                                className={`${severity.label === s.label ? styles['selected'] : undefined} ${styles['severity-list-item']}`}
                                onClick={() => { setSeverity(s); severityPopover.close(); }}
                                style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", padding: "8px 15px" }}
                            >
                                <TooltipPopover tip={s.tip}>
                                    <img src={s.icon} alt={s.label} />
                                </TooltipPopover>
                                <p style={{ color: s.color }}>{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* --- DUE DATE POPOVER --- */}
            {duePopover.show && (
                <div
                    id="popover-root"
                    className={styles['popover-menu']}
                    style={{
                        position: "absolute",
                        top: duePopover.pos.top,
                        left: duePopover.pos.left,
                        minWidth: duePopover.pos.width,
                        zIndex: 1500
                    }}>
                    <div className={styles['popover-header']}>
                        <p className={styles['popover-title']}>Choose a date</p>
                    </div>
                    <div style={{ padding: "10px 0" }}>
                        {["Today", "Tomorrow", "Next Week", "Pick a date..."].map(option => (
                            <div
                                key={option}
                                className={dueDate === option ? styles['selected'] : undefined}
                                style={{ padding: "10px 20px", cursor: "pointer" }}
                                onClick={() => { setDueDate(option); duePopover.close(); }}>
                                {option}
                            </div>
                        ))}
                        {dueDate === "Pick a date..." && (
                            <input
                                style={{
                                    margin: "10px 20px",
                                    padding: "5px",
                                    borderRadius: 6,
                                    border: "1px solid #ccc",
                                    width: 130
                                }}
                                type="date"
                                value={dueDate.length === 10 ? dueDate : ""}
                                onChange={e => setDueDate(e.target.value)}
                            />
                        )}
                        <div
                            style={{ padding: "10px 20px", cursor: "pointer", color: "#f87171" }}
                            onClick={() => { setDueDate(""); duePopover.close(); }}>
                            Clear due date
                        </div>
                    </div>
                </div>
            )}

            {/* --- ASSIGNEE POPOVER --- */}
            {assignPopover.show && (
                <div
                    id="popover-root"
                    className={styles['popover-menu']}
                    style={{
                        position: "absolute",
                        top: assignPopover.pos.top,
                        left: assignPopover.pos.left,
                        minWidth: assignPopover.pos.width,
                        zIndex: 1500
                    }}>
                    {/*<div className={styles['popover-header']}><p className={styles['popover-title']}>Assign to User</p></div>*/}
                    <input
                        className={styles['popover-search']}
                        placeholder="Search users"
                        value={assigneeSearch}
                        onChange={e => setAssigneeSearch(e.target.value)}
                        style={{ margin: "5px 0 10px 0" }}
                    />
                    <div className={styles['popover-list']}>
                        {filteredUsers.map(user => (
                            <div
                                key={user._id}
                                className={assignee && assignee._id === user._id ? `${styles['selected']} ${styles['popover-list-item']}` : `${styles['popover-list-item']}`}
                                onClick={() => { setAssignee(user); setAssigneeSearch(""); assignPopover.close(); }}
                            >
                                <img src={user.picture} alt={user.name} />
                                <p>{user.name}</p>
                            </div>
                        ))}
                        {filteredUsers.length === 0 &&
                            <div className={styles['popover-empty']}>No users found</div>
                        }
                    </div>
                </div>
            )}

            {/* --- TAGS POPOVER --- */}
            {tagsPopover.show && (
                <div
                    id="popover-root"
                    className={styles['tags-popover']}
                    style={{ position: "absolute", top: tagsPopover.pos.top, left: tagsPopover.pos.left, minWidth: tagsPopover.pos.width, zIndex: 1500 }}>
                    <div className={styles['tags-modal']}>
                        <div className={styles['tags-add-row']}>
                            <input
                                type="text"
                                value={tagInput}
                                maxLength={25}
                                placeholder="Choose label and press Enter"
                                className={styles['tag-add-input']}
                                onChange={e => setTagInput(e.target.value)}
                                onKeyDown={e => { if (e.key === "Enter") handleAddTag(); }}
                                autoFocus
                            />
                        </div>
                        <div className={styles['tags-list']}>
                            {tagsList.length === 0 && <span className={styles['no-tags']}>No tags yet</span>}
                            {tagsList.map(tag => (
                                <div
                                    key={tag}
                                    className={styles['tag-chip']}
                                    style={{ alignItems: "center", fontSize: 13, display: "flex" }}
                                >
                  <span style={{
                      display: "inline-block", width: 7, height: 7, borderRadius: "50%",
                      background: getColorForTag(tag), marginRight: 8, flexShrink: 0
                  }} />
                                    <span>{tag}</span>
                                    <img
                                        className={styles['close-label']}
                                        src={close}
                                        style={{ marginLeft: 8, height: 10, opacity: 0.7, cursor: "pointer" }}
                                        onClick={e => { e.stopPropagation(); handleRemoveTag(tag) }}
                                        alt="Remove"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IssueModalWrapper;
