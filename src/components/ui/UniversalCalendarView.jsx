import React, { useEffect, useState, useRef } from "react";
import styles from "./UniversalCalendarView.module.css";
import dropdown from "../../images/icons/dropdown.svg";
import { useLocation, useNavigate } from "react-router-dom";
import { parseISO, isValid } from "date-fns";

const UniversalCalendarView = ({ combinedItems , updateEntity }) => {
    const [items, setItems] = useState([]);
    const [draggedItem, setDraggedItem] = useState(null);
    const autoSwitchTimer = useRef(null);



    const location = useLocation();
    const navigate = useNavigate();

    const queryParams = new URLSearchParams(location.search);
    const initialDateParam = queryParams.get("date");
    const initialDate = initialDateParam && isValid(parseISO(initialDateParam))
        ? parseISO(initialDateParam)
        : new Date();
    const [currentDate, setCurrentDate] = useState(initialDate);

    // Sync URL with selected date
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        params.set("date", formatDate(currentDate));
        navigate(`${location.pathname}?${params.toString()}`, { replace: true });
    }, [currentDate]);

    // Sync props with local state
    useEffect(() => {
        setItems(combinedItems);
    }, [combinedItems]);

    useEffect(() => {
        console.log("Calendar Unviersal " , items)
    }, [items]);

    const formatDate = (date) => {
        return date.toISOString().slice(0, 10);
    };
    const itemsForDate = (dateStr) =>
        items.filter(item => {
            if (!item.dueDate) return false;
            const eventDate = item.dueDate.slice(0, 10); // Get 'YYYY-MM-DD' directly from ISO string
            console.log("EVENT DATE" , eventDate);
            console.log("DATE STR" , dateStr);
            console.log("IS SAME DATE" , eventDate ===  dateStr)
            return eventDate === dateStr;
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

    const handleDragStart = (item) => setDraggedItem(item);

    const updateItemDueDate = async (itemId, dueDate) => {
        try {
            await updateEntity(itemId, { dueDate });
            const updatedItems = items.map(i =>
                i._id === itemId ? { ...i, dueDate } : i
            );
            setItems(updatedItems);
            setDraggedItem(null);
        } catch (error) {
            alert("Could not update item due date.");
        }
    };

    const handleDrop = (e, targetDate) => {
        e.preventDefault();
        clearAutoSwitchTimer();

        if (!draggedItem || !targetDate || draggedItem.type === "google_calendar/event") return;
        const newDueDate = formatDate(targetDate);
        updateItemDueDate(draggedItem._id, newDueDate);
    };

    const handleAutoSwitch = (direction) => {
        if (autoSwitchTimer.current) return;
        autoSwitchTimer.current = setTimeout(() => {
            direction === "prev" ? goToPrevMonth() : goToNextMonth();
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
        if (isFirstColumn) handleAutoSwitch("prev");
        else if (isLastColumn) handleAutoSwitch("next");
        else clearAutoSwitchTimer();
    };

    const goToPrevMonth = () => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    const goToNextMonth = () => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));

    const calendarDays = getMonthDays();

    const renderItemCard = (item) => {
        const pillTypeClass = {
            task: styles["task-pill"],
            milestone: styles["milestone-pill"],
            issue: styles["issue-pill"],
            meeting: styles["meeting-pill"],
            "google_calendar/event": styles["google-calendar-pill"]
        }[item.type] || "";

        const isDraggable = item.type !== "google_calendar/event";

        return (
            <div
                key={item._id || item.id}
                className={`${styles["item-pill"]} ${pillTypeClass} ${draggedItem?._id === item._id ? styles.dragging : ""}`}
                draggable={isDraggable}
                onDragStart={() => isDraggable && handleDragStart(item)}
                onDragEnd={() => isDraggable && setDraggedItem(null)}
                onClick={() => item.type === "google_calendar/event" && window.open(item.raw?.htmlLink, "_blank")}
            >
                <p>
                    {{
                        task: "📝",
                        milestone: "🚩",
                        issue: "🐞",
                        meeting: "📅",
                        "google_calendar/event": "🔗"
                    }[item.type] || "📌"}{" "}
                    {item.title || item.summary}
                </p>
                {item.dueDate && (
                    <small>
                        {new Date(item.dueDate).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit"
                        })}
                    </small>
                )}
            </div>
        );
    };

    return (
        <div className={styles.calendar}>
            <div className={styles.header}>
                <p className={styles.viewTitle}>Calendar & Scheduling</p>
                <div className={styles.dateSelector}>
                    <img src={dropdown} onClick={goToPrevMonth} style={{ transform: "rotate(90deg)" }} />
                    <p>
                        {currentDate.toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long"
                        })}
                    </p>
                    <img src={dropdown} onClick={goToNextMonth} style={{ transform: "rotate(-90deg)" }} />
                </div>
            </div>

            <div className={styles.grid}>
                {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((d, i) => (
                    <div key={i} className={styles.dayHeader}>{d}</div>
                ))}

                {calendarDays.map((day, index) => (
                    <div
                        key={index}
                        className={`${styles.dayCell} ${!day ? styles.empty : ''}`}
                        onDrop={(e) => handleDrop(e, day)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragLeave={clearAutoSwitchTimer}
                    >
                        {day && (
                            <>
                                <div className={styles.dateLabel}>
                                    {day.toLocaleDateString("en-US", {
                                        day: "numeric",
                                        month: "short"
                                    })}
                                </div>
                                <div className={styles["item-list"]}>
                                    {itemsForDate(formatDate(day)).map(item => renderItemCard(item))}
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UniversalCalendarView;