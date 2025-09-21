// taskPacking.js
export function assignTasksToRows(tasks, getStartIdx, getEndIdx) {
  const intervals = tasks.map(t => ({
    id: t.id,
    start: getStartIdx(t),
    end: getEndIdx(t),
    origRow: typeof t.row === "number" ? t.row : undefined,
  }));

  intervals.sort((a,b) => (a.start - b.start) || (a.end - b.end));

  const rows = [];
  const assignments = {};

  intervals.forEach(interval => {
    if(interval.start === -1 || interval.end === -1) {
      assignments[interval.id] = 0;
      return;
    }

    let placed = false;
    const totalRows = rows.length;
    const order = [];

    if(typeof interval.origRow === 'number' && interval.origRow >= 0 && interval.origRow < totalRows) order.push(interval.origRow);
    for(let r = 0; r < totalRows; r++) if(!order.includes(r)) order.push(r);

    for(let rIndex of order) {
      const row = rows[rIndex] || [];
      const overlap = row.some(seg => !(interval.end < seg.start || interval.start > seg.end));

      if(!overlap) {
        row.push({start: interval.start, end: interval.end, id: interval.id});
        rows[rIndex] = row;
        assignments[interval.id] = rIndex;
        placed = true;
        break;
      }
    }

    if(!placed) {
      rows.push([{start: interval.start, end: interval.end, id: interval.id}]);
      assignments[interval.id] = rows.length - 1;
    }
  });

  return tasks.map(task => ({...task, row: assignments[task.id]}));
}
