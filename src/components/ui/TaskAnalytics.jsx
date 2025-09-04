import React, { useEffect, useState } from "react";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import "chart.js/auto";
import styles from "./TaskAnalytics.module.css";
import { fetchTasksByProjectId } from "../../service/Tasks/taskService";
import DriftIQ from "../features/DriftIQ";



const TaskAnalytics = ({ projectId }) => {
    const [tasks, setTasks] = useState([]);
    const [insights, setInsights] = useState([]);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await fetchTasksByProjectId(projectId);
                setTasks(data);
            } catch (err) {
                console.error("Failed to fetch tasks", err);
            }
        };
        if (projectId) load();
    }, [projectId]);


    return (
        <div className={styles.analyticsWrapper}>
            <DriftIQ projectId={projectId}/>
        </div>
    );
};

export default TaskAnalytics;