import React, { useEffect, useState } from "react";
import styles from "./TaskGanttView.module.css";
import { fetchTasksByProjectId } from "../../service/Tasks/taskService";

const TaskGanttView = ({ projectId }) => {
    const [tasks, setTasks] = useState([]);
    const [daysRange, setDaysRange] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const data = await fetchTasksByProjectId(projectId);
            setTasks(data);
            computeDaysRange(data);
        };
        if (projectId) fetchData();
    }, [projectId]);

    const computeDaysRange = (tasks) => {
        let allDates = tasks.flatMap(task => [new Date(task.startDate), new Date(task.dueDate)]);
        const min = new Date(Math.min(...allDates));
        const max = new Date(Math.max(...allDates));

        const days = [];
        let cur = new Date(min);
        while (cur <= max) {
            days.push(new Date(cur));
            cur.setDate(cur.getDate() + 1);
        }
        setDaysRange(days);
    };

    const getBarStyle = (start, end) => {
        const startIndex = daysRange.findIndex(d => d.toDateString() === new Date(start).toDateString());
        const endIndex = daysRange.findIndex(d => d.toDateString() === new Date(end).toDateString());
        if (startIndex === -1 || endIndex === -1) return {};
        const left = `${startIndex * 20}px`;
        const width = `${(endIndex - startIndex + 1) * 20}px`;
        return { left, width };
    };

    return (
        <div className={styles.ganttWrapper}>
            <div className={styles.headerRow}>
                <div className={styles.taskColumn}>Task</div>
                <div className={styles.timeline}>
                    {daysRange.map((date, i) => (
                        <div key={i} className={styles.timelineCell}>
                            {date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                        </div>
                    ))}
                </div>
            </div>
            {tasks.map((task) => (
                <div key={task._id} className={styles.taskRow}>
                    <div className={styles.taskColumn}>{task.title}</div>
                    <div className={styles.timeline}>
                        <div className={styles.ganttBar} style={getBarStyle(task.startDate, task.dueDate)}>
                            <span>{task.status}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default TaskGanttView;