// ContractEditorMain.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "./ContractEditorMain.module.css";

import { useEditorState } from "./editor/useEditorState";
import { TOOLS, PAGE_SIZES } from "./editor/constants";
import { TEMPLATES, SECTIONS, VARIABLES_SCHEMA } from "./ui/templates";
import { exportPagesToPDF } from "./editor/pdf";
import { renderBlock } from "./editor/renderers";
import { applyVariablesToBlocks } from "./editor/variables";
import { paginate } from "./editor/pagination";

import right from "../../../images/icons/rightarrow.svg";
import preview from "../../../images/icons/preview.svg";
import download from "../../../images/icons/download.svg";
import share from "../../../images/icons/share.svg";

import select from "../../../images/icons/select.svg"
import signature from "../../../images/icons/signature.svg"
import shape from "../../../images/icons/shape.svg"
import text from "../../../images/icons/text.svg"
import textsize from "../../../images/icons/textsize.svg"
import heading from "../../../images/icons/heading.svg"




// Grid & snap
const GRID_SIZE = 8;
const SNAP_DISTANCE = 6;
const NUDGE_STEP = 1;
const NUDGE_STEP_FAST = 10;

const uid = (p = "") => p + Math.random().toString(36).slice(2, 9);
const roundGrid = (v) => Math.round(v / GRID_SIZE) * GRID_SIZE;
const near = (a, b, d = SNAP_DISTANCE) => Math.abs(a - b) <= d;

export default function ContractEditorMain() {
  const {
    pages, setPages, activePageIndex, tool, setTool, selectedIds, setSelectedIds,
    drawing, setDrawing, dragging, setDragging, resizing, setResizing,
    isPanning, setIsPanning, pan, setPan, marquee, setMarquee,
    floatingBar, setFloatingBar, mouseDownPoint, setMouseDownPoint,
    editingId, setEditingId, pageRef, editorRef, fileInputRef, clickTimer,
    activePage, updateBlock, addBlock,
  } = useEditorState();

  // Theme
  const [theme, setTheme] = useState("dark");
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") root.classList.add("light"); else root.classList.remove("light");
    if (theme !== "light") root.classList.add("dark"); else root.classList.remove("dark");
  }, [theme]);

  // Variables + pagination
  const [variables, setVariables] = useState({});
  const pagesWithVars = useMemo(() => paginate(
    pages.map(p => ({ ...p, blocks: applyVariablesToBlocks(p.blocks, variables) }))
  ), [pages, variables]);

  // Editor nodes map for contentEditable
  const editorNodeMapRef = useRef(new Map());

  // Meta: lock & groups (future use)
  const [meta, setMeta] = useState({ locked: new Set(), groups: {} });
  const isLocked = (id) => meta.locked.has(id);

  // History
  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);
  const snapshot = () => JSON.stringify({ pages, pan, selectedIds, variables });
  const pushHistory = () => setHistory((h) => [...h, snapshot()].slice(-100));

  // View toggles
  const [showGrid, setShowGrid] = useState(false);
  const [showRulers, setShowRulers] = useState(false);

  // Alignment snap lines
  const [snapLines, setSnapLines] = useState([]); // {x}|{y}

  // Panels
  const [leftTab, setLeftTab] = useState("layers"); // layers | assets | variables | history
  const [rightTab] = useState("inspector"); // reserved

  // Export preset
  const [pdfPreset, setPdfPreset] = useState("standard");

  // Command palette
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState("");

  // Floating selection bar for native selection
  useEffect(() => {
    const onSel = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed) { setFloatingBar(null); return; }
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      if (!rect || !rect.width) { setFloatingBar(null); return; }
      setFloatingBar({ x: rect.left + rect.width / 2, y: rect.top - 8 });
    };
    document.addEventListener("selectionchange", onSel);
    return () => document.removeEventListener("selectionchange", onSel);
  }, [setFloatingBar]);

  // Caret at end helper
  const focusAtEnd = (el) => {
    el.focus();
    const sel = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
  };

  // Formatting exec
  const focusEditorAndExec = (blockId, command, value = null) => {
    const editor = editorNodeMapRef.current.get(blockId);
    if (!editor) return;
    focusAtEnd(editor);
    document.execCommand(command, false, value);
    updateBlock(activePageIndex, blockId, { content: editor.innerHTML });
  };

  const execInlineSafe = (cmd, value = null) => {
    if (selectedIds.length !== 1) return;
    const b = activePage.blocks.find(x => x.id === selectedIds[0]);
    if (!b || !["text", "paragraph"].includes(b.type)) return;
    focusEditorAndExec(b.id, cmd, value);
  };

  // Paste: plain text
  const onPaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  };

  // Image insert
  const onPickImage = () => fileInputRef.current?.click();
  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      pushHistory();
      const id = uid("img_");
      addBlock(activePageIndex, {
        id, type: "image", src: reader.result,
        x: 120, y: 120, width: 600, height: 300,
        editable: false, padding: 0, borderRadius: 8, backgroundColor: "transparent", alignContent: "left", opacity: 1
      });
      setSelectedIds([id]);
      e.target.value = "";
    };
    reader.readAsDataURL(file);
  };

  // Export PDF
  const exportPdf = async () => {
    const meta = {
      header: { enabled: true, text: variables.ClientName ? `${variables.ClientName} – Contract` : "Contract" },
      footer: { enabled: true, left: new Date().toISOString().slice(0,10) },
      preset: pdfPreset,
    };
    await exportPagesToPDF(`.${styles["page-outer"]}`, meta);
  };

  // Click/dblclick for edit/select
  const onBlockClick = (e, block) => {
    e.stopPropagation();
    if (isLocked(block.id)) return;
    const multi = e.shiftKey || e.ctrlKey || e.metaKey;
    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
      clickTimer.current = null;
      if (["text", "paragraph"].includes(block.type)) {
        setEditingId(block.id);
        setSelectedIds([block.id]);
        const editor = editorNodeMapRef.current.get(block.id);
        if (editor) {
          editor.setAttribute("contenteditable","true");
          focusAtEnd(editor);
        }
      }
      return;
    }
    clickTimer.current = setTimeout(() => {
      setEditingId(null);
      setSelectedIds(prev => multi ? (prev.includes(block.id) ? prev.filter(x => x !== block.id) : [...prev, block.id]) : [block.id]);
      clickTimer.current = null;
    }, 220);
  };

  // Drag start for blocks
  const onBlockPointerDown = (e, block) => {
    e.stopPropagation();
    if (editingId || isLocked(block.id)) return;
    if (e.button !== 0) return;
    const selIds = selectedIds.includes(block.id) ? selectedIds : [block.id];
    const targetSet = new Set(selIds);
    const selBlocks = activePage.blocks.filter(b => targetSet.has(b.id));
    pushHistory();
    setDragging({
      pageIndex: activePageIndex,
      startX: e.clientX, startY: e.clientY,
      startXOrigin: e.clientX, startYOrigin: e.clientY,
      started: false,
      items: selBlocks.map(b => ({ id: b.id, origX: b.x, origY: b.y })),
    });
  };

  // Resize handle down
  const onHandlePointerDown = (e, block, handle) => {
    e.stopPropagation();
    if (editingId || isLocked(block.id)) return;
    pushHistory();
    setResizing({
      blockId: block.id, handle,
      startX: e.clientX, startY: e.clientY,
      startRect: { x: block.x, y: block.y, width: block.width, height: block.height },
    });
  };

  // Text input autosize
  const handleTextInput = (e, block) => {
    const el = e.currentTarget;
    el.style.height = "auto";
    const needed = el.scrollHeight;
    updateBlock(activePageIndex, block.id, { height: Math.max(needed, 24), content: el.innerHTML });
  };

  // Stop editing
  const stopEditing = () => {
    if (!editingId) return;
    const editor = editorNodeMapRef.current.get(editingId);
    editor?.setAttribute("contenteditable","false");
    setEditingId(null);
  };

  // Copy/Cut/Paste elements
  useEffect(() => {
    const onCopyCutPaste = (e) => {
      if (editingId) return; // let browser handle text copy while editing text
      // COPY
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "c") {
        if (!selectedIds.length) return;
        const selBlocks = activePage.blocks.filter(b => selectedIds.includes(b.id));
        window._clipBlocks = selBlocks.map(b => ({ ...b }));
        e.preventDefault();
      }
      // CUT
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "x") {
        if (!selectedIds.length) return;
        const selBlocks = activePage.blocks.filter(b => selectedIds.includes(b.id));
        window._clipBlocks = selBlocks.map(b => ({ ...b }));
        pushHistory();
        setPages(prev => prev.map((p, idx) =>
          idx===activePageIndex ? { ...p, blocks: p.blocks.filter(b => !selectedIds.includes(b.id)) } : p
        ));
        setSelectedIds([]);
        e.preventDefault();
      }
      // PASTE
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "v") {
        if (!window._clipBlocks?.length) return;
        pushHistory();
        const clones = window._clipBlocks.map(b => ({ ...b, id: uid("paste_"), x: b.x + 16, y: b.y + 16 }));
        setPages(prev => prev.map((p, idx) =>
          idx===activePageIndex ? { ...p, blocks: [...p.blocks, ...clones] } : p
        ));
        setSelectedIds(clones.map(c => c.id));
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", onCopyCutPaste);
    return () => window.removeEventListener("keydown", onCopyCutPaste);
  }, [selectedIds, editingId, activePage, activePageIndex, setPages]);

  // Keyboard shortcuts and history
  useEffect(() => {
    const onKey = (e) => {
      // Palette
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { setPaletteOpen(true); setPaletteQuery(""); e.preventDefault(); }
      if (paletteOpen && e.key === "Escape") { setPaletteOpen(false); e.preventDefault(); }

      // Undo / Redo
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === "z") {
        if (!history.length) return;
        const prev = history[history.length - 1];
        setFuture(f => [snapshot(), ...f].slice(0,100));
        const s = JSON.parse(prev);
        setPages(s.pages); setPan(s.pan); setSelectedIds(s.selectedIds); setVariables(s.variables);
        setHistory(h => h.slice(0,-1));
        e.preventDefault(); return;
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "z") {
        if (!future.length) return;
        const nxt = future[0];
        setHistory(h => [...h, snapshot()].slice(-100));
        const s = JSON.parse(nxt);
        setPages(s.pages); setPan(s.pan); setSelectedIds(s.selectedIds); setVariables(s.variables);
        setFuture(f => f.slice(1));
        e.preventDefault(); return;
      }

      if (editingId) {
        if (e.key === "Escape") { stopEditing(); e.preventDefault(); }
        return;
      }
      if (!selectedIds.length) return;

      // Delete
      if ((e.key === "Delete" || (e.key === "Backspace" && !/INPUT|TEXTAREA/.test(e.target.tagName)))) {
        pushHistory();
        setPages(prev => prev.map((p, idx) =>
          idx === activePageIndex ? { ...p, blocks: p.blocks.filter(b => !selectedIds.includes(b.id)) } : p
        ));
        setSelectedIds([]);
        e.preventDefault();
      }

      // Duplicate
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "d") {
        pushHistory();
        setPages(prev => prev.map((p, idx) => {
          if (idx !== activePageIndex) return p;
          const clones = p.blocks.filter(b => selectedIds.includes(b.id))
            .map(b => ({ ...b, id: uid("dup_"), x: b.x + 12, y: b.y + 12 }));
          return { ...p, blocks: [...p.blocks, ...clones] };
        }));
        e.preventDefault();
      }

      // Nudge
      if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)) {
        pushHistory();
        const step = e.shiftKey ? NUDGE_STEP_FAST : NUDGE_STEP;
        const dx = e.key === "ArrowLeft" ? -step : e.key === "ArrowRight" ? step : 0;
        const dy = e.key === "ArrowUp" ? -step : e.key === "ArrowDown" ? step : 0;
        setPages(prev => prev.map((p, idx) =>
          idx === activePageIndex
            ? { ...p, blocks: p.blocks.map(b => selectedIds.includes(b.id) ? { ...b, x: b.x + dx, y: b.y + dy } : b) }
            : p
        ));
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [paletteOpen, history, future, pages, pan, variables, editingId, selectedIds, activePageIndex]);

  // Drag reorder for Layers (left panel)
  const [dragLayerId, setDragLayerId] = useState(null);

  // Compute alignment snap lines given primary preview and other blocks
  const computeSnapLines = (preview, blocks) => {
    const lines = [];
    const edges = (b)=>({
      left:b.x, right:b.x+b.width, top:b.y, bottom:b.y+b.height, cx: b.x + b.width/2, cy: b.y + b.height/2
    });
    const p0 = edges(preview);
    blocks.forEach(b=>{
      if (b.id===preview.id) return;
      const e = edges(b);
      if (near(p0.left, e.left) || near(p0.left, e.right) || near(p0.left, e.cx)) lines.push({ x: e.left });
      if (near(p0.right, e.left) || near(p0.right, e.right) || near(p0.right, e.cx)) lines.push({ x: e.right });
      if (near(p0.cx, e.left) || near(p0.cx, e.right) || near(p0.cx, e.cx)) lines.push({ x: e.cx });
      if (near(p0.top, e.top) || near(p0.top, e.bottom) || near(p0.top, e.cy)) lines.push({ y: e.top });
      if (near(p0.bottom, e.top) || near(p0.bottom, e.bottom) || near(p0.bottom, e.cy)) lines.push({ y: e.bottom });
      if (near(p0.cy, e.top) || near(p0.cy, e.bottom) || near(p0.cy, e.cy)) lines.push({ y: e.cy });
    });
    return lines.slice(0,6);
  };


  const [guides, setGuides] = useState([]); // persistent guides (optional)

  const selectedBlock = selectedIds.length === 1 ? activePage.blocks.find(b => b.id === selectedIds[0]) : null;
const showInlineStyleBar = !!(selectedBlock && ["text","paragraph"].includes(selectedBlock.type));

  // Global pointer move/up: resize, drag, pan, marquee, drawing + snap lines
  useEffect(() => {
    const onMove = (e) => {
      if (!pageRef.current) return;

      // Resize
      if (resizing) {
        const dx = e.clientX - resizing.startX;
        const dy = e.clientY - resizing.startY;
        const { x: sx, y: sy, width: sw, height: sh } = resizing.startRect;
        let nx = sx, ny = sy, nw = sw, nh = sh;
        const h = resizing.handle;
        if (h.includes("n")) { ny = sy + dy; nh = Math.max(10, sh - dy); }
        if (h.includes("s")) { nh = Math.max(10, sh + dy); }
        if (h.includes("w")) { nx = sx + dx; nw = Math.max(10, sw - dx); }
        if (h.includes("e")) { nw = Math.max(10, sw + dx); }
        nw = roundGrid(nw); nh = roundGrid(nh);
        updateBlock(activePageIndex, resizing.blockId, { x: nx, y: ny, width: nw, height: nh });
        return;
      }

      // Drag
      if (dragging) {
        if (editingId) return;
        const dist = Math.hypot(e.clientX - dragging.startXOrigin, e.clientY - dragging.startYOrigin);
        if (!dragging.started && dist < 4) return;
        const dx = e.clientX - dragging.startX;
        const dy = e.clientY - dragging.startY;
        setPages(prev => prev.map((p, idx) => {
          if (idx !== dragging.pageIndex) return p;
          const ids = new Set(dragging.items.map(i => i.id));
          const preview = dragging.items.map(it => {
            const b = p.blocks.find(x => x.id === it.id);
            return { id: it.id, x: it.origX + dx, y: it.origY + dy, w: b.width, h: b.height };
          });
          if (preview.length) {
            const first = preview[0];
            // grid snap for first
            const sx = near(first.x, roundGrid(first.x)) ? roundGrid(first.x) : first.x;
            const sy = near(first.y, roundGrid(first.y)) ? roundGrid(first.y) : first.y;
            const ddx = sx - first.x;
            const ddy = sy - first.y;
            preview.forEach((pt)=> { pt.x += ddx; pt.y += ddy; });
            // compute alignment lines
            const b0 = { id:first.id, x:sx, y:sy, width:first.w, height:first.h };
            setSnapLines(computeSnapLines(b0, p.blocks));
          }
          return {
            ...p,
            blocks: p.blocks.map(b => {
              if (!ids.has(b.id)) return b;
              const pos = preview.find(pt => pt.id === b.id);
              return { ...b, x: pos.x, y: pos.y };
            })
          };
        }));
        setDragging(d => ({ ...d, started: true }));
        return;
      }

      // Pan
      if (isPanning && mouseDownPoint) {
        const dx = e.clientX - mouseDownPoint.x;
        const dy = e.clientY - mouseDownPoint.y;
        setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
        setMouseDownPoint({ x: e.clientX, y: e.clientY });
        return;
      }

      // Marquee
      if (marquee?.active) {
        const rect = pageRef.current.getBoundingClientRect();
        const mx = e.clientX - rect.left - pan.x;
        const my = e.clientY - rect.top - pan.y;
        const x = Math.min(marquee.startX, mx);
        const y = Math.min(marquee.startY, my);
        const w = Math.abs(mx - marquee.startX);
        const h = Math.abs(my - marquee.startY);
        setMarquee({ ...marquee, x, y, w, h });
        return;
      }

      // Drawing
      if (drawing) {
        const rect = pageRef.current.getBoundingClientRect();
        const cx = e.clientX - rect.left - pan.x;
        const cy = e.clientY - rect.top - pan.y;
        const x = Math.min(drawing.startX, cx);
        const y = Math.min(drawing.startY, cy);
        const w = Math.max(4, Math.abs(cx - drawing.startX));
        const h = Math.max(4, Math.abs(cy - drawing.startY));
        updateBlock(activePageIndex, drawing.tempId, { x, y, width: roundGrid(w), height: roundGrid(h) });
      }
    };

    const onUp = () => {
      if (drawing) { setDrawing(null); setTool(TOOLS.SELECT); }
      setDragging(null);
      setResizing(null);
      setIsPanning(false);
      setMouseDownPoint(null);
      setSnapLines([]);
      if (marquee?.active) {
        const sel = activePage.blocks.filter((b) => {
          const bx1 = b.x, by1 = b.y, bx2 = b.x + b.width, by2 = b.y + b.height;
          const mx1 = marquee.x, my1 = marquee.y, mx2 = marquee.x + marquee.w, my2 = marquee.y + marquee.h;
          return !(bx2 < mx1 || bx1 > mx2 || by2 < my1 || by1 > my2);
        }).map(b => b.id);
        setSelectedIds(sel);
        setMarquee(null);
      }
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [drawing, resizing, dragging, isPanning, mouseDownPoint, marquee, activePage, activePageIndex, pan.x, pan.y, updateBlock, setDrawing, setDragging, setResizing, setIsPanning, setMouseDownPoint, setSelectedIds, setMarquee, setTool, editingId, pageRef, setPages]);

  // Ruler top offset
  const rulerTop = showInlineStyleBar ? 96 : 48;

  // Commands list for palette
  const paletteCmds = [
    { key: "bold", label: "Bold", run: () => execInlineSafe("bold") },
    { key: "italic", label: "Italic", run: () => execInlineSafe("italic") },
    { key: "underline", label: "Underline", run: () => execInlineSafe("underline") },
    { key: "ulist", label: "Bulleted List", run: () => execInlineSafe("insertUnorderedList") },
    { key: "olist", label: "Numbered List", run: () => execInlineSafe("insertOrderedList") },
    { key: "left", label: "Align Left", run: () => execInlineSafe("justifyLeft") },
    { key: "center", label: "Align Center", run: () => execInlineSafe("justifyCenter") },
    { key: "right", label: "Align Right", run: () => execInlineSafe("justifyRight") },
    { key: "pdf", label: "Export PDF", run: exportPdf },
    { key: "image", label: "Insert Image", run: onPickImage },
  ];

  // Floating Figma-style quick menu (bottom-left)
  const FigmaMenu = () => (
    <div className={styles.figmaMenu}>
      <button onClick={()=>setTool(TOOLS.SELECT)}>Select</button>
      <button onClick={()=>setTool(TOOLS.PARAGRAPH)}>Text</button>
      <button onClick={()=>setTool(TOOLS.RECT)}>Rect</button>
      <button onClick={()=>setTool(TOOLS.CIRCLE)}>Circle</button>
      <button onClick={()=>setTool(TOOLS.LINE)}>Line</button>
      <span />
      <button onMouseDown={(e)=>e.preventDefault()} onClick={()=>execInlineSafe("bold")}>B</button>
      <button onMouseDown={(e)=>e.preventDefault()} onClick={()=>execInlineSafe("italic")}>I</button>
      <button onMouseDown={(e)=>e.preventDefault()} onClick={()=>execInlineSafe("underline")}>U</button>
      <button onMouseDown={(e)=>e.preventDefault()} onClick={()=>execInlineSafe("insertUnorderedList")}>•</button>
      <button onMouseDown={(e)=>e.preventDefault()} onClick={()=>execInlineSafe("insertOrderedList")}>1.</button>
      <button onMouseDown={(e)=>e.preventDefault()} onClick={()=>execInlineSafe("justifyLeft")}>L</button>
      <button onMouseDown={(e)=>e.preventDefault()} onClick={()=>execInlineSafe("justifyCenter")}>C</button>
      <button onMouseDown={(e)=>e.preventDefault()} onClick={()=>execInlineSafe("justifyRight")}>R</button>
    </div>
  );

  return (
    <section className={styles["page-wrapper"]}>
      {/* <div className={styles["header"]}>
        <div className={styles['header-i']}>
          <div className={styles['header-nav']}>
            <p>Contracts</p>
            <img src={right} alt="" />
            <p>New Contract Agreement<span>Draft</span></p>
          </div>
        </div>
        <div className={styles['header-i']}>
          <div className={styles['header-control']} title="Preview">
            <img src={preview} alt="Preview" />
          </div>
          <div onClick={exportPdf} className={styles['header-control']} title="Download PDF">
            <img src={download} alt="Download PDF" />
          </div>
          <div className={styles['header-control']} title="Share">
            <img src={share} alt="Share" />
          </div>
        </div>
      </div> */}

      <div className={styles["content"]}>
        <aside className={styles["left-bar"]} onPointerDown={(e) => e.stopPropagation()}>
                             <div className={styles['left-bar-header']}>
            <div className={styles['left-bar-header-i']}>
              <div className={styles['left-bar-text-wrapper']}>
                <div><p>New Contract Agreement</p><img src={right} alt="" /></div>
                <p>Drafts</p>
              </div>
            </div>
          </div>

          <div className={styles['left-bar-button-wrapper']}>
            <button className="toolItem" onClick={()=>setLeftTab("layers")}>Layers</button>
            <button className="toolItem" onClick={()=>setLeftTab("styles")}>Styles</button>

            <button className="toolItem" onClick={()=>setLeftTab("assets")}>Assets</button>
            <button className="toolItem" onClick={()=>setLeftTab("variables")}>Variables</button>
          </div>

          {leftTab === "styles" && (
            <>
{selectedIds.length === 1 && ["text","paragraph"].includes((activePage.blocks.find(b => b.id === selectedIds[0]) || {}).type) && (
  <div className={styles['center-right-bar']}>
    {(() => {
      const b = activePage?.blocks?.find(x => x.id === selectedIds[0]);
      if (!b) return null;
      const upd = (patch) => updateBlock(activePageIndex, b.id, patch);

      const onNum = (fn) => (e) => {
        const v = e.target.value;
        if (v === "" || v === "-" || v === "." || v === "-.") return;
        const n = Number(v);
        if (!Number.isNaN(n)) fn(n);
      };

      return (
        <div>
          {/* Layout group */}
          <div className={styles['style-entity-group']}>
            <div className={styles['style-entity-title']}>Position</div>
            <div className={styles['style-row']}>
              <span className={styles['style-key']}>X</span>
              <input className={styles['style-num']} type="number" value={b.x ?? 0} onChange={onNum((n)=>upd({ x: n }))} />
              <span className={styles['style-key']}>Y</span>
              <input className={styles['style-num']} type="number" value={b.y ?? 0} onChange={onNum((n)=>upd({ y: n }))} />
              <span className={styles['style-key']}>W</span>
              <input className={styles['style-num']} type="number" value={b.width ?? 0} onChange={onNum((n)=>upd({ width: Math.max(10, n) }))} />
              <span className={styles['style-key']}>H</span>
              <input className={styles['style-num']} type="number" value={b.height ?? 0} onChange={onNum((n)=>upd({ height: Math.max(10, n) }))} />
            </div>
          </div>

          {/* Typography group */}
          <div className={styles['style-entity-group']}>
            <div className={styles['style-entity-title']}>Typography</div>
            <div className={styles['style-row']}>
              <span className={styles['style-key']}>Font</span>
              <input className={styles['style-num']} type="number" value={b.fontSize ?? 16} onChange={onNum((n)=>upd({ fontSize: n }))} />
              <button className={styles['style-btn']} onMouseDown={(e)=>e.preventDefault()} onClick={()=>execInlineSafe("bold")}>B</button>
              <button className={styles['style-btn']} onMouseDown={(e)=>e.preventDefault()} onClick={()=>execInlineSafe("italic")}>I</button>
              <button className={styles['style-btn']} onMouseDown={(e)=>e.preventDefault()} onClick={()=>execInlineSafe("underline")}>U</button>
              <button className={styles['style-btn']} onMouseDown={(e)=>e.preventDefault()} onClick={()=>execInlineSafe("justifyLeft")}>L</button>
              <button className={styles['style-btn']} onMouseDown={(e)=>e.preventDefault()} onClick={()=>execInlineSafe("justifyCenter")}>C</button>
              <button className={styles['style-btn']} onMouseDown={(e)=>e.preventDefault()} onClick={()=>execInlineSafe("justifyRight")}>R</button>
              <button className={styles['style-btn']} onMouseDown={(e)=>e.preventDefault()} onClick={()=>execInlineSafe("insertUnorderedList")}>•</button>
              <button className={styles['style-btn']} onMouseDown={(e)=>e.preventDefault()} onClick={()=>execInlineSafe("insertOrderedList")}>1.</button>
            </div>
          </div>

          {/* Colors & opacity */}
          <div className={styles['style-entity-group']}>
            <div className={styles['style-entity-title']}>Colors</div>
            <div className={styles['style-row']}>
              <span className={styles['style-key']}>Color</span>
              <input className={styles['style-color']} type="color" value={b.color || "#222222"} onChange={(e)=>upd({ color: e.target.value })} />
              <span className={styles['style-key']}>BG</span>
              <input className={styles['style-color']} type="color" value={b.backgroundColor || "#ffffff"} onChange={(e)=>upd({ backgroundColor: e.target.value })} />
              <span className={styles['style-key']}>Opacity</span>
              <input className={styles['style-range']} type="range" min="0" max="1" step="0.05" value={b.opacity ?? 1} onChange={(e)=>upd({ opacity: Number(e.target.value) })} />
              <span className={styles['style-value']}>{Math.round(100*(b.opacity ?? 1))}%</span>
            </div>
          </div>
        </div>
      );
    })()}
  </div>
)}
            </>
          )}
 
          {leftTab === "layers" && (
            <>
              <div className={styles['layers-wrapper']}>

                <div className={styles['element-title']}>
                  <p></p>
                </div>
                {activePage?.blocks.map(block => (
                  <div
                    key={block.id}
                    className={`${styles.leftBarElement} ${selectedIds.includes(block.id) ? styles.selectedElement : ""}`}
                    onClick={() => setSelectedIds([block.id])}
                    draggable
                    onDragStart={() => setDragLayerId(block.id)}
                    onDragOver={(e)=>e.preventDefault()}
                    onDrop={(e)=> {
                      e.preventDefault();
                      if (!dragLayerId || dragLayerId===block.id) return;
                      setPages(prev => prev.map((p, idx)=>{
                        if (idx !== activePageIndex) return p;
                        const arr = [...p.blocks];
                        const from = arr.findIndex(b => b.id===dragLayerId);
                        const to = arr.findIndex(b => b.id===block.id);
                        if (from<0 || to<0) return p;
                        const [it] = arr.splice(from,1);
                        arr.splice(to,0,it);
                        return { ...p, blocks: arr };
                      }));
                      setDragLayerId(null);
                    }}
                  >
                    <span>{block.type} · {block.id.slice(0,6)}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {leftTab === "assets" && (
            <>
              <div className={styles.toolboxTitle}>Templates</div>
              <button className="toolItem" onClick={() => { pushHistory(); setPages(prev => prev.map((p, idx)=> idx===activePageIndex ? { ...p, blocks: TEMPLATES.professionalLetterhead() } : p)); }}>Letterhead</button>
              <button className="toolItem" onClick={() => { pushHistory(); setPages(prev => prev.map((p, idx)=> idx===activePageIndex ? { ...p, blocks: TEMPLATES.msa(variables) } : p)); }}>MSA</button>
              <div className={styles.toolboxTitle}>Insert</div>
              <button className="toolItem" onClick={onPickImage}>Image</button>
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display:"none" }} onChange={onFileChange}/>
            </>
          )}

          {leftTab === "variables" && (
            <>
              <div className={styles.toolboxTitle}>Variables</div>
              {VARIABLES_SCHEMA.map(f=>(
                <div key={f.key} className="varRow">
                  <label>{f.label}</label>
                  <input className="input" type={f.type==="number"?"number": f.type==="date"?"date":"text"} value={variables[f.key] ?? f.default ?? ""} onChange={(e)=> setVariables(v => ({ ...v, [f.key]: e.target.value }))} />
                </div>
              ))}
            </>
          )}

          {leftTab === "history" && (
            <>
              <div className={styles.toolboxTitle}>History</div>
              <button className="toolItem" onClick={()=>{
                if (!history.length) return;
                const prev = history[history.length - 1];
                setFuture(f => [snapshot(), ...f].slice(0,100));
                const s = JSON.parse(prev);
                setPages(s.pages); setPan(s.pan); setSelectedIds(s.selectedIds); setVariables(s.variables);
                setHistory(h => h.slice(0,-1));
              }}>Undo</button>
              <button className="toolItem" onClick={()=>{
                if (!future.length) return;
                const nxt = future[0];
                setHistory(h => [...h, snapshot()].slice(-100));
                const s = JSON.parse(nxt);
                setPages(s.pages); setPan(s.pan); setSelectedIds(s.selectedIds); setVariables(s.variables);
                setFuture(f => f.slice(1));
              }}>Redo</button>
            </>
          )}
        </aside>

        <main
          className={styles["center-zone"]}
          ref={editorRef}
          onPointerDown={(e) => {
            if (e.target === editorRef.current) {
              setSelectedIds([]);
              if (editingId) {
                const ed = editorNodeMapRef.current.get(editingId);
                ed?.setAttribute("contenteditable","false");
              }
              setEditingId(null);
            }
          }}
        >
          {/* Sticky top toolbar */}
          <div className={styles['center-tools']}>
            {/* <div className={styles['center-tool-i']}>
              <button className="btn" onClick={() => setTool(TOOLS.SELECT)}>Select</button>
              <button className="btn" onClick={() => setTool(TOOLS.HEADING)}>H1</button>
              <button className="btn" onClick={() => setTool(TOOLS.PARAGRAPH)}>Text</button>
              <button className="btn" onClick={() => setTool(TOOLS.RECT)}>Rect</button>
              <button className="btn" onClick={() => setTool(TOOLS.CIRCLE)}>Circle</button>
              <button className="btn" onClick={() => setTool(TOOLS.LINE)}>Line</button>
              <button className="btn" onClick={() => setTool(TOOLS.PAN)}>Pan</button>
              <span className={styles['center-tool-span']} />
              <button className="btn" onMouseDown={(e)=>e.preventDefault()} onClick={() => execInlineSafe("bold")}>B</button>
              <button className="btn" onMouseDown={(e)=>e.preventDefault()} onClick={() => execInlineSafe("italic")}>I</button>
              <button className="btn" onMouseDown={(e)=>e.preventDefault()} onClick={() => execInlineSafe("underline")}>U</button>
              <button className="btn" onMouseDown={(e)=>e.preventDefault()} onClick={() => execInlineSafe("insertUnorderedList")}>•</button>
              <button className="btn" onMouseDown={(e)=>e.preventDefault()} onClick={() => execInlineSafe("insertOrderedList")}>1.</button>
              <button className="btn" onMouseDown={(e)=>e.preventDefault()} onClick={() => execInlineSafe("justifyLeft")}>L</button>
              <button className="btn" onMouseDown={(e)=>e.preventDefault()} onClick={() => execInlineSafe("justifyCenter")}>C</button>
              <button className="btn" onMouseDown={(e)=>e.preventDefault()} onClick={() => execInlineSafe("justifyRight")}>R</button>
              <span className={styles['center-tool-span']} />
              <button className="btn" onClick={()=>setPaletteOpen(true)}>Cmd/Ctrl+K</button>
              <button className="btn" onClick={onPickImage}>Image</button>
              <button className="btn" onClick={exportPdf}>PDF</button>
            </div> */}
          </div>


          {/* Rulers */}
          {/* {showRulers && (
            <div style={{ position:"absolute", top: rulerTop, left:0, zIndex:170 }}>
              <div style={{ height:20, background:"rgba(255,255,255,0.05)", borderBottom:"1px solid var(--border-soft)", display:"flex", overflow:"hidden" }}>
                {Array.from({length: Math.ceil((activePage?.width || 850)/50) + 1}).map((_,i)=>(
                  <div key={i} style={{ width:50, fontSize:10, color:"var(--muted)", textAlign:"center" }}>{i*50}</div>
                ))}
              </div>
            </div>
          )} */}

          {/* Floating native selection bar */}
          {floatingBar && selectedIds.length === 1 && (
            <div className={styles.floatingBar} style={{ left: floatingBar.x, top: floatingBar.y }} onMouseDown={(e) => e.preventDefault()}>
              <button onMouseDown={(e)=>e.preventDefault()} onClick={() => execInlineSafe("bold")}>B</button>
              <button onMouseDown={(e)=>e.preventDefault()} onClick={() => execInlineSafe("italic")}>I</button>
              <button onMouseDown={(e)=>e.preventDefault()} onClick={() => execInlineSafe("underline")}>U</button>
              <button onMouseDown={(e)=>e.preventDefault()} onClick={() => execInlineSafe("insertUnorderedList")}>•</button>
              <button onMouseDown={(e)=>e.preventDefault()} onClick={() => execInlineSafe("insertOrderedList")}>1.</button>
              <button onMouseDown={(e)=>e.preventDefault()} onClick={() => execInlineSafe("justifyLeft")}>⟸</button>
              <button onMouseDown={(e)=>e.preventDefault()} onClick={() => execInlineSafe("justifyCenter")}>⇔</button>
              <button onMouseDown={(e)=>e.preventDefault()} onClick={() => execInlineSafe("justifyRight")}>⟹</button>
            </div>
          )}

          {/* Command palette */}
          {paletteOpen && (
            <div style={{ position:"fixed", inset:0, zIndex:9998 }} onClick={()=>setPaletteOpen(false)}>
              <div style={{ position:"absolute", left:"50%", top:"20%", transform:"translateX(-50%)", width:560, background:"var(--panel-2)", border:"1px solid var(--border)", borderRadius:10, boxShadow:"var(--shadow)" }} onClick={(e)=>e.stopPropagation()}>
                <input
                  autoFocus
                  value={paletteQuery}
                  onChange={(e)=>setPaletteQuery(e.target.value)}
                  placeholder="Type a command… (bold, italic, list, align, pdf, image)"
                  style={{ width:"100%", padding:12, border:"none", outline:"none", background:"transparent", color:"var(--text)", fontSize:14 }}
                />
                <div style={{ maxHeight:300, overflow:"auto" }}>
                  {paletteCmds.filter(c=> c.label.toLowerCase().includes(paletteQuery.toLowerCase())).map(c=>(
                    <div key={c.key} style={{ padding:"10px 12px", borderTop:"1px solid var(--border)", cursor:"pointer" }} onClick={()=>{ c.run(); setPaletteOpen(false); }}>
                      {c.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Alignment snap lines (red) */}
          {snapLines.map((g,i)=> g.x!=null ? (
            <div key={`sx_${i}`} style={{ position:"absolute", left:g.x + pan.x, top:0, width:1, height:"100%", background:"rgba(255,70,70,0.95)", pointerEvents:"none" }} />
          ) : (
            <div key={`sy_${i}`} style={{ position:"absolute", top:g.y + pan.y, left:0, height:1, width:"100%", background:"rgba(255,70,70,0.95)", pointerEvents:"none" }} />
          ))}

          {/* Workspace scrollable with pages */}
          <div className={styles['workspace']} style={{ overflow: "auto" }}>


<div className={styles['floating-wrapper']}>
  <button
    className={`${styles['floating-wrapper-i']} ${tool === TOOLS.SELECT ? styles['selected'] : ""}`}
    onClick={() => setTool(TOOLS.SELECT)}
    title="Select"
    tabIndex={0}
  >
    <img src={select} alt="Select" />
  </button>
  <button
    className={`${styles['floating-wrapper-i']} ${tool === TOOLS.HEADING ? styles['selected'] : ""}`}
    onClick={() => setTool(TOOLS.HEADING)}
    title="Heading"
    tabIndex={0}
  >
    <img src={heading} alt="Heading" />
  </button>
  <button
    className={`${styles['floating-wrapper-i']} ${tool === TOOLS.PARAGRAPH ? styles['selected'] : ""}`}
    onClick={() => setTool(TOOLS.PARAGRAPH)}
    title="Text"
    tabIndex={0}
  >
    <img src={text} alt="Text" />
  </button>
  <button
    className={`${styles['floating-wrapper-i']} ${tool === TOOLS.RECT ? styles['selected'] : ""}`}
    onClick={() => setTool(TOOLS.RECT)}
    title="Shape"
    tabIndex={0}
  >
    <img src={shape} alt="Shape" />
  </button>
  <button
    className={`${styles['floating-wrapper-i']} ${tool === TOOLS.SIGNATURE ? styles['selected'] : ""}`}
    onClick={() => setTool(TOOLS.SIGNATURE)}
    title="Signature"
    tabIndex={0}
  >
    <img src={signature} alt="Signature" />
  </button>
</div>







            

            <div className={styles['pdf-wrapper']}>








              {pagesWithVars.map((pg, pgIdx)=> (
                <div
                  key={pg.id + "_" + pgIdx}
                  ref={pgIdx===activePageIndex ? pageRef : null}
                  className={styles["page-outer"]}
                  style={{
                    width: pg.width, height: pg.height, backgroundColor: pg.backgroundColor,
                    backgroundImage: showGrid ? `linear-gradient(to right, rgba(11,22,40,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(11,22,40,0.06) 1px, transparent 1px)` : undefined,
                    backgroundSize: showGrid ? `${GRID_SIZE}px ${GRID_SIZE}px` : undefined,
                    borderRadius: pg.borderRadius, border: `${pg.borderWidth}px solid ${pg.borderColor}`,
                    transform: pgIdx===activePageIndex ? `translate(${pan.x}px, ${pan.y}px)` : "none",
                    position: "relative", marginBottom: 24,
                  }}
                  onPointerDown={(e) => {
                    if (e.button !== 0 || pgIdx!==activePageIndex) return;
                    if (editingId) return;

                    const rect = pageRef.current.getBoundingClientRect();
                    const px = e.clientX - rect.left - pan.x;
                    const py = e.clientY - rect.top - pan.y;

                    // Add guide with Shift
                    if (e.shiftKey && tool !== TOOLS.PAN) { setGuides(prev=>[...prev,{ x: px }]); return; }

                    if (tool === TOOLS.SELECT) {
                      const blocks = [...pg.blocks].slice().reverse();
                      const hit = blocks.find(b => px>=b.x && px<=b.x+b.width && py>=b.y && py<=b.y+b.height);
                      if (!hit) { setSelectedIds([]); setMarquee({ active: true, startX: px, startY: py, x: px, y: py, w: 0, h: 0 }); }
                    }

                    if (tool === TOOLS.PAN) { setIsPanning(true); setMouseDownPoint({ x: e.clientX, y: e.clientY }); }

                    if ([TOOLS.RECT, TOOLS.CIRCLE, TOOLS.LINE, TOOLS.HEADING, TOOLS.PARAGRAPH].includes(tool)) {
                      pushHistory();
                      const tempId = uid("b_");
                      const newBlock = {
                        id: tempId,
                        type: tool===TOOLS.HEADING?"text":tool===TOOLS.PARAGRAPH?"paragraph":tool,
                        content: tool===TOOLS.HEADING?"Heading":tool===TOOLS.PARAGRAPH?"Paragraph text. Click to edit.":"",
                        x: roundGrid(px), y: roundGrid(py),
                        width: tool===TOOLS.PARAGRAPH?240:100,
                        height: tool===TOOLS.PARAGRAPH?Math.max(60, 24):50,
                        fontSize: tool===TOOLS.HEADING?24:16,
                        color:"#222",
                        backgroundColor: tool===TOOLS.RECT?"#e6f0ff":"transparent",
                        padding:8, borderRadius: tool===TOOLS.CIRCLE?9999:6,
                        editable: tool===TOOLS.HEADING||tool===TOOLS.PARAGRAPH,
                        alignContent:"left", opacity:1
                      };
                      setPages(prev => prev.map((p, idx)=> idx===pgIdx ? { ...p, blocks: [...p.blocks, newBlock] } : p));
                      setSelectedIds([tempId]);
                      setDrawing({ type: tool, startX: newBlock.x, startY: newBlock.y, tempId });
                    }
                  }}
                >
                  <div className={styles["page"]}>
                    {pg.blocks.map((b) =>
                      renderBlock({
                        block: b,
                        isSelected: selectedIds.includes(b.id),
                        pan,
                        editingId,
                        onBlockPointerDown,
                        onBlockClick,
                        onHandlePointerDown,
                        onInput: (e) => handleTextInput(e, b),
                        onPaste,
                        stopEditing: () => {
                          const ed = editorNodeMapRef.current.get(b.id);
                          ed?.setAttribute("contenteditable", "false");
                          setEditingId(null);
                        },
                        registerEditor: (el) => {
                          if (el) editorNodeMapRef.current.set(b.id, el);
                          else editorNodeMapRef.current.delete(b.id);
                        },
                      })
                    )}
                  </div>

                  {marquee?.active && pgIdx===activePageIndex && (
                    <div className={styles.marquee} style={{ left: marquee.x + pan.x, top: marquee.y + pan.y, width: marquee.w, height: marquee.h }} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Figma-like floating quick menu */}
          <FigmaMenu />
        </main>

        <aside className={styles['right-tab']} />
      </div>
    </section>
  );
}
