export const DRAG_THRESHOLD = 4;

export const TOOLS = {
  SELECT: "select",
  HEADING: "heading",
  PARAGRAPH: "paragraph",
  RECT: "rectangle",
  CIRCLE: "circle",
  LINE: "line",
  IMAGE: "image",
  SIGNATURE: "signature",
  PAN: "pan",
};

export const PAGE_SIZES = {
  A4: { w: 595.28, h: 841.89 },   // pt
  LETTER: { w: 612, h: 792 },
};

export const DEFAULT_PAGE = {
  width: 850,
  height: 1500,
  margin: { top: 80, right: 80, bottom: 100, left: 80 },
  header: { enabled: true, height: 70 },
  footer: { enabled: true, height: 70 },
  backgroundColor: "#fff",
  borderRadius: 10,
  borderColor: "#e3e7ff",
  borderWidth: 1,
};
