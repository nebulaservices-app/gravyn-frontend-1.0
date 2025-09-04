import React, { useEffect, useMemo, useState } from "react";
import styles from "./KanbanTasks.module.css";
import clock from "../../images/icons/clock.svg";
import subtask from "../../images/icons/subtasks.svg";
import comment from "../../images/icons/comment.svg";
import attachment from "../../images/icons/attachment.svg";
import issue from "../../images/icons/issues.svg";
import dot from "../../images/icons/dotmenu.svg";
import add from "../../images/icons/add.svg";
import { fetchTasksByProjectId } from "../../service/Tasks/taskService";
import { getUserNameAndImageById } from "../../service/User/UserFetcher";

const KanbanTasks = ({ projectId, searchQuery, onTaskClick }) => {
    const [tasks, setTasks] = useState([]);
    const [userDataMap, setUserDataMap] = useState({});


    const statusMap = {
        backlog: "Backlog",              // Not yet prioritized
        pending: "Pending",                   // Next in line
        in_progress: "In Progress",      // Being actively worked on
        under_review: "Under Review",          // Work finished, pending approval
        completed: "Completed",               // Fully done
        cancelled: "Failed",                // Attempted but failed, e.g., rejected or abandoned
        blocked: "Blocked"               // Cannot move forward due to issues
    };

    const statuses = Object.keys(statusMap); // ['backlog', 'todo', 'in_progress', ...]

    useEffect(() => {
        const getTasks = async () => {
            try {
                const data = await fetchTasksByProjectId(projectId);
                setTasks(data);
            } catch (err) {
                console.error("Error fetching tasks:", err);
            }
        };
        if (projectId) getTasks();
    }, [projectId]);

    useEffect(() => {
        const fetchAllUserDetails = async () => {
            const uniqueUserIds = [...new Set(tasks.map(task => task.assignedTo))];
            const userDataPromises = uniqueUserIds.map(async (userId) => {
                try {
                    const { name, picture } = await getUserNameAndImageById(userId);
                    return { userId, name, picture };
                } catch {
                    return { userId, name: "Unknown", picture: null };
                }
            });
            const userDetails = await Promise.all(userDataPromises);
            const map = {};
            userDetails.forEach(({ userId, name, picture }) => {
                map[userId] = { name, picture };
            });
            setUserDataMap(map);
        };

        if (tasks.length > 0) fetchAllUserDetails();
    }, [tasks]);

    const formatDate = (date) =>
        new Date(date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });

    const highlightText = (text, query) => {
        if (!query || !text) return text;
        const regex = new RegExp(`(${query})`, "gi");
        const parts = text.split(regex);
        return parts.map((part, index) =>
            part.toLowerCase() === query.toLowerCase() ? (
                <mark key={index} style={{ backgroundColor: "yellow", padding: 0 }}>
                    {part}
                </mark>
            ) : (
                part
            )
        );
    };

    const statusPriority = []; // your front-preferred statuses

    const allStatuses = [
        ...new Set(tasks.map(task => task.status?.trim().toLowerCase()))
    ];

    const sortedStatuses = [
        ...statusPriority,
        ...allStatuses.filter(status => !statusPriority.includes(status))
    ];

    const groupedTasks = sortedStatuses.reduce((acc, status) => {
        const normalizedStatus = status.toLowerCase();
        const tasksForStatus = tasks.filter(task => task.status?.trim().toLowerCase() === normalizedStatus);

        acc[status] = tasksForStatus.filter(task => {
            const assignedUserName = userDataMap[task.assignedTo]?.name || "";
            const query = searchQuery?.toLowerCase() || "";
            return (
                task.title?.toLowerCase().includes(query) ||
                task.description?.toLowerCase().includes(query) ||
                assignedUserName.toLowerCase().includes(query)
            );
        });

        return acc;
    }, {});


    const formatStatusTitle = (status) =>
        status
            .split(" ")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");

    return (
        <div className={styles["kanban-view-wrapper"]}>
            <div className={styles["kanban-view-columns"]}>
                {sortedStatuses.map((status) => (
                    <div key={status} className={styles["kanban-column"]}>
                        <div className={styles["kanban-column-header"]}>
                            <div className={styles['kanban-column-header-i']}>
                                <p className={styles["kanban-column-title"]}>
                                    {statusMap[status]}
                                </p>
                                <p className={styles["kanban-column-count"]}>
                                    {groupedTasks[status].length}
                                </p>
                            </div>
                            <div className={styles['kanban-column-header-i']}>
                                <img src={add} alt="Add Task" />
                            </div>
                        </div>
                        <div className={styles["kanban-column-tasks"]}>
                            <div className={styles['grey-zone']}>
                                {groupedTasks[status].length > 0 ? (
                                    groupedTasks[status].map((task) => (
                                        <div
                                            key={task._id}
                                            className={styles['task-card']}
                                            onClick={() => onTaskClick(task)}
                                        >
                                            <div className={styles['dot-img-wrapper']}>
                                                <img src={dot} alt="Options"/>
                                            </div>

                                            <div className={styles['task-details']}>
                                                <p className={styles['task-title']}>
                                                    {highlightText(task.title, searchQuery)}
                                                </p>
                                                <p className={styles['task-description']}>
                                                    {highlightText(task.description, searchQuery)}
                                                </p>
                                            </div>

                                            <div className={styles['task-properties']}>
                                                <div className={styles['task-properties-pill']}>
                                                    <img src={clock} alt="Due Date"/>
                                                    <p>{formatDate(task.dueDate)}</p>
                                                </div>

                                                {task.assignedTo && (
                                                    <div className={styles['task-properties-pill']}>
                                                        {userDataMap[task.assignedTo]?.picture && (
                                                            <img
                                                                src={userDataMap[task.assignedTo].picture}
                                                                alt={userDataMap[task.assignedTo].name}
                                                                className={styles['user-avatar']}
                                                            />
                                                        )}
                                                        <p>
                                                            {highlightText(
                                                                userDataMap[task.assignedTo]?.name || "Unknown",
                                                                searchQuery
                                                            )}
                                                        </p>
                                                    </div>
                                                )}

                                                <div className={styles['task-properties-pill']}>
                                                    <img src={subtask} alt="Subtasks"/>
                                                    <p>{task.subtasks?.length || 0} Subtasks</p>
                                                </div>
                                            </div>

                                            <div className={styles['task-addons']}>
                                                <div className={styles['task-addons-pill']}>
                                                    <img src={comment} alt="Comments"/>
                                                    <p>{task.comments?.length || 0}</p>
                                                </div>

                                                <div className={styles['task-addons-pill']}>
                                                    <img src={attachment} alt="Attachments"/>
                                                    <p>{task.attachments?.length || 0}</p>
                                                </div>

                                                <div className={styles['task-addons-pill']}>
                                                    <img src={issue} alt="Issues"/>
                                                    <p>{task.issues?.length || 0}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className={styles["empty-column-message"]}>
                                        No matching tasks
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default KanbanTasks;