import React, { useEffect, useRef, useState } from "react";
import styles from "./TaskModal.module.css";
import { getUserNameAndImageById } from "../../service/User/UserFetcher";
import { Towers } from "../../views/Dashboard/Dashboard";
import inprogress from "../../images/icons/inprogress_icon.svg";
import flag from "../../images/icons/flag.svg";
import search from "../../images/icons/search.svg";
import check from "../../images/icons/check.svg";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { formatFullDateUTC, formatMonthDayUTC } from "../../utils/datetime";
import drag from "../../images/icons/grab.svg";
import { v4 as uuidv4 } from "uuid";
import upload from "../../images/icons/upload.svg";



//  Comment Images
import lines from "../../images/icons/lines.svg"

import bold from "../../images/icons/bold.svg"
import italic from "../../images/icons/italic.svg"
import underline from "../../images/icons/underline.svg"
import attachment from "../../images/icons/attachment.svg"
import image from "../../images/icons/image.svg"
import emoji from "../../images/icons/emoji1.svg"
import at from "../../images/icons/at.svg"
import like from "../../images/icons/like.svg"
import dislike from "../../images/icons/dislike.svg"


import dot from "../../images/icons/dotmenu.svg"
import heart_like from "../../images/icons/heart_liked.svg"
import heart from "../../images/icons/like.svg"
import reminder from "../../images/icons/reminder.svg"
import minimize from "../../images/icons/minimize.svg"

const CommentEditor = ({ onSubmit }) => {
    const editorRef = useRef(null);
    const [html, setHtml] = useState('');

    const format = (command) => {
        document.execCommand(command, false, null);
        editorRef.current.focus();
    };

    const handleEmojiInsert = (emoji) => {
        document.execCommand('insertText', false, emoji);
        editorRef.current.focus();
    };

    const handleInput = () => {
        setHtml(editorRef.current.innerHTML);
    };

    const handleSubmit = () => {
        if (html.trim() !== '') {
            onSubmit(html);
            editorRef.current.innerHTML = '';
            setHtml('');
        }
    };

    return (
        <div className={styles.editorWrapper}>
            <div className={styles.toolbar}>
                <button onClick={() => format('bold')}><b>B</b></button>
                <button onClick={() => format('italic')}><i>I</i></button>
                <button onClick={() => format('underline')}><u>U</u></button>
                <button onClick={() => handleEmojiInsert('😊')}>😊</button>
                <button onClick={() => handleEmojiInsert('🔥')}>🔥</button>
            </div>
            <div
                className={styles.editor}
                contentEditable
                ref={editorRef}
                onInput={handleInput}
                placeholder="Write a comment..."
                suppressContentEditableWarning={true}
            />
            <button onClick={handleSubmit} className={styles.submitBtn}>Submit</button>
        </div>
    );
};

const SubtaskList = ({ subtasks, setSubtasks }) => {
    const handleDragEnd = (result) => {
        if (!result.destination) return;
        const items = Array.from(subtasks);
        const [reordered] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reordered);
        setSubtasks(items);
    };

    const toggleComplete = (index) => {
        const updated = [...subtasks];
        updated[index].completed = !updated[index].completed;
        setSubtasks(updated);
    };

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <div className={styles["search-panel"]}>
                <div className={styles["search-panel-i"]}>
                    <img src={search} alt="search" />
                    <input placeholder={"Search"} />
                </div>
                <div className={styles["search-panel-i"]}></div>
            </div>
            <Droppable droppableId="subtasks">
                {(provided) => (
                    <div className={styles["subtasks-list"]} {...provided.droppableProps} ref={provided.innerRef}>
                        {subtasks.map((subtask, index) => {
                            const isChecked = subtask.completed;
                            return (
                                <Draggable key={subtask.id} draggableId={String(subtask.id)} index={index}>
                                    {(provided) => (
                                        <div className={styles["subtask-card"]} ref={provided.innerRef} {...provided.draggableProps}>
                                            <div className={styles["subtask-row"]}>
                                                <div className={styles["subtask-title-row"]}>
                                                    <div className={styles["subtask-title-row-left"]}>
                                                        <div {...provided.dragHandleProps} className={styles["drag-handle"]} title="Drag to reorder">
                                                            <img src={drag} alt="drag" />
                                                        </div>
                                                        <div className={`${styles["checkbox"]} ${isChecked ? styles["tick"] : ""}`} onClick={() => toggleComplete(index)}>
                                                            {isChecked && <img src={check} alt="✓" />}
                                                        </div>
                                                        <p className={`${styles["subtask-title"]} ${isChecked ? styles["subtask-title-checked"] : ""}`}>
                                                            {subtask.title}
                                                        </p>
                                                    </div>
                                                    <p className={styles["subtask-date"]}>{formatMonthDayUTC(subtask.dueDate)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </Draggable>
                            );
                        })}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </DragDropContext>
    );
};


const FileAttachmentList = () => {
    const [files, setFiles] = useState([]);
    const [pendingFiles, setPendingFiles] = useState([]);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(null);
    const inputRef = useRef();

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const droppedFiles = Array.from(e.dataTransfer.files);
        handleIncomingFiles(droppedFiles);
    };

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        handleIncomingFiles(selectedFiles);
    };

    const handleIncomingFiles = (fileList) => {
        const pending = fileList.map((file) => ({
            id: uuidv4(),
            name: file.name,
            size: file.size,
            type: file.type,
            preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
            file,
        }));
        setPendingFiles(pending);
        setShowConfirmModal(true);
    };

    const confirmUpload = () => {
        setFiles((prev) => [...pendingFiles, ...prev]);
        setPendingFiles([]);
        setShowConfirmModal(false);
    };

    const cancelUpload = () => {
        pendingFiles.forEach((file) => {
            if (file.preview) URL.revokeObjectURL(file.preview);
        });
        setPendingFiles([]);
        setShowConfirmModal(false);
    };

    const handleDelete = (id) => {
        const fileToDelete = files.find((f) => f.id === id);
        if (fileToDelete?.preview) URL.revokeObjectURL(fileToDelete.preview);
        setFiles((prev) => prev.filter((f) => f.id !== id));
    };

    const goPrev = () => {
        if (selectedImageIndex !== null) {
            setSelectedImageIndex((prev) => (prev - 1 + files.length) % files.length);
        }
    };

    const goNext = () => {
        if (selectedImageIndex !== null) {
            setSelectedImageIndex((prev) => (prev + 1) % files.length);
        }
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (selectedImageIndex !== null) {
                if (e.key === "ArrowLeft") goPrev();
                if (e.key === "ArrowRight") goNext();
                if (e.key === "Escape") setSelectedImageIndex(null);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectedImageIndex, files.length]);

    return (
        <div className={styles["file-modal-wrapper"]}>
            <div className={styles["search-panel"]}>
                <div className={styles["search-panel-i"]}>
                    <img src={search} alt="search" />
                    <input placeholder="Search" />
                </div>
            </div>

            <div
                className={styles["file-upload-area"]}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => inputRef.current.click()}
            >
                <div className={styles["file-upload-text-content"]}>
                    <div className={styles["file-upload-icon"]}>
                        <img src={upload} alt="upload" />
                    </div>
                    <div className={styles["file-upload-text-wrapper"]}>
                        <p>
                            <span>Click to upload </span>or Drag and drop in this area
                        </p>
                        <p>PNG, JPG, SVG, PDF (Max size 10MB)</p>
                    </div>
                </div>
                <input ref={inputRef} type="file" multiple hidden onChange={handleFileChange} />
            </div>

            <div className={styles["file-list"]}>
                {files.map((file, index) => (
                    <div key={file.id} className={styles["file-card"]}>
                        <div className={styles["file-info"]}>
                            {file.preview && (
                                <img
                                    src={file.preview}
                                    className={styles["file-preview-thumb"]}
                                    alt="preview"
                                    onClick={() => setSelectedImageIndex(index)}
                                />
                            )}
                            <div className={styles["file-details"]}>
                                <p className={styles["file-name"]}>{file.name}</p>
                                <p className={styles["file-size"]}>{(file.size / 1024).toFixed(1)} KB</p>
                            </div>
                        </div>
                        <button className={styles["delete-file-btn"]} onClick={() => handleDelete(file.id)}>
                            ✕
                        </button>
                    </div>
                ))}
            </div>

            {showConfirmModal && (
                <div className={styles["confirm-modal-overlay"]}>
                    <div className={styles["confirm-modal"]}>
                        <div className={styles["confirm-header"]}>
                            <p>Confirm Upload</p>
                            <p>Are you sure you want to upload the following files?</p>
                        </div>
                        <div className={styles["confirm-file-list"]}>
                            {pendingFiles.map((file) => (
                                <div key={file.id} className={styles["confirm-file-card"]}>
                                    {file.preview && (
                                        <img src={file.preview} className={styles["file-preview-thumb"]} alt="preview" />
                                    )}
                                    <div className={styles["file-details"]}>
                                        <p className={styles["file-name"]}>{file.name}</p>
                                        <p className={styles["file-size"]}>{(file.size / 1024).toFixed(1)} KB</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className={styles["confirm-buttons"]}>
                            <button className={styles["confirm-btn"]} onClick={confirmUpload}>
                                Upload
                            </button>
                            <button className={styles["cancel-btn"]} onClick={cancelUpload}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {selectedImageIndex !== null && (
                <div className={styles["gallery-modal-overlay"]} onClick={() => setSelectedImageIndex(null)}>
                    <div className={styles["gallery-modal"]} onClick={(e) => e.stopPropagation()}>
                        <button className={styles["gallery-close-btn"]} onClick={() => setSelectedImageIndex(null)}>✕</button>
                        <div className={styles["gallery-main-image-wrapper"]}>
                            <button onClick={goPrev} className={styles["gallery-nav-btn"]}>←</button>
                            <img
                                src={files[selectedImageIndex]?.preview}
                                alt="Full View"
                                className={styles["gallery-image"]}
                            />
                            <button onClick={goNext} className={styles["gallery-nav-btn"]}>→</button>
                        </div>
                        <div className={styles["gallery-thumbnails"]}>
                            {files.map((file, idx) => (
                                <img
                                    key={file.id}
                                    src={file.preview}
                                    className={`${styles["gallery-thumb"]} ${idx === selectedImageIndex ? styles["active"] : ""}`}
                                    onClick={() => setSelectedImageIndex(idx)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


const initialComments = [
    {
        id: 1,
        author: "Noah Pierre",
        avatar: "https://i.pravatar.cc/150?img=1",
        time: "58 minutes ago",
        text: "I’m a bit unclear about how condensation forms in the water cycle. Can someone break it down?",
        likes: 25,
        dislikes: 3,
        replies: [
            {
                id: 11,
                author: "Skill Sprout",
                avatar: "https://cdn-icons-png.flaticon.com/512/732/732221.png",
                time: "8 minutes ago",
                text: "Condensation happens when water vapor cools down and changes back into liquid droplets. It’s the step before precipitation. The example with the glass of ice water in the video was a great visual!",
                likes: 2,
                dislikes: 0,
                isBrand: true
            }
        ]
    },
    {
        id: 2,
        author: "Mollie Hall",
        avatar: "https://i.pravatar.cc/150?img=5",
        time: "5 hours ago",
        text: "I really enjoyed today’s lesson on the water cycle! The animations made the processes so much easier to grasp.",
        likes: 8,
        dislikes: 2,
        replies: []
    },
    {
        id: 3,
        author: "Lyle Kauffman",
        avatar: "https://i.pravatar.cc/150?img=6",
        time: "1 day ago",
        text: "How do we measure the amount of water vapor in the air? Is it something we’ll cover later?",
        likes: 12,
        dislikes: 0,
        replies: [
            {
                id: 31,
                author: "Amanda Lowery",
                avatar: "https://i.pravatar.cc/150?img=8",
                time: "12 hours ago",
                text: "Yes, I think we’ll dive deeper into that in the next module on humidity. But the short answer is: we measure it using a tool called a hygrometer.",
                likes: 8,
                dislikes: 1
            },
            {
                id: 32,
                author: "Owen Garcia",
                avatar: "https://i.pravatar.cc/150?img=9",
                time: "2 hours ago",
                text: "Exactly! The next lesson will cover humidity, and I’m excited to see how it all connects back to the water cycle.",
                likes: 4,
                dislikes: 0
            }
        ]
    }
];

const CommentThread = () => {
    const [comments, setComments] = useState(initialComments);
    const [replyingTo, setReplyingTo] = useState(null);
    const editorRef = useRef(null);
    const replyRefs = useRef({});

    const format = (command) => {
        document.execCommand(command, false, null);
        editorRef.current?.focus();
    };

    const handleEmojiInsert = (emoji) => {
        document.execCommand("insertText", false, emoji);
        editorRef.current?.focus();
    };

    const handleAddComment = () => {
        const html = editorRef.current.innerHTML;
        if (!html || html === "<br>" || html.trim() === "") return;

        setComments([
            {
                id: Date.now(),
                author: "You",
                avatar: "https://i.pravatar.cc/150?img=50",
                time: "just now",
                text: html,
                likes: 0,
                dislikes: 0,
                replies: []
            },
            ...comments
        ]);
        editorRef.current.innerHTML = "";
    };

    const handleAddReply = (commentId) => {
        const html = replyRefs.current[commentId]?.innerHTML;
        if (!html || html.trim() === "") return;

        const updated = comments.map((c) =>
            c.id === commentId
                ? {
                    ...c,
                    replies: [
                        ...c.replies,
                        {
                            id: Date.now(),
                            author: "You",
                            avatar: "https://i.pravatar.cc/150?img=50",
                            time: "just now",
                            text: html,
                            likes: 0,
                            dislikes: 0
                        }
                    ]
                }
                : c
        );

        setComments(updated);
        setReplyingTo(null);
        if (replyRefs.current[commentId]) replyRefs.current[commentId].innerHTML = "";
    };



    useEffect(() => {
        const editor = editorRef.current;

        const handleInput = () => {
            const text = editor.innerText.trim();
            if (text === "") {
                editor.classList.add(styles.empty);
            } else {
                editor.classList.remove(styles.empty);
            }
        };

        editor.addEventListener("input", handleInput);

        // Initial check
        handleInput();

        return () => {
            editor.removeEventListener("input", handleInput);
        };
    }, []);
    return (
        <div className={styles.container}>


            <div className={styles['comment-zone']}>

                {/*<div className={styles.header}>*/}
                {/*    <h3>Comments</h3>*/}
                {/*    <span className={styles.count}>{comments.length}</span>*/}
                {/*    <div className={styles.sort}>*/}
                {/*        <span>Most recent</span> <span>⬍</span>*/}
                {/*    </div>*/}
                {/*</div>*/}
                <div className={styles['comment-wrapper']}>
                    {comments.map((comment) => (

                        <div className={styles['comment-outer']}>
                            <div key={comment.id} className={styles.comment}>
                                <img className={styles['lines']} src={lines}/>
                                <img className={styles.avatar} src={comment.avatar} alt="User"/>
                                <div className={styles.content}>
                                    <div className={styles.meta}>
                                        <p className={styles.author}>{comment.author}</p>
                                        <p className={styles.time}>{comment.time}</p>
                                    </div>
                                    <div
                                        className={styles["comment-text"]}
                                        dangerouslySetInnerHTML={{__html: comment.text}}
                                    />
                                    <div className={styles.actions}>
                                        <span><img src={like}/> {comment.likes}</span>
                                        <span><img src={dislike}/> {comment.dislikes}</span>
                                        <span className={styles.reply} onClick={() => setReplyingTo(comment.id)}>
                                Reply
                            </span>
                                        <span className={styles.more}>•••</span>
                                    </div>

                                    {replyingTo === comment.id && (
                                        <div className={styles.replyInput}>
                                            <div className={styles.editor} contentEditable
                                                 ref={(el) => (replyRefs.current[comment.id] = el)}/>
                                            <button onClick={() => handleAddReply(comment.id)}>Reply</button>
                                        </div>
                                    )}


                                </div>
                            </div>
                            <div className={styles['reply-boxer']}>
                                <div className={styles['reply-boxer-inner']}>
                                    <img className={styles['lines']} src={lines}/>
                                    {comment.replies.length > 0 &&
                                        comment.replies.map((reply) => (
                                            <div key={reply.id} className={styles.replyBox}>
                                                <img className={styles.avatar} src={reply.avatar} alt="Reply"/>
                                                <div className={styles.content}>
                                                    <div className={styles.meta}>
                                                        <p className={styles.author}>{reply.author}</p>
                                                        <p className={styles.time}>{reply.time}</p>
                                                    </div>
                                                    <div
                                                        className={styles["comment-text"]}
                                                        dangerouslySetInnerHTML={{__html: reply.text}}
                                                    />
                                                    <div className={styles.actions}>
                                                        <span><img src={like}/> {reply.likes}</span>
                                                        <span><img src={dislike}/> {reply.dislikes}</span>
                                                        <span className={styles.reply}>Reply</span>
                                                        <span className={styles.more}>•••</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                </div>

                            </div>

                        </div>

                    ))}

                </div>

            </div>


            <div className={styles.inputBox}>

                <div
                    className={styles.editor}
                    ref={editorRef}
                    contentEditable
                    data-placeholder="Add a comment..."
                    suppressContentEditableWarning
                ></div>
                <div className={styles['comment-editor-footer']}>
                    <div className={styles.toolbar}>
                        <button onClick={() => format("bold")}><img src={bold}/></button>
                        <button onClick={() => format("italic")}><img src={italic}/></button>
                        <button onClick={() => format("underline")}><img src={underline}/></button>
                        <button onClick={() => handleEmojiInsert("😊")}><img src={emoji}/></button>
                        <button><img src={attachment}/></button>
                        <button><img src={image}/></button>
                        <button><img src={at}/></button>

                    </div>
                    <button className={styles.submitBtn} onClick={handleAddComment}>
                        Submit
                    </button>
                </div>

            </div>

        </div>
    );
};

const TaskModal = ({task, setSelectedTask}) => {
    const [demoSubtasks, setDemoSubtasks] = useState([
        {
            id: 1,
            title: "Create detailed user journey documentation including mobile, web, and edge-case interactions",
            dueDate: "2022-01-30T00:00:00Z",
            completed: false,
            comments: [{
                text: "Cover both mobile and web users.",
                author: "Jane",
                picture: "https://i.pravatar.cc/150?img=1"
            }],
            assignees: [{name: "Jane", picture: "https://i.pravatar.cc/150?img=1"}, {
                name: "John",
                picture: "https://i.pravatar.cc/150?img=2"
            }],
        },
        {
            id: 2,
            title: "Review drafted documentation, suggest revisions, and finalize version 1.0 for stakeholder review",
            dueDate: "2022-01-29T00:00:00Z",
            completed: true,
            comments: [],
            assignees: [{name: "Maya", picture: "https://i.pravatar.cc/150?img=3"}],
        },
        {
            id: 3,
            title: "Design mobile-first wireframes that align with updated UI principles and accommodate new workflows",
            dueDate: "2022-02-01T00:00:00Z",
            completed: false,
            comments: [],
            assignees: [{name: "Ali", picture: "https://i.pravatar.cc/150?img=4"}],
        },
        {
            id: 4,
            title: "Develop and finalize UI components for dashboard section including charts, tables, and user widgets",
            dueDate: "2022-02-02T00:00:00Z",
            completed: false,
            comments: [],
            assignees: [{name: "Sara", picture: "https://i.pravatar.cc/150?img=5"}],
        },
        {
            id: 5,
            title: "Connect backend APIs to the new task module and test all edge cases including null and error states",
            dueDate: "2022-02-03T00:00:00Z",
            completed: true,
            comments: [{
                text: "Tested integration works well",
                author: "Dev",
                picture: "https://i.pravatar.cc/150?img=6"
            }],
            assignees: [{name: "Dev", picture: "https://i.pravatar.cc/150?img=6" }],
        },
        {
            id: 6,
            title: "Facilitate user testing sessions, capture insights and pain points, and summarize findings for dev team",
            dueDate: "2022-02-05T00:00:00Z",
            completed: false,
            comments: [],
            assignees: [{ name: "Nina", picture: "https://i.pravatar.cc/150?img=7" }],
        },
        {
            id: 7,
            title: "Debug all critical issues found during QA, focusing on validation bugs and rendering issues on Safari",
            dueDate: "2022-02-06T00:00:00Z",
            completed: false,
            comments: [{ text: "Critical bug in form validation still exists.", author: "QA", picture: "https://i.pravatar.cc/150?img=8" }],
            assignees: [{ name: "Arjun", picture: "https://i.pravatar.cc/150?img=9" }],
        },
        {
            id: 8,
            title: "Audit and optimize all components for faster load times and better performance in low-end devices",
            dueDate: "2022-02-07T00:00:00Z",
            completed: true,
            comments: [],
            assignees: [{ name: "Anya", picture: "https://i.pravatar.cc/150?img=10" }],
        },
        {
            id: 9,
            title: "Prepare a thorough technical documentation package for developer handoff and onboarding purposes",
            dueDate: "2022-02-08T00:00:00Z",
            completed: false,
            comments: [],
            assignees: [{ name: "Liam", picture: "https://i.pravatar.cc/150?img=11" }],
        },
        {
            id: 10,
            title: "Schedule and organize the final product presentation with stakeholders and executive leadership",
            dueDate: "2022-02-09T00:00:00Z",
            completed: false,
            comments: [],
            assignees: [{ name: "Sophie", picture: "https://i.pravatar.cc/150?img=12" }],
        }
    ]);


    const statusMap = {
        in_progress: { label: "In Progress", icon: inprogress },
        pending: { label: "Pending", icon: inprogress },
        backlog: { label: "Backlog", icon: inprogress },
        under_review: { label: "Under Review", icon: inprogress },
        completed: { label: "Completed", icon: inprogress },
        cancelled: { label: "Failed", icon: inprogress },
        blocked: { label: "Blocked", icon: inprogress },
    };

    const taskMap = { low: 1, medium: 2, high: 3, emergency: 4 };
    const [activeMenu, setActiveMenu] = useState("Subtasks");
    const [assignee, setAssignee] = useState(null);

    useEffect(() => {
        const fetchAssignee = async () => {
            if (!task?.assignedTo) return;
            try {
                const { name, picture } = await getUserNameAndImageById(task.assignedTo);
                setAssignee({ name, picture });
            } catch {
                setAssignee({ name: "Unknown", picture: null });
            }
        };
        fetchAssignee();
    }, [task]);

    return (
        <div className={styles["task-overlay-wrapper"]}>
            <div className={styles["task-wrapper"]}>
                <div className={styles['task-header']}>
                    <div className={styles['task-header-i']}>
                        <img onClick={()=>{setSelectedTask(false)}} src={minimize}/>
                    </div>
                    <div className={styles['task-header-i']}>
                        <img src={reminder}/>
                        <img src={heart_like}/>
                        <img src={dot}/>
                    </div>
                </div>
                <div className={styles["task-content-wrapper"]}>
                    <div className={styles["task-detail-wrapper"]}>
                        <p className={styles["task-title"]}>{task.title}</p>
                        <p className={styles["task-desc"]}>{task.description}</p>
                        <div className={styles["task-properties-wrapper"]}>
                            <div className={styles["task-property-capsule"]}>
                                <p className={styles["task-property-pill"]}>Status</p>
                                <div className={styles["task-property-pill-v"]}>
                                    <img src={statusMap[task.status]?.icon} alt="status" />
                                    <p>{statusMap[task.status]?.label || task.status}</p>
                                </div>
                            </div>
                            <div className={styles["task-property-capsule"]}>
                                <p className={styles["task-property-pill"]}>Priority</p>
                                <p className={styles["task-property-pill-v"]}>
                                    <Towers signal={taskMap[task.priority]} /> {task.priority}
                                </p>
                            </div>
                            <div className={styles["task-property-capsule"]}>
                                <p className={styles["task-property-pill"]}>Assignee</p>
                                <div className={styles["task-property-pill-v"]}>
                                    {assignee?.picture && <img src={assignee.picture} className={styles["assignee-avatar"]} alt="avatar" />}
                                    <p>{assignee?.name}</p>
                                </div>
                            </div>
                            <div className={styles["task-property-capsule"]}>
                                <p className={styles["task-property-pill"]}>Deadline</p>
                                <div className={styles["task-property-pill-v"]}>
                                    <img src={flag} alt="deadline" />
                                    <p>{formatFullDateUTC(task.dueDate)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles["task-menu-panel"]}>
                        {[
                            { label: "Subtasks", count: demoSubtasks.length },
                            { label: "Files & Attachments", count: 2 },
                            { label: "Issues", count: 1 },
                            { label: "Comments", count: 5 },
                            { label: "Activity History", count: 4 },
                        ].map(({ label, count }) => (
                            <div
                                key={label}
                                className={`${styles["task-menu-item"]} ${activeMenu === label ? styles["active-menu-item"] : ""}`}
                                onClick={() => setActiveMenu(label)}
                            >
                                <p className={styles["task-menu-label"]}>{label}</p>
                                {activeMenu === label && <p className={styles["task-menu-count"]}>{count}</p>}
                            </div>
                        ))}
                    </div>

                    <div className={styles["task-menu-content-wrapper"]}>
                        {activeMenu === "Subtasks" && <SubtaskList subtasks={demoSubtasks} setSubtasks={setDemoSubtasks} />}
                        {activeMenu === "Files & Attachments" && <FileAttachmentList />}
                        {activeMenu === "Comments" && <CommentThread/>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskModal;