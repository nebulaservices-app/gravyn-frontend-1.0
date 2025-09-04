import React, { useEffect, useState } from "react";
import { fetchTasksByProjectId } from "../../service/Tasks/taskService";
import styles from "./DriftIQ.module.css";

import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
dayjs.extend(isoWeek);

// 🔹 Get week key like "2025-W31"
const getWeekKey = (date) => {
    return dayjs(date).isoWeek() < 10
        ? `${dayjs(date).year()}-W0${dayjs(date).isoWeek()}`
        : `${dayjs(date).year()}-W${dayjs(date).isoWeek()}`;
};
// 🔹 Get period text for a week like "Aug 5 - Aug 11"
const getWeekPeriod = (weekKey) => {
    const [year, weekStr] = weekKey.split("-W");
    const week = parseInt(weekStr, 10);

    const start = dayjs().year(+year).isoWeek(week).startOf("isoWeek");
    const end = start.endOf("isoWeek");

    return `${start.format("MMM D")} - ${end.format("MMM D")}`;
};

// 🔹 Group tasks by started week
const groupTasksByWeek = (tasks) => {
    const grouped = {};
    tasks.forEach(task => {
        if (!task.startedAt) return;
        const week = getWeekKey(task.startedAt);
        if (!grouped[week]) grouped[week] = [];
        grouped[week].push(task);
    });
    return grouped;
};

// 🔹 Analyze each week
const analyzeWeek = (tasks) => {
    const stats = {
        started: tasks.length,
        completed: 0,
        blocked: 0,
        overdue: 0,
        cycleTimes: [],
        incompleteSubtasks: 0
    };

    tasks.forEach(task => {
        if (task.status === "completed" && task.completedAt && task.startedAt) {
            stats.completed++;
            const cycle = (new Date(task.completedAt) - new Date(task.startedAt)) / (1000 * 60 * 60 * 24);
            stats.cycleTimes.push(cycle);

            if (task.dueDate && new Date(task.completedAt) > new Date(task.dueDate)) {
                stats.overdue++;
            }
        }

        if (task.status === "blocked" || (task.issues?.length ?? 0) > 0) {
            stats.blocked++;
        }

        if (task.subtasks?.some(st => st.status !== "completed")) {
            stats.incompleteSubtasks++;
        }
    });

    return stats;
};

// 🔹 Evaluate performance of a week
const classifyWeek = (weekKey, summary) => {
    const avg = (arr) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
    const avgCycle = avg(summary.cycleTimes);

    let status = "🟡 Balanced";
    const insights = [];

    if (summary.completed / summary.started >= 0.8 && avgCycle <= 3) {
        status = "🟢 Efficient";
        insights.push("✅ High completion rate with quick turnarounds.");
    }

    if (summary.blocked > 3) {
        status = "🔴 Blocked";
        insights.push(`🧊 ${summary.blocked} tasks blocked or facing issues.`);
    }

    if (summary.overdue > 2) {
        status = "⚠️ Delayed";
        insights.push(`⏱️ ${summary.overdue} tasks finished past due date.`);
    }

    if (summary.incompleteSubtasks > 4) {
        insights.push(`🧩 ${summary.incompleteSubtasks} tasks have pending subtasks.`);
    }

    insights.push(`📈 Avg Cycle Time: ${avgCycle.toFixed(1)} days`);
    insights.push(`📊 Started: ${summary.started}, Completed: ${summary.completed}`);

    return {
        weekKey,
        status,
        insights,
        period: getWeekPeriod(weekKey)
    };
};

// 🔹 DriftIQ Smart Window Analyzer
const DriftIQ = ({ projectId }) => {
    const [weeklySummaries, setWeeklySummaries] = useState([]);

    useEffect(() => {
        const analyze = async () => {
            try {
                const tasks = await fetchTasksByProjectId(projectId);
                const grouped = groupTasksByWeek(tasks);

                const summaries = Object.entries(grouped).map(([weekKey, weekTasks]) => {
                    const stats = analyzeWeek(weekTasks);
                    return classifyWeek(weekKey, stats);
                });

                setWeeklySummaries(summaries.sort((a, b) => a.weekKey.localeCompare(b.weekKey)));
            } catch (err) {
                console.error("DriftIQ failed to analyze:", err);
            }
        };

        if (projectId) analyze();

        const interval = setInterval(() => {
            if (projectId) analyze();
        }, 10 * 60 * 1000); // every 10 minutes

        return () => clearInterval(interval);
    }, [projectId]);

    return (
        <div className={styles.executionPulse}>
            <h2>🚀 DriftIQ: Weekly Execution Summary</h2>

            {weeklySummaries.length === 0 && <p>No execution data available.</p>}

            {weeklySummaries.map((week, idx) => (
                <div key={idx} className={styles.weekCard}>
                    <div className={styles.weekHeader}>
                        <h4>{week.weekKey} — {week.status}</h4>
                        <span className={styles.period}>{week.period}</span>
                    </div>
                    <ul>
                        {week.insights.map((point, i) => (
                            <li key={i}>{point}</li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
};

export default DriftIQ;