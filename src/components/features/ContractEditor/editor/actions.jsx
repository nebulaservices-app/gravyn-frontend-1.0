import { DRAG_THRESHOLD, TOOLS } from "./constants";

export const updateBlock = (setPages) => (pageIndex, blockId, patch) => {
  setPages((prev) =>
    prev.map((p, idx) =>
      idx === pageIndex ? { ...p, blocks: p.blocks.map((b) => (b.id === blockId ? { ...b, ...patch } : b)) } : p
    )
  );
};

export const addBlock = (setPages) => (pageIndex, block) => {
  setPages((prev) => prev.map((p, idx) => (idx === pageIndex ? { ...p, blocks: [...p.blocks, block] } : p)));
};

export const startDragging = (setDragging) => (blockId, pageIndex, e, block) => {
  setDragging({
    blockId, pageIndex,
    startX: e.clientX, startY: e.clientY,
    startXOrigin: e.clientX, startYOrigin: e.clientY,
    origX: block.x, origY: block.y,
    started: false,
  });
};

export const continueDragging = (dragging, update) => (e) => {
  if (!dragging) return;
  const dist = Math.hypot(e.clientX - dragging.startXOrigin, e.clientY - dragging.startYOrigin);
  if (!dragging.started && dist < DRAG_THRESHOLD) return;
  const dx = e.clientX - dragging.startX;
  const dy = e.clientY - dragging.startY;
  update(dragging.pageIndex, dragging.blockId, { x: dragging.origX + dx, y: dragging.origY + dy });
  return true; // moved
};

export const endDragging = (setDragging) => () => setDragging(null);

export const onPagePointerDownFactory = ({
  tool, setSelectedIds, setMarquee, setIsPanning, setMouseDownPoint,
  addBlock, activePageIndex, pan, uidFn
}) => (e, pageRef) => {
  const rect = pageRef.current.getBoundingClientRect();
  const px = e.clientX - rect.left - pan.x;
  const py = e.clientY - rect.top - pan.y;

  if ([TOOLS.RECT, TOOLS.CIRCLE, TOOLS.LINE, TOOLS.HEADING, TOOLS.PARAGRAPH].includes(tool)) {
    const tempId = uidFn("b_");
    const base = {
      id: tempId, x: px, y: py, width: 100, height: 50,
      color: "#222", padding: 8, borderRadius: 6, opacity: 1, alignContent: "left", backgroundColor: "transparent",
    };
    let block = null;
    if (tool === TOOLS.HEADING) block = { ...base, type: "text", content: "Heading", fontSize: 24, editable: true };
    else if (tool === TOOLS.PARAGRAPH) block = { ...base, type: "paragraph", content: "Paragraph text. Click to edit.", fontSize: 16, editable: true, width: 240, height: 120 };
    else if (tool === TOOLS.RECT) block = { ...base, type: "rectangle", backgroundColor: "#e6f0ff" };
    else if (tool === TOOLS.CIRCLE) block = { ...base, type: "circle", borderRadius: 9999, width: 100, height: 100, backgroundColor: "#e6f0ff" };
    else if (tool === TOOLS.LINE) block = { ...base, type: "line", height: 2, width: 160, backgroundColor: "#333" };
    addBlock(activePageIndex, block);
    setSelectedIds([tempId]);
    setMarquee(null);
    return;
  }

  if (tool === TOOLS.SELECT) {
    setSelectedIds([]);
    setMarquee({ active: true, startX: px, startY: py, x: px, y: py, w: 0, h: 0 });
  }

  if (tool === TOOLS.PAN) {
    setIsPanning(true);
    setMouseDownPoint({ x: e.clientX, y: e.clientY });
  }
};
