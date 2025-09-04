import React, {useEffect, useRef, useState} from "react"
import styles from "../../styles/Dashboard/Dashboard.module.css"
import nebula_logo from "../../images/onboard/logo-white.svg"
import downarrow from "../../images/icons/downarrow.svg"
import create from "../../images/icons/create-new.svg"
import search from "../../images/icons/search.svg"
import inbox from "../../images/nav/inbox.svg"
import dashboard from "../../images/nav/dashboard.svg"
import messages from "../../images/nav/messages.svg"
import finances from "../../images/nav/finance.svg"
import files from "../../images/nav/files.svg"
import issues from "../../images/nav/issues.svg"
import alert from "../../images/icons/alert.svg"
import members from "../../images/icons/members.svg"
import calendar from "../../images/icons/calendar.svg"
import workspace from "../../images/icons/workspace.svg"
import rightarrow from "../../images/icons/arrow.svg"
import send from "../../images/icons/send.svg"
import sync from "../../images/icons/sync.svg"
import comment_green from "../../images/icons/comment-green.svg"
import fileIcon from "../../images/icons/file.svg"
import kairo from "../../images/logo/kairo.svg"
import close from "../../images/icons/close.svg"
import add from "../../images/icons/add.svg"
import stack_inactive from "../../images/icons/stack-white.svg"
import stack_active from "../../images/icons/stack-blue.svg"
import comment from "../../images/icons/comment.svg"
import attachnent from "../../images/icons/attachment.svg"
import {useAuth} from "../../components/script/AuthContext"

import resync from "../../images/icons/refesh.svg"
import plus from "../../images/icons/plus.svg"
import more from "../../images/icons/more.svg"

//Status Indicator
import pending from "../../images/icons/pending.svg"
import inprogress from "../../images/icons/in-progress.svg"
import pause from "../../images/icons/paused.svg"
import cancelled from "../../images/icons/cancel.svg"
import success from "../../images/icons/success.svg"


import facet1 from "../../images/teamp/face1.jpeg"
import facet2 from "../../images/teamp/face2.jpeg"
import facet3 from "../../images/teamp/face3.jpeg"
import facet4 from "../../images/teamp/face10.jpeg"
import facet5 from "../../images/teamp/face12.jpeg"
import facet6 from "../../images/teamp/face13.jpeg"

import cube from "../../images/icons/cube.svg"
import bolt from "../../images/icons/bolt.svg"
import settings from "../../images/nav/settings.svg"
import {getInitials} from "../../utils/helper";
import {keyboard} from "@testing-library/user-event/dist/keyboard";
import star_nofav from "../../images/icons/star-nofav.svg"
import star_fav from "../../images/icons/star-fav.svg"
import {formatDateTime, formatFullDate, formatTime12Hour, getTimeElapsed} from "../../utils/datetime";
import GanttChart from "../../components/features/GanttChart";
import axios from "axios";
import Graphs from "../Graphs";
import TaskCharts from "../TaskCharts";
import ActivityLogger from "../../components/features/ActivityLogger";
import AppCenter from "../../components/ui/AppCenter";
import {createMeeting} from "../../service/googleMeet/gmeetCRUD";
import {isGoogleTokenExpired, isTokenExpired, refreshGoogleAccessToken} from "../../service/googleMeet/gmeetAuth";
import {toast} from "react-toastify";
import MeetingOverview from "../../components/ui/MeetingOverview";
import MeetingCreatorModal from "../../components/ui/MeetingCreatorModal";
import {useNavigate} from "react-router-dom";
import Sidebar from "../../components/ui/Sidebar";
import SideBar_Proj from "../../components/ui/SideBar_Proj";

const WorkspaceDetails = {
    img : null,
    name : "Alpha Zfuse Inc Coding Base",
    settings : {

    },
    creator : {
        id : "uid_test",
        name : "John Doe",
        username : "johndoe.212",
        email : "johndoe.example.com",
    },
    projectIds : [
        "pid123"
    ],
    preferences : {

    }
}


const raised_issue = [
    {
        "id": "iss002",
        "title": "Phase planning overdue",
        "description": "Design phase planning not completed, delaying next steps.",
        "severity": "high",
        "scope": "phase",
        "status": "open",
        "createdAt": "2025-04-17T11:00:00Z",
        "resolvedAt": null,
        "projectId": "pid123",
        "phaseId": "ph001",
        "assignedTo": ["userid3"],
        "reportedBy": "uid_test",
        "priority": "high",
        "impact": {
            "entityType": "phase",
            "id": "ph001",
            "description": "Delays task assignment by 1 day"
        }
    },
    {
        "id": "iss003",
        "title": "Bug in task implementation",
        "description": "Error in Booking API task code prevents testing.",
        "severity": "high",
        "scope": "task",
        "status": "in-progress",
        "createdAt": "2024-10-16T12:00:00Z",
        "resolvedAt": null,
        "projectId": "pid124",
        "assignedTo": ["userid2"],
        "reportedBy": "userid3",
        "priority": "medium",
        "impact": {
            "entityType": "task",
            "id": "task002",
            "description": "Blocks testing phase progress"
        }
    },
    {
        "id": "iss004",
        "title": "Milestone deadline missed",
        "description": "Design Phase Completed milestone overdue due to delays.",
        "severity": "low",
        "scope": "warning",
        "status": "open",
        "createdAt": "2025-04-17T13:00:00Z",
        "resolvedAt": null,
        "projectId": "pid123",
        "milestoneId": "ms001",
        "assignedTo": ["userid2", "userid3"],
        "reportedBy": "uid_test",
        "priority": "low",
        "impact": {
            "entityType": "milestone",
            "id": "ms001",
            "description": "Risks project timeline slippage"
        }
    }
];

const users = [
    {
        uid: "userid1",
        uType: "pm", // Project Manager
        uName: "Gonzalis Trivo",
        uImg: facet1, // Placeholder image path
    },
    {
        uid: "userid2",
        uType: "dev", // Developer
        uName: "Maria Gonzalez",
        uImg: facet2,
    },
    {
        uid: "userid3",
        uType: "dev", // Developer
        uName: "Akash Patel",
    },
    {
        uid: "userid4",
        uType: "qa", // Quality Assurance
        uName: "Sophie Laurent",
        uImg: facet4,
    },
    {
        uid: "userid5",
        uType: "client",
        uName: "Emily Carter",
        uImg: facet5,
    },
];
const projects = [
    {
        id: "pid123",
        name: "Gumboot Car Booking App",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        status: "In Progress",
        createdAt: new Date("2025-03-01").toISOString(), // "2024-07-01T00:00:00.000Z"
        startDate: new Date("2024-07-01").toISOString(), // "2024-07-01T00:00:00.000Z"
        creatorId: "userid1",
        participant: ["userid2", "userid3", "userid4"], // Developers and QA
        client: {
            clientPresent: false,
            clientId: null,
        },
        endDate: new Date("2024-12-31").toISOString(), // "2024-12-31T00:00:00.000Z"
        priority: "High",
        teamSize: 3,
        tasksCompleted: 15,
        totalTasks: 25,
        lastUpdated: "2025-04-16T05:20:04.000Z"
    },
    {
        id: "pid124",
        name: "Nebula Task Manager",
        description: "A task management tool for Lexxov Nebula users...",
        status: "Planning",
        startDate: new Date("2024-10-01").toISOString(), // "2024-10-01T00:00:00.000Z"
        creatorId: "userid2",
        participant: ["userid3", "userid4"], // Developers and QA
        client: {
            clientPresent: true,
            clientId: "client001", // Linked to Emily Carter
        },
        endDate: new Date("2025-03-31").toISOString(), // "2025-03-31T00:00:00.000Z"
        priority: "Medium",
        teamSize: 2,
        tasksCompleted: 2,
        totalTasks: 10,
    },
    {
        id: "pid125",
        name: "Alpha Fuse Analytics Dashboard",
        description: "Analytics platform for business insights...",
        status: "Completed",
        startDate: new Date("2024-04-01").toISOString(), // "2024-04-01T00:00:00.000Z"
        creatorId: "userid4",
        participant: ["userid2", "userid3", "userid5"], // Developers, QA, and client
        client: {
            clientPresent: true,
            clientId: "client001",
        },
        endDate: new Date("2024-09-30").toISOString(), // "2024-09-30T00:00:00.000Z"
        priority: "Low",
        teamSize: 4,
        tasksCompleted: 30,
        totalTasks: 30,
        lastUpdated : "2025-04-16T05:20:04.000Z"
    },
    {
        id: "pid126",
        name: "Nebula Plugin Framework",
        description: "A framework for developing Nebula plugins...",
        status: "Not Started",
        startDate: new Date("2025-01-01").toISOString(), // "2025-01-01T00:00:00.000Z"
        creatorId: "userid3",
        participant: ["userid2", "userid4"],
        client: {
            clientPresent: false,
            clientId: null,
        },
        endDate: new Date("2025-06-30").toISOString(), // "2025-06-30T00:00:00.000Z"
        priority: "Medium",
        teamSize: 2,
        tasksCompleted: 0,
        totalTasks: 20,
    },
];

const statusIcon = {
    "pending" : pending,
    "progress" : inprogress,
    "paused" : pause,
    "completed" : success,
    "cancelled" : cancelled,
    "blocked" : cancelled
}





// Helper function to get user or team details
const getAssigneeDetails = (assigned, assignedTo) => {
    if (assigned.assignedType === 'team') {
        const teamName = assigned.assignedType.name || 'Unnamed Team';
        return {
            img: null,
            name: teamName,
            initials: getInitials(teamName),
        };
    } else {
        return {
            img: assigned?.img || null,
            name: assigned?.assignedTo || 'Unknown User',
            initials: assigned?.assignedTo ? getInitials(assigned?.assignedTo) : '??',
        };
    }
};

const activeProjectId = "pid123"

export const Towers = ({ signal = 0 }) => {
    const tallestTowerHeight = 15; // Tallest height in units (e.g., pixels)
    const towersCount = 4;

    // Generate tower heights: 50%, 60%, 70%, 80% of tallestTowerHeight
    const towerHeights = Array.from({ length: towersCount }, (_, index) =>
        tallestTowerHeight * (0.5 + index * 0.1)
    );

    // Calculate a single color based on overall signal level (0 to 1, where 0 is green, 1 is red)
    const getTowerColor = () => {
        const progress = Math.min(1, signal / (towersCount - 1)); // Normalize signal to 0-1
        const red = Math.min(255, Math.round(255 * progress)); // Increase red from 0 to 255
        const green = Math.max(0, Math.round(255 * (1 - progress))); // Decrease green from 255 to 0
        return `rgb(${red}, ${green}, 0)`; // Base color for lit towers
    };

    // Calculate opacity based on height proportion, ensuring tallest tower has opacity 1.0 when lit
    const getTowerOpacity = (height, index, signal) => {
        const minHeightRatio = 0.5; // 50% of tallestTowerHeight
        const maxHeightRatio = 0.8; // 80% of tallestTowerHeight
        const heightRatio = height / tallestTowerHeight;

        // If this tower is the tallest (index === towersCount - 1) and lit, force opacity to 1.0
        if (index === towersCount - 1 && index < signal) {
            return 1.0;
        }

        // For other lit towers, scale opacity based on height
        const minOpacity = 0.5;
        const maxOpacity = 1.0;
        return minOpacity + (maxOpacity - minOpacity) * ((heightRatio - minHeightRatio) / (maxHeightRatio - minHeightRatio));
    };

    return (
        <div className={styles['towers-wrapper']}>
            {Array.from({ length: towersCount }, (_, index) => {
                const height = towerHeights[index];
                const opacity = index < signal ? getTowerOpacity(height, index, signal) : 0.5; // Apply opacity only to lit towers
                const color = getTowerColor();
                return (
                    <div
                        key={index}
                        className={styles['tower']}
                        style={{
                            height: `${height}px`,
                            backgroundColor: index < signal ? `rgba(${color.split('(')[1].split(')')[0]}, ${opacity})` : 'rgba(255,255,255,0.5)',
                        }}
                    >
                        {/* Optional: Add content or bar visualization */}
                    </div>
                );
            })}
        </div>
    );
};


const SideNavBar = ({}) => {

    const navigate = useNavigate();
    const projectId = "68159219cdb8524689046498";

    return <div className={`${styles['side-bar']} ${styles['side-bar-collapsible']}`}>
        <nav className={`${styles['nav-bar-burger-wrapper']}`}>
            <div className={`${styles['nav-burger-flex-item']} ${styles['nav-burger-flex-left']}`}>
                <img src={nebula_logo}/>
                <img src={downarrow}/>
            </div>

            <div className={styles['nav-burger-flex-item']}>
                <img src={create}/>
            </div>
        </nav>
        <div className={styles['menu-wrapper']}>
            <div className={styles['menu-item-capsule']}>
                <div className={styles['menu-item-children-capsule']}>
                    <div className={styles['menu-item-pill']}>
                        <img src={inbox}/>
                        <p>My Inboxes</p>
                    </div>
                </div>
            </div>
            <div className={styles['menu-item-capsule']}>
                <p>GENERAL</p>
                <div className={styles['menu-item-children-capsule']}>
                    <div className={styles['menu-item-pill']}>
                        <img src={dashboard}/>
                        <p>Dashboard</p>
                    </div>
                    <div className={styles['menu-item-pill']}>
                        <img src={messages}/>
                        <p>Messages</p>
                    </div>
                    <div className={styles['menu-item-pill']}>
                        <img src={finances}/>
                        <p>Finances</p>
                    </div>
                    <div className={styles['menu-item-pill']}>
                        <img src={files}/>
                        <p>Files & Attachment</p>
                    </div>
                    <div
                        onClick={()=>{navigate(`/app/project/${projectId}/tasks/overview`)}}
                        className={styles['menu-item-pill']}>
                        <img src={issues}/>
                        <p>Project Issues</p>
                    </div>
                    <div className={styles['menu-item-pill']}>
                        <img src={settings}/>
                        <p>Workspace Settings</p>
                    </div>

                    <div className={styles['menu-item-pill']}>
                        <img src={settings}/>
                        <p>App Center</p>
                    </div>

                </div>
            </div>
        </div>
    </div>
}

const getSignalFromPriority = (priority) => {
    switch (priority?.toLowerCase()) {
        case 'low':
            return 1;
        case 'medium':
            return 2;
        case 'high':
            return 3;
        case 'emergency':
            return 4;
        default:
            return 2; // Default to medium (signal = 2) for invalid priorities
    }
};


const CommentBurger = ({ comments = [] }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isInteracting, setIsInteracting] = useState(false);
    const wrapperRef = useRef(null);
    const interactionTimeoutRef = useRef(null);


    // Scroll to a specific index
    const scrollToIndex = (index) => {
        if (wrapperRef.current && comments.length > 0) {
            const itemWidth = wrapperRef.current.offsetWidth;
            wrapperRef.current.scrollTo({
                left: index * itemWidth,
                behavior: 'smooth',
            });
            setCurrentIndex(index);
        }
    };

    useEffect(() => {
        const wrapper = wrapperRef.current;
        if (!wrapper || comments.length <= 1) return;

        // Update counter on manual scrollmousemove
        const handleScroll = () => {
            const scrollLeft = wrapper.scrollLeft;
            const itemWidth = wrapper.offsetWidth;
            const newIndex = Math.round(scrollLeft / itemWidth);
            setCurrentIndex(newIndex);
            setIsInteracting(true);
            // Reset interaction after 3 seconds
            clearTimeout(interactionTimeoutRef.current);
            interactionTimeoutRef.current = setTimeout(() => setIsInteracting(false), 3000);
        };

        // Handle mouse wheel scrolling
        const handleWheel = (event) => {
            event.preventDefault();
            wrapper.scrollLeft += event.deltaY;
            setIsInteracting(true);
            clearTimeout(interactionTimeoutRef.current);
            interactionTimeoutRef.current = setTimeout(() => setIsInteracting(false), 3000);
        };

        // Pause auto-scroll on mouse enter
        const handleMouseEnter = () => {
            setIsInteracting(true);
        };

        // Resume auto-scroll on mouse leave
        const handleMouseLeave = () => {
            setIsInteracting(false);
        };

        // Auto-scroll every 3 seconds
        let autoScrollInterval;
        if (!isInteracting) {
            autoScrollInterval = setInterval(() => {
                const nextIndex = currentIndex < comments.length - 1 ? currentIndex + 1 : 0;
                scrollToIndex(nextIndex);
            }, 3000); // 3 seconds
        }

        wrapper.addEventListener('scroll', handleScroll);
        wrapper.addEventListener('wheel', handleWheel, { passive: false });
        wrapper.addEventListener('mouseenter', handleMouseEnter);
        wrapper.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            wrapper.removeEventListener('scroll', handleScroll);
            wrapper.removeEventListener('wheel', handleWheel);
            wrapper.removeEventListener('mouseenter', handleMouseEnter);
            wrapper.removeEventListener('mouseleave', handleMouseLeave);
            clearInterval(autoScrollInterval);
            clearTimeout(interactionTimeoutRef.current);
        };
    }, [comments.length, currentIndex, isInteracting]);

    return (
        <div className={styles['carousel-container']}>
            <div className={styles['comments-wrapper']} ref={wrapperRef}>
                {comments.length > 0 ? (
                    comments.map((comment, cIndex) => {
                        // Find the user matching comment.commentedBy
                        const user = users.find((user) => user.uid === comment.commentedBy);
                        return (
                            <div key={cIndex} className={styles['comment-item']}>
                                {/*<img src={comment_green} alt="Comment"/>*/}
                                {user ? (
                                    <img
                                        src={user.uImg}
                                        alt={comment.commentedBy}
                                        className={styles['comment-user-img']}
                                    />
                                ) : (
                                    <span className={styles['comment-user']}>{comment.commentedBy}</span>
                                )}
                                <span className={styles['comment-text']}>{comment.commentContent}</span>
                                <span className={styles['comment-timestamp']}>
                  {getTimeElapsed(comment.createdAt)}
                </span>
                            </div>
                        );
                    })
                ) : (
                    <p className={styles['no-comments']}>No comments to display</p>
                )}
            </div>
            {comments.length > 0 && (
                <div className={styles['carousel-counter']}>
                    {currentIndex + 1}/{comments.length}
                </div>
            )}
        </div>
    );
};

const FileOverview = () => {
    const [files, setFiles] = useState([]);
    const [editingIndex, setEditingIndex] = useState(null);
    const [commentIndex, setCommentIndex] = useState(null); // Track which file's comment input is active
    const [commentText, setCommentText] = useState({commentContent: '', commentedBy: "userid3", createdAt: ''}); // Temporary comment object
    const [currentUser, setCurrentUser] = useState('User1'); // Simulated current user
    const fileInputRef = useRef(null);

    // Handle file input change
    const handleFileChange = (event) => {
        const selectedFiles = Array.from(event.target.files);
        const newFiles = selectedFiles.map(file => ({
            name: file.name,
            size: (file.size / 1024).toFixed(2) + ' KB',
            type: file.type.split('/')[1].toUpperCase() || 'UNKNOWN',
            uploadedBy : `userid${Math.floor(Math.random() * 4) + 1}`,
            comments: [], // Array to store multiple comments
        }));
        setFiles(prevFiles => [...prevFiles, ...newFiles]);
        event.target.value = null; // Reset file input
    };

    // Handle name edit
    const handleNameEdit = (index) => {
        setEditingIndex(index);
    };

    // Save edited name
    const handleNameChange = (e, index) => {
        const updatedFiles = [...files];
        updatedFiles[index].name = e.target.value;
        setFiles(updatedFiles);
    };

    // Finish editing name
    const handleNameBlur = () => {
        setEditingIndex(null);
    };

    // Toggle comment input and set initial text
    const handleCommentClick = (index) => {
        setCommentIndex(commentIndex === index ? null : index);
        setCommentText({ commentContent: '', commentedBy: "userid3", createdAt: new Date().toISOString() });
    };

    // Send (save) comment
    const handleSendComment = (index) => {
        if (commentText.commentContent.trim()) {
            const updatedFiles = [...files];
            updatedFiles[index].comments.push({
                ...commentText,
                createdAt: new Date().toISOString(), // Ensure fresh timestamp
            });
            setFiles(updatedFiles);
            setCommentIndex(null); // Hide input after sending
            setCommentText({ commentContent: '', commentedBy: currentUser, createdAt: '' }); // Clear temporary comment
        }
    };

    // Handle comment content change
    const handleCommentContentChange = (e) => {
        setCommentText(prev => ({ ...prev, commentContent: e.target.value }));
    };

    // Remove file
    const removeFile = (index) => {
        setFiles(files.filter((_, i) => i !== index));
        if (commentIndex === index) {
            setCommentIndex(null);
            setCommentText({ commentContent: '', commentedBy: currentUser, createdAt: '' });
        }
    };

    // Trigger file input click when ADD button is clicked
    const handleAddClick = () => {
        fileInputRef.current.click();
    };

    return (
        <div className={styles['menu-overview-content-wrapper']}>
            <div className={styles['pjt-content-menu-overview-bar']}>
                <div className={styles['menu-overview-bar-flex-item']}>
                    <div className={styles['menu-details-pill']}>
                        <p className={styles['menu-detail-heading']}>Your Attachments</p>
                        <p className={styles['menu-counter']}>{files.length}</p>
                    </div>
                </div>
                <div className={styles['menu-overview-bar-flex-item']}>
                    <div className={styles['header-actions']}>
                        <button className={styles['add-button']} onClick={handleAddClick}>
                            <img src={add}/>
                            <p>Upload File</p>
                        </button>
                    </div>
                </div>
            </div>
            <div className={styles['file-list']}>
                {files.length > 0 ? (
                    files.map((file, index) => {

                        const user = users.find((user) => user.uid === file.uploadedBy);

                        return(<div key={index} className={styles['file-item']}>

                            <div className={styles['file-header']}>
                                <div className={styles['file-item-flex']}>
                                    <div className={styles['file-info']}>
                                        <img src={fileIcon} className={styles['file-icon']}/>
                                        <div className={styles['file-details']}>
                                            {editingIndex === index ? (
                                                <input
                                                    type="text"
                                                    value={file.name}
                                                    onChange={(e) => handleNameChange(e, index)}
                                                    onBlur={handleNameBlur}
                                                    className={styles['edit-name-input']}
                                                    autoFocus
                                                />
                                            ) : (
                                                <p className={styles['file-name']}
                                                   onClick={() => handleNameEdit(index)}>
                                                    {file.name}
                                                </p>
                                            )}
                                            <p className={styles['file-meta']}>
                                                <p className={styles['file-size']}>
                                                    {file.size}
                                                </p>
                                                <p className={styles['file-type']}>
                                                    {file.type}
                                                </p>
                                            </p>

                                        </div>
                                    </div>
                                    <div className={styles['file-upload-details']}>
                                        <p>File has been uploaded by <span>{user?.uName}</span></p>
                                    </div>
                                </div>
                                <div className={styles['file-item-flex']}>
                                    <img
                                        src={comment_green}
                                        onClick={() => {
                                            handleCommentClick(index)
                                        }}
                                        className={styles['comment-button']}/>

                                    <button className={styles['remove-button']} onClick={() => removeFile(index)}>
                                        ⋮
                                    </button>
                                </div>
                            </div>


                            <div className={styles['file-footer']}>
                                {file.comments.length >0 &&
                                    <CommentBurger comments={file.comments}/>
                                }

                                {commentIndex === index && (
                                    <div className={styles['comment-section']}>
                                        <input
                                            type="text"
                                            value={commentText.commentContent}
                                            onChange={handleCommentContentChange}
                                            className={styles['file-comment-input']}
                                            placeholder="Add a comment..."
                                            autoFocus
                                        />
                                        <button
                                            className={styles['send-comment-button']}
                                            onClick={() => handleSendComment(index)}
                                        >
                                            Send
                                        </button>
                                    </div>
                                )}
                            </div>

                        </div>)})
                ) : (
                    <p className={styles['no-files']}>No files uploaded</p>
                )}
            </div>
            <input
                type="file"
                multiple
                onChange={handleFileChange}
                className={styles['file-input']}
                ref={fileInputRef}
            />
        </div>
    );
};

const renderMenuOptions = (activeItem) => {
    switch (activeItem) {
        case 'Tasks':
            return (
                <>
                </>
            );
        case 'Files & Attachments':
            return (
                <>
                    <button className={styles['menu-button']}>
                        Add File
                    </button>
                    <button className={styles['menu-button']}>
                        Sort By
                    </button>
                </>
            );
        case 'Meetings':
            return (
                <>
                    <button className={styles['menu-button']} onClick={() => {/* Handle Create Meeting */
                    }}>
                        Create Meeting
                    </button>
                </>
            );
        default:
            return null;
    }
};



const IssueBurger = ({ issueList = [], raisedIssues = [] }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isInteracting, setIsInteracting] = useState(false);
    const wrapperRef = useRef(null);
    const interactionTimeoutRef = useRef(null);

    const issues = raisedIssues.filter((issue) => issueList.includes(issue._id));

    const scrollToIndex = (index) => {
        if (wrapperRef.current && issues.length > 0) {
            const itemWidth = wrapperRef.current.offsetWidth;
            wrapperRef.current.scrollTo({
                left: index * itemWidth,
                behavior: 'smooth',
            });
            setCurrentIndex(index);
        }
    };

    useEffect(() => {
        const wrapper = wrapperRef.current;
        if (!wrapper || issues.length <= 1) return;

        const handleScroll = () => {
            const scrollLeft = wrapper.scrollLeft;
            const itemWidth = wrapper.offsetWidth;
            const newIndex = Math.round(scrollLeft / itemWidth);
            setCurrentIndex(newIndex);
            setIsInteracting(true);
            clearTimeout(interactionTimeoutRef.current);
            interactionTimeoutRef.current = setTimeout(() => setIsInteracting(false), 3000);
        };

        const handleWheel = (event) => {
            event.preventDefault();
            wrapper.scrollLeft += event.deltaY;
            setIsInteracting(true);
            clearTimeout(interactionTimeoutRef.current);
            interactionTimeoutRef.current = setTimeout(() => setIsInteracting(false), 3000);
        };

        const handleMouseEnter = () => setIsInteracting(true);
        const handleMouseLeave = () => setIsInteracting(false);

        let autoScrollInterval;
        if (!isInteracting) {
            autoScrollInterval = setInterval(() => {
                const nextIndex = currentIndex < issues.length - 1 ? currentIndex + 1 : 0;
                scrollToIndex(nextIndex);
            }, 3000);
        }

        wrapper.addEventListener('scroll', handleScroll);
        wrapper.addEventListener('wheel', handleWheel, { passive: false });
        wrapper.addEventListener('mouseenter', handleMouseEnter);
        wrapper.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            wrapper.removeEventListener('scroll', handleScroll);
            wrapper.removeEventListener('wheel', handleWheel);
            wrapper.removeEventListener('mouseenter', handleMouseEnter);
            wrapper.removeEventListener('mouseleave', handleMouseLeave);
            clearInterval(autoScrollInterval);
            clearTimeout(interactionTimeoutRef.current);
        };
    }, [issues.length, currentIndex, isInteracting]);



    return (
        <div className={styles['carousel-container']}>
            <div className={styles['issue-burger-wrapper']} ref={wrapperRef}>
                {issues.length > 0 ? (
                    issues.map((issue) => (
                        <div key={issue._id} className={styles['issue-item']}>
                            <img src={alert} alt="Alert"/>
                            <p>
                                <span>Issue encountered - </span>
                                <p>{issue.title}</p>
                            </p>
                            <span className={styles['issue-time']}>{getTimeElapsed(issue.createdAt)}</span>
                        </div>
                    ))
                ) : (
                    <div></div>
                )}
            </div>
            {issues.length > 0 && (
                <div className={styles['carousel-counter']}>
                    {currentIndex + 1}/{issues.length}
                </div>
            )}
        </div>
    );
};





const BASE_URL = "http://localhost:5001";

const TasksOverview = ({ projectId }) => {
    const [tasks, setTasks] = useState([]);
    const [issuesMap, setIssuesMap] = useState({});
    const [userMap, setUserMap] = useState({});

    useEffect(() => {
        if (projectId) {
            fetchTasks(projectId);
        }
    }, [projectId]);

    const fetchTasks = async (projectId) => {
        try {
            const res = await fetch(`${BASE_URL}/api/v1/tasks/project/${projectId}`);
            if (!res.ok) throw new Error("Failed to fetch tasks");
            const data = await res.json();
            setTasks(data);
        } catch (err) {
            console.error(err.message);
        }
    };

    useEffect(() => {
        if (!tasks || tasks.length === 0) return;

        const issueIds = [...new Set(tasks.flatMap(task => task.issues || []))];
        const userIds = [...new Set(tasks.map(task => task.assignedTo).filter(Boolean))];

        if (issueIds.length) fetchIssues(issueIds);
        if (userIds.length) fetchUsers(userIds);
    }, [tasks]);

    const fetchIssues = async (ids) => {
        try {
            const { data } = await axios.post(`${BASE_URL}/api/v1/issues/bulk`, { ids });
            setIssuesMap(data.reduce((acc, issue) => ({ ...acc, [issue._id]: issue }), {}));
        } catch (err) {
            console.error("Error fetching issues:", err);
        }
    };

    const fetchUsers = async (ids) => {
        try {
            const { data } = await axios.get(`${BASE_URL}/api/v1/users/`, { ids });
            setUserMap(data.reduce((acc, user) => ({ ...acc, [user._id]: user }), {}));
        } catch (err) {
            console.error("Error fetching users:", err);
        }
    };

    const getAssigneeDetails = (userId) => {
        const user = userMap[userId];
        if (!user) return { name: 'Unassigned', initials: 'NA', img: null };

        const initials = user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'NA';
        return { name: user.name || 'No Name', initials, img: user.picture || null };
    };

    return (
        <div className={styles['menu-overview-content-wrapper']}>
            <div className={styles['pjt-content-menu-overview-bar']}>
                <div className={styles['menu-overview-bar-flex-item']}>
                    <p>Tasks Summary</p>
                    <p>{tasks.length}</p>
                </div>
            </div>

            <div className={styles['pjt-content-menu-items-overflow']}>
                {tasks.map((task) => {
                    const { name, initials, img } = getAssigneeDetails(task.assignedTo);
                    return (
                        <div key={task._id} className={styles['task-item']}>
                            {task.issues?.length > 0 && (
                                <div className={styles['task-issue-burger']}>
                                    <IssueBurger
                                        issueList={task.issues}
                                        raisedIssues={Object.values(issuesMap)}
                                    />
                                </div>
                            )}

                            {/* Header */}
                            <div className={styles['task-item-header']}>
                                <div className={`${styles['task-item-flex']} ${styles['task-item-flex-left']}`}>
                                    <img className={styles['task-item-icon']} src={statusIcon[task.status?.toLowerCase()]}/>
                                </div>
                                <div className={styles['task-item-flex']}>
                                    <p>{task.title}<span>{task.status}</span></p>
                                    <p>{task.description}</p>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className={styles['task-item-footer']}>
                                <div className={styles['task-item-footer-flex-item']}>
                                    {/* Assigned */}
                                    <div className={styles['task-property-capsule']}>
                                        <p>Assigned To</p>
                                        <div className={styles['task-property-pill']}>
                                            <div className={styles['task-assigned-img']}>
                                                {img ? <img src={img} alt="Profile" /> : <p>{initials}</p>}
                                            </div>
                                            <p>{name}</p>
                                        </div>
                                    </div>

                                    {/* Priority */}
                                    <div className={styles['task-property-capsule']}>
                                        <p>Priority</p>
                                        <div className={styles['task-property-pill']}>
                                            <Towers signal={getSignalFromPriority(task.priority.toLowerCase())}/>
                                            <p>{task.priority}</p>
                                        </div>
                                    </div>

                                    {/* Due Date */}
                                    <div className={styles['task-property-capsule']}>
                                        <p>Due Date</p>
                                        <div className={styles['task-property-pill']}>
                                            <img src={calendar} />
                                            <p>{formatFullDate(task.dueDate)}</p>
                                        </div>
                                    </div>

                                    {/* Status */}
                                    <div className={styles['task-property-capsule']}>
                                        <p>Status</p>
                                        <div className={styles['task-property-pill']}>
                                            <img src={statusIcon[task.status?.toLowerCase()]}/>
                                            <p>{task.status}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Counts */}
                                <div className={styles['task-item-footer-flex-item']}>
                                    {[
                                        { icon: attachnent, value: task.attachments?.length || 0 },
                                        { icon: comment, value: task.comments?.length || 0 },
                                        { icon: alert, value: task.issues?.length || 0 }
                                    ].map(({ icon, value }, i) => (
                                        <div key={i} className={styles['task-property-capsule']}>
                                            <div className={styles['task-property-pill']}>
                                                <img src={icon} />
                                                <p>{value}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export const AiOverlay = ({ user, handleClose }) => {
    const [messages, setMessages] = useState([
        { sender: 'kairo', text: 'Hello! I am Kairo. How can I assist you today?' }
    ]);
    const [input, setInput] = useState('');
    const bottomRef = useRef(null);
    const picture = user.picture;

    const userId = localStorage.getItem("nuid");

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');

        // Add thinking message
        setMessages(prev => [...prev, { sender: 'kairo', text: '💬 Thinking...' }]);

        try {
            const response = await axios.post('http://localhost:5001/api/v1/comm/chat/ai/message', {
                message: input,
                userId : userId
            });

            const data = response.data;

            // Remove "Thinking..." message
            setMessages(prev => prev.slice(0, -1));

            let reply = "Okay!";
            if (data?.success) {
                switch (data?.type) {
                    case 'fallback':
                        reply = data.message || "I'm not sure how to help with that.";
                        break;

                    case 'ask-required':
                        reply = `📝 I need a few more details: ${data?.missingFields?.join(', ')}`;
                        break;

                    case 'intent-handled':
                        reply = data.message || "✅ Done!";
                        break;

                    default:
                        reply = data.message || "Understood.";
                }
            } else {
                reply = data?.message || "Something went wrong with the AI response.";
            }

            setMessages(prev => [...prev, { sender: 'kairo', text: reply }]);
        } catch (err) {
            // Remove "Thinking..." message
            setMessages(prev => prev.slice(0, -1));

            setMessages(prev => [...prev, {
                sender: 'kairo',
                text: '❌ Sorry, I had trouble reaching the AI server.'
            }]);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleSend();
    };

    return (
        <section className={styles['ai-overlay-wrapper']}>
            <section className={styles['ai-chatterbox-wrapper-i']}>
                {/* Header */}
                <div className={styles['ai-chatterbox-header']}>
                    <div className={styles['chatterbox-header-capsule']}>
                        <img src={kairo} alt="Kairo" />
                        <div className={styles['chatterbox-text-wrapper']}>
                            <p>Kairo.ai</p>
                            <p>Nebula Intelligent Agent</p>
                        </div>
                    </div>
                    <img onClick={handleClose} className={styles['closer-button']} src={close} />
                </div>

                {/* Conversation */}
                <div className={styles['ai-chatterbox-conversation-wrapper']}>
                    <div className={styles['message-parent-wrapper']}>
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`${styles['message']} ${styles[msg.sender]}`}
                            >
                                <div className={styles['message-left']}>
                                    <img src={msg.sender === "kairo" ? kairo : picture} />
                                </div>
                                <div className={styles['message-right']}>
                                    <p>{msg.text}</p>
                                </div>
                            </div>
                        ))}
                        <div ref={bottomRef} />
                    </div>
                </div>

                {/* Footer */}
                <div className={styles['ai-chatterbox-footer']}>
                    <div className={styles['chatterbox-input-wrapper']}>
                        <input
                            placeholder="Type your message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                        />
                        <div className={styles['send-button-wrapper']} onClick={handleSend}>
                            <img src={send} alt="Send" />
                        </div>
                    </div>
                </div>
            </section>
        </section>
    );
};
const Dashboard = ({}) => {
    const inputRef = useRef(null); // Reference to the input element
    const [showAppCenter, setShowAppCenter] = useState(false);
    const [fav, setFav] = useState(star_nofav);
    let isFav = false;
    const toggleFav = () => {
        console.log("Is fav", isFav)
        if (isFav) {
            setFav(star_fav)
        } else {
            setFav(star_nofav)
        }
        isFav = !isFav;
    }

    useEffect(() => {
        const handleKeyPress = (event) => {
            if (inputRef.current.value === "") {
                if (event.key === 's' || event.key === 'S') {
                    event.preventDefault(); // Prevent "s" from being typed
                    inputRef.current.focus(); // Focus the input
                    inputRef.current.value = ""; // Clear the input content
                }
            }
        };

        // Add event listener
        window.addEventListener('keydown', handleKeyPress);

        // Cleanup event listener on unmount
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, []); // Empty dependency array for one-time setup

    const project = projects[0]; // Assuming focus on the first project
    const creator = users.find(user => user.uid === project.creatorId);
    const participants = project.participant.map(uid => users.find(user => user.uid === uid)).filter(user => user);


    const menuItem = [
        "Details",
        "Tasks",
        "Milestones",
        "Files & Attachments",
        "Team Members",
        "Meetings"
    ]

    const [activeItem, setActiveItem] = useState("Tasks");
    const renderRightSidebarContent = () => {
        switch (activeItem) {
            case "Tasks":
                return (
                    <>
                        <TaskCharts />
                        <ActivityLogger />
                    </>
                );

            case "meeting":
                return (
                    <>

                    </>
                );

            case "files":
                return (
                    <>

                    </>
                );

            // Add more cases as needed

            default:
                return null;
        }
    };

    const [taskData , setTaskData] = useState(null)
    const fetchTasksByProject = async (projectId) => {
        try {
            const response = await fetch(`${BASE_URL}/api/v1/tasks/project/${projectId}`);
            if (!response.ok) {
                throw new Error("Failed to fetch tasks by project ID");
            }

            const data = await response.json();
            setTaskData(data);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };


    const handleOpenModal = () => {
        setMeetingCreatorModalVisible(true)
    }

    const [weeklyTaskData , setWeeklyTaskData] = useState(null)

    const fetchWeeklyTasksByProject = async (projectId) => {
        try {
            const response = await fetch(`${BASE_URL}/api/v1/tasks/project/${projectId}/week`);
            if (!response.ok) {
                throw new Error("Failed to fetch weekly tasks");
            }

            const data = await response.json();
            console.log("Fetched weekly tasks" , data)
            setWeeklyTaskData(data);  // You can change this based on your state naming
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };


    useEffect(() => {
        console.log("Weekly task data", weeklyTaskData)
    }, [weeklyTaskData]);
    const renderOverviewWrapper = () => {
        switch (activeItem) {
            case "Details":
                return <div>Details Content Here</div>;

            case "Tasks":
                return <TasksOverview projectId={"68159219cdb8524689046498"}/>;


            case "Files & Attachments":
                return <FileOverview/>;

            case "Meetings" :
                return <MeetingOverview project = {projectData} userId = {userId} onOpenModal={handleOpenModal}/>
            default:
                return <div>Default Content Here</div>;
        }
    };


    function handleActiveMenuSelection(index) {
        setActiveItem(menuItem[index]);
    }


    const {isAuthenticated} = useAuth();

    function fetchUserData(item) {
        console.log("Fetching the user for the user id" , item )
    }

    if(isAuthenticated)
    {
        fetchUserData(localStorage.getItem("nuid"));
    }
    const workspaceId = "6814f81f58db016aa57682b9";
    const [workspaceData, setWorkspaceData] = useState(null);
    const [projectData, setProjectData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const BASE_URL = "http://localhost:5001"

    useEffect(() => {
    }, [workspaceData]);

    // Function to fetch workspace data
    const fetchWorkspaceData = async (workspaceId) => {
        try {
            // Make the API request to fetch workspace data
            const response = await fetch(`${BASE_URL}/api/v1/workspaces/${workspaceId}`);
            if (!response.ok) {
                throw new Error("Failed to fetch data");
            }

            // Parse the response JSON
            const data = await response.json();

            // Update the state with the fetched data
            setWorkspaceData(data);
            setLoading(false); // Update loading state to false
        } catch (err) {
            // Handle errors
            setError(err.message);
            setLoading(false);
        }
    };




    // Function to fetch a specific project by its ID
    async function getProjectById(projectId) {
        try {
            console.log("Trying to fetch for project , here is error" , projectId)
            const response = await fetch(`${BASE_URL}/api/v1/projects/${projectId}`);

            // Check if the response is ok (status code 200-299)
            if (!response.ok) {
                throw new Error("Failed to fetch project");
            }

            // Parse the JSON data
            const projectData = await response.json();
            setProjectData(projectData)

            // Do something with the project (e.g., display it in the UI)
        } catch (error) {
            console.error("Error fetching project:", error);
        }
    }


    useEffect(() => {
        console.log("Task Data" ,taskData)
    }, [taskData]);

    useEffect(() => {
        getProjectById("68159219cdb8524689046498")
        fetchWorkspaceData(workspaceId);
        fetchTasksByProject("68159219cdb8524689046498")
        fetchWeeklyTasksByProject("68159219cdb8524689046498")
    }, []); // Dependency array ensures it only runs on mount



    const [isTaskModalVisible , setTaskModalVisible] = useState(false);



    const [user, setUser] = useState(null);
    const userId = localStorage.getItem('nuid');
    console.log("User id " , localStorage.getItem("userId"), "User id one more " , localStorage.getItem("nuid"))


    useEffect(() => {
        if (!userId) {
            setUser(null);
            setError('No user ID found');
            return;
        }

        let isCancelled = false;

        const fetchUser = async () => {
            try {
                const res = await axios.get(`http://localhost:5001/api/v1/users/${userId}`, {
                    headers: { Authorization: `Bearer ${userId}` }, // Use token if required
                });
                if (!isCancelled) {
                    console.log("User", res.data);
                    setUser(res.data.data);
                    setError('');
                }
            } catch (err) {
                if (!isCancelled) {
                    setUser(null);
                    setError('Failed to fetch user');
                    localStorage.removeItem('nuid'); // Clear invalid nuid
                }
            }
        };

        fetchUser();

        return () => {
            isCancelled = true;
        };
    }, [userId]);



    const [isMeetingCreatorModalVisible , setMeetingCreatorModalVisible] = useState(false)

    console.warn("Projects ", projectData)


    const [kairoVisible , setKairoVisible] = useState(false);

    const handleCloseModal = () => {
        setMeetingCreatorModalVisible(false)
    }

    return (
        <section className={styles['page-wrapper']}>
            <SideBar_Proj/>
            {projectData && workspaceData &&
                <div className={`${styles['page-main-wrapper']}`}>
                    <nav className={styles['page-navbar-wrapper']}>
                        <div className={`${styles['navbar-flex-item']} ${styles['navbar-flex-item-left']}`}>
                            <div className={styles['workspace-pill']}>
                                <div className={styles['workspace-pill-img-wrapper']}>
                                    {WorkspaceDetails.img !== null ?
                                        <img className={styles['workspace-pill-img']} src={WorkspaceDetails.img}/> :
                                        <p className={styles['workspace-initials']}>{getInitials(workspaceData?.name)}</p>
                                    }
                                </div>
                                <p className={styles['workspace-pill-name']}>{workspaceData?.name} <span><img
                                    src={downarrow}/> </span></p>
                            </div>
                        </div>
                        <div className={`${styles['navbar-flex-item']} ${styles['navbar-flex-item-left']}`}>
                            <div className={styles['search-bar-capsule']}>
                                <img className={styles['search-icon']} src={search}/>
                                <input
                                    ref={inputRef}
                                    type={"text"}
                                    placeholder={"Search for anything..."}/>
                                <div className={styles['shortcut-wrapper']}>
                                    <p>S</p>
                                </div>
                            </div>
                        </div>

                        {/*<div className={`${styles['navbar-flex-item']} ${styles['navbar-flex-item-left']}`}>*/}

                        {/*</div>*/}
                    </nav>
                    <div className={styles['page-main-content-wrapper']}>
                        <div className={styles['page-main-content-nav-wrapper']}>
                            <div className={styles['page-main-content-nav-item-flex']}>
                                <div className={styles['page-main-content-nav-capsule']}>
                                    <div className={styles['page-main-content-nav-pill']}>
                                        <p>Workspace projects</p>
                                        <img src={downarrow}/>
                                    </div>
                                    <div className={styles['page-main-content-nav-pill']}>
                                        <img src={cube}/>
                                        <p>{projectData?.name}</p>
                                        <img src={downarrow}/>
                                        <img
                                            onClick={() => {
                                                toggleFav()
                                            }}
                                            src={fav}/>
                                    </div>
                                    <div
                                        style={{
                                            marginLeft :10
                                        }}
                                        className={styles['page-main-content-nav-pill']}>
                                        <img src={alert}/>
                                        <p>Raise An Issue</p>
                                    </div>
                                </div>
                            </div>
                            <div className={styles['page-main-content-nav-item-flex']}>
                                <div onClick={()=>{setKairoVisible(true)}} className={styles['page-main-content-nav-pill']}>
                                    <img src={kairo}/>
                                    <p>Ask Kairo</p>
                                </div>
                            </div>
                        </div>
                        <div className={styles['page-main-content-children-wrapper']}>
                            <div className={styles['main-content-children-flex-item']}>
                                <div className={styles['main-content-children-flex-left-header']}>
                                    <div className={styles['notification-wrapper']}>
                                        <img src={bolt}/>
                                        <p>Your Free Business Trial is Ending in Just 7 Days – Don’t Miss Out on Continued Access </p>
                                    </div>
                                </div>
                                <div className={styles['main-content-children-flex-left-content']}>
                                    <div className={styles['main-content-pjt-header']}>
                                        <div className={styles['pjt-header-capsule-top-right']}>
                                            <div className={styles['pjt-header-last-update-wrapper']}>
                                                <div className={styles['live']}/>
                                                <p><span>Last Updated </span>{formatFullDate(project.lastUpdated)}</p>
                                            </div>
                                        </div>
                                        <div className={styles['pjt-header-identity-details']}>
                                            <p>{projectData?.name}</p>
                                            <p>{projectData?.description}</p>
                                        </div>

                                        <div className={styles['pjt-header-bottom-wrapper']}>

                                        </div>

                                        <div className={styles['project-overview-content-header-bottom-wrapper']}>

                                            <div className={styles['header-bottom-capsule']}>
                                                <div className={styles['header-bottom-capsule-pill']}>
                                                    <div className={styles['header-bottom-capsule-pill-title']}>Budget
                                                    </div>
                                                    <p className={`${styles['header-bottom-capsule-pill-value']} ${styles['header-bottom-capsule-pill-budget']}`}>$
                                                        25,000 🔥</p>
                                                </div>
                                                <div className={styles['header-bottom-capsule-pill']}>
                                                    <div
                                                        className={styles['header-bottom-capsule-pill-title']}>Location
                                                    </div>
                                                    <p className={styles['header-bottom-capsule-pill-value']}>San
                                                        Francisco, USA</p>
                                                </div>

                                                <div className={styles['header-bottom-capsule-pill']}>
                                                    <div
                                                        className={styles['header-bottom-capsule-pill-title']}>Currency
                                                    </div>
                                                    <p className={styles['header-bottom-capsule-pill-value']}>US
                                                        Dollars</p>
                                                </div>


                                                {/*<div className={styles['header-bottom-capsule-pill']}>*/}
                                                {/*    <div*/}
                                                {/*        className={styles['header-bottom-capsule-pill-title']}>Progress*/}
                                                {/*    </div>*/}
                                                {/*    <div className={styles['header-bottom-capsule-progress-wrapper']}>*/}
                                                {/*        <div className={styles['header-bottom-capsule-progress']}/>*/}
                                                {/*        <span>30%</span>*/}
                                                {/*    </div>*/}
                                                {/*</div>*/}

                                            </div>


                                            <div className={styles['header-bottom-capsule']}>

                                            </div>

                                            {/*<div className={styles['header-bottom-capsule']}>*/}
                                            {/*    <div onClick={() => console.log("Retrieving project...")}*/}
                                            {/*         className={styles['header-bottom-pill-resync']}>*/}
                                            {/*    <img src={more}/>*/}
                                            {/*    </div>*/}
                                            {/*    <div onClick={() => console.log("Add participants")}*/}
                                            {/*         className={styles['header-bottom-pill-invite']}>*/}
                                            {/*        <img src={plus}/>*/}
                                            {/*        <p className={styles['header-bottom-pill-invite-text']}>ADD MEMBERS</p>*/}
                                            {/*    </div>*/}
                                            {/*    <div className={styles['header-bottom-pill-more']}>*/}
                                            {/*        <img src={resync}/>*/}
                                            {/*    </div>*/}
                                            {/*</div>*/}
                                        </div>

                                    </div>
                                    <div onClick={() => {
                                        setKairoVisible(false)
                                    }} className={styles['main-content-pjt-content']}>
                                        <div className={styles['pjt-content-menu-wrapper']}>
                                            {menuItem.map((menu, index) => (
                                                <div
                                                    key={index}
                                                    onClick={() => {
                                                        handleActiveMenuSelection(index)
                                                    }}
                                                    className={`${styles['pjt-menu-item']} ${menu === activeItem ? styles['active'] : ''}`}
                                                >
                                                    {menu}
                                                </div>
                                            ))}
                                        </div>
                                        {renderOverviewWrapper()}
                                    </div>
                                </div>
                            </div>
                            <div
                                className={`${styles['main-content-children-flex-item']} ${styles['main-content-children-flex-item-side']}`}>
                                {renderRightSidebarContent()}
                            </div>
                        </div>
                    </div>
                </div>
            }


            {kairoVisible && <AiOverlay user={user}/>}


            {showAppCenter && (
                <AppCenter onClose={() => setShowAppCenter(false)} />
            )}
            {/*<AppCenter onClose={() => setShowAppCenter(false)} />*/}

            {isMeetingCreatorModalVisible
                &&  <MeetingCreatorModal project={projectData} teamMembers={projectData?.teamMembers || []} onClose = {handleCloseModal} />
            }


        </section>
    )
}

export default Dashboard