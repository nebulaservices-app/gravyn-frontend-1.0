import { useEffect, useRef, useState } from "react";
import { initialPages } from "../ui/templates";
import { DRAG_THRESHOLD, TOOLS } from "./constants";
import { addBlock as addBlockFactory, updateBlock as updateBlockFactory } from "./actions";

export const useEditorState = () => {
  const [pages, setPages] = useState(initialPages);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [tool, setTool] = useState(TOOLS.SELECT);
  const [selectedIds, setSelectedIds] = useState([]);
  const [drawing, setDrawing] = useState(null);
  const [dragging, setDragging] = useState(null);
  const [resizing, setResizing] = useState(null);
  const [isPanning, setIsPanning] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [marquee, setMarquee] = useState(null);
  const [floatingBar, setFloatingBar] = useState(null);
  const [mouseDownPoint, setMouseDownPoint] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const pageRef = useRef(null);
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const clickTimer = useRef(null);

  const activePage = pages[activePageIndex];

  const updateBlock = updateBlockFactory(setPages);
  const addBlock = addBlockFactory(setPages);

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
  }, []);

  return {
    // state
    pages, setPages, activePageIndex, setActivePageIndex, tool, setTool, selectedIds, setSelectedIds,
    drawing, setDrawing, dragging, setDragging, resizing, setResizing, isPanning, setIsPanning,
    pan, setPan, marquee, setMarquee, floatingBar, setFloatingBar, mouseDownPoint, setMouseDownPoint,
    editingId, setEditingId,
    // refs
    pageRef, editorRef, fileInputRef, clickTimer,
    // derived
    activePage,
    // actions
    updateBlock, addBlock,
  };
};
