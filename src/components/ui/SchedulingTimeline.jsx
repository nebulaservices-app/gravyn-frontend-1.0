import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import styles from "./SchedulingTimeline.module.css";

/* Constants */
const MS_IN_DAY = 24 * 60 * 60 * 1000;
const DEFAULT_COLUMN_WIDTH = 90;
const MIN_COLUMN_WIDTH = 70;
const MAX_COLUMN_WIDTH = 300;
const ROW_HEIGHT = 64;
const TASK_BAR_PADDING = 10;
const TASK_SIDE_INSET = 15;
const DEP_MARGIN = 30;

/* Utils */
const addDays = (date, days) => {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
};
const sameDay = (a, b) => a.toDateString() === b.toDateString();

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

/* Anchors */
function computeTaskAnchors(task, getStartIdx, getEndIdx, columnWidth, rowTop, frac = 0, cssMarginTop = 20) {
  const sIdx = getStartIdx(task);
  const eIdx = getEndIdx(task);
  if (sIdx === -1 || eIdx === -1) return null;

  const translateX = frac * columnWidth;
  const barLeft = sIdx * columnWidth + TASK_SIDE_INSET + translateX;
  const rawWidth = (eIdx - sIdx + 1) * columnWidth - TASK_SIDE_INSET * 2;
  const barWidth = Math.max(rawWidth, columnWidth - TASK_SIDE_INSET * 2);

  const yTop = rowTop + task.row * ROW_HEIGHT + TASK_BAR_PADDING + cssMarginTop;
  const barHeight = ROW_HEIGHT - 2 * TASK_BAR_PADDING;
  const yMid = yTop + barHeight / 2;

  return { xLeft: barLeft, xRight: barLeft + barWidth, yMid };
}

/* Paths */
function roundManhattanPath(points, r = 5) {
  if (!points || points.length < 2) return "";
  const path = [];
  path.push(`M ${points[0].x} ${points[0].y}`);
  for (let i = 1; i < points.length; i++) {
    const pPrev = points[i - 1];
    const p = points[i];
    if (i < points.length - 1) {
      const pNext = points[i + 1];
      const dx1 = p.x - pPrev.x, dy1 = p.y - pPrev.y;
      const dx2 = pNext.x - p.x, dy2 = pNext.y - p.y;

      const isStraight = (dx1 === 0 && dx2 === 0) || (dy1 === 0 && dy2 === 0);
      if (isStraight) { path.push(`L ${p.x} ${p.y}`); continue; }

      const len1 = Math.abs(dx1) + Math.abs(dy1);
      const len2 = Math.abs(dx2) + Math.abs(dy2);
      const rr = Math.min(r, Math.floor(Math.min(len1, len2) / 2));
      const trimIn = { x: p.x - Math.sign(dx1) * rr, y: p.y - Math.sign(dy1) * rr };
      const trimOut = { x: p.x + Math.sign(dx2) * rr, y: p.y + Math.sign(dy2) * rr };

      path.push(`L ${trimIn.x} ${trimIn.y}`);

      const sdx1 = Math.sign(dx1), sdy1 = Math.sign(dy1);
      const sdx2 = Math.sign(dx2), sdy2 = Math.sign(dy2);
      let sweep = 0;
      if (sdx1 === 1 && sdy2 === 1) sweep = 1;
      else if (sdx1 === 1 && sdy2 === -1) sweep = 0;
      else if (sdx1 === -1 && sdy2 === 1) sweep = 0;
      else if (sdx1 === -1 && sdy2 === -1) sweep = 1;
      else if (sdy1 === -1 && sdx2 === 1) sweep = 1;
      else if (sdy1 === 1 && sdx2 === 1) sweep = 0;
      else if (sdy1 === -1 && sdx2 === -1) sweep = 0;
      else if (sdy1 === 1 && sdx2 === -1) sweep = 1;

      path.push(`A ${rr} ${rr} 0 0 ${sweep} ${trimOut.x} ${trimOut.y}`);
    } else {
      path.push(`L ${p.x} ${p.y}`);
    }
  }
  return path.join(" ");
}

function routeElbow(from, to, margin = DEP_MARGIN, radius = 7) {
  const pts = [{ x: from.x, y: from.y }];
  const stubX = from.x + margin;
  const preX = to.x - margin;

  if (stubX <= preX) {
    pts.push({ x: preX, y: from.y });
    pts.push({ x: preX, y: to.y });
  } else {
    const midY = (from.y + to.y) / 2;
    pts.push({ x: stubX, y: from.y });
    pts.push({ x: stubX, y: midY });
    pts.push({ x: preX, y: midY });
    pts.push({ x: preX, y: to.y });
  }
  pts.push({ x: to.x, y: to.y });

  return roundManhattanPath(pts, radius);
}

function getAnchorsByType(depType, fromTask, toTask, getStartIdx, getEndIdx, columnWidth, rowTop) {
  const A = computeTaskAnchors(fromTask, getStartIdx, getEndIdx, columnWidth, rowTop, fromTask.__frac || 0, 20);
  const B = computeTaskAnchors(toTask, getStartIdx, getEndIdx, columnWidth, rowTop, toTask.__frac || 0, 20);
  if (!A || !B) return null;
  switch (depType) {
    case "FS": return { from: { x: A.xRight, y: A.yMid }, to: { x: B.xLeft, y: B.yMid } };
    case "SS": return { from: { x: A.xLeft, y: A.yMid }, to: { x: B.xLeft, y: B.yMid } };
    case "FF": return { from: { x: A.xRight, y: A.yMid }, to: { x: B.xRight, y: B.yMid } };
    case "SF": return { from: { x: A.xLeft, y: A.yMid }, to: { x: B.xRight, y: B.yMid } };
    default: return { from: { x: A.xRight, y: A.yMid }, to: { x: B.xLeft, y: B.yMid } };
  }
}

/* Main */
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
    { id: 4, label: "Input Styleguide", startDate: new Date("2025-07-01"), endDate: new Date("2025-07-12") },
    { id: 5, label: "New microdose website", startDate: new Date("2025-07-20"), endDate: new Date("2025-09-10") },
  ]);

  const [dependencies, setDependencies] = useState([
    { id: "d1", from: 1, to: 2, type: "FS" },
  ]);

  /* UI state */
  const [focusedDepId, setFocusedDepId] = useState(null);
  const [hoverDepId, setHoverDepId] = useState(null);
  const activeDepId = hoverDepId ?? focusedDepId;
  const [depDrag, setDepDrag] = useState(null);
  const [creatingDepType, setCreatingDepType] = useState("FS");
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [showOutsideLabels, setShowOutsideLabels] = useState(true);

  /* Refs and measures */
  const schedulerContentRef = useRef(null);
  const firstColumnHeaderRef = useRef(null);
  const timelineRef = useRef(null);
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

  /* Index lookups */
  const getStartIdx = useCallback(
    (task) => daysArray.findIndex(d => sameDay(d, task.startDate)),
    [daysArray]
  );
  const getEndIdx = useCallback(
    (task) => daysArray.findIndex(d => sameDay(d, task.endDate)),
    [daysArray]
  );

  /* Layout */
  const packedTasks = useMemo(() => assignTaskRows([...tasks], getStartIdx, getEndIdx), [tasks, getStartIdx, getEndIdx]);
  const maxRow = useMemo(() => Math.max(...packedTasks.map(t => (typeof t.row === "number" ? t.row : 0)), 0), [packedTasks]);
  const timelineRowsHeight = useMemo(() => (maxRow + 1) * ROW_HEIGHT, [maxRow]);
  const timelineWidth = useMemo(() => daysArray.length * columnWidth, [daysArray.length, columnWidth]);

  /* Dependency paths (all types) */
  const dependencyPaths = useMemo(() => {
    const map = new Map(packedTasks.map(t => [t.id, t]));
    const list = [];
    for (const dep of dependencies) {
      const fromTask = map.get(dep.from);
      const toTask = map.get(dep.to);
      if (!fromTask || !toTask) continue;

      const anchors = getAnchorsByType(dep.type, fromTask, toTask, getStartIdx, getEndIdx, columnWidth, columnHeaderHeight);
      if (!anchors) continue;

      const d = routeElbow(anchors.from, anchors.to, DEP_MARGIN, 7);
      list.push({ id: dep.id, d });
    }
    return list;
  }, [dependencies, packedTasks, getStartIdx, getEndIdx, columnWidth, columnHeaderHeight]);

  /* Drag states for tasks */
  const dragStateRef = useRef(null);
  const dragAnimRef = useRef(null);

  const onTaskMouseDown = useCallback((e, taskId, edge) => {
    e.stopPropagation();
    dragStateRef.current = {
      taskId,
      edge,
      startX: e.clientX,
      originalStart: null,
      originalEnd: null,
      columnWidthAtStart: columnWidth,
    };
    const t = packedTasks.find(x => x.id === taskId);
    if (t) {
      dragStateRef.current.originalStart = new Date(t.startDate);
      dragStateRef.current.originalEnd = new Date(t.endDate);
    }
    document.body.style.userSelect = "none";
    document.body.style.cursor = edge ? "ew-resize" : "grabbing";
    setSelectedTaskId(taskId);
  }, [columnWidth, packedTasks]);

  const isSpaceDown = useRef(false);
  const panState = useRef({ panning: false, startX: 0, scrollStart: 0 });

  const onBodyMouseDown = useCallback((e) => {
    if (!isSpaceDown.current) return;
    const scroller = schedulerContentRef.current;
    if (!scroller) return;
    panState.current = { panning: true, startX: e.clientX, scrollStart: scroller.scrollLeft };
    scroller.style.cursor = "grabbing";
  }, []);

  const onMouseMove = useCallback((e) => {
    // panning
    if (isSpaceDown.current && panState.current.panning) {
      const dx = e.clientX - panState.current.startX;
      const el = schedulerContentRef.current;
      if (el) el.scrollLeft = panState.current.scrollStart - dx;
      return;
    }

    if (dragStateRef.current) {
      const { taskId, edge, startX, originalStart, originalEnd, columnWidthAtStart } = dragStateRef.current;
      const dx = e.clientX - startX;
      const cw = columnWidthAtStart || columnWidth;
      const dDays = dx / cw;

      if (dragAnimRef.current) cancelAnimationFrame(dragAnimRef.current);
      dragAnimRef.current = requestAnimationFrame(() => {
        setTasks(prev =>
          prev.map(task => {
            if (task.id !== taskId) return task;
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
      return;
    }

    if (depDrag) {
      setDepDrag(drag => ({ ...drag, currentX: e.clientX, currentY: e.clientY }));
    }
  }, [columnWidth, depDrag]);

  const onMouseUp = useCallback(() => {
    // panning end
    if (panState.current.panning) {
      const sc = schedulerContentRef.current;
      if (sc) sc.style.cursor = "";
      panState.current.panning = false;
    }

    if (dragStateRef.current) {
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
      document.body.style.cursor = "";
      return;
    }

    if (depDrag) {
      const e = window.event;
      const element = document.elementFromPoint(e.clientX, e.clientY);
      const targetTaskElem = element?.closest(`.${styles.task}`);
      const targetTaskId = targetTaskElem?.getAttribute('data-task-id');

      if (targetTaskId && targetTaskId !== `${depDrag.fromTaskId}`) {
        setDependencies(prev => [
          ...prev,
          { id: `d${Date.now()}`, from: depDrag.fromTaskId, to: Number(targetTaskId), type: creatingDepType },
        ]);
      }
      setDepDrag(null);
      document.body.style.userSelect = "";
    }
  }, [depDrag, creatingDepType, columnWidth]);

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  /* Keyboard: ESC, T to cycle dep type, Delete to remove task, Space pan */
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setFocusedDepId(null);
        setHoverDepId(null);
        setDepDrag(null);
      }
      if (e.key.toLowerCase() === "t" && depDrag) {
        const order = ["FS", "SS", "FF", "SF"];
        const idx = order.indexOf(creatingDepType);
        setCreatingDepType(order[(idx + 1) % order.length]);
      }
      if (e.key === "Delete" && selectedTaskId != null) {
        setTasks(prev => prev.filter(t => t.id !== selectedTaskId));
        setDependencies(prev => prev.filter(d => d.from !== selectedTaskId && d.to !== selectedTaskId));
        setSelectedTaskId(null);
      }
      if (e.code === "Space") {
        isSpaceDown.current = true;
      }
    };
    const onKeyUp = (e) => {
      if (e.code === "Space") isSpaceDown.current = false;
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [depDrag, creatingDepType, selectedTaskId]);

  /* Zoom controls */
  const clampZoom = useCallback((w) => Math.max(MIN_COLUMN_WIDTH, Math.min(MAX_COLUMN_WIDTH, w)), []);
  const zoomIn = useCallback(() => setColumnWidth(w => clampZoom(w + 10)), [clampZoom]);
  const zoomOut = useCallback(() => setColumnWidth(w => clampZoom(w - 10)), [clampZoom]);
  const resetZoom = useCallback(() => setColumnWidth(DEFAULT_COLUMN_WIDTH), []);

  /* Double-click create task */
  const onGridDoubleClick = useCallback((e) => {
    const sc = schedulerContentRef.current;
    if (!sc) return;
    const rect = sc.getBoundingClientRect();
    const x = (e.clientX - rect.left) + sc.scrollLeft;
    const dayIdx = Math.floor(x / columnWidth);
    if (dayIdx < 0 || dayIdx >= daysArray.length) return;
    const startDate = daysArray[dayIdx];
    const endDate = daysArray[Math.min(dayIdx + 2, daysArray.length - 1)];
    const newTask = { id: Date.now(), label: "New Task", startDate, endDate };
    setTasks(prev => [...prev, newTask]);
  }, [columnWidth, daysArray]);

  /* Styles */
  const getTaskStyle = useCallback((task) => {
    const startIndex = getStartIdx(task);
    const endIndex = getEndIdx(task);
    if (startIndex === -1 || endIndex === -1) return { display: "none" };

    const left = startIndex * columnWidth + TASK_SIDE_INSET;
    const width = (endIndex - startIndex + 1) * columnWidth - TASK_SIDE_INSET * 2;

    const frac = typeof task.__frac === "number" ? task.__frac : 0;
    const pxOffset = frac * columnWidth;

    return {
      position: "absolute",
      left,
      width: Math.max(width, columnWidth - TASK_SIDE_INSET * 2),
      top: task.row * ROW_HEIGHT + TASK_BAR_PADDING,
      height: ROW_HEIGHT - 2 * TASK_BAR_PADDING,
      borderRadius: 8,
      color: "#fff",
      cursor: "grab",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      boxShadow: "0 2px 8px rgb(0 0 0 / 0.15)",
      userSelect: "none",
      zIndex: 10,
      boxSizing: "border-box",
      overflow: "hidden",
      transform: `translateX(${pxOffset}px)`,
      willChange: "transform",
      padding: "0 10px",
      background: "linear-gradient(180deg, #4a90e2, #357ABD)"
    };
  }, [columnWidth, getStartIdx, getEndIdx]);

  const getTaskFocusStyle = (taskId) => {
    if (!activeDepId) return {};
    const dep = dependencies.find(d => d.id === activeDepId);
    if (!dep) return {};
    const isActive = dep.from === taskId || dep.to === taskId;
    return isActive ? { opacity: 1 } : { opacity: 0.35, filter: "blur(1px)" };
  };

  const getPathFocusStyle = (depId) => {
    if (!activeDepId) return {};
    return depId === activeDepId ? { opacity: 1, stroke: "rgba(255,255,255,0.95)" } : { opacity: 0.15, stroke: "rgba(255,255,255,0.35)" };
  };

  const getLiveDepPath = () => {
    if (!depDrag) return null;
    const sourceTask = packedTasks.find(t => t.id === depDrag.fromTaskId);
    if (!sourceTask) return null;

    const A = computeTaskAnchors(sourceTask, getStartIdx, getEndIdx, columnWidth, columnHeaderHeight, sourceTask.__frac || 0, 20);
    if (!A) return null;

    const sc = schedulerContentRef.current;
    const svgRect = timelineRef.current?.querySelector('svg')?.getBoundingClientRect();
    if (!svgRect || !sc) return null;

    const start = (creatingDepType === "FS" || creatingDepType === "FF")
      ? { x: A.xRight, y: A.yMid }
      : { x: A.xLeft, y: A.yMid };

    const cursorX = depDrag.currentX - svgRect.left + sc.scrollLeft;
    const cursorY = depDrag.currentY - svgRect.top + sc.scrollTop;

    const dayIdx = Math.max(0, Math.min(daysArray.length - 1, Math.floor(cursorX / columnWidth)));
    const snapX = dayIdx * columnWidth + ((creatingDepType === "FS" || creatingDepType === "SS") ? TASK_SIDE_INSET : columnWidth - TASK_SIDE_INSET);
    const end = { x: snapX, y: cursorY };

    return roundManhattanPath([start, { x: end.x, y: start.y }, end], 5);
  };

  /* Render */
  return (
    <div
      ref={timelineRef}
      className={styles["timeline-scheduler"]}
      style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", position: "relative" }}
      onClick={() => { setFocusedDepId(null); setHoverDepId(null); }}
    >
      {/* Top Toolbar */}
      {/* <div style={{ display: "flex", gap: 8, padding: 8, alignItems: "center" }}>
        <button onClick={zoomIn}>Zoom +</button>
        <button onClick={zoomOut}>Zoom -</button>
        <button onClick={resetZoom}>Reset</button>
        <label style={{ marginLeft: 12 }}>
          <input type="checkbox" checked={showOutsideLabels} onChange={e => setShowOutsideLabels(e.target.checked)} /> Labels outside
        </label>
        <span style={{ marginLeft: 12, color: "#aaa" }}>Hold Space to pan</span>
      </div> */}

      <div
        ref={schedulerContentRef}
        className={styles["scheduler-content"]}
        style={{
          position: "relative",
          overflowX: "auto",
          overflowY: "auto",
          flex: "1 1 auto",
          scrollBehavior: "smooth"
        }}
        onMouseDown={onBodyMouseDown}
        onDoubleClick={onGridDoubleClick}
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
                <div ref={(idx === 0) ? firstColumnHeaderRef : undefined} style={{ width: "100%", padding: "0 20px", textAlign: "start", color: "white" }}>
                  {zone.zoneLabel}
                </div>
              </div>
            );
          })}
        </div>

        {/* Timeline wrapper */}
        <div
          className={styles["timeline-wrapper"]}
          style={{ position: "relative", width: timelineWidth, height: columnHeaderHeight + Math.max(visibleTrackHeight, timelineRowsHeight) }}
        >
          {/* Grid columns */}
          <div
            className={styles["zone-content"]}
            style={{
              display: "flex",
              position: "absolute",
              left: 0,
              top: 0,
              width: timelineWidth,
              filter: activeDepId ? "brightness(0.85)" : "none",
              transition: "filter 120ms ease"
            }}
          >
            {dayZones.flatMap((zone, z) => {
              return zone.days.map((day, idx) => {
                const isWeekend = day.date.getDay() === 0 || day.date.getDay() === 6;
                return (
                  <div key={`${z}-${idx}`} className={styles["zone-column"]} style={{ minWidth: columnWidth }} title={day.date.toDateString()}>
                    <div className={styles["zone-column-header"]} style={{ cursor: "zoom-in" }}>
                      <p>{day.shortLabel}</p>
                    </div>
                    <div className={`${styles["zone-column-content"]} ${isWeekend ? styles["weekend"] : ""}`} style={{ height: visibleTrackHeight }} />
                  </div>
                );
              });
            })}
          </div>

          {/* Dependency layer (SVG under tasks, pointer events ON) */}
          <svg
            className={styles["dependency-layer"]}
            width={timelineWidth}
            height={columnHeaderHeight + Math.max(visibleTrackHeight, timelineRowsHeight)}
            style={{ position: "absolute", left: 0, top: 0, pointerEvents: "auto", zIndex: 6 }}
          >
            <defs>
              <marker id="arrowhead" markerWidth="8" markerHeight="9" refX="7.2" refY="4" orient="auto">
                <polygon points="0 0, 6 3 , 0 6" fill="rgba(255, 255, 255, 0.95)" />
              </marker>
            </defs>

            {dependencyPaths.map(p => (
              <path
                key={p.id}
                d={p.d}
                fill="none"
                stroke="rgba(255,255,255,0.6)"
                strokeWidth={1.8}
                markerEnd="url(#arrowhead)"
                style={{ cursor: "pointer", transition: "opacity 120ms ease, filter 120ms ease, stroke 120ms ease", ...getPathFocusStyle(p.id) }}
                onMouseEnter={(e) => { e.stopPropagation(); setHoverDepId(p.id); }}
                onMouseLeave={(e) => { e.stopPropagation(); setHoverDepId((prev) => (prev === p.id ? null : prev)); }}
                onClick={(e) => { e.stopPropagation(); setFocusedDepId((prev) => (prev === p.id ? null : p.id)); }}
              />
            ))}

            {/* Live dragging dependency path */}
            {depDrag && (
              <path
                d={getLiveDepPath()}
                fill="none"
                stroke="rgba(255,255,255,0.85)"
                strokeWidth={2}
                strokeDasharray="5 5"
                markerEnd="url(#arrowhead)"
                pointerEvents="none"
              />
            )}
          </svg>

          {/* Task layer */}
          <div
            className={styles["task-layer"]}
            style={{ position: "absolute", left: 0, top: columnHeaderHeight, width: timelineWidth, height: timelineRowsHeight, pointerEvents: "none", zIndex: 10 }}
          >
            {packedTasks.map(task => {
              const s = getStartIdx(task), e = getEndIdx(task);
              const left = s * columnWidth + TASK_SIDE_INSET;
              const top = task.row * ROW_HEIGHT + TASK_BAR_PADDING;

              return (
                <React.Fragment key={task.id}>
                  {showOutsideLabels && (
                    <div style={{ position: "absolute", left, top: top - 4, color: "#fff", fontSize: 12, pointerEvents: "none" }}>
                      {task.label}
                    </div>
                  )}
                  <div
                    className={styles["task"]}
                    style={{ ...getTaskStyle(task), pointerEvents: "auto", transition: "opacity 120ms ease, filter 120ms ease", ...getTaskFocusStyle(task.id), outline: selectedTaskId === task.id ? "2px solid #fff" : "none" }}
                    onMouseDown={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const offsetX = e.clientX - rect.left;
                      if (offsetX < 12) onTaskMouseDown(e, task.id, "left");
                      else if (offsetX > rect.width - 12) onTaskMouseDown(e, task.id, "right");
                      else onTaskMouseDown(e, task.id, null);
                    }}
                    onClick={(e) => { e.stopPropagation(); setSelectedTaskId(task.id); }}
                    data-task-id={task.id}
                    title={task.label}
                  >
                    <p style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, padding: "0 10px" }}>{task.label}</p>
                    <p style={{ marginLeft: 8, fontSize: 11, opacity: 0.85, paddingRight: 10 }}>{task.endDate.toLocaleDateString()}</p>

                    {/* Dependency handles */}
                    <div
                      onMouseDown={(e) => { e.stopPropagation(); setDepDrag({ fromTaskId: task.id, currentX: e.clientX, currentY: e.clientY }); document.body.style.userSelect = "none"; setCreatingDepType("FS"); }}
                      style={{ position: "absolute", right: 0, top: 0, width: 12, height: "100%", cursor: "crosshair", zIndex: 20, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: "0 8px 8px 0" }}
                      title="Drag to create dependency (FS default). Press T to cycle FS/SS/FF/SF"
                    />
                    <div
                      onMouseDown={(e) => { e.stopPropagation(); setDepDrag({ fromTaskId: task.id, currentX: e.clientX, currentY: e.clientY }); document.body.style.userSelect = "none"; setCreatingDepType("SS"); }}
                      style={{ position: "absolute", left: 0, top: 0, width: 12, height: "100%", cursor: "crosshair", zIndex: 20, backgroundColor: "rgba(255,255,255,0.08)", borderRadius: "8px 0 0 8px" }}
                      title="Drag to create dependency (SS default). Press T to cycle"
                    />
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* HUD for dep type */}
      {depDrag && (
        <div style={{
          position: "fixed", left: depDrag.currentX + 12, top: depDrag.currentY + 12,
          background: "rgba(0,0,0,0.75)", color: "#fff", fontSize: 12,
          padding: "4px 6px", borderRadius: 4, pointerEvents: "none"
        }}>
          {creatingDepType} (press T)
        </div>
      )}
    </div>
  );
};

export default TimelineScheduler;
