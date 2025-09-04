import React, { useState, useMemo, useRef, useEffect } from 'react';
import styles from './EnchancedChartsDemo.module.css';
import {fetchTasksByProjectId} from "../service/Tasks/taskService";

const EnhancedTaskChart = ({projectId }) => {


    const [Tasks , setTasks] = useState([]);

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


    return <>

    </>
};

export default EnhancedTaskChart;