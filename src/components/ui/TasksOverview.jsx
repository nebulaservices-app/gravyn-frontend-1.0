import React, { useState, useEffect, useCallback } from "react";
import styles from "./TasksOverview.module.css"; // Use the new CSS module for tasks
import useProjectContext from "../../hook/useProjectContext";
import { fetchTasksByProjectId, updateTask, createTask } from "../../service/Tasks/taskService"; // Ensure createTask is imported

// --- Icons ---
import kanban from "../../images/icons/kanban.svg";
import list from "../../images/icons/list.svg";
import timeline from "../../images/icons/timeline.svg";
import calendar from "../../images/icons/calendar.svg";
import search from "../../images/icons/search.svg";
import filter from "../../images/icons/filter.svg";
import sort from "../../images/icons/sort.svg";
import add from "../../images/icons/add.svg";
import sync from "../../images/icons/sync.svg";
import dotIcon from "../../images/icons/dot.svg";

// --- Components (ensure these paths are correct in your project structure) ---
import Kanban from "./Kanban"; // Reusable Kanban component (should be generic for issues/tasks)
import UniversalSpreadsheetView from "./UniversalSpreadsheetView"; // Generic spreadsheet view
import UniversalCalendarView from "./UniversalCalendarView"; // Generic calendar view
import TaskModalWrapper from "./TaskModalWrapper"; // The modal for creating/editing tasks
import AppCenter from "./AppCenter"; // Your AppCenter component
import SideActionBarTower from "./SideActionBarTower"; // Your SideActionBarTower component

// ==========================
// Tasks Overview Component
// ==========================
const TasksOverview = () => {
    // --- Context / State ---
    // Project and user data now come from the ProjectContext, similar to IssuesOverview
    const { project } = useProjectContext();

    // UI + logic state
    const [searchQuery, setSearchQuery] = useState("");
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeView, setActiveView] = useState("kanban"); // Default view is Kanban
    const [groupBy, setGroupBy] = useState("status"); // Default grouping for Kanban
    const [isAppCenterOpen, setAppCenterOpen] = useState(false);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false); // State for opening new task modal
    const [selectedTask, setSelectedTask] = useState(null); // State for editing existing task modal

    // --- Label Maps (Adjust for Tasks - these should match your task data structure) ---
    const labelMap = {
        status: {
            todo: "To Do",
            in_progress: "In Progress",
            in_review: "In Review",
            done: "Done",
        },
        priority: {
            high: "High",
            medium: "Medium",
            low: "Low",
        },
        // Add other groupings if needed, e.g., assignee
        // assignee: { 'user1_id': 'User 1 Name', 'user2_id': 'User 2 Name' }
    };

    // Status mapper for UniversalSpreadsheetView, if it needs to display specific icons/labels
    const statusMapper = [
        { key: "todo", label: "To Do" /* icon: todoIcon */ }, // Add actual icon imports if desired
        { key: "in_progress", label: "In Progress" /* icon: progressIcon */ },
        { key: "in_review", label: "In Review" /* icon: reviewIcon */ },
        { key: "done", label: "Done" /* icon: doneIcon */ },
    ];

    // --- Effect: Fetch tasks on project change ---
    useEffect(() => {
        if (!project?._id) return; // Only fetch if a project is selected
        const loadTasks = async () => {
            try {
                setLoading(true);
                // Corrected function call: fetchTasksByProjectId
                const tasksList = await fetchTasksByProjectId(project._id );
                setTasks(tasksList);
            } catch (error) {
                console.error("Failed to load tasks:", error.message);
            } finally {
                setLoading(false);
            }
        };
        loadTasks();
    }, [project]); // Re-run when project changes

    // --- Filtered tasks based on search query ---
    const filteredTasks = tasks.filter((task) =>
        task.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // --- Kanban/Drag handler for status updates ---
    const handleCardMove = async (movedItem, fromGroup, toGroup) => {
        // Optimistic UI update
        const updated = tasks.map((task) =>
            task._id === movedItem._id ? { ...task, [groupBy]: toGroup } : task
        );
        setTasks(updated);

        // API call to persist the change
        try {
            await updateTask(movedItem._id, { [groupBy]: toGroup });
        } catch (err) {
            console.error("Failed to update task:", err.message);
            // Revert UI if API call fails
            setTasks(tasks);
        }
    };

    // --- Hotkey handler for creating a new task (Ctrl/Cmd + T) ---
    const handleKeyDown = useCallback((e) => {
        if ((e.ctrlKey || e.metaKey) && (e.key === "t" || e.key === "T")) {
            e.preventDefault(); // Prevent browser's default action (e.g., new tab)
            setIsTaskModalOpen(true);
        }
    }, []);

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

    // --- UI Render ---
    return (
        <div className={styles["task-overview-wrapper"]}>
            {/* Main Body - using task-main for consistency */}
            <div className={styles["task-main"]}>
                <div className={styles["task-main-wrapper"]}>
                    {/* Header Section - using task-header for consistency */}
                    <div className={styles["task-header-wrapper"]}>
                        {/* No notification bar, as per IssuesOverview example */}
                        <div className={styles["task-header-context-wrapper"]}>
                            <div className={styles["context-text-wrapper"]}>
                                <p className={styles["header-heading"]}>Tasks Overview</p>
                                <p className={styles["header-subheading"]}>
                                    View, manage, and track all tasks across your project in one unified dashboard.
                                </p>
                            </div>
                            <div className={styles["header-context-footer"]}>
                                <div className={styles["header-context-capsule"]}>
                                    {[
                                        {icon: kanban, label: "Kanban", view: "kanban"},
                                        {icon: list, label: "Spreadsheet", view: "spreadsheet"},
                                        {icon: timeline, label: "Gantt", view: "gantt"}, // Placeholder for Gantt view
                                        {icon: calendar, label: "Calendar", view: "calendar"},
                                    ].map((viewItem) => (
                                        <div
                                            key={viewItem.label}
                                            className={`${styles["header-menu-pill"]} ${activeView === viewItem.view ? styles["active"] : ""}`}
                                            onClick={() => setActiveView(viewItem.view)}
                                        >
                                            <img src={viewItem.icon} alt={viewItem.label}/>
                                            <p>{viewItem.label}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className={styles["header-footer-flexer-i"]}>
                                    {/* Team Members Display (limited to 4, as per IssuesOverview) */}
                                    <div className={styles["footer-i"]}>
                                        {project?.teamMembers?.slice(0, 4).map((person, index) => (
                                            <img key={index} src={person.picture} alt={person.name || ""} />
                                        ))}
                                    </div>
                                    <div className={styles["footer-i"]}><img src={add} alt="Add Member"/></div>
                                    <div className={styles["footer-i"]}></div> {/* Separator, as in IssuesOverview */}
                                    <div className={styles["footer-i"]}><img src={sync} alt="Sync"/></div>
                                    <div className={styles["footer-i"]}><img src={dotIcon} alt="More"/></div>
                                    {/* Create Task Button */}
                                    <div className={styles["footer-i"]} onClick={() => setIsTaskModalOpen(true)}>
                                        Create a task
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Task Content Area - using task-content-wrapper */}
                    <div className={styles["task-content-wrapper"]}>
                        {/* Search & Filters Section */}
                        <div className={styles["section-config-wrapper"]}>
                            <div className={styles["sec-config-i"]}>
                                <img src={search} alt="Search Icon"/>
                                <input
                                    type="text"
                                    placeholder="Search tasks..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className={styles["sec-config-action-wrapper"]}>
                                <div className={styles["sec-config-action-pill"]}><img src={filter} alt="Filter Icon"/><p>Filter</p></div>
                                <div className={styles["sec-config-action-pill"]}><img src={sort} alt="Sort Icon"/><p>Sort</p></div>
                            </div>
                        </div>

                        {/* View Switcher: Renders the active view (Kanban, Spreadsheet, Calendar, Gantt) */}
                        <div className={`${styles["view-wrapper"]} ${styles[`${activeView}-view`]}`}>
                            {loading ? (
                                <p>Loading tasks...</p>
                            ) : (
                                <>
                                    {activeView === "kanban" && (
                                        <Kanban
                                            data={filteredTasks}
                                            groupBy={groupBy}
                                            titleKey="title" // Assuming tasks have a 'title'
                                            // descriptionKey="description" // Add if Kanban cards display descriptions
                                            onCardClick={(card) => setSelectedTask(card)} // Opens TaskModal for selected task
                                            // onAddClick={(group) => console.log("Add new task to group", group)} // Enable if Kanban has an 'add' button per group
                                            statusLabels={labelMap[groupBy] || {}} // Pass status labels for display
                                            onCardMove={handleCardMove} // Handles drag-and-drop
                                            entity="tasks" // Specifies the entity type for generic Kanban
                                        />

                                    )}
                                    {activeView === "spreadsheet" && (
                                        <UniversalSpreadsheetView
                                            data={tasks}
                                            columns={[
                                                { key: "title", label: "Title", editable: true },
                                                { key: "status", label: "Status", editable: true },
                                                { key: "priority", label: "Priority" },
                                                { key: "dueDate", label: "Due Date" }, // Assuming tasks have a 'dueDate'
                                            ]}
                                            statusMapper={statusMapper} // To map status keys to readable labels/icons
                                            searchQuery={searchQuery} // For internal filtering if any
                                        />
                                    )}
                                    {activeView === "calendar" && (
                                        <UniversalCalendarView
                                            projectId={project._id}
                                            fetchEntitiesByProjectId={fetchTasksByProjectId} // Function to fetch tasks for calendar
                                            updateEntity={updateTask} // Function to update a task (e.g., drag on calendar)
                                            type={"tasks"} // Entity type for generic calendar
                                        />
                                    )}
                                    {/* Placeholder for Gantt view - needs its own component */}
                                    {activeView === "gantt" && (
                                        <p style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>Gantt View Coming Soon...</p>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
                {/* Side Action Bar */}
                <div className={styles["task-actionbar-wrapper"]}>
                    <SideActionBarTower setAppCenterOpen={setAppCenterOpen} />
                </div>
            </div>

            {/* Modals: Rendered conditionally based on state */}
            {selectedTask && ( // When an existing task is clicked on Kanban/Spreadsheet
                <TaskModalWrapper
                    task={selectedTask}
                    setOpenModal={setSelectedTask} // Close function also resets selectedTask
                />
            )}
            {isTaskModalOpen && ( // When "Create a task" button or hotkey is used
                <TaskModalWrapper
                    setOpenModal={setIsTaskModalOpen} // Close function resets isTaskModalOpen
                />
            )}
            {isAppCenterOpen && ( // AppCenter modal
                <AppCenter onClose={() => setAppCenterOpen(false)} />
            )}
        </div>
    );
};

export default TasksOverview;
