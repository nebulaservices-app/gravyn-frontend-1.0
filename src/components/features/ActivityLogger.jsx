import React from "react";
import styles from "./ActivityLogger.module.css";
import pending from "../../images/icons/status/pending.svg";
import completed from "../../images/icons/status/completed.svg";
import review from "../../images/icons/status/review.svg";
import paused from "../../images/icons/status/paused.svg";
import issue from "../../images/icons/status/issue.svg";
import failed from "../../images/icons/status/cancel.svg";
import lineicon from "../../images/icons/line.svg";
import {getTimeElapsed} from "../../utils/datetime";

const activityLogs = [
    {
        id: 1,
        icon: pending,
        status: "Pending",
        message: "Wireframe task has been created for Login Page interface",
        detail: "Arjun initiated this task to kick off frontend development. Initial sketches are being finalized before layout begins.",
        createdAt: "2025-05-06T10:30:00Z",
    },
    {
        id: 2,
        icon: review,
        status: "In Review",
        message: "Landing Page Copy has been submitted for client feedback",
        detail: "Martin submitted the content draft to the client. Awaiting approval before proceeding to design handoff.",
        createdAt: "2025-05-06T14:15:00Z",
    },
    {
        id: 3,
        icon: completed,
        status: "Completed",
        message: "Sprint Planning task marked as complete by design team",
        detail: "Priya wrapped up the sprint planning session. Timeline and task priorities have been documented and circulated.",
        createdAt: "2025-05-05T16:00:00Z",
    },
    {
        id: 4,
        icon: paused,
        status: "Paused",
        message: "API Integration task has been temporarily paused",
        detail: "Progress is halted due to issues with the third-party provider. Follow-up with the vendor scheduled for tomorrow.",
        createdAt: "2025-05-06T09:00:00Z",
    },
    {
        id: 5,
        icon: issue,
        status: "Issue",
        message: "Bug identified in Notification System affecting Android users",
        detail: "QA team reported failure in push delivery on Android devices. The bug has been assigned to the mobile backend team.",
        createdAt: "2025-05-06T16:30:00Z",
    },
    {
        id: 6,
        icon: failed,
        status: "Failed",
        message: "Production deployment failed due to script error",
        detail: "The deployment process returned error code 502. Logs suggest a misconfigured environment variable on the server.",
        createdAt: "2025-05-06T18:00:00Z",
    },
];
const ActivityLogger = () => {
    return (
        <div className={styles["logger-wrapper"]}>
            <div className={styles['logger-header']}>
                <div className={styles['logger-header-flex']}>
                    <p>Task Activity</p>
                    <p>Monitor your task activity for the entire day</p>
                </div>
                <div className={styles['actions-wrapper']}>

                </div>
            </div>
            <div className={styles['logger-card-overflow-wrapper']}>
                {activityLogs.map((log) => (
                    <div key={log.id} className={styles["log-card"]}>
                        <img className={styles['line-border']} src={lineicon}/>
                        <div className={styles['time']}>{getTimeElapsed(log.createdAt)}</div>
                        <div className={styles["header"]}>
                            <img src={log.icon} alt={log.status} className={styles["icon"]} />
                            <div className={styles['message-wrapper']}>
                                <p className={styles["message"]}>{log.message}</p>
                                <div className={styles['log-interior']}>
                                    <p className={styles["actor"]}>Martin Luther commented</p>
                                    <p className={styles["detail"]}>{log.detail}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

            </div>
        </div>
    );
};

export default ActivityLogger;