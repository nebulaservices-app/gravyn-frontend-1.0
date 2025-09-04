import React, { useState, useMemo, useRef, useEffect } from 'react';
import styles from './ChartsDemo.module.css';
import {getDayOfWeek} from "../utils/datetime";
import growth from "../images/icons/growth.svg"

const TaskChart = ({taskData = [
    { day: "Sun", data: { blocked: 2, pending: 3, completed: 5 }, utc: "2025-05-04T00:00:00.000Z" },
    { day: "Mon", data: { blocked: 0, pending: 4, completed: 40 }, utc: "2025-05-05T00:00:00.000Z" },
    { day: "Tue", data: { blocked: 1, pending: 2, completed: 65 }, utc: "2025-05-06T00:00:00.000Z" },
    { day: "Wed", data: { blocked: 1, pending: 2, completed: 4 }, utc: "2025-05-07T00:00:00.000Z" },
    { day: "Thu", data: { blocked: 0, pending: 0, completed: 20 }, utc: "2025-05-08T00:00:00.000Z" },
    { day: "Fri", data: { blocked: 2, pending: 2, completed: 10 }, utc: "2025-05-09T00:00:00.000Z" },
    { day: "Sat", data: { blocked: 1, pending: 2, completed: 9 }, utc: "2025-05-10T00:00:00.000Z" }
]}) => {

    console.log("Task data received " , taskData)

    const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, content: null });
    const graphHolder = useRef(null);
    const [rowHeight, setRowHeight] = useState(0);
    const [gapSize, setGapSize] = useState(0);

    const { step, maxYAxisValue } = useMemo(() => {
        if (!Array.isArray(taskData) || taskData.length === 0) {
            return { step: 1, maxYAxisValue: 6 };
        }

        const maxTotal = Math.max(
            ...taskData.map(({ data }) => (data?.blocked || 0) + (data?.pending || 0) + (data?.completed || 0))
        );

        const n = Math.floor(maxTotal / 6) + 1;
        return { step: n, maxYAxisValue: n * 6 };
    }, [taskData]);

    const today = new Date().toISOString().split('T')[0];
    const todayIndex = taskData.findIndex(task => task.utc.startsWith(today));
    const yesterdayIndex = todayIndex - 1;

    const todayCompletion = todayIndex >= 0 ? taskData[todayIndex].data.completed : 0;
    const yesterdayCompletion = yesterdayIndex >= 0 ? taskData[yesterdayIndex].data.completed : 0;

    let comparisonText = '';
    if (todayCompletion > yesterdayCompletion) {
        const diff = ((todayCompletion - yesterdayCompletion) / yesterdayCompletion) * 100;
        comparisonText = `Completion rate increased by ${Math.round(diff)}%`;
    } else if (todayCompletion < yesterdayCompletion) {
        const diff = ((yesterdayCompletion - todayCompletion) / yesterdayCompletion) * 100;
        comparisonText = `Completion rate decreased by ${Math.round(diff)}%`;
    } else {
        comparisonText = `Completion rate remained the same`;
    }

    const updateRowHeight = () => {
        if (graphHolder.current) {
            const height = graphHolder.current.clientHeight;
            setRowHeight(height / 6);
        }
    };

    const updateBarsConfig = () => {
        if (graphHolder.current) {
            const width = graphHolder.current.clientWidth;
            const barWidth = 32;
            setGapSize((width - taskData.length * barWidth) / (taskData.length + 1));
        }
    };

    useEffect(() => {
        updateRowHeight();
        updateBarsConfig();
        window.addEventListener('resize', updateRowHeight);
        return () => {
            window.removeEventListener('resize', updateRowHeight);
        };
    }, []);

    const showTooltip = (e, task) => {
        const barRect = e.currentTarget.getBoundingClientRect();
        const containerRect = graphHolder.current.getBoundingClientRect();

        const total = task.data.blocked + task.data.pending + task.data.completed;

        let x = barRect.left - containerRect.left + barRect.width / 2;
        const y = barRect.top - containerRect.top - 10;

        const tooltipWidth = 150;
        if (x + tooltipWidth > containerRect.width) {
            x = containerRect.width - tooltipWidth - 10;
        }

        setTooltip({
            visible: true,
            x,
            y,
            content: (
                <div
                    className={styles.tooltip}
                    style={{top: tooltip.y, left: tooltip.x}}
                >
                    <div className={styles.tooltipBox}>
                        <div className={styles.tooltipHeading}>{getDayOfWeek(task.utc)}</div>

                        <div className={styles.tooltipItem}>
                            <div className={styles['tool-tip-item-flex']}>
                                <div className={styles.colorBox} style={{backgroundColor: '#036CFE'}}></div>
                                <span>Completed</span>
                            </div>
                            <div className={styles.tooltipLabelValue}>
                                <span>{task.data.completed}</span>
                            </div>
                        </div>

                        <div className={styles.tooltipItem}>
                            <div className={styles['tool-tip-item-flex']}>
                                <div className={styles.colorBox} style={{backgroundColor: '#6DAAFF'}}></div>
                                <span>Pending</span>
                            </div>
                            <div className={styles.tooltipLabelValue}>
                            <span>{task.data.pending}</span>
                            </div>
                        </div>

                        <div className={styles.tooltipItem}>
                            <div className={styles['tool-tip-item-flex']}>
                                <div className={styles.colorBox} style={{backgroundColor: '#FF3838'}}></div>
                                <span>Blocked</span>
                            </div>
                            <div className={styles.tooltipLabelValue}>
                                <span>{task.data.blocked}</span>
                            </div>

                        </div>

                        <div className={styles.tooltipItem}>

                            <div className={styles['tool-tip-item-flex']}>
                                <div className={styles.colorBox} style={{backgroundColor: '#9e9e9e'}}></div>
                                <span>Total</span>
                            </div>
                            <div className={styles.tooltipLabelValue}>
                                <span>{task.data.completed + task.data.pending + task.data.blocked}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )
        });
    };

    const hideTooltip = () => {
        setTooltip({visible: false, x: 0, y: 0, content: null});
    };

    return (
        <div className={styles['task-graph-wrapper']}>
            <div className={styles['task-graph-header']}>
                <div className={styles['task-graph-header-flex-item']}>
                    <p className={styles['task-graph-header-title']}>Task Analytics</p>
                    <p className={styles['task-graph-header-today']}>23 Active tasks today</p>
                    <div className={styles['task-graph-header-comparison']}><img src={growth}/><p>{comparisonText}</p> </div>
                </div>
            </div>

            <div className={styles['task-graph-holder']}>
                <div ref={graphHolder} className={styles['graph']}>
                    <div className={styles['yRowContainer']}>
                        {[...Array(6)].map((_, index) => {
                            const labelValue = (6 - index) * step;
                            return (
                                <div key={index} style={{height: rowHeight}} className={styles['row-container']}>
                                    <span>{labelValue}</span>
                                    <div className={styles['axis']}/>
                                </div>
                            );
                        })}
                    </div>

                    <div style={{gap: gapSize}} className={styles['barColumnContainer']}>
                        {taskData.map((task, index) => {
                            const total = task.data.blocked + task.data.pending + task.data.completed;
                            const heightScale = (total / maxYAxisValue) * (rowHeight * 6);

                            const isToday = task.utc.startsWith(today);

                            return (
                                <div
                                    key={task.day}
                                    className={styles['each-bar']}
                                    style={{
                                        height: heightScale,
                                        width: 32,
                                        marginLeft: index === 0 ? gapSize : 0,
                                        alignSelf: 'flex-end',
                                        display: 'flex',
                                        flexDirection: 'column-reverse',
                                        cursor: 'pointer',
                                        transition: 'height 0.5s'
                                    }}
                                    onMouseEnter={(e) => showTooltip(e, task)}
                                    onMouseLeave={hideTooltip}
                                >
                                    <div className={styles['bar-interior']} style={{ height: '100%', width: '100%' }}>
                                        <div
                                            className={styles['completed']}
                                            style={{ height: `${(task.data.completed / total) * 100}%` }}
                                        />
                                        <div
                                            className={styles['pending']}
                                            style={{ height: `${(task.data.pending / total) * 100}%` }}
                                        />
                                        <div
                                            className={styles['blocked']}
                                            style={{ height: `${(task.data.blocked / total) * 100}%` }}
                                        />
                                    </div>
                                    <div className={styles['bar-label']}>{task.day}</div>
                                </div>
                            );
                        })}
                    </div>

                    {tooltip.visible && (
                        <div
                            className={styles.tooltip}
                            style={{
                                left: tooltip.x,
                                top: tooltip.y,
                                position: 'absolute',
                                zIndex: 10,
                                pointerEvents: 'none'
                            }}
                        >
                            {tooltip.content}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TaskChart;