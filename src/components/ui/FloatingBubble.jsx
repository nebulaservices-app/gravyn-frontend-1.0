import React, { useRef, useEffect, useState, useCallback } from "react";
import styles from "../ui/SchedulingTimeline.module.css";
import zoomin from "../../images/icons/zoomn.svg"
import zoomout from "../../images/icons/zoomout.svg"
import fit from "../../images/icons/fit.svg"
import reset from "../../images/icons/reset.svg"
import today from "../../images/icons/calendar.svg"

/**
 * FloatingBubble (self-contained with buttons)
 * Props:
 * - parentRef: React.RefObject<HTMLElement> to clamp within (must be positioned)
 * - initial?: { x: number, y: number }
 * - size?: number
 * - onAction?: (type: "today" | "zoomIn" | "zoomOut" | "fit" | "reset") => void
 */

/**
 * FloatingBubble (self-contained with buttons)
 * Props:
 * - parentRef: React.RefObject<HTMLElement> to clamp within (must be positioned)
 * - initial?: { x: number, y: number }
 * - size?: number
 * - onAction?: (type: "today" | "zoomIn" | "zoomOut" | "fit" | "reset") => void
 */
export default function FloatingBubble({
  parentRef,
  initial,
  size = 52,
  onAction
}) {
  const bubbleRef = useRef(null);

  // pressed vs dragging: pressed becomes dragging only after threshold
  const pressedRef = useRef(false);
  const draggingRef = useRef(false);

  // offset from bubble top-left to pointer hotspot when press started
  const grabOffsetRef = useRef({ gx: 0, gy: 0 });

  // initial pointer screen coords (for threshold)
  const startPointerRef = useRef({ px: 0, py: 0 });

  // current bubble local position (relative to parent)
  const posRef = useRef({ x: 0, y: 0 });
  const [pos, setPos] = useState({ x: 0, y: 0 });

  // action pill open state; stays open until explicitly toggled
  const [open, setOpen] = useState(false);

  const DRAG_THRESHOLD = 6; // px

  const easeOutBack = (t) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  };

const clamp = useCallback((x, y) => {
  const parent = parentRef?.current;
  if (!parent) return { x, y };
  const rect = parent.getBoundingClientRect();
  const padX = -40; // set to -2 to allow 2px overhang if desired
  const padY = -80
  const maxX = rect.width - size + padX;
  const maxY = rect.height - size + padY;
  return {
    x: Math.max(0 + (-padX), Math.min(x, maxX)),
    y: Math.max(0 + (-padY), Math.min(y, maxY)),
  };
}, [parentRef, size]);


  // Initialize position safely
  useEffect(() => {
    const parent = parentRef?.current;
    const fallbackW = 320, fallbackH = 240;
    const rectW = parent ? parent.getBoundingClientRect().width : fallbackW;
    const rectH = parent ? parent.getBoundingClientRect().height : fallbackH;
    const defaultX = rectW - size - 16;
    const defaultY = rectH - size - 16;
    const startX = initial?.x ?? defaultX;
    const startY = initial?.y ?? defaultY;
    const clamped = clamp(startX, startY);
    posRef.current = clamped;
    setPos(clamped);
  }, [parentRef, initial, clamp, size]);

  // Compute local coords helper (parent-local)
  const toLocal = (clientX, clientY) => {
    const parent = parentRef?.current;
    if (!parent) return { lx: clientX, ly: clientY };
    const rect = parent.getBoundingClientRect();
    return { lx: clientX - rect.left, ly: clientY - rect.top };
  };

  const onPointerDown = (e) => {
    // Do not let default text selection interfere
    e.preventDefault();

    const isTouch = e.type === "touchstart";
    const point = isTouch ? e.touches[0] : e;

    // Record initial pointer screen coords for threshold
    startPointerRef.current = { px: point.clientX, py: point.clientY };

    // Compute grab offset from bubble top-left to pointer
    const { lx, ly } = toLocal(point.clientX, point.clientY);
    const gx = lx - posRef.current.x;
    const gy = ly - posRef.current.y;
    grabOffsetRef.current = { gx, gy };

    pressedRef.current = true;
    draggingRef.current = false;

    document.body.style.userSelect = "none";
  };

  const onPointerMove = (e) => {
    if (!pressedRef.current) return;
    const isTouch = e.type === "touchmove";
    const point = isTouch ? e.touches[0] : e;

    // Check threshold
    const dxp = point.clientX - startPointerRef.current.px;
    const dyp = point.clientY - startPointerRef.current.py;
    const dist2 = dxp * dxp + dyp * dyp;
    if (!draggingRef.current && dist2 < DRAG_THRESHOLD * DRAG_THRESHOLD) {
      return; // still a click jitter
    }

    // Now it's a drag
    draggingRef.current = true;

    // Desired local top-left = pointerLocal - grabOffset
    const { lx, ly } = toLocal(point.clientX, point.clientY);
    const nx = lx - grabOffsetRef.current.gx;
    const ny = ly - grabOffsetRef.current.gy;

    const clamped = clamp(nx, ny);
    posRef.current = clamped;

    // Immediate visual update via transform for smoothness
    if (bubbleRef.current) {
      bubbleRef.current.style.transform = `translate(${clamped.x}px, ${clamped.y}px)`;
    }
  };

  const onPointerUp = () => {
    if (!pressedRef.current) return;

    const wasDragging = draggingRef.current;
    pressedRef.current = false;
    draggingRef.current = false;
    document.body.style.userSelect = "";

    // If it was a click (no drag), do nothing here; onClick toggles the pill
    if (!wasDragging) return;

    // Snap to nearest edge after drag completes
    const parent = parentRef?.current;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    const maxX = rect.width - size;
    const maxY = rect.height - size;
    const { x, y } = posRef.current;

    const distances = [
      { edge: "left", d: x },
      { edge: "right", d: Math.abs(maxX - x) },
      { edge: "top", d: y },
      { edge: "bottom", d: Math.abs(maxY - y) },
    ].sort((a, b) => a.d - b.d);

    const nearest = distances[0].edge;

let tx = x;
let ty = y;
if (nearest === "left") tx = 0;
if (nearest === "right") tx = maxX;
if (nearest === "top") ty = 0;
if (nearest === "bottom") ty = maxY;


    const from = { ...posRef.current };
    const to = clamp(tx, ty);

    const duration = 180;
    const startTime = performance.now();

    function step(now) {
      const t = Math.min(1, (now - startTime) / duration);
      const k = easeOutBack(t);
      const nx = from.x + (to.x - from.x) * k;
      const ny = from.y + (to.y - from.y) * k;
      if (bubbleRef.current) {
        bubbleRef.current.style.transform = `translate(${nx}px, ${ny}px)`;
      }
      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        posRef.current = to;
        setPos(to);
      }
    }
    requestAnimationFrame(step);
  };

  // Global listeners
  useEffect(() => {
    const handleMouseMove = (e) => onPointerMove(e);
    const handleMouseUp = () => onPointerUp();
    const handleTouchMove = (e) => onPointerMove(e);
    const handleTouchEnd = () => onPointerUp();

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [onPointerMove]);

  // Pill side based on current x
  const isNearLeft = pos.x < 140;
  const pillSideStyle = isNearLeft ? { left: size + 10 } : { right: size + 10 };

  return (
    <div
      ref={bubbleRef}
      onMouseDown={onPointerDown}
      onTouchStart={onPointerDown}
      onClick={() => {
        // Toggle only when it was not a drag
        if (draggingRef.current) return;
        setOpen(v => !v);
      }}
      className={styles["bubbleStyle"]}
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        transform: `translate(${pos.x}px, ${pos.y}px)`,
        width: size,
        height: size,
        borderRadius: "9999px",
        cursor: "grab",
        touchAction: "none",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "auto",
        userSelect: "none",
        willChange: "transform",
      }}
      aria-label="Floating actions"
      role="button"
      title="Actions"
    >
      {/* Dot in its own div */}
      <div className={styles["bubbleDot"]} style={{ position: "relative", zIndex: 1000 }}>
        ≡
      </div>

      {/* Pill sibling div, visually beside the dot (stays open until user toggles) */}
      {open && (
        <div
          className={styles["bubblePill"]}
          style={{
            position: "absolute",
            top: "50%",
            transform: "translateY(-50%)",
            ...pillSideStyle,
            pointerEvents: "auto",
            zIndex: 1001,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
      <button className={styles["bubblePillItem"]} onClick={() => {  onAction?.("today"); }}><img src={today}/><p>Today</p></button>
          <button className={styles["bubblePillItem"]} onClick={() => { onAction?.("zoomOut"); }}><img src={zoomout}/><p>Zoom Out</p></button>
          <button className={styles["bubblePillItem"]} onClick={() => {  onAction?.("zoomIn"); }}><img src={zoomin}/><p>Zoom In</p></button>
          <button className={styles["bubblePillItem"]} onClick={() => {  onAction?.("fit"); }}><img src={fit}/><p>Fit</p></button>
          <button className={styles["bubblePillItem"]} onClick={() => {  onAction?.("reset"); }}><img src={reset}/><p>Reset</p></button>
       
        </div>
      )}
    </div>
  );
}
