// Simple vertical overflow paginator: if a block bottom exceeds page height - footer, push to next page with same x/y relative to new page
export const paginate = (pages) => {
  const out = [];
  for (const page of pages) {
    const usableHeight = page.height - (page.margin?.top || 0) - (page.margin?.bottom || 0) - (page.footer?.enabled ? (page.footer.height||0) : 0);
    let currentPage = { ...page, blocks: [] };
    let cursorY = 0;
    for (const b of page.blocks) {
      const bottom = b.y + b.height;
      const contentTop = page.margin?.top || 0;
      const contentBottom = contentTop + usableHeight;
      if (bottom <= contentBottom) {
        currentPage.blocks.push(b);
      } else {
        out.push(currentPage);
        const newPage = { ...page, id: page.id + "_cont_" + (out.length+1), name: page.name };
        currentPage = { ...newPage, blocks: [{ ...b, y: (page.margin?.top || 0) + 12 }] };
      }
      cursorY = bottom;
    }
    out.push(currentPage);
  }
  return out;
};
