// src/utils/toastTemplates.js
import styles from './toastTemplates.module.css'; // Import the new CSS module
import issue from "../../images/icons/issues.svg"

export const toastTemplates = new Map([
    // Issues-specific templates (granular by action)
    ['issues-creation', (data) => (
        <div className={styles['issues-container']}>

            <div className={styles['issue-flex-i']}>
                <img src={issue}/>
            </div>
            <div className={styles['issue-flex-i']}>
                <p className={styles.title}>New Issue Encountered</p>
                <p className={styles.paragraph}>{data.title}</p>
                <small className={styles.details}>{data.details}</small>
            </div>

        </div>
    )],
    ['issues-deletion', (data) => (
        <div className={styles['issues-container']}>
            <strong className={styles.title}>Issue Deleted</strong>
            <p className={styles.paragraph}>Issue "{data.title}" has been removed.</p>
            <small className={styles.details}>{data.reason || 'No reason provided'}</small>
            <button className={styles['undo-button']} onClick={data.onUndo}>Undo Deletion</button>
        </div>
    )],
    // Previous general templates (kept for reference; add action-specific as needed)
    ['project-template', (data) => (
        <div className={styles['project-container']}>
            <strong className={styles.title}>Project {data.status}</strong>
            <p className={styles.paragraph}>{data.name}</p>
            <button className={styles['open-button']} onClick={data.onOpen}>Open Project</button>
        </div>
    )],
    ['assignee-template', (data) => (
        <div className={styles['assignee-container']}>
            <strong className={styles.title}>Assignee Changed</strong>
            <p className={styles.paragraph}>{data.user} assigned to {data.task}</p>
        </div>
    )],
    ['tasks-template', (data) => (
        <div className={styles['tasks-container']}>
            <strong className={styles.title}>Task Reminder</strong>
            <p className={styles.paragraph}>{data.taskName} due on {data.dueDate}</p>
            <button className={styles['complete-button']} onClick={data.onComplete}>Mark Complete</button>
        </div>
    )],
    // Add more action-specific templates, e.g., ['project-creation-template', (data) => /* JSX */]
]);
