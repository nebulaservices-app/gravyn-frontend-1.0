import React, { useEffect, useState } from "react";
import styles from "./UnviersalSpreadsheetView.module.css";
import issues from "../../images/icons/issues.svg";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import low from "../../images/icons/issues_severity/low.svg";
import medium from "../../images/icons/issues_severity/medium.svg";
import critical from "../../images/icons/issues_severity/critical.svg";
import severe from "../../images/icons/issues_severity/severe.svg";
import { getUserNameAndImageById } from "../../service/User/UserFetcher";
import bug from "../../images/icons/bug_i.svg";
import improvement from "../../images/icons/wrench_i.svg";
import performance from "../../images/icons/rocket_i.svg";
import warning from "../../images/icons/warning_i.svg";
import info from "../../images/icons/bulb_i.svg";
import security from "../../images/icons/lock_i.svg";
import design from "../../images/icons/design_i.svg";
import calendar from "../../images/icons/calendar.svg";
import { formatToShortDate } from "../../utils/datetime";
import { highlightText } from "./Kanban";
import dropdown from "../../images/icons/dropdown.svg";
import add from "../../images/icons/add.svg"

import aitriage from "../../images/icons/aitriage.svg"


const statusMap = {
    pending: { key: "pending", label: "Pending", icon: "", color: "#A0A0A0" },
    triaged: { key: "triaged", label: "Triaged", icon: "", color: "#6699CC" },
    confirmed: { key: "confirmed", label: "Confirmed", icon: "", color: "#558B2F" },
    planned: { key: "planned", label: "Planned", icon: "", color: "#F9A825" },
    in_progress: { key: "in_progress", label: "In Progress", icon: "", color: "#FF9800" },
    resolved: { key: "resolved", label: "Resolved", icon: "", color: "#00C853" },
    closed: { key: "closed", label: "Closed", icon: "", color: "#9E9E9E" },
};

const UniversalSpreadsheetView = ({ data, groupByKey = "status", columns = [], statusMapper, searchQuery }) => {
    const columnOrderMap = {
        status: Object.keys(statusMap),
        severity: ["severe", "critical", "medium", "low"],
        source: ["github", "gitlab", "manual"]
    };

    const typeMap = {
        bug: bug,
        improvement: improvement,
        performance: performance,
        warning: warning,
        info: info,
        security: security,
        design: design,
    };

    const severityIconMap = {
        low,
        medium,
        critical,
        severe
    };

    const [userMap, setUserMap] = useState({});

    const groupByStatus = (data) => {
        return data.reduce((acc, item) => {
            const key = item[groupByKey] || "Ungrouped";
            if (!acc[key]) acc[key] = [];
            acc[key].push(item);
            return acc;
        }, {});
    };

    const [groupedData, setGroupedData] = useState(groupByStatus(data));

    const [expandedGroups, setExpandedGroups] = useState(() => {
        const initial = {};
        Object.keys(groupedData).forEach((key) => {
            initial[key] = true;
        });
        return initial;
    });

    const toggleGroup = (group) => {
        setExpandedGroups((prev) => ({
            ...prev,
            [group]: !prev[group],
        }));
    };

    const onDragEnd = (result) => {
        const { source, destination } = result;
        if (!destination) return;

        const sourceGroup = source.droppableId;
        const destGroup = destination.droppableId;

        const sourceItems = [...groupedData[sourceGroup]];
        const destItems = [...groupedData[destGroup]];

        const [movedItem] = sourceItems.splice(source.index, 1);

        if (sourceGroup === destGroup) {
            sourceItems.splice(destination.index, 0, movedItem);
            setGroupedData({ ...groupedData, [sourceGroup]: sourceItems });
        } else {
            destItems.splice(destination.index, 0, movedItem);
            setGroupedData({
                ...groupedData,
                [sourceGroup]: sourceItems,
                [destGroup]: destItems,
            });
        }
    };

    // const handleData = (item) => {
    //     alert(JSON.stringify(item))
    // }

    // const groupOrder = Object.keys(groupedData);
    const groupOrder = (columnOrderMap[groupByKey] || []).filter((group) => groupedData[group]?.length);
    useEffect(() => {
        const fetchUserData = async () => {
            const allUserIds = new Set();

            data.forEach((issue) => {
                const { assignedTo, createdBy, comments, logs } = issue;
                assignedTo?.users?.forEach((id) => allUserIds.add(id));
                if (createdBy?.id) allUserIds.add(createdBy.id);
                comments?.forEach((c) => c?.author && allUserIds.add(c.author));
                logs?.forEach((log) => log?.by && allUserIds.add(log.by));
            });

            const newIdsToFetch = [...allUserIds].filter((id) => !userMap[id]);
            const promises = newIdsToFetch.map(async (userId) => {
                try {
                    const user = await getUserNameAndImageById(userId);
                    return { userId, user };
                } catch {
                    return null;
                }
            });

            const results = await Promise.all(promises);
            const userMapUpdates = {};
            results.forEach((res) => {
                if (res) userMapUpdates[res.userId] = res.user;
            });

            setUserMap((prev) => ({ ...prev, ...userMapUpdates }));
        };

        if (data.length > 0) fetchUserData();
    }, [data]);

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className={styles["spreadsheet-view"]}>
                {groupOrder.map((group) => (
                    <Droppable key={group} droppableId={group}>
                        {(provided) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className={styles["spreadsheet-group"]}
                            >
                                <div
                                    className={styles["spreadsheet-header"]}
                                    onClick={() => toggleGroup(group)}
                                    style={{cursor: "pointer"}}
                                >
                                    <div className={styles["spreadsheet-header-i"]}>
                                        <img
                                            src={
                                                statusMapper.find((s) => s.key === group)?.icon
                                            }
                                            alt={group}
                                        />
                                        <p>{statusMapper.find((s) => s.key === group)?.label || group} Issues</p>
                                        <p className={styles['spreadsheet-header-i-counter']}>{groupedData[group].length} issues</p>
                                    </div>
                                    <div className={styles["spreadsheet-header-i"]}>
                                        <img src={add}/>
                                        <span>{expandedGroups[group] ? <img
                                                style={{
                                                    transition : 'all 0.3s'
                                                }}
                                                src={dropdown}/> :
                                            <img
                                                style={{
                                                    transform : 'rotate(-90deg)',
                                                    transition : 'all 0.3s'
                                                }}
                                                src={dropdown}/>}</span>
                                    </div>
                                </div>

                                {expandedGroups[group] && (
                                    <div className={styles["spreadsheet-content"]}>
                                        {groupedData[group].map((item, index) => (
                                            <Draggable key={item._id} draggableId={item._id.toString()} index={index}>
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className={`${styles["spreadsheet-row"]} ${snapshot.isDragging ? styles["dragging"] : ""}`}
                                                    >
                                                        <div className={styles["spreadsheet-row-i"]}>
                                                            <div className={styles["properties-wrapper"]}>
                                                                <img src={severityIconMap[item.severity]}/>
                                                            </div>
                                                            <div className={styles["properties-wrapper"]}>
                                                                <img src={typeMap[item.type.toLowerCase()]}/>
                                                            </div>
                                                          
                                                            <p className={styles["item-title"]}>{highlightText(item.title, searchQuery)}</p>
                                                        
                                                        </div>
                                                        <div className={styles["spreadsheet-row-i"]}>
                                                              <div className={styles["properties-v2-wrapper"]}>
                                                               {item.meta.triaged.triaged === true  && 
                                                                    <img src={aitriage}/> 
                                                               }
                                                            </div>

                                                            {item.assignedTo?.users?.map((userId) => {
                                                                    const user = userMap[userId];
                                                                    return (
                                                                        <div className={styles["properties-v2-wrapper"]}>
                                                                        <img
                                                                            key={userId}
                                                                            src={
                                                                                user?.picture ||
                                                                                `https://ui-avatars.com/api/?name=${user?.name || "User"}&background=random&size=128`
                                                                            }
                                                                            alt={user?.name || "User"}
                                                                            title={user?.name || "Unknown User"}
                                                                            className={styles["user-avatar"]}
                                                                        />
                                                                        </div>
                                                                  
                                                                    );
                                                            })}
                                                      
                                                            <div className={styles["properties-v2-wrapper"]}>
                                                                {/*<img src={calendar}/>*/}
                                                                <p>{formatToShortDate(item.dueDate)}</p>
                                                            </div>
                                                          
                                                        </div>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </div>
                        )}
                    </Droppable>
                ))}
            </div>
        </DragDropContext>
    );
};

export default UniversalSpreadsheetView;