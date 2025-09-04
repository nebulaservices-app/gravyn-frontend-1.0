import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './GanttChart.module.css';

const GanttChart = ({ tasks, dateRange, onTaskClick }) => {
    const [currentView, setCurrentView] = useState('week');
    const [scrollPosition, setScrollPosition] = useState(0);
    const ganttContainerRef = useRef(null);
    const headerRef = useRef(null);
    const sidebarRef = useRef(null);

    // Handle scroll synchronization
    useEffect(() => {
        const handleScroll = () => {
            if (ganttContainerRef.current && headerRef.current) {
                headerRef.current.scrollLeft = ganttContainerRef.current.scrollLeft;
                setScrollPosition(ganttContainerRef.current.scrollLeft);
            }
        };

        const container = ganttContainerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
            return () => container.removeEventListener('scroll', handleScroll);
        }
    }, []);

    // Calculate date range if not provided
    const calculatedDateRange = dateRange || calculateDateRange(tasks);

    // Zoom handlers
    const handleZoomIn = () => {
        // Implement zoom in logic
    };

    const handleZoomOut = () => {
        // Implement zoom out logic
    };

    // Task click handler
    const handleTaskClick = (task) => {
        onTaskClick && onTaskClick(task);
    };

    return (
        <div className={styles.ganttContainer}>
            {/* Toolbar */}
            <div className={styles.toolbar}>
                <button onClick={handleZoomIn} className={styles.toolbarButton}>
                    <span className={styles.zoomIcon}>+</span>
                </button>
                <button onClick={handleZoomOut} className={styles.toolbarButton}>
                    <span className={styles.zoomIcon}>-</span>
                </button>
                <div className={styles.viewSwitcher}>
                    <button
                        className={`${styles.viewButton} ${currentView === 'day' ? styles.active : ''}`}
                        onClick={() => setCurrentView('day')}
                    >
                        Day
                    </button>
                    <button
                        className={`${styles.viewButton} ${currentView === 'week' ? styles.active : ''}`}
                        onClick={() => setCurrentView('week')}
                    >
                        Week
                    </button>
                    <button
                        className={`${styles.viewButton} ${currentView === 'month' ? styles.active : ''}`}
                        onClick={() => setCurrentView('month')}
                    >
                        Month
                    </button>
                </div>
            </div>

            {/* Gantt Header */}
            <div className={styles.ganttHeader} ref={headerRef}>
                <div className={styles.headerSidebar} style={{ width: '250px' }}></div>
                <div className={styles.headerTimeline}>
                    <TimelineHeader
                        dateRange={calculatedDateRange}
                        viewMode={currentView}
                        scrollPosition={scrollPosition}
                    />
                </div>
            </div>

            {/* Gantt Body */}
            <div className={styles.ganttBody}>
                <div className={styles.sidebar} ref={sidebarRef}>
                    {tasks.map(task => (
                        <div key={task.id} className={styles.taskRow}>
                            <div className={styles.taskName}>{task.name}</div>
                        </div>
                    ))}
                </div>
                <div
                    className={styles.timeline}
                    ref={ganttContainerRef}
                >
                    {tasks.map(task => (
                        <TaskBar
                            key={task.id}
                            task={task}
                            dateRange={calculatedDateRange}
                            onClick={() => handleTaskClick(task)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

// Timeline Header Component
const TimelineHeader = ({ dateRange, viewMode, scrollPosition }) => {
    // Generate timeline headers based on view mode
    const generateHeaders = () => {
        // Implementation for generating date headers
        return [];
    };

    return (
        <div className={styles.timelineHeaders}>
            {generateHeaders().map((header, index) => (
                <div key={index} className={styles.timelineHeaderItem}>
                    {header.label}
                </div>
            ))}
        </div>
    );
};

// Task Bar Component
const TaskBar = ({ task, dateRange, onClick }) => {
    const calculatePosition = () => {
        // Calculate left position and width based on task dates
        return {
            left: '0px',
            width: '100px'
        };
    };

    const position = calculatePosition();

    return (
        <div
            className={styles.taskBarContainer}
            style={{ height: '30px', margin: '5px 0' }}
        >
            <div
                className={styles.taskBar}
                style={{
                    left: position.left,
                    width: position.width,
                    backgroundColor: getTaskColor(task)
                }}
                onClick={onClick}
            >
                <div className={styles.taskProgress} style={{ width: `${task.progress}%` }}></div>
                <div className={styles.taskLabel}>{task.name}</div>
            </div>
        </div>
    );
};

// Helper functions
const calculateDateRange = (tasks) => {
    // Calculate min start date and max end date from tasks
    return {
        start: new Date(),
        end: new Date()
    };
};

const getTaskColor = (task) => {
    // Return color based on task status or type
    return '#4caf50';
};

// Prop Types
GanttChart.propTypes = {
    tasks: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            start: PropTypes.instanceOf(Date).isRequired,
            end: PropTypes.instanceOf(Date).isRequired,
            progress: PropTypes.number,
            dependencies: PropTypes.arrayOf(PropTypes.string),
            type: PropTypes.string,
            status: PropTypes.string
        })
    ).isRequired,
    dateRange: PropTypes.shape({
        start: PropTypes.instanceOf(Date),
        end: PropTypes.instanceOf(Date)
    }),
    onTaskClick: PropTypes.func
};

export default GanttChart;