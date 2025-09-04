import React, { useEffect, useState } from 'react';
import styles from './CalendarTimeGridView.module.css';
import { fetchTasksByProjectId } from "../../service/Tasks/taskService";

const timeSlots = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2);
    const mins = i % 2 === 0 ? '00' : '30';
    return `${hour.toString().padStart(2, '0')}:${mins}`;
});

const getDayName = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' });

const CalendarTimeGridView = ({ projectId }) => {
    const [tasks, setTasks] = useState([]);
    const [days, setDays] = useState([]);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const data = await fetchTasksByProjectId(projectId);
                setTasks(data);

                // Extract all unique days (Mon, Tue...) from tasks
                const uniqueDays = [
                    ...new Set(
                        data.map(task => getDayName(task.startTime))
                    )
                ];
                setDays(uniqueDays);
            } catch (err) {
                console.error("Error fetching tasks:", err);
            }
        };

        if (projectId) fetchTasks();
    }, [projectId]);

    const getMinutesFromMidnight = (timeStr) => {
        const date = new Date(timeStr);
        return date.getHours() * 60 + date.getMinutes();
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.timeHeaderCell}></div>

            <div className={styles.dayHeaders}>
                {days.map(day => (
                    <div key={day} className={styles.dayHeader}>{day}</div>
                ))}
            </div>

            <div className={styles.grid}>
                <div className={styles.timeColumn}>
                    {timeSlots.map(slot => (
                        <div key={slot} className={styles.timeCell}>{slot}</div>
                    ))}
                </div>

                {days.map(day => (
                    <div key={day} className={styles.dayColumn}>
                        {timeSlots.map((_, i) => (
                            <div key={i} className={styles.slotCell}></div>
                        ))}

                        {tasks.filter(t => getDayName(t.startTime) === day).map((task, i) => {
                            const start = getMinutesFromMidnight(task.createdAt || task.dueDate);
                            const end = getMinutesFromMidnight(task.dueDate || task.createdAt);
                            const top = (start / 30) * 40;
                            const height = ((end - start) / 30) * 40;

                            return (
                                <div
                                    key={i}
                                    className={styles.taskBlock}
                                    style={{ top, height }}
                                >
                                    {task.title}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CalendarTimeGridView;