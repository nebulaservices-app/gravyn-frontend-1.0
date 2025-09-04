import React, { useEffect, useState } from "react";
import styles from "./TaskSpreadsheet.module.css";
import { fetchTasksByProjectId } from "../../service/Tasks/taskService";
import { getUserNameAndImageById } from "../../service/User/UserFetcher";

const TaskSpreadsheetGrouped = ({ projectId, searchQuery }) => {
    const [tasks, setTasks] = useState([]);
    const [userMap, setUserMap] = useState({});

    useEffect(() => {
        const loadTasks = async () => {
            const data = await fetchTasksByProjectId(projectId);
            setTasks(data);
        };
        if (projectId) loadTasks();
    }, [projectId]);

    useEffect(() => {
        const loadUsers = async () => {
            const userIds = [...new Set(tasks.map(task => task.assignedTo))];
            const results = await Promise.all(userIds.map(async (uid) => {
                try {
                    const { name, picture } = await getUserNameAndImageById(uid);
                    return { uid, name, picture };
                } catch {
                    return { uid, name: "Unknown", picture: null };
                }
            }));
            const map = {};
            results.forEach(({ uid, name, picture }) => {
                map[uid] = { name, picture };
            });
            setUserMap(map);
        };
        if (tasks.length) loadUsers();
    }, [tasks]);

    const filtered = tasks.filter(task => {
        const q = searchQuery?.toLowerCase() || "";
        const name = userMap[task.assignedTo]?.name || "";
        return task.title?.toLowerCase().includes(q)
            || task.description?.toLowerCase().includes(q)
            || name.toLowerCase().includes(q);
    });

    const grouped = filtered.reduce((acc, task) => {
        const status = task.status?.toLowerCase() || "unspecified";
        acc[status] = acc[status] || [];
        acc[status].push(task);
        return acc;
    }, {});

    const formatDate = (d) => new Date(d).toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric"
    });

    return (
        <div className={styles.wrapper}>
            {Object.entries(grouped).map(([status, tasks]) => (
                <div className={styles.statusGroup} key={status}>
                    <div className={styles.statusHeader}>
                        <p>{status}</p>
                        <span>{tasks.length}</span>
                    </div>
                    <table className={styles.taskTable}>
                        <thead>
                        <tr>
                            <th>Title</th>
                            <th>Assigned</th>
                            <th>Due</th>
                            <th>Subtasks</th>
                            <th>Comments</th>
                            <th>Attachments</th>
                            <th>Issues</th>
                        </tr>
                        </thead>
                        <tbody>
                        {tasks.map(task => (
                            <tr key={task._id}>
                                <td>{task.title}</td>
                                <td><img src={userMap[task.assignedTo]?.picture }/></td>
                                <td>{formatDate(task.dueDate)}</td>
                                <td>{task.subtasks?.length || 0}</td>
                                <td>{task.comments?.length || 0}</td>
                                <td>{task.attachments?.length || 0}</td>
                                <td>{task.issues?.length || 0}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            ))}
        </div>
    );
};

export default TaskSpreadsheetGrouped;