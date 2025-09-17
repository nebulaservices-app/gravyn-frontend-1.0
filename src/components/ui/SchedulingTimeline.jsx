import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import styles from "./SchedulingTimeline.module.css";
import FloatingBubble from "./FloatingBubble";

/* Constants */
const MS_IN_DAY = 24 * 60 * 60 * 1000;
const DEFAULT_COLUMN_WIDTH = 90;
const MIN_COLUMN_WIDTH = 70;
const MAX_COLUMN_WIDTH = 300;
const ROW_HEIGHT = 64;
const TASK_BAR_PADDING = 10;
const TASK_SIDE_INSET = 10;
const DEP_MARGIN = 30; // horizontal/vertical clearance for elbows

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

/* Anchors: strict mid-left/right with drag translate applied */
// Pass taskLayerTop = columnHeaderHeight to rowTop argument
function computeTaskAnchors(task, getStartIdx, getEndIdx, columnWidth, rowTop, frac = 0, cssMarginTop = 20) {
  const sIdx = getStartIdx(task);
  const eIdx = getEndIdx(task);
  if (sIdx === -1 || eIdx === -1) return null;

  // Horizontal: exact bar position, including drag translate
  const translateX = frac * columnWidth;
  const barLeft = sIdx * columnWidth + TASK_SIDE_INSET + translateX;
  const rawWidth = (eIdx - sIdx + 1) * columnWidth - TASK_SIDE_INSET * 2;
  const barWidth = Math.max(rawWidth, columnWidth - TASK_SIDE_INSET * 2);

  // Vertical: exact card middle in the SVG’s coordinate space
  // SVG y=0 is at top of whole component; bars start at taskLayerTop = columnHeaderHeight
  const yTop = rowTop + task.row * ROW_HEIGHT + TASK_BAR_PADDING + cssMarginTop;
  const barHeight = ROW_HEIGHT - 2 * TASK_BAR_PADDING;
  const yMid = yTop + barHeight / 2;

  return {
    xLeft: barLeft,
    xRight: barLeft + barWidth,
    yMid
  };
}

  // Given a polyline as [{x,y}, ...], return a path string with 90° corners rounded by radius r.
function roundManhattanPath(points, r = 5) {
  if (!points || points.length < 2) return "";
  const clamp = (a,b,c) => Math.max(a, Math.min(b,c));
  const path = [];
  path.push(`M ${points[0].x} ${points[0].y}`);
  for (let i = 1; i < points.length; i++) {
    const pPrev = points[i - 1];
    const p = points[i];
    if (i < points.length - 1) {
      const pNext = points[i + 1];
      const dx1 = p.x - pPrev.x, dy1 = p.y - pPrev.y; // incoming
      const dx2 = pNext.x - p.x, dy2 = pNext.y - p.y; // outgoing

      const isStraight = (dx1 === 0 && dx2 === 0) || (dy1 === 0 && dy2 === 0);
      if (isStraight) {
        // no corner here
        path.push(`L ${p.x} ${p.y}`);
        continue;
      }

      // Distances along each leg
      const len1 = Math.abs(dx1) + Math.abs(dy1);
      const len2 = Math.abs(dx2) + Math.abs(dy2);
      const rr = Math.min(r, Math.floor(Math.min(len1, len2) / 2));

      // Trim along incoming leg
      const trimIn = {
        x: p.x - Math.sign(dx1) * rr,
        y: p.y - Math.sign(dy1) * rr
      };
      // Trim along outgoing leg
      const trimOut = {
        x: p.x + Math.sign(dx2) * rr,
        y: p.y + Math.sign(dy2) * rr
      };

      // Line to trimIn
      path.push(`L ${trimIn.x} ${trimIn.y}`);

      // Determine sweep for quarter arc
      // From dir1 -> dir2 (H then V or V then H)
      // Right(1,0)->Down(0,1): sweep=1; Right->Up: 0; Left(-1,0)->Down: 0; Left->Up:1
      // Up(0,-1)->Right(1,0):1; Down(0,1)->Right:0; Up->Left:0; Down->Left:1
      const sdx1 = Math.sign(dx1), sdy1 = Math.sign(dy1);
      const sdx2 = Math.sign(dx2), sdy2 = Math.sign(dy2);
      let sweep = 0;
      if (sdx1 === 1 && sdy2 === 1) sweep = 1;         // → then ↓
      else if (sdx1 === 1 && sdy2 === -1) sweep = 0;   // → then ↑
      else if (sdx1 === -1 && sdy2 === 1) sweep = 0;   // ← then ↓
      else if (sdx1 === -1 && sdy2 === -1) sweep = 1;  // ← then ↑
      else if (sdy1 === -1 && sdx2 === 1) sweep = 1;   // ↑ then →
      else if (sdy1 === 1 && sdx2 === 1) sweep = 0;    // ↓ then →
      else if (sdy1 === -1 && sdx2 === -1) sweep = 0;  // ↑ then ←
      else if (sdy1 === 1 && sdx2 === -1) sweep = 1;   // ↓ then ←

      // Quarter circle arc from trimIn to trimOut
      path.push(`A ${rr} ${rr} 0 0 ${sweep} ${trimOut.x} ${trimOut.y}`);
    } else {
      // Last segment
      path.push(`L ${p.x} ${p.y}`);
    }
  }
  return path.join(" ");
}


/* FS routing: non-overlap = HVH; overlap = stub -> midGapY -> preTurnX -> endY -> into B */
function buildFsPathMidAnchors(A, B, margin = DEP_MARGIN, radius = 7) {
  const startX = A.xRight, startY = A.yMid;
  const endX   = B.xLeft,  endY   = B.yMid;

  const preTurnX = endX - margin;
  const stubX    = startX + margin;

  const pts = [{ x: startX, y: startY }];
  const nonOverlap = startX + margin <= preTurnX;

  if (nonOverlap) {
    // HVH
    pts.push({ x: preTurnX, y: startY });
    pts.push({ x: preTurnX, y: endY });
    pts.push({ x: endX,    y: endY });
  } else {
    const midGapY = (startY + endY) / 2;
    pts.push({ x: stubX,    y: startY });
    pts.push({ x: stubX,    y: midGapY });
    pts.push({ x: preTurnX, y: midGapY });
    pts.push({ x: preTurnX, y: endY });
    pts.push({ x: endX,     y: endY });
  }

  return roundManhattanPath(pts, radius);
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
    { id: 4, label: "Input Styleguide", startDate: new Date("2025-07-01"), endDate: new Date("2025-07-12") },
    { id: 5, label: "New microdose website", startDate: new Date("2025-07-20"), endDate: new Date("2025-09-10") },
  ]);

  // Dependencies (FS only here)
  const [dependencies] = useState([
    { id: "d1", from: 4, to: 5, type: "FS" },
    { id: "d2", from: 1, to: 2, type: "FS" },
    { id: "d3", from: 3, to: 2, type: "FS" },
  ]);

  // Focus state
  const [focusedDepId, setFocusedDepId] = useState(null);
  const [hoverDepId, setHoverDepId] = useState(null);
  const activeDepId = hoverDepId ?? focusedDepId;

  const depEndpoints = useMemo(() => {
    const m = new Map();
    for (const d of dependencies) m.set(d.id, { from: d.from, to: d.to, type: d.type });
    return m;
  }, [dependencies]);

  const activeTaskIds = useMemo(() => {
    if (!activeDepId) return null;
    const e = depEndpoints.get(activeDepId);
    return e ? new Set([e.from, e.to]) : null;
  }, [activeDepId, depEndpoints]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setFocusedDepId(null);
        setHoverDepId(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* Index lookups */
  const getStartIdx = useCallback(
    (task) => daysArray.findIndex(d => d.toDateString() === task.startDate.toDateString()),
    [daysArray]
  );
  const getEndIdx = useCallback(
    (task) => daysArray.findIndex(d => d.toDateString() === task.endDate.toDateString()),
    [daysArray]
  );

  /* Layout */
  const packedTasks = useMemo(() => assignTaskRows([...tasks], getStartIdx, getEndIdx), [tasks, getStartIdx, getEndIdx]);
  const maxRow = useMemo(() => Math.max(...packedTasks.map(t => (typeof t.row === "number" ? t.row : 0)), 0), [packedTasks]);
  const timelineRowsHeight = useMemo(() => (maxRow + 1) * ROW_HEIGHT, [maxRow]);

  /* Refs and measures */
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

  /* Drag with smooth visual, snap on release */
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
      columnWidthAtStart: columnWidth
    };
    const t = packedTasks.find(x => x.id === taskId);
    if (t) {
      dragStateRef.current.originalStart = new Date(t.startDate);
      dragStateRef.current.originalEnd = new Date(t.endDate);
    }
    document.body.style.userSelect = "none";
  }, [columnWidth, packedTasks]);

  const onMouseMove = useCallback((e) => {
    if (!dragStateRef.current) return;
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

  /* Zoom */
  const clampZoom = useCallback((w) => Math.max(MIN_COLUMN_WIDTH, Math.min(MAX_COLUMN_WIDTH, w)), []);
  const zoomIn = useCallback(() => setColumnWidth(w => clampZoom(w + 10)), [clampZoom]);
  const zoomOut = useCallback(() => setColumnWidth(w => clampZoom(w - 10)), [clampZoom]);
  const resetZoom = useCallback(() => setColumnWidth(DEFAULT_COLUMN_WIDTH), []);

  const zoomAnchorRef = useRef(null);
  const setZoomAnchorByIndex = useCallback((idx) => {
    zoomAnchorRef.current = (typeof idx === "number" && idx >= 0 && idx < daysArray.length) ? idx : null;
  }, [daysArray.length]);
  const setZoomAnchorByDate = useCallback((date) => {
    const idx = daysArray.findIndex(d => d.toDateString() === date.toDateString());
    zoomAnchorRef.current = idx >= 0 ? idx : null;
  }, [daysArray]);







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

    let clientX = anchorClientX;
    if (zoomAnchorRef.current != null) {
      const rect = scroller.getBoundingClientRect();
      const dayCenterContentX = (zoomAnchorRef.current + 0.5) * prevW;
      clientX = rect.left + (dayCenterContentX - scroller.scrollLeft);
    }
    zoomAtX(clamped, prevW, scroller, clientX ?? (scroller.getBoundingClientRect().left + scroller.clientWidth / 2));
    if (setColumnWidthRaf.current) cancelAnimationFrame(setColumnWidthRaf.current);
    setColumnWidthRaf.current = requestAnimationFrame(() => setColumnWidth(clamped));
  }, [columnWidth, clampZoom, zoomAtX]);

  const onWheelZoom = useCallback((e) => {
    const isZoomGesture = e.ctrlKey || e.metaKey;
    if (!isZoomGesture) return;
    e.preventDefault();
    const step = 0.025;
    const factor = Math.exp(-step * Math.sign(e.deltaY));
    applyZoom(columnWidth * factor, e.clientX);
  }, [columnWidth, applyZoom]);

  /* Scroll snap */
  const scrollIdleRef = useRef(null);
  const onScroll = useCallback(() => {
    const scroller = schedulerContentRef.current;
    if (!scroller) return;
    if (scrollIdleRef.current) clearTimeout(scrollIdleRef.current);
    scrollIdleRef.current = setTimeout(() => {
      const col = columnWidth;
      const current = scroller.scrollLeft;
      scroller.scrollTo({ left: Math.round(current / col) * col, behavior: "smooth" });
    }, 140);
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
    //   background: "linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.06))",
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
      padding: "0 10px"
    };
  }, [columnWidth, getStartIdx, getEndIdx]);

  const getTaskFocusStyle = (taskId) => {
    if (!activeTaskIds) return {};
    const isActive = activeTaskIds.has(taskId);
    return isActive
      ? { filter: "none", opacity: 1 }
      : { filter: "blur(1px)", opacity: 0.35 };
  };

  /* Dependency paths: FS only */
 const dependencyPaths = useMemo(() => {
  const taskMap = new Map(packedTasks.map(t => [t.id, t]));
  const paths = [];
  const cssMarginTop = 20; // from .task { margin-top: 20px }

  for (const dep of dependencies) {
    if (dep.type !== "FS") continue;
    const ATask = taskMap.get(dep.from);
    const BTask = taskMap.get(dep.to);
    if (!ATask || !BTask) continue;

    const A = computeTaskAnchors(
      ATask, getStartIdx, getEndIdx, columnWidth,
      columnHeaderHeight, ATask.__frac || 0, cssMarginTop
    );
    const B = computeTaskAnchors(
      BTask, getStartIdx, getEndIdx, columnWidth,
      columnHeaderHeight, BTask.__frac || 0, cssMarginTop
    );
    if (!A || !B) continue;

    const d = buildFsPathMidAnchors(
      { xRight: A.xRight, yMid: A.yMid },
      { xLeft:  B.xLeft,  yMid: B.yMid },
    //   DEP_MARGIN
    40
    );

    paths.push({ id: dep.id, d });
  }
  return paths;
}, [dependencies, packedTasks, getStartIdx, getEndIdx, columnWidth, columnHeaderHeight]);



  const getPathFocusStyle = (depId) => {
    if (!activeDepId) return {};
    const isActive = depId === activeDepId;
    return isActive
      ? { opacity: 1, stroke: "var(--dep-line-color, rgba(255,255,255,0.9))" }
      : { opacity: 0.1, stroke: "var(--dep-line-color, rgba(255,255,255,0.25))" };
  };

  const timelineRef = useRef(null);

  return (
    <div
      ref={timelineRef}
      className={styles["timeline-scheduler"]}
      style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", position: "relative" }}
      onClick={() => { setFocusedDepId(null); setHoverDepId(null); }}
    >
      <FloatingBubble parentRef={timelineRef} size={50} onAction={(action) => {
        const scroller = schedulerContentRef.current;
        if (!scroller) return;
        if (action === "today") {
          const today = new Date();
          const idx = daysArray.findIndex(d => d.toDateString() === today.toDateString());
          if (idx === -1) return;
          const colLeft = idx * columnWidth;
          const view = scroller.clientWidth;
          scroller.scrollTo({ left: Math.max(0, colLeft - Math.max(0, (view - columnWidth) / 2)), behavior: "smooth" });
        } else if (action === "zoomIn") setColumnWidth(w => Math.min(MAX_COLUMN_WIDTH, w + 10));
        else if (action === "zoomOut") setColumnWidth(w => Math.max(MIN_COLUMN_WIDTH, w - 10));
        else if (action === "reset") setColumnWidth(DEFAULT_COLUMN_WIDTH);
      }} />

      <div
        ref={schedulerContentRef}
        className={styles["scheduler-content"]}
        style={{
          position: "relative",
          overflowX: "auto",
          overflowY: "auto",
          flex: "1 1 auto",
          minHeight: "calc(100% - 50px)",
          maxHeight: 420,
          scrollBehavior: "smooth",
          WebkitOverflowScrolling: "touch",
          overscrollBehavior: "contain"
        }}
        onWheel={(e) => {
          const isZoomGesture = e.ctrlKey || e.metaKey;
          if (!isZoomGesture) return;
          e.preventDefault();
          const step = 0.025;
          const factor = Math.exp(-step * Math.sign(e.deltaY));
          const next = columnWidth * factor;
          const rect = e.currentTarget.getBoundingClientRect();
          const clientX = e.clientX ?? (rect.left + rect.width / 2);
          const prevW = columnWidth;
          const clamped = Math.max(MIN_COLUMN_WIDTH, Math.min(MAX_COLUMN_WIDTH, next));
          if (clamped !== prevW) {
            const xInView = clientX - rect.left + e.currentTarget.scrollLeft;
            const scale = clamped / prevW;
            const newScrollLeft = xInView * scale - (clientX - rect.left);
            e.currentTarget.scrollLeft = Math.max(0, newScrollLeft);
            setColumnWidth(clamped);
          }
        }}
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
                <div style={{ width: "100%", padding: "0 20px", textAlign: "start", color: "white" }}>
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
                const globalIdx = dayZones.slice(0, z).reduce((acc, g) => acc + g.days.length, 0) + idx;
                return (
                  <div key={`${z}-${idx}`} className={styles["zone-column"]} style={{ minWidth: columnWidth }} title={day.date.toDateString()}>
                    <div
                      ref={globalIdx === 0 ? firstColumnHeaderRef : undefined}
                      className={styles["zone-column-header"]}
                      style={{ cursor: "zoom-in" }}
                    >
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
                <polygon points="0 0, 6 3 , 0 6" fill="var(--dep-arrow-color, rgba(255, 255, 255))" />
              </marker>
            </defs>
            {dependencyPaths.map(p => (
              <path
                key={p.id}
                d={p.d}
                fill="none"
                stroke="var(--dep-line-color, rgba(255, 255, 255, 0.3))"
                strokeWidth={activeDepId === p.id ? 2.25 : 1.75}
                shapeRendering="crispEdges"
                markerEnd="url(#arrowhead)"
                style={{ cursor: "pointer", transition: "opacity 120ms ease, filter 120ms ease, stroke 120ms ease", ...getPathFocusStyle(p.id) }}
                onMouseEnter={(e) => { e.stopPropagation(); setHoverDepId(p.id); }}
                onMouseLeave={(e) => { e.stopPropagation(); setHoverDepId((prev) => (prev === p.id ? null : prev)); }}
                onClick={(e) => { e.stopPropagation(); setFocusedDepId((prev) => (prev === p.id ? null : p.id)); }}
              />
            ))}

            
          </svg>

          {/* Today overlay (div version) */}
{todayIndex !== -1 && (
  <div
    className={styles["today-zone"]}
    style={{
      position: "absolute",
      top: 0,
      left: (todayIndex + 0.5) * columnWidth - 0.5, // center of day
      transform: "translateX(-50%)",
      width: 1,
      height: columnHeaderHeight + Math.max(visibleTrackHeight, timelineRowsHeight),
      pointerEvents: "none",
    }}
  >
    <span style={{ display: "block" }} />
    <div />
  </div>
)}


          {/* Task layer */}
          <div
            className={styles["task-layer"]}
            style={{ position: "absolute", left: 0, top: columnHeaderHeight, width: timelineWidth, height: timelineRowsHeight, pointerEvents: "none", zIndex: 10 }}
          >
            {packedTasks.map(task => (
              <div
                key={task.id}
                className={styles["task"]}
                style={{ ...getTaskStyle(task), pointerEvents: "auto", transition: "opacity 120ms ease, filter 120ms ease", ...getTaskFocusStyle(task.id) }}
                onMouseDown={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const offsetX = e.clientX - rect.left;
                  if (offsetX < 12) onTaskMouseDown(e, task.id, "left");
                  else if (offsetX > rect.width - 12) onTaskMouseDown(e, task.id, "right");
                  else onTaskMouseDown(e, task.id, null);
                }}
                title={task.label}
              >
                <p style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, padding: "0 10px" }}>{task.label}</p>
                <p style={{ marginLeft: 8, fontSize: 11, opacity: 0.85, paddingRight: 10 }}>
                  {task.endDate.toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineScheduler;
