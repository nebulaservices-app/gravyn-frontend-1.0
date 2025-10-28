// editor/renderers.js
import styles from "../ContractEditorMain.module.css";

export const Handles = ({ block, onHandlePointerDown }) => {
  const hs = ["nw", "n", "ne", "e", "se", "s", "sw", "w"];
  return (
    <div className={styles.handlesWrapper}>
      {hs.map((h) => (
        <div key={h} className={`${styles.handle} ${styles["handle-" + h]}`} onPointerDown={(ev) => onHandlePointerDown(ev, block, h)} />
      ))}
    </div>
  );
};

export const renderBlock = ({
  block, isSelected, pan, editingId,
  onBlockPointerDown, onBlockClick, onHandlePointerDown,
  onInput, stopEditing, registerEditor,
}) => {
  const left = block.x + pan.x;
  const top = block.y + pan.y;
  const base = {
    position: "absolute",
    left, top,
    width: block.width, height: block.height,
    fontSize: block.fontSize || 13,
    color: block.color || "",
    background: block.backgroundColor || "transparent",
    padding: 0 || 0,
    borderRadius: 0,
    opacity: block.opacity ?? 1,
    boxSizing: "border-box",
    overflow: "visible",
    userSelect: "none",
  };

  if (block.type === "image") {
    return (
      <div
        key={block.id}
        className={`${styles.block} ${isSelected ? styles.selected : ""}`}
        style={{ ...base, padding: 0, cursor: editingId ? "text" : "move" }}
        onPointerDown={(e) => onBlockPointerDown(e, block)}
        onClick={(e) => onBlockClick(e, block)}
        data-block-id={block.id}
      >
        <img src={block.src} alt="" style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: base.borderRadius }} />
        {isSelected && <Handles block={block} onHandlePointerDown={onHandlePointerDown} />}
      </div>
    );
  }

  if (["rectangle", "circle", "line"].includes(block.type)) {
    const style = { ...base, border: "1px solid rgba(0,0,0,0.08)", cursor: editingId ? "text" : "move" };
    if (block.type === "circle") style.borderRadius = "50%";
    if (block.type === "line") { style.height = Math.max(2, block.height); style.background = block.backgroundColor || "#333"; }
    return (
      <div
        key={block.id}
        className={`${styles.block} ${isSelected ? styles.selected : ""}`}
        style={style}
        onPointerDown={(e) => onBlockPointerDown(e, block)}
        onClick={(e) => onBlockClick(e, block)}
        data-block-id={block.id}
      >
        {isSelected && <Handles block={block} onHandlePointerDown={onHandlePointerDown} />}
      </div>
    );
  }

  // text / paragraph
  return (
    <div
      key={block.id}
      className={`${styles.block} ${isSelected ? styles.selected : ""}`}
      style={{ ...base, cursor: editingId === block.id ? "text" : "move", whiteSpace: "pre-wrap", wordBreak: "break-word" }}
      onPointerDown={(e) => onBlockPointerDown(e, block)}
      onClick={(e) => onBlockClick(e, block)}
      data-block-id={block.id}
    >
      <div
        className={styles.textEditor}
        ref={registerEditor}
        contentEditable={editingId === block.id}
        suppressContentEditableWarning
        spellCheck={false}
        onInput={onInput}
        onBlur={stopEditing}
        dangerouslySetInnerHTML={{ __html: block.content }}
      />
      {isSelected && <Handles block={block} onHandlePointerDown={onHandlePointerDown} />}
    </div>
  );
};
