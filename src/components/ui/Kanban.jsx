// import React, {useEffect, useMemo, useState} from "react";
// import styles from "./Kanban.module.css";
// import dot from "../../images/icons/dotmenu.svg";
// import add from "../../images/icons/add.svg";
// import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
// import emptybox from "../../images/icons/emptybox.svg"
// import {Towers} from "../../views/Dashboard/Dashboard";
//
// import attachment from "../../images/icons/attachment.svg"
// import comment from "../../images/icons/comment.svg"
// import {getUserNameAndImageById} from "../../service/User/UserFetcher";
// import gitlab from "../../images/int_icon/github.svg"
// import bug from "../../images/icons/bug_i.svg"
// import improvement from "../../images/icons/wrench_i.svg"
// import performance from "../../images/icons/rocket_i.svg"
// import warning from "../../images/icons/warning_i.svg"
// import link from "../../images/icons/attachment.svg"
// import info from "../../images/icons/bulb_i.svg"
// import security from "../../images/icons/lock_i.svg"
// import design from "../../images/icons/design_i.svg"
// import {getProjectById} from "../../service/Project/ProjectFetcher";
// import {fetchTaskById} from "../../service/Tasks/taskService";
//
// import low from "../../images/icons/issues_severity/low.svg"
// import medium from "../../images/icons/issues_severity/medium.svg"
// import critical from "../../images/icons/issues_severity/critical.svg"
// import severe from "../../images/icons/issues_severity/severe.svg"
// import {formatFullDate, formatToShortDate} from "../../utils/datetime";
// import clock from "../../images/icons/clock.svg"
// export const highlightText = (text, query) => {
//     if (!query || !text) return text;
//     const regex = new RegExp(`(${query})`, "gi");
//     const parts = text.split(regex);
//     return parts.map((part, i) =>
//         part.toLowerCase() === query.toLowerCase() ? (
//             <mark key={i} className={styles.highlight}>{part}</mark>
//         ) : part
//     );
// };
// const columnOrderMap = {
//     status: [
//         "pending",
//         "triaged",
//         "confirmed",
//         "planned",
//         "in_progress",
//         "resolved",
//         "closed"
//     ],
//     severity: ["severe", "critical", "medium", "low"],
//     source: ["github", "gitlab", "manual"]
// };
//
// const severityIconMap = {
//     low,
//     medium,
//     critical,
//     severe
// };
//
//
//
// const Kanban = ({
//                     data = [],
//                     groupBy = "status",
//                     titleKey = "title",
//                     descriptionKey = "description",
//                     statusLabels = {},
//                     searchQuery = "",
//                     onCardClick = () => {},
//                     onAddClick = () => {},
//                     onCardMove = () => {},
//                     entity
//                 }) => {
//
//     const columnOrder = columnOrderMap[groupBy] || [];
//
//     console.log("Project search query " , searchQuery)
//
//     const [userMap, setUserMap] = useState({}); // { userId: { name, picture } }
//
//     useEffect(() => {
//         const fetchUserData = async () => {
//             const allUserIds = new Set();
//
//             // Extract unique user IDs from the Kanban data
//             data.forEach((issue) => {
//                 const { assignedTo, createdBy, comments, logs } = issue;
//
//                 // Assigned users
//                 assignedTo?.users?.forEach((id) => allUserIds.add(id));
//
//                 // Created by
//                 if (createdBy?.id) allUserIds.add(createdBy.id);
//
//                 // Comment authors
//                 comments?.forEach((comment) => comment?.author && allUserIds.add(comment.author));
//
//                 // Log authors
//                 logs?.forEach((log) => log?.by && allUserIds.add(log.by));
//             });
//
//             // Remove already fetched users
//             const newIdsToFetch = [...allUserIds].filter((id) => !userMap[id]);
//
//             // Fetch user data one-by-one (or in parallel)
//             const promises = newIdsToFetch.map(async (userId) => {
//                 try {
//                     const user = await getUserNameAndImageById(userId);
//                     return { userId, user };
//                 } catch (e) {
//                     return null; // skip on failure
//                 }
//             });
//
//             const results = await Promise.all(promises);
//             const userMapUpdates = {};
//             results.forEach((res) => {
//                 if (res) {
//                     userMapUpdates[res.userId] = res.user;
//                 }
//             });
//
//             setUserMap((prev) => ({ ...prev, ...userMapUpdates }));
//         };
//
//         if (data.length > 0) {
//             fetchUserData();
//         }
//     }, [data]);
//
//     const typeMap = {
//         bug: bug,
//         improvement: improvement,
//         performance: performance,
//         warning: warning,
//         info: info,
//         security: security,
//         design: design,
//     };
//
//     const groupedData = useMemo(() => {
//         const result = {};
//         columnOrder.forEach((status) => {
//             result[status] = data.filter((item) => {
//                 const itemValue = item[groupBy]?.toLowerCase().trim();
//                 const matchesStatus = itemValue === status;
//                 if (!matchesStatus) return false;
//
//                 if (!searchQuery) return true;
//
//                 const titleMatch = item[titleKey]?.toLowerCase().includes(searchQuery.toLowerCase());
//                 const descMatch = item[descriptionKey]?.toLowerCase().includes(searchQuery.toLowerCase());
//
//                 return titleMatch || descMatch;
//             });
//         });
//         return result;
//     }, [data, columnOrder, groupBy, titleKey, descriptionKey, searchQuery]);
//
//
//
//     const [refMap, setRefMap] = useState({});
//
//     useEffect(() => {
//         const fetchRefs = async () => {
//             const newMap = {};
//
//             const refsToFetch = data
//                 .map((item) => item.ref)
//                 .filter((ref) => ref?.id && ref?.type && !refMap[ref.id]); // skip already fetched
//
//             const fetchPromises = refsToFetch.map(async (ref) => {
//                 try {
//                     if (ref.type === "task") {
//                         const task = await fetchTaskById(ref.id);
//                         newMap[ref.id] = task.title;
//                     } else if (ref.type === "project") {
//                         const project = await getProjectById(ref.id);
//                         newMap[ref.id] = project.name;
//                     }
//                 } catch (e) {
//                     newMap[ref.id] = "Unknown Ref";
//                 }
//             });
//
//             await Promise.all(fetchPromises);
//             setRefMap((prev) => ({ ...prev, ...newMap }));
//         };
//
//         if (data.length > 0) {
//             fetchRefs();
//         }
//     }, [data]);
//
//     const onDragEnd = (result) => {
//         const { source, destination } = result;
//         if (!destination || (source.droppableId === destination.droppableId && source.index === destination.index)) {
//             return;
//         }
//
//         const sourceColumn = source.droppableId;
//         const destColumn = destination.droppableId;
//         const sourceItems = [...groupedData[sourceColumn]];
//         const [movedItem] = sourceItems.splice(source.index, 1);
//
//         movedItem[groupBy] = destColumn;
//         onCardMove(movedItem, sourceColumn, destColumn);
//     };
//     const issueMap = { low: 1, medium: 2, high: 3, critical: 4 , blocker : 5 };
//
//     const [floatingContext, setFloatingContext] = useState(null);
//     /*
//     {
//       id: item._id,
//       type: "task" | "issue",
//       anchor: { x, y },
//       side: "left" | "right",
//       value: "medium", // current severity or priority
//     }
//     */
//
//     return (
//         <DragDropContext onDragEnd={onDragEnd}>
//
//             <div className={styles["kanban-view-columns"]}>
//                 {columnOrder.map((status) => (
//                     <Droppable key={status} droppableId={status}>
//                         {(provided) => (
//                             <div
//                                 ref={provided.innerRef}
//                                 {...provided.droppableProps}
//                                 className={styles["kanban-column"]}
//                             >
//                                 <div className={styles["kanban-column-header"]}>
//                                     <div className={styles["kanban-column-header-i"]}>
//                                         <p className={styles["kanban-column-title"]}>
//                                             {statusLabels[status] || status}
//                                         </p>
//                                         <p className={styles["kanban-column-count"]}>
//                                             {groupedData[status]?.length || 0}
//                                         </p>
//                                     </div>
//                                     <div
//                                         className={styles["kanban-column-header-i"]}
//                                         onClick={() => onAddClick(status)}
//                                         title="Add new"
//                                         style={{ cursor: "pointer" }}
//                                     >
//                                         <img src={add} alt="Add" />
//                                     </div>
//                                 </div>
//
//                                 <div className={styles["kanban-column-tasks"]}>
//                                     <div className={styles["grey-zone"]}>
//                                         {groupedData[status]?.length > 0 ? (
//                                             groupedData[status].map((item, index) => (
//                                                 <Draggable
//                                                     key={item._id}
//                                                     draggableId={item._id}
//                                                     index={index}
//                                                     isDragDisabled={false}
//                                                 >
//                                                     {(provided) => (
//                                                         <div
//                                                             ref={provided.innerRef}
//                                                             {...provided.draggableProps}
//                                                             {...provided.dragHandleProps}
//                                                             className={styles["task-card"]}
//                                                             onClick={() => onCardClick(item)}
//                                                         >
//
//                                                             {floatingContext && (
//                                                                 <div
//                                                                     className={styles["floating-modal"]}
//                                                                     style={{
//                                                                         top: `${floatingContext.anchor.y}px`,
//                                                                         left: `${floatingContext.anchor.x}px`,
//                                                                         transform: `translate(${floatingContext.side === "left" ? "-100%" : "0"}, 0)`
//                                                                     }}
//                                                                     onClick={(e) => e.stopPropagation()}
//                                                                 >
//                                                                     {(floatingContext.type === "issue" ? ["severe", "critical", "medium", "low"] : ["high", "medium", "low"]).map((level) => (
//                                                                         <div
//                                                                             key={level}
//                                                                             className={`${styles["severity-option"]} ${floatingContext.value === level ? styles.active : ""}`}
//                                                                             onClick={() => {
//                                                                                 const updated = data.find(item => item._id === floatingContext.id);
//                                                                                 if (!updated) return;
//
//                                                                                 if (floatingContext.type === "issue") updated.severity = level;
//                                                                                 else updated.priority = level;
//
//                                                                                 onCardMove(updated, updated[groupBy], updated[groupBy]);
//                                                                                 setFloatingContext(null);
//                                                                             }}
//                                                                         >
//                                                                             <img src={severityIconMap[level] || ""} alt={level} />
//                                                                             <span>{level.charAt(0).toUpperCase() + level.slice(1)}</span>
//                                                                         </div>
//                                                                     ))}
//                                                                 </div>
//                                                             )}
//
//
//                                                             {/*<div className={styles["dot-img-wrapper"]}>*/}
//                                                             {/*    <img src={dot} alt="Options"/>*/}
//                                                             {/*</div>*/}
//
//
//                                                             {/*<div className={styles['task-options']}>*/}
//                                                             {/*    <div className={styles['task-pill']}>*/}
//                                                             {/*        <Towers signal={issueMap[item.severity]}/>*/}
//                                                             {/*        <p>{item.severity}</p>*/}
//                                                             {/*    </div>*/}
//                                                             {/*</div>*/}
//                                                             <div className={styles["task-details"]}>
//                                                                 <p className={styles["task-title"]}>
//                                                                     {highlightText(item[titleKey], searchQuery)}
//                                                                 </p>
//                                                                 <p className={styles["task-description"]}>
//                                                                     {highlightText(item[descriptionKey], searchQuery)}
//                                                                 </p>
//                                                             </div>
//
//                                                             <div className={styles['task-header']}>
//
//                                                                 {item.type !== null &&
//                                                                     <div className={styles['task-type-wrapper']}>
//                                                                         <img src={typeMap[item.type?.toLowerCase()]}/>
//                                                                     </div>
//                                                                 }
//
//                                                                 {/*<div>{item.ref.type}</div>*/}
//                                                                 {/*{item.ref?.id && (*/}
//                                                                 {/*    <p className={styles["ref-title"]}>*/}
//                                                                 {/*        <img src={link}/>*/}
//                                                                 {/*        {refMap[item.ref.id] || "Loading..."}*/}
//                                                                 {/*    </p>*/}
//                                                                 {/*)}*/}
//
//                                                                 {item.severity !== null && (
//                                                                     <div className={styles["task-severity-wrapper"]}>
//                                                                         <img
//                                                                             onClick={(e) => {
//                                                                                 e.stopPropagation();
//                                                                                 const rect = e.currentTarget.getBoundingClientRect();
//                                                                                 const screenWidth = window.innerWidth;
//                                                                                 const openLeft = rect.right + 180 > screenWidth;
//
//                                                                                 setFloatingContext({
//                                                                                     id: item._id,
//                                                                                     type: entity,
//                                                                                     anchor: {
//                                                                                         x: openLeft ? rect.left - 180 : rect.right,
//                                                                                         y: rect.top + window.scrollY,
//                                                                                     },
//                                                                                     side: openLeft ? "left" : "right",
//                                                                                     value: item.severity || item.priority,
//                                                                                 });
//                                                                             }}
//                                                                             src={severityIconMap[item.severity.toLowerCase()]}
//                                                                             alt={item.severity}
//                                                                             title={item.severity.charAt(0).toUpperCase() + item.severity.slice(1)}
//                                                                             className={styles["severity-icon"]}
//                                                                         />
//                                                                     </div>
//                                                                 )}
//
//                                                                 {item.dueDate && (
//                                                                     <div className={styles['task-duedate-wrapper']}>
//                                                                         {/*<img src={clock}/>*/}
//                                                                         <p>{formatToShortDate(item.dueDate)}</p>
//                                                                     </div>
//                                                                 )}
//
//                                                             </div>
//
//
//                                                             <div className={styles['task-footer']}>
//                                                                 <div className={styles['task-footer-capsule']}>
//                                                                     {item.assignedTo?.users?.length > 0 &&
//                                                                         item.assignedTo.users.map((userId) => {
//                                                                             const user = userMap[userId];
//                                                                             return (
//                                                                                 <img
//                                                                                     key={userId}
//                                                                                     src={
//                                                                                         user?.picture ||
//                                                                                         `https://ui-avatars.com/api/?name=${user?.name || "User"}&background=random&size=128`
//                                                                                     }
//                                                                                     alt={user?.name || "User"}
//                                                                                     title={user?.name || "Unknown User"}
//                                                                                     className={styles["user-avatar"]}
//                                                                                 />
//                                                                             );
//                                                                         })}
//                                                                 </div>
//                                                                 <div className={styles['task-footer-capsule']}>
//                                                                     <div className={styles['task-footer-pill']}>
//                                                                         <img src={attachment}/>
//                                                                         <p>{item.attachments?.length || 0}</p>
//                                                                     </div>
//                                                                     <div className={styles['task-footer-pill']}>
//                                                                         <img src={comment}/>
//                                                                         <p>{item.comments?.length || 0}</p>
//                                                                     </div>
//                                                                 </div>
//                                                             </div>
//                                                         </div>
//                                                     )}
//                                                 </Draggable>
//                                             ))
//                                         ) : (
//                                             <div className={styles["empty-column-message"]}>
//                                                 <img src={emptybox}/>
//                                                 <p>There are no active {statusLabels[status]} {entity} in this
//                                                     column</p>
//                                                 <button>Create Now</button>
//                                             </div>
//                                         )}
//                                         {provided.placeholder}
//                                     </div>
//                                 </div>
//                             </div>
//                         )}
//                     </Droppable>
//                 ))}
//             </div>
//         </DragDropContext>
//     );
// };
//
// export default Kanban;
//
//
//
//
//
//
//
//
//
//
//
//
//
//







import React, { useEffect, useMemo, useState } from "react";
import styles from "./Kanban.module.css";
import add from "../../images/icons/add.svg";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import emptybox from "../../images/icons/emptybox.svg";
import attachment from "../../images/icons/attachment.svg";
import comment from "../../images/icons/comment.svg";
import clock from "../../images/icons/clock.svg";
import { getUserNameAndImageById } from "../../service/User/UserFetcher";
import { formatToShortDate } from "../../utils/datetime";

// --- Icon Imports ---
import bug from "../../images/icons/bug_i.svg";
import improvement from "../../images/icons/wrench_i.svg";
import performance from "../../images/icons/rocket_i.svg";
import warning from "../../images/icons/warning_i.svg";
import info from "../../images/icons/bulb_i.svg";
import security from "../../images/icons/lock_i.svg";
import design from "../../images/icons/design_i.svg";
import low from "../../images/icons/issues_severity/low.svg";
import medium from "../../images/icons/issues_severity/medium.svg";
import critical from "../../images/icons/issues_severity/critical.svg";
import severe from "../../images/icons/issues_severity/severe.svg";

// --- Helper Function (unchanged) ---
export const highlightText = (text, query) => {
    if (!query || !text) return text;
    const regex = new RegExp(`(${query})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
            <mark key={i} className={styles.highlight}>{part}</mark>
        ) : part
    );
};

// --- Dynamic Configurations ---
const columnDefinitions = {
    issue: {
        status: ["pending", "triaged", "confirmed", "planned", "in_progress", "resolved", "closed"],
        severity: ["severe", "critical", "medium", "low"],
        source: ["github", "gitlab", "manual"]
    },
    task: {
        status: ["todo", "in_progress", "in_review", "done"],
        priority: ["high", "medium", "low"]
    }
};

const levelIconMap = {
    issue: { low, medium, critical, severe },
    task: { low, medium, high: critical } // Reuse for tasks; customize if needed
};

const levelOptionsMap = {
    issue: ["severe", "critical", "medium", "low"],
    task: ["high", "medium", "low"]
};

const typeIconMap = {
    issue: { bug : bug, improvement:improvement, performance : performance, warning : warning, info : info, security : security, design : design },
    task: {} // Add task type icons here if needed
};

// Reusable Kanban component
const Kanban = ({
                    data = [],
                    groupBy = "status",
                    titleKey = "title",
                    descriptionKey = "description",
                    statusLabels = {},
                    searchQuery = "",
                    onCardClick = () => {},
                    onAddClick = () => {},
                    onCardMove = () => {},
                    entity = "issue" // Default to "issue" to prevent undefined errors
                }) => {
    const [userMap, setUserMap] = useState({});
    const [floatingContext, setFloatingContext] = useState(null);

    // Safeguard against invalid entity
    const safeEntity = columnDefinitions[entity] ? entity : "issue"; // Fallback to "issue"
    if (entity !== safeEntity) {
        console.warn(`Invalid entity "${entity}"; falling back to "issue"`);
    }

    // Define levelProperty here to fix undefined error
    const levelProperty = safeEntity === "issue" ? "severity" : "priority";

    // Columns for this entity/groupBy
    const columnOrder = useMemo(
        () => columnDefinitions[safeEntity][groupBy] || [],
        [safeEntity, groupBy]
    );

    // Group and filter data
    const groupedData = useMemo(() => {
        const result = {};
        columnOrder.forEach((bucket) => {
            result[bucket] = data.filter((item) => {
                const val = item[groupBy]?.toLowerCase().trim();
                if (val !== bucket) return false;
                if (!searchQuery) return true;
                const t = item[titleKey]?.toLowerCase() || "";
                const d = item[descriptionKey]?.toLowerCase() || "";
                const q = searchQuery.toLowerCase();
                return t.includes(q) || d.includes(q);
            });
        });
        return result;
    }, [data, columnOrder, groupBy, titleKey, descriptionKey, searchQuery]);

    // Load avatars for assigned users
    useEffect(() => {
        const run = async () => {
            const ids = new Set(data.flatMap((i) => i.assignedTo?.users || []));
            const toFetch = [...ids].filter((id) => !userMap[id]);
            if (!toFetch.length) return;
            const results = await Promise.all(
                toFetch.map((id) =>
                    getUserNameAndImageById(id)
                        .then((user) => ({ id, user }))
                        .catch(() => null)
                )
            );
            const addMap = Object.fromEntries(
                results.filter(Boolean).map((r) => [r.id, r.user])
            );
            setUserMap((prev) => ({ ...prev, ...addMap }));
        };
        if (data.length) run();
    }, [data, userMap]);

    // DnD handler
    const onDragEnd = (result) => {
        const { source, destination, draggableId } = result;
        if (!destination || (source.droppableId === destination.droppableId && source.index === destination.index)) {
            return;
        }
        const moved = data.find((i) => i._id === draggableId);
        if (moved) {
            onCardMove(
                { ...moved, [groupBy]: destination.droppableId },
                source.droppableId,
                destination.droppableId
            );
        }
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            {/* Floating level selector (severity/priority) */}
            {floatingContext && (
                <div
                    className={styles["floating-modal"]}
                    style={{
                        top: `${floatingContext.anchor.y}px`,
                        left: `${floatingContext.anchor.x}px`,
                        transform: `translate(${floatingContext.side === "left" ? "-100%" : "0"}, 0)`
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {levelOptionsMap[safeEntity].map((level) => (
                        <div
                            key={level}
                            className={`${styles["severity-option"]} ${floatingContext.value === level ? styles.active : ""}`}
                            onClick={() => {
                                const updated = data.find((i) => i._id === floatingContext.id);
                                if (!updated) return;
                                updated[levelProperty] = level;
                                onCardMove(updated, updated[groupBy], updated[groupBy]);
                                setFloatingContext(null);
                            }}
                        >
                            <img src={levelIconMap[safeEntity][level]} alt={level} />
                            <span>{level.charAt(0).toUpperCase() + level.slice(1)}</span>
                        </div>
                    ))}
                </div>
            )}

            <div className={styles["kanban-view-columns"]}>
                {columnOrder.map((groupValue) => (
                    <Droppable key={groupValue} droppableId={groupValue}>
                        {(provided) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className={styles["kanban-column"]}
                            >
                                <div className={styles["kanban-column-header"]}>
                                    <div className={styles["kanban-column-header-i"]}>
                                        <p className={styles["kanban-column-title"]}>
                                            {statusLabels[groupValue] || groupValue}
                                        </p>
                                        <p className={styles["kanban-column-count"]}>
                                            {groupedData[groupValue]?.length || 0}
                                        </p>
                                    </div>
                                    <div
                                        className={styles["kanban-column-header-i"]}
                                        onClick={() => onAddClick(groupValue)}
                                        title="Add new"
                                        style={{ cursor: "pointer" }}
                                    >
                                        <img src={add} alt="Add" />
                                    </div>
                                </div>

                                <div className={styles["kanban-column-tasks"]}>
                                    <div className={styles["grey-zone"]}>
                                        {groupedData[groupValue]?.length > 0 ? (
                                            groupedData[groupValue].map((item, index) => (
                                                <Draggable
                                                    key={item._id}
                                                    draggableId={item._id}
                                                    index={index}
                                                    isDragDisabled={false}
                                                >
                                                    {(providedDraggable) => (
                                                        <div
                                                            ref={providedDraggable.innerRef}
                                                            {...providedDraggable.draggableProps}
                                                            {...providedDraggable.dragHandleProps}
                                                            className={styles["task-card"]}
                                                            onClick={() => onCardClick(item)}
                                                        >
                                                            <div className={styles["task-details"]}>
                                                                <p className={styles["task-title"]}>
                                                                    {highlightText(item[titleKey], searchQuery)}
                                                                </p>
                                                                <p className={styles["task-description"]}>
                                                                    {highlightText(item[descriptionKey], searchQuery)}
                                                                </p>
                                                            </div>

                                                            <div className={styles['task-header']}>
                                                                {item.type && typeIconMap[safeEntity][item.type.toLowerCase()] && (
                                                                    <div className={styles['task-type-wrapper']}>
                                                                        <img src={typeIconMap[safeEntity][item.type.toLowerCase()]} alt={item.type} />
                                                                    </div>
                                                                )}
                                                                {item[levelProperty] && (
                                                                    <div className={styles["task-severity-wrapper"]}>
                                                                        <img
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                const rect = e.currentTarget.getBoundingClientRect();
                                                                                const screenWidth = window.innerWidth;
                                                                                const openLeft = rect.right + 180 > screenWidth;
                                                                                setFloatingContext({
                                                                                    id: item._id,
                                                                                    anchor: {
                                                                                        x: openLeft ? rect.left - 180 : rect.right,
                                                                                        y: rect.top + window.scrollY,
                                                                                    },
                                                                                    side: openLeft ? "left" : "right",
                                                                                    value: item[levelProperty],
                                                                                });
                                                                            }}
                                                                            src={levelIconMap[safeEntity][item[levelProperty].toLowerCase()]}
                                                                            alt={item[levelProperty]}
                                                                            title={item[levelProperty].charAt(0).toUpperCase() + item[levelProperty].slice(1)}
                                                                            className={styles["severity-icon"]}
                                                                        />
                                                                    </div>
                                                                )}
                                                                {item.dueDate && (
                                                                    <div className={styles['task-duedate-wrapper']}>
                                                                        <p>{formatToShortDate(item.dueDate)}</p>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div className={styles['task-footer']}>
                                                                <div className={styles['task-footer-capsule']}>
                                                                    {item.assignedTo?.users?.length > 0 && item.assignedTo.users.map((userId) => {
                                                                        const user = userMap[userId];
                                                                        return user && (
                                                                            <img
                                                                                key={userId}
                                                                                src={user.picture || `https://ui-avatars.com/api/?name=${user.name || "User"}&background=random&size=128`}
                                                                                alt={user.name || "User"}
                                                                                title={user.name || "Unknown User"}
                                                                                className={styles["user-avatar"]}
                                                                            />
                                                                        );
                                                                    })}
                                                                </div>
                                                                <div className={styles['task-footer-capsule']}>
                                                                    <div className={styles['task-footer-pill']}>
                                                                        <img src={attachment} alt="Attachments" />
                                                                        <p>{item.attachments?.length || 0}</p>
                                                                    </div>
                                                                    <div className={styles['task-footer-pill']}>
                                                                        <img src={comment} alt="Comments" />
                                                                        <p>{item.comments?.length || 0}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))
                                        ) : (
                                            <div className={styles["empty-column-message"]}>
                                                <img src={emptybox} alt="Empty Box" />
                                                <p>No {entity} in this column</p>
                                                <button onClick={() => onAddClick(groupValue)}>Create Now</button>
                                            </div>
                                        )}
                                        {provided.placeholder}
                                    </div>
                                </div>
                            </div>
                        )}
                    </Droppable>
                ))}
            </div>
        </DragDropContext>
    );
};

export default Kanban;
