import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import styles from "./SchedulingTimeline.module.css";
import FloatingBubble from "./FloatingBubble";

/* Constants */
const MS_IN_DAY = 24 * 60 * 60 * 1000;
const DEFAULT_COLUMN_WIDTH = 90;
const MIN_COLUMN_WIDTH = 70;
const MAX_COLUMN_WIDTH = 300;
const ROW_HEIGHT = 50;
const TASK_BAR_PADDING = 4;

/* Utils */
const addDays = (date, days) => {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
};

function formatDayLabel(date) {
  const dayNum = date.getDate();
  const dayLetter = date.toLocaleDateString("en-US", { weekday: "short" }).charAt(0);
  return `${dayNum}${dayLetter}`;
}

/* Build days and month zones */
function useDaysViewZones(projectStartDate, projectEndDate) {
  const timelineStart = useMemo(() => addDays(projectStartDate, -7), [projectStartDate]);

  const { groups, daysArray } = useMemo(() => {
    const totalDays = Math.ceil((projectEndDate - timelineStart) / MS_IN_DAY) + 1;
    const daysArrayLocal = new Array(totalDays);
    for (let i = 0; i < totalDays; i++) daysArrayLocal[i] = addDays(timelineStart, i);

    const groupsLocal = [];
    let currentZoneLabel = "";
    let currentGroup = null;

    for (const date of daysArrayLocal) {
      const zoneLabel = date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
      if (zoneLabel !== currentZoneLabel) {
        if (currentGroup) groupsLocal.push(currentGroup);
        currentZoneLabel = zoneLabel;
        currentGroup = { zoneLabel, days: [] };
      }
      currentGroup.days.push({ date, shortLabel: formatDayLabel(date) });
    }
    if (currentGroup) groupsLocal.push(currentGroup);
    return { groups: groupsLocal, daysArray: daysArrayLocal };
  }, [projectEndDate, timelineStart]);

  return { groups, daysArray, timelineStart };
}

/* Stable row packing */
function assignTaskRows(tasks, getStartIdx, getEndIdx) {
  const intervals = tasks.map((t) => ({
    id: t.id,
    start: getStartIdx(t),
    end: getEndIdx(t),
    origRow: typeof t.row === "number" ? t.row : undefined,
  }));
  intervals.sort((a, b) => (a.start - b.start) || (a.end - b.end));

  const rows = [];
  const assignment = {};
  for (const it of intervals) {
    if (it.start === -1 || it.end === -1) { assignment[it.id] = 0; continue; }
    let placed = false;
    const totalRows = rows.length;
    const order = [];
    if (typeof it.origRow === "number" && it.origRow >= 0 && it.origRow < totalRows) order.push(it.origRow);
    for (let r = 0; r < totalRows; r++) if (!order.includes(r)) order.push(r);
    for (const rIdx of order) {
      const row = rows[rIdx] || [];
      const overlaps = row.some(seg => !(it.end < seg.start || it.start > seg.end));
      if (!overlaps) {
        row.push({ start: it.start, end: it.end, id: it.id });
        rows[rIdx] = row;
        assignment[it.id] = rIdx;
        placed = true;
        break;
      }
    }
    if (!placed) {
      rows.push([{ start: it.start, end: it.end, id: it.id }]);
      assignment[it.id] = rows.length - 1;
    }
  }
  return tasks.map(t => ({ ...t, row: typeof assignment[t.id] === "number" ? assignment[t.id] : 0 }));
}

const TimelineScheduler = () => {
  /* Timeline window */
  const projectStartDate = new Date("2024-12-25");
  const projectEndDate = new Date("2025-11-15");
  const { groups: dayZones, daysArray } = useDaysViewZones(projectStartDate, projectEndDate);

  /* State */
  const [columnWidth, setColumnWidth] = useState(DEFAULT_COLUMN_WIDTH);
  const [tasks, setTasks] = useState([
    { id: 1, label: "Design splash page", startDate: new Date("2025-08-22"), endDate: new Date("2025-08-24") },
    { id: 2, label: "Develop backend API", startDate: new Date("2025-08-28"), endDate: new Date("2025-10-05") },
    { id: 3, label: "Develop backend API 2", startDate: new Date("2025-06-25"), endDate: new Date("2025-09-05") },
  ]);

  /* Index lookups */
  const getStartIdx = useCallback(
    (task) => daysArray.findIndex(d => d.toDateString() === task.startDate.toDateString()),
    [daysArray]
  );
  const getEndIdx = useCallback(
    (task) => daysArray.findIndex(d => d.toDateString() === task.endDate.toDateString()),
    [daysArray]
  );

  /* Derived layout */
  const packedTasks = useMemo(() => assignTaskRows([...tasks], getStartIdx, getEndIdx), [tasks, getStartIdx, getEndIdx]);
  const maxRow = useMemo(() => Math.max(...packedTasks.map(t => (typeof t.row === "number" ? t.row : 0)), 0), [packedTasks]);
  const timelineRowsHeight = useMemo(() => (maxRow + 1) * ROW_HEIGHT, [maxRow]);

  /* Refs and measurements */
  const schedulerContentRef = useRef(null);
  const firstColumnHeaderRef = useRef(null);
  const [visibleTrackHeight, setVisibleTrackHeight] = useState(300);
  const [columnHeaderHeight, setColumnHeaderHeight] = useState(40);

  useEffect(() => {
    let raf;
    const measure = () => {
      const sc = schedulerContentRef.current;
      const ch = firstColumnHeaderRef.current;
      const scH = sc ? sc.clientHeight : 400;
      const chH = ch ? ch.clientHeight : 40;
      const available = scH - chH;
      const computed = Math.max(120, Math.min(available, 800));
      setVisibleTrackHeight(computed);
      setColumnHeaderHeight(chH);
    };
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [daysArray.length, columnWidth]);

  /* Smooth task dragging with snap on release */
  const dragStateRef = useRef(null);
  const dragAnimRef = useRef(null);

  const onTaskMouseDown = useCallback((e, taskId, edge) => {
    e.stopPropagation();
    dragStateRef.current = {
      taskId,
      edge, // "left" | "right" | null
      startX: e.clientX,
      originalStart: null,
      originalEnd: null,
      columnWidthAtStart: columnWidth
    };
    const t = tasks.find(x => x.id === taskId);
    if (t) {
      dragStateRef.current.originalStart = new Date(t.startDate);
      dragStateRef.current.originalEnd = new Date(t.endDate);
    }
    document.body.style.userSelect = "none";
  }, [columnWidth, tasks]);

  const onMouseMove = useCallback((e) => {
    if (!dragStateRef.current) return;
    const { taskId, edge, startX, originalStart, originalEnd, columnWidthAtStart } = dragStateRef.current;
    const dx = e.clientX - startX;
    const cw = columnWidthAtStart || columnWidth;

    const dDays = dx / cw; // fractional days for smoothness
    if (dragAnimRef.current) cancelAnimationFrame(dragAnimRef.current);
    dragAnimRef.current = requestAnimationFrame(() => {
      setTasks(prev =>
        prev.map(task => {
          if (task.id !== taskId) return task;

          // For layout, we shift whole days; fractional part is rendered via transform.
          const whole = Math.trunc(dDays);
          const frac = dDays - whole;

          let ns = addDays(new Date(originalStart), whole);
          let ne = addDays(new Date(originalEnd), whole);

          if (edge === "left") {
            ns = addDays(new Date(originalStart), whole);
            if (ns > ne) ns = new Date(ne);
          } else if (edge === "right") {
            ne = addDays(new Date(originalEnd), whole);
            if (ne < ns) ne = new Date(ns);
          }

          return { ...task, startDate: ns, endDate: ne, __frac: frac };
        })
      );
    });
  }, [columnWidth]);

  const onMouseUp = useCallback(() => {
    if (!dragStateRef.current) return;
    const { taskId, edge, startX, originalStart, originalEnd, columnWidthAtStart } = dragStateRef.current;
    const lastClientX = window.event?.clientX ?? startX;
    const dx = lastClientX - startX;
    const cw = columnWidthAtStart || columnWidth;
    const dDaysExact = dx / cw;
    const round = (v) => (v >= 0 ? Math.round(v) : -Math.round(-v));
    const delta = round(dDaysExact);

    if (dragAnimRef.current) cancelAnimationFrame(dragAnimRef.current);

    setTasks(prev =>
      prev.map(task => {
        if (task.id !== taskId) return task;
        let ns = new Date(originalStart);
        let ne = new Date(originalEnd);
        if (edge === "left") {
          ns = addDays(originalStart, delta);
          if (ns > ne) ns = new Date(ne);
        } else if (edge === "right") {
          ne = addDays(originalEnd, delta);
          if (ne < ns) ne = new Date(ns);
        } else {
          ns = addDays(originalStart, delta);
          ne = addDays(originalEnd, delta);
        }
        const clean = { ...task, startDate: ns, endDate: ne };
        delete clean.__frac;
        return clean;
      })
    );

    dragStateRef.current = null;
    document.body.style.userSelect = "";
  }, [columnWidth]);

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  /* Zoom controls + prevent browser zoom inside scheduler */
  const clampZoom = useCallback((w) => Math.max(MIN_COLUMN_WIDTH, Math.min(MAX_COLUMN_WIDTH, w)), []);
  const zoomIn = useCallback(() => setColumnWidth(w => clampZoom(w + 10)), [clampZoom]);
  const zoomOut = useCallback(() => setColumnWidth(w => clampZoom(w - 10)), [clampZoom]);
  const resetZoom = useCallback(() => setColumnWidth(DEFAULT_COLUMN_WIDTH), []);

  const zoomAtX = useCallback((nextWidth, prevWidth, scroller, clientX) => {
    if (!scroller) return;
    const rect = scroller.getBoundingClientRect();
    const xInView = clientX - rect.left + scroller.scrollLeft;
    const scale = nextWidth / prevWidth;
    const newScrollLeft = xInView * scale - (clientX - rect.left);
    scroller.scrollLeft = Math.max(0, newScrollLeft);
  }, []);

  const setColumnWidthRaf = useRef(null);
  const applyZoom = useCallback((nextW, anchorClientX) => {
    const scroller = schedulerContentRef.current;
    if (!scroller) return;
    const prevW = columnWidth;
    const clamped = clampZoom(nextW);
    if (clamped === prevW) return;
    zoomAtX(clamped, prevW, scroller, anchorClientX ?? (scroller.getBoundingClientRect().left + scroller.clientWidth / 2));
    if (setColumnWidthRaf.current) cancelAnimationFrame(setColumnWidthRaf.current);
    setColumnWidthRaf.current = requestAnimationFrame(() => setColumnWidth(clamped));
  }, [columnWidth, clampZoom, zoomAtX]);

  const onWheelZoom = useCallback((e) => {
    const isZoomGesture = e.ctrlKey || e.metaKey;
    if (!isZoomGesture) return;
    e.preventDefault(); // block browser/page zoom here
    const step = 0.025;
    const factor = Math.exp(-step * Math.sign(e.deltaY));
    applyZoom(columnWidth * factor, e.clientX);
  }, [columnWidth, applyZoom]);

  const pinchRef = useRef({ active: false, startDist: 0, startWidth: DEFAULT_COLUMN_WIDTH, anchorX: 0 });

  const onTouchStartZoom = useCallback((e) => {
    if (e.touches.length === 2) {
      const [t1, t2] = e.touches;
      const dx = t2.clientX - t1.clientX;
      const dy = t2.clientY - t1.clientY;
      const dist = Math.hypot(dx, dy);
      pinchRef.current.active = true;
      pinchRef.current.startDist = dist;
      pinchRef.current.startWidth = columnWidth;
      pinchRef.current.anchorX = (t1.clientX + t2.clientX) / 2;
    }
  }, [columnWidth]);

  const onTouchMoveZoom = useCallback((e) => {
    if (!pinchRef.current.active || e.touches.length !== 2) return;
    e.preventDefault(); // block page zoom/pan
    const [t1, t2] = e.touches;
    const dx = t2.clientX - t1.clientX;
    const dy = t2.clientY - t1.clientY;
    const dist = Math.hypot(dx, dy);
    const scale = dist / (pinchRef.current.startDist || 1);
    const next = pinchRef.current.startWidth * scale;
    applyZoom(next, pinchRef.current.anchorX);
  }, [applyZoom]);

  const onTouchEndZoom = useCallback(() => {
    pinchRef.current.active = false;
  }, []);

  // Keyboard zoom prevention (Ctrl/⌘ + +/−/0) inside scheduler
  useEffect(() => {
    const el = schedulerContentRef.current;
    if (!el) return;
    el.tabIndex = 0;
    const onKey = (e) => {
      const plus = (e.key === "=" || e.key === "+");
      const minus = (e.key === "-" || e.key === "_");
      const reset = (e.key === "0");
      if ((e.ctrlKey || e.metaKey) && (plus || minus || reset)) {
        e.preventDefault();
        if (plus) applyZoom(columnWidth * 1.1);
        else if (minus) applyZoom(columnWidth / 1.1);
        else if (reset) applyZoom(DEFAULT_COLUMN_WIDTH);
      }
    };
    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
  }, [applyZoom, columnWidth]);

  // Safety net: prevent page zoom only when cursor is over scheduler
  useEffect(() => {
    const scroller = schedulerContentRef.current;
    if (!scroller) return;
    let over = false;
    const enter = () => { over = true; };
    const leave = () => { over = false; };
    scroller.addEventListener("mouseenter", enter);
    scroller.addEventListener("mouseleave", leave);

    const onWinWheel = (e) => { if ((e.ctrlKey || e.metaKey) && over) e.preventDefault(); };
    const onWinKey = (e) => {
      const plus = (e.key === "=" || e.key === "+");
      const minus = (e.key === "-" || e.key === "_");
      const reset = (e.key === "0");
      if ((e.ctrlKey || e.metaKey) && (plus || minus || reset) && over) e.preventDefault();
    };

    window.addEventListener("wheel", onWinWheel, { passive: false, capture: true });
    window.addEventListener("keydown", onWinKey, true);

    return () => {
      scroller.removeEventListener("mouseenter", enter);
      scroller.removeEventListener("mouseleave", leave);
      window.removeEventListener("wheel", onWinWheel, { capture: true });
      window.removeEventListener("keydown", onWinKey, true);
    };
  }, []);

  /* Smooth scroll + idle snap */
  const scrollIdleRef = useRef(null);
  const onScroll = useCallback(() => {
    const scroller = schedulerContentRef.current;
    if (!scroller) return;
    if (scrollIdleRef.current) clearTimeout(scrollIdleRef.current);
    scrollIdleRef.current = setTimeout(() => {
      const col = columnWidth;
      const current = scroller.scrollLeft;
      const target = Math.round(current / col) * col;
      scroller.scrollTo({ left: target, behavior: "smooth" });
    }, 220); // idle window
  }, [columnWidth]);

  useEffect(() => {
    const sc = schedulerContentRef.current;
    if (!sc) return;
    sc.addEventListener("scroll", onScroll, { passive: true });
    return () => sc.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  /* Dimensions */
  const timelineWidth = useMemo(() => daysArray.length * columnWidth, [daysArray.length, columnWidth]);
  const wrapperInnerTrackHeight = Math.max(visibleTrackHeight, timelineRowsHeight);
  const wrapperHeight = columnHeaderHeight + wrapperInnerTrackHeight;
  const taskLayerTop = columnHeaderHeight;

  /* Today index + initial center */
  const todayIndex = useMemo(() => {
    const today = new Date();
    return daysArray.findIndex(d => d.toDateString() === today.toDateString());
  }, [daysArray]);

  const didInitialScrollRef = useRef(false);
  useEffect(() => {
    if (!schedulerContentRef.current) return;
    if (todayIndex === -1) return;
    if (didInitialScrollRef.current) return;

    const scroller = schedulerContentRef.current;
    const columnLeft = todayIndex * columnWidth;
    const viewportWidth = scroller.clientWidth;
    const targetScrollLeft = Math.max(0, columnLeft - Math.max(0, (viewportWidth - columnWidth) / 2));

    requestAnimationFrame(() => {
      scroller.scrollTo({ left: targetScrollLeft, behavior: "smooth" });
      didInitialScrollRef.current = true;
    });
  }, [todayIndex, columnWidth]);

  /* FAB actions */
  const lastScrollMetaRef = useRef({ time: 0, idx: -1 });
  const scrollToToday = useCallback(() => {
    const scroller = schedulerContentRef.current;
    if (!scroller) return;
    const today = new Date();
    const idx = daysArray.findIndex(d => d.toDateString() === today.toDateString());
    if (idx === -1) return;
    const now = performance.now();
    const { time: lastTime, idx: lastIdx } = lastScrollMetaRef.current;
    if (lastIdx === idx && now - lastTime < 500) return;
    const left = idx * columnWidth;
    const view = scroller.clientWidth;
    const target = Math.max(0, left - Math.max(0, (view - columnWidth) / 2));
    scroller.scrollTo({ left: target, behavior: "smooth" });
    lastScrollMetaRef.current = { time: now, idx };
  }, [daysArray, columnWidth]);

  const fitProject = useCallback(() => {
    const scroller = schedulerContentRef.current;
    if (!scroller || tasks.length === 0) return;
    const firstIdx = tasks.reduce((min, t) => {
      const i = daysArray.findIndex(d => d.toDateString() === t.startDate.toDateString());
      return i === -1 ? min : Math.min(min, i);
    }, Infinity);
    const lastIdx = tasks.reduce((max, t) => {
      const i = daysArray.findIndex(d => d.toDateString() === t.endDate.toDateString());
      return i === -1 ? max : Math.max(max, i);
    }, -Infinity);
    if (!isFinite(firstIdx) || !isFinite(lastIdx) || firstIdx < 0 || lastIdx < 0) return;
    const startX = firstIdx * columnWidth;
    const endX = (lastIdx + 1) * columnWidth;
    const span = endX - startX;
    const view = scroller.clientWidth;
    const target = span > view ? startX : Math.max(0, startX - (view - span) / 2);
    scroller.scrollTo({ left: target, behavior: "smooth" });
  }, [tasks, daysArray, columnWidth]);

  const handleFabAction = useCallback((type) => {
    if (type === "today") scrollToToday();
    else if (type === "zoomIn") zoomIn();
    else if (type === "zoomOut") zoomOut();
    else if (type === "fit") fitProject();
    else if (type === "reset") resetZoom();
  }, [scrollToToday, zoomIn, zoomOut, fitProject, resetZoom]);

  /* Styles */
  const getTaskStyle = useCallback((task) => {
    const startIndex = getStartIdx(task);
    const endIndex = getEndIdx(task);
    if (startIndex === -1 || endIndex === -1) return { display: "none" };

    const left = startIndex * columnWidth + 4;
    const width = (endIndex - startIndex + 1) * columnWidth - 8;

    const frac = typeof task.__frac === "number" ? task.__frac : 0;
    const pxOffset = frac * columnWidth;

    return {
      position: "absolute",
      left,
      width: Math.max(width, columnWidth - 8),
      top: task.row * ROW_HEIGHT + TASK_BAR_PADDING,
      height: ROW_HEIGHT - 2 * TASK_BAR_PADDING,
      borderRadius: 6,
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      padding: "0 10px",
      color: "#fff",
      cursor: "grab",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      boxShadow: "0 2px 8px rgb(0 0 0 / 0.1)",
      userSelect: "none",
      zIndex: 10,
      boxSizing: "border-box",
      overflow: "hidden",
      transform: `translateX(${pxOffset}px)`,
      willChange: "transform",
    };
  }, [columnWidth, getStartIdx, getEndIdx]);

  const timelineRef = useRef(null);

  return (
    <div
      ref={timelineRef}
      className={styles["timeline-scheduler"]}
      style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", position: "relative" }}
    >
      <FloatingBubble parentRef={timelineRef} size={50} onAction={handleFabAction} />

      <div
        ref={schedulerContentRef}
        className={styles["scheduler-content"]}
        style={{
          position: "relative",
          overflowX: "auto",
          overflowY: "auto",
          flex: "1 1 auto",
          minHeight: "calc(100% - 50px)",
          maxHeight: 350,
          scrollBehavior: "smooth",               // smooth inertial scroll
          WebkitOverflowScrolling: "touch",       // iOS momentum
          overscrollBehavior: "contain"
        }}
        onWheel={onWheelZoom}
        onTouchStart={onTouchStartZoom}
        onTouchMove={onTouchMoveZoom}
        onTouchEnd={onTouchEndZoom}
      >
        {/* Sticky month header row */}
        <div className={styles["zone-header-row"]} style={{ display: "flex", position: "sticky", top: 0, zIndex: 5 }}>
          {dayZones.map((zone, idx) => {
            const zonePx = zone.days.length * columnWidth;
            return (
              <div
                key={idx}
                className={styles["zone-header"]}
                style={{
                  minWidth: zonePx,
                  width: zonePx,
                  padding: 0,
                  boxSizing: "content-box",
                  borderRight: "var(--border-ultra-light)",
                  borderBottom: "var(--border-ultra-light)"
                }}
              >
                <div style={{ width: "100%", padding: "0 20px", textAlign: "center", color: "white" }}>
                  {zone.zoneLabel}
                </div>
              </div>
            );
          })}
        </div>

        {/* Timeline wrapper */}
        <div className={styles["timeline-wrapper"]} style={{ position: "relative", width: timelineWidth, height: wrapperHeight }}>
          {/* Grid columns */}
          <div className={styles["zone-content"]} style={{ display: "flex", position: "absolute", left: 0, top: 0, width: timelineWidth }}>
            {daysArray.map((day, idx) => {
              const isWeekend = day.getDay() === 0 || day.getDay() === 6;
              return (
                <div key={idx} className={styles["zone-column"]} style={{ minWidth: columnWidth }} title={day.toDateString()}>
                  <div ref={idx === 0 ? firstColumnHeaderRef : undefined} className={styles["zone-column-header"]}>
                    <p>{formatDayLabel(day)}</p>
                  </div>
                  <div className={`${styles["zone-column-content"]} ${isWeekend ? styles["weekend"] : ""}`} style={{ height: visibleTrackHeight }} />
                </div>
              );
            })}
          </div>

          {/* Task layer */}
          <div className={styles["task-layer"]} style={{ position: "absolute", left: 0, top: taskLayerTop, width: timelineWidth, height: timelineRowsHeight, pointerEvents: "none" ,     willChange: "transform" }}>
            {packedTasks.map(task => (
              <div
                key={task.id}
                className={styles["task"]}
                style={{ ...getTaskStyle(task), pointerEvents: "auto" }}
                onMouseDown={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const offsetX = e.clientX - rect.left;
                  if (offsetX < 12) onTaskMouseDown(e, task.id, "left");
                  else if (offsetX > rect.width - 12) onTaskMouseDown(e, task.id, "right");
                  else onTaskMouseDown(e, task.id, null);
                }}
                title={task.label}
              >
                <p style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{task.label}</p>
                <p style={{ marginLeft: 8, fontSize: 11, opacity: 0.85 }}>
                  {task.endDate.toLocaleDateString()}
                </p>
              </div>
            ))}

            {/* Today marker */}
            {todayIndex !== -1 && (
              <div
                className={styles["today-zone"]}
                style={{
                  position: "absolute",
                  top: 10,
                  left: todayIndex * columnWidth,
                  width: columnWidth,
                  height: Math.max(timelineRowsHeight, visibleTrackHeight),
                  pointerEvents: "none",
                  zIndex: 0
                }}
              >
                <span></span>
                <div></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineScheduler;
