// useTimelineData.js
import { useMemo } from "react";

const MS_IN_DAY = 24*60*60*1000;

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatDayLabel(date) {
  const dayNum = date.getDate();
  const dayLetter = date.toLocaleDateString("en-US", { weekday: "short" }).charAt(0);
  return `${dayNum}${dayLetter}`;
}

export function useTimelineData(projectStart, projectEnd) {
  const timelineStart = useMemo(() => addDays(projectStart, -7), [projectStart]);
  const { groups, days } = useMemo(() => {
    const count = Math.ceil((projectEnd - timelineStart)/MS_IN_DAY)+1;
    const daysArr = [];
    for(let i=0; i<count; i++) {
      daysArr.push(addDays(timelineStart, i));
    }

    const groups = [];
    let currentLabel = "";
    let currentGroup = null;

    daysArr.forEach(date => {
      const label = date.toLocaleDateString("en-US", {month: "long", year:"numeric"});
      if(label !== currentLabel) {
        if(currentGroup) groups.push(currentGroup);
        currentLabel = label;
        currentGroup = {label, days: []};
      }
      currentGroup.days.push({date, shortLabel: formatDayLabel(date)});
    });

    if(currentGroup) groups.push(currentGroup);

    return {groups, days: daysArr};
  }, [projectEnd, timelineStart]);

  return {timelineStart, groups, days};
}
