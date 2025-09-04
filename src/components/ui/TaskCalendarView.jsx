import React, { useEffect, useState, useRef } from "react";
import styles from "./TaskCalendarView.module.css";
import { fetchTasksByProjectId } from "../../service/Tasks/taskService";
import dropdown from "../../images/icons/dropdown.svg";
import { useLocation, useNavigate } from "react-router-dom";
import { parseISO, isValid } from "date-fns";
import {Towers} from "../../views/Dashboard/Dashboard";

const TaskCalendarView = ({ projectId }) => {
    const [tasks, setTasks] = useState([]);
    const [draggedTask, setDraggedTask] = useState(null);
    const autoSwitchTimer = useRef(null);
    const taskMap = { low: 1, medium: 2, high: 3, emergency: 4 };

    const location = useLocation();
    const navigate = useNavigate();

    // Extract and parse date from URL query param
    const queryParams = new URLSearchParams(location.search);
    const initialDateParam = queryParams.get("date");
    const initialDate = initialDateParam && isValid(parseISO(initialDateParam))
        ? parseISO(initialDateParam)
        : new Date();
    const [currentDate, setCurrentDate] = useState(initialDate);

    // Update URL whenever currentDate changes
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        params.set("date", formatDate(currentDate));
        navigate(`${location.pathname}?${params.toString()}`, { replace: true });
    }, [currentDate]);

    // Fetch tasks on mount or when projectId changes
    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await fetchTasksByProjectId(projectId);
                setTasks(data);
            } catch (err) {
                console.error("Error fetching tasks:", err);
            }
        };
        if (projectId) fetchData();
    }, [projectId]);

    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = `${date.getMonth() + 1}`.padStart(2, '0');
        const day = `${date.getDate()}`.padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const tasksForDate = (dateStr) =>
        tasks.filter(task => {
            if (!task.dueDate) return false;
            const localDueDate = formatDate(new Date(task.dueDate));
            return localDueDate === dateStr;
        });

    const getMonthDays = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const days = [];

        const startWeekDay = firstDay.getDay();
        for (let i = 0; i < startWeekDay; i++) days.push(null);
        for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d));

        return days;
    };

    const handleDragStart = (task) => {
        setDraggedTask(task);
    };

    const updateTaskDueDate = async (taskId, dueDate) => {
        const response = await fetch(`http://localhost:5001/api/v1/tasks/${taskId}/due-date`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ dueDate })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to update due date");
        }

        return response.json();
    };

    const handleDrop = async (e, targetDate) => {
        e.preventDefault();
        clearAutoSwitchTimer();

        if (!draggedTask || !targetDate) return;

        const newDueDate = formatDate(targetDate);

        try {
            await updateTaskDueDate(draggedTask._id, newDueDate);

            const updatedTask = {
                ...draggedTask,
                dueDate: newDueDate
            };

            const updatedTasks = tasks.map(t =>
                t._id === draggedTask._id ? updatedTask : t
            );

            setTasks(updatedTasks);
            setDraggedTask(null);
        } catch (error) {
            console.error("Failed to update due date:", error);
            alert("Could not update task due date.");
        }
    };

    const handleAutoSwitch = (direction) => {
        if (autoSwitchTimer.current) return;

        autoSwitchTimer.current = setTimeout(() => {
            if (direction === "prev") goToPrevMonth();
            if (direction === "next") goToNextMonth();
            autoSwitchTimer.current = null;
        }, 1000);
    };

    const clearAutoSwitchTimer = () => {
        if (autoSwitchTimer.current) {
            clearTimeout(autoSwitchTimer.current);
            autoSwitchTimer.current = null;
        }
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();

        const isFirstColumn = index % 7 === 0;
        const isLastColumn = index % 7 === 6;

        if (isFirstColumn) {
            handleAutoSwitch("prev");
        } else if (isLastColumn) {
            handleAutoSwitch("next");
        } else {
            clearAutoSwitchTimer();
        }
    };

    const goToPrevMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    const calendarDays = getMonthDays();

    return (
        <div className={styles.calendarWrapper}>
            <div className={styles.header}>
                <div className={styles["header-i"]}>
                    <div className={styles["header-pill-i"]}>
                        <p>Calendar View</p>
                    </div>
                </div>

                <div className={styles["header-i"]}>
                    <div className={styles["header-pill-i"]}>
                        <img
                            onClick={goToPrevMonth}
                            src={dropdown}
                            alt="Previous Month"
                            style={{ transform: "rotate(90deg)", cursor: "pointer" }}
                        />
                        <p>
                            {currentDate.toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long"
                            })}
                        </p>
                        <img
                            onClick={goToNextMonth}
                            src={dropdown}
                            alt="Next Month"
                            style={{ transform: "rotate(-90deg)", cursor: "pointer" }}
                        />
                    </div>
                </div>
            </div>

            <div className={styles.grid}>
                {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day, i) => (
                    <div key={i} className={styles.dayHeader}>{day}</div>
                ))}

                {calendarDays.map((day, index) => (
                    <div
                        key={index}
                        className={`${styles.dayCell} ${!day ? styles.emptyCell : ''}`}
                        onDrop={(e) => handleDrop(e, day)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragLeave={clearAutoSwitchTimer}
                    >
                        {day && (
                            <>
                                <div className={styles.date}>
                                    {day.toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric"
                                    })}
                                </div>
                                <div className={styles.taskList}>
                                    {tasksForDate(formatDate(day)).map(task => (
                                        <div
                                            key={task._id}
                                            className={`${styles.taskCard} ${draggedTask?._id === task._id ? styles.dragging : ''}`}
                                            draggable
                                            onDragStart={() => handleDragStart(task)}
                                            onDragEnd={() => setDraggedTask(null)}
                                        >
                                            {/*<Towers signal={taskMap[task.priority]} />*/}
                                            <p>{task.title}</p>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TaskCalendarView;