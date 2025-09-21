// pathUtils.js

// Calculate anchors for tasks
export function computeTaskAnchor(task, getStartIdx, getEndIdx, colWidth, rowTop, cssOffset = 20, frac = 0) {
  const startIndex = getStartIdx(task);
  const endIndex = getEndIdx(task);
  if(startIndex === -1 || endIndex === -1) return null;

  const x = startIndex* colWidth + frac * colWidth + 10;
  const width = Math.max((endIndex - startIndex + 1)*colWidth - 20, colWidth - 20);

  const y = rowTop + task.row*64 + cssOffset + 10;
  const height = 44;

  return {
    left: x,
    right: x + width,
    midY: y + height /2,
    width,
    height
  }
}

// Draw manhattan curved (rounded) path
export function roundedManhattan(points, radius = 5) {
  if(points.length < 2) return "";

  let d = `M${points[0].x} ${points[0].y}`

  for(let i = 1; i < points.length; i++) {
    const prev = points[i-1];
    const curr = points[i];
    if(i < points.length-1) {
      const next = points[i+1];
      const dx1 = curr.x - prev.x;
      const dy1 = curr.y - prev.y;
      const dx2 = next.x - curr.x;
      const dy2 = next.y - curr.y;

      if((dx1 === 0 && dx2 === 0) || (dy1 === 0 && dy2 === 0)) {
        d += ` L${curr.x} ${curr.y}`;
      } else {
        const r = Math.min(radius, (Math.abs(dx1) + Math.abs(dy1))/2, (Math.abs(dx2) + Math.abs(dy2))/2);

        const pt1 = {x: curr.x - Math.sign(dx1)*r, y: curr.y - Math.sign(dy1)*r};
        const pt2 = {x: curr.x + Math.sign(dx2)*r, y: curr.y + Math.sign(dy2)*r};

        d += ` L${pt1.x} ${pt1.y}`;
        const sweep = (Math.sign(dx1) === Math.sign(dy2)) ? 1 : 0;
        d += ` A${r} ${r} 0 0 ${sweep} ${pt2.x} ${pt2.y}`;
      }
    } else {
      d += ` L${curr.x} ${curr.y}`;
    }
  }
  return d;
}

// Route manhattan path between two points with elbows for dependencies
export function routeDependencyPath(from, to, margin = 30, radius = 7) {
  const pts = [{x: from.x, y: from.y}];
  const stubX = from.x + margin;
  const preX = to.x - margin;

  if(stubX <= preX) {
    pts.push({x: preX, y: from.y});
    pts.push({x: preX, y: to.y});
  } else {
    const midY = (from.y + to.y)/2;
    pts.push({x: stubX, y: from.y});
    pts.push({x: stubX, y: midY});
    pts.push({x: preX, y: midY});
    pts.push({x: preX, y: to.y});
  }
  pts.push({x: to.x, y: to.y});

  return roundedManhattan(pts, radius);
}
