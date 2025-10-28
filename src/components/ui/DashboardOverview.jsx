import React, { useEffect, useState, useRef } from "react";
import styles from "./DashboardOverview.module.css";

// Icons & Images
import allproject from "../../images/icons/allprojects.svg";
import slash from "../../images/icons/slash.svg";
import projecticon from "../../images/icons/project.svg";
import star_fav from "../../images/icons/star-fav.svg";
import star_nofav from "../../images/icons/star-nofav.svg";
import dot from "../../images/icons/dot.svg";
import warning from "../../images/icons/warning.svg";
import triage from "../../images/icons/aitriage.svg";
import kairo from "../../images/logo/kairo.svg";
import gitlab from "../../images/int_icon/hubspot.svg";
import add from "../../images/icons/add.svg";
import sync from "../../images/icons/sync.svg";
import driftIq from "../../images/icons/driftiq.svg";
import driftIq_null from "../../images/icons/driftiq_null.png";
import inprogress from "../../images/icons/inprogress_icon.svg";
import calendar from "../../images/icons/calendar.svg";
import notasks from "../../images/icons/notasks.png";
import updates from "../../images/icons/update.svg";
import highPriority from "../../images/icons/issues_severity/critical.svg";
import right from "../../images/icons/arrow.svg";
import comment_green from "../../images/icons/comment-green.svg";
import fileIcon from "../../images/icons/file.svg";
import googlemeet from "../../images/integration/google_integration/google-meet-icon.svg";
import zoom from "../../images/integration/google_integration/zoom_logo.png";
import clock from "../../images/icons/clock.svg"

import upload from "../../images/icons/upload.svg"

import list from "../../images/icons/list.svg"
import gallery from "../../images/icons/gallery.svg"
import filterImg from "../../images/icons/filter.svg"
import sort from "../../images/icons/sort.svg"

// Hooks & Utils
import useProjectContext from "../../hook/useProjectContext";
import { formatDateTime, formatFullDate, getTimeElapsed } from "../../utils/datetime";

// Services & Components
import { getLatestProjectUpdate } from "../../service/Project/ProjectFetcher";
import SideActionBarTower from "./SideActionBarTower";
import SelectedIntegration from "./AppAddOnModal";
import ProjectSections from "./ProjectSections";
import AppCenter from "./AppCenter";
import TaskCharts from "../../views/TaskCharts";
import { AiOverlay } from "../../views/Dashboard/Dashboard";
import MeetingCreatorModal from "./MeetingCreatorModal";

// -------------------- Clock Icon --------------------
const ClockIcon = ({ width = 24, height = 24, fill = "grey" }) => (
  <svg width={width} height={height} viewBox="0 0 11 13" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M4.86142 0.432902C4.89396 0.576618 4.86809 0.727372 4.78951 0.852021C4.71092 0.976671 4.58606 1.06501 4.44236 1.09762C4.3333 1.12244 4.22521 1.15136 4.11833 1.18433C4.04859 1.20586 3.9753 1.21344 3.90263 1.20665C3.82996 1.19985 3.75934 1.17881 3.6948 1.14472C3.63026 1.11063 3.57307 1.06417 3.52649 1.00798C3.47991 0.951784 3.44485 0.886969 3.42332 0.817229C3.40179 0.74749 3.39421 0.674193 3.401 0.601523C3.4078 0.528852 3.42884 0.458232 3.46293 0.393694C3.49702 0.329156 3.54348 0.271964 3.59967 0.225384C3.65586 0.178804 3.72068 0.143747 3.79042 0.122216C3.92381 0.080717 4.05905 0.0445907 4.19614 0.0138371C4.26734 -0.00235469 4.34104 -0.00435778 4.41301 0.00794208C4.48499 0.0202419 4.55383 0.0466037 4.61562 0.085521C4.6774 0.124438 4.73091 0.175149 4.77308 0.234754C4.81526 0.294359 4.84528 0.361691 4.86142 0.432902Z"
      fill={fill}
    />
  </svg>
);

// -------------------- Helpers --------------------
const getColor = (percentRemaining) => {
  if (percentRemaining >= 70) return "#2ecc71"; // green
  if (percentRemaining >= 40) return "#f1c40f"; // yellow
  if (percentRemaining >= 15) return "#e67e22"; // orange
  return "#e74c3c"; // red
};

const formatTimeRemaining = (daysLeft) => {
  if (daysLeft > 30) return `Plenty of time left – about ${Math.floor(daysLeft / 30)} month(s) remaining.`;
  if (daysLeft > 7) return `You have around ${Math.floor(daysLeft / 7)} week(s) left. Stay on track!`;
  if (daysLeft > 1) return `Just ${daysLeft} days remaining. Wrap up your milestones.`;
  if (daysLeft === 1) return `Only 1 day left. Time to finish strong!`;
  if (daysLeft === 0) return `Deadline is today. Final touches should be wrapping up now.`;
  return `Overdue by ${Math.abs(daysLeft)} day(s). Immediate attention required.`;
};

// -------------------- Project Time Tracker --------------------
const ProjectTimeTracker = ({ startDate, endDate }) => {
  const [percentRemaining, setPercentRemaining] = useState(100);
  const [daysLeft, setDaysLeft] = useState(0);

  useEffect(() => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDuration = end - start;
    const remaining = end - now;
    const percentage = Math.max(0, (remaining / totalDuration) * 100);
    setPercentRemaining(Math.floor(percentage));
    setDaysLeft(Math.ceil(remaining / (1000 * 60 * 60 * 24)));
  }, [startDate, endDate]);

  return (
    <div className={styles["time-remaining-wrapper"]}>
      <ClockIcon fill={getColor(percentRemaining)} />
      <p>{formatTimeRemaining(daysLeft)}</p>
    </div>
  );
};

// -------------------- Comment Burger --------------------
const CommentBurger = ({ comments = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isInteracting, setIsInteracting] = useState(false);
  const wrapperRef = useRef(null);
  const interactionTimeoutRef = useRef(null);

  const scrollToIndex = (index) => {
    if (wrapperRef.current && comments.length > 0) {
      const itemWidth = wrapperRef.current.offsetWidth;
      wrapperRef.current.scrollTo({
        left: index * itemWidth,
        behavior: "smooth",
      });
      setCurrentIndex(index);
    }
  };

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper || comments.length <= 1) return;

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

    const handleMouseEnter = () => {
      setIsInteracting(true);
    };

    const handleMouseLeave = () => {
      setIsInteracting(false);
    };

    let autoScrollInterval;
    if (!isInteracting) {
      autoScrollInterval = setInterval(() => {
        const nextIndex = currentIndex < comments.length - 1 ? currentIndex + 1 : 0;
        scrollToIndex(nextIndex);
      }, 3000);
    }

    wrapper.addEventListener("scroll", handleScroll);
    wrapper.addEventListener("wheel", handleWheel, { passive: false });
    wrapper.addEventListener("mouseenter", handleMouseEnter);
    wrapper.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      wrapper.removeEventListener("scroll", handleScroll);
      wrapper.removeEventListener("wheel", handleWheel);
      wrapper.removeEventListener("mouseenter", handleMouseEnter);
      wrapper.removeEventListener("mouseleave", handleMouseLeave);
      clearInterval(autoScrollInterval);
      clearTimeout(interactionTimeoutRef.current);
    };
  }, [comments.length, currentIndex, isInteracting]);

  return (
    <div className={styles["carousel-container"]}>
      <div className={styles["comments-wrapper"]} ref={wrapperRef}>
        {comments.length > 0 ? (
          comments.map((comment, cIndex) => (
            <div key={cIndex} className={styles["comment-item"]}>
              <img src={comment_green} alt="Comment" />
              <span className={styles["comment-user"]}>{comment.commentedBy}</span>
              <span className={styles["comment-text"]}>{comment.commentContent}</span>
              <span className={styles["comment-timestamp"]}>{getTimeElapsed(comment.createdAt)}</span>
            </div>
          ))
        ) : (
          <p className={styles["no-comments"]}>No comments to display</p>
        )}
      </div>
      {comments.length > 0 && (
        <div className={styles["carousel-counter"]}>
          {currentIndex + 1}/{comments.length}
        </div>
      )}
    </div>
  );
};

// -------------------- Project Details --------------------
const ProjectDetailsContent = ({ project, update }) => (
  <div className={styles["mutable-project-content-wrapper"]}>
    <div className={styles["project-pan-description"]}>
      <div className={styles["project-updates-wrapper"]}>
        <div className={styles["project-updates-header"]}>
          <div className={styles["project-updates-header-details"]}>
            <div className={styles["project-updates-header-details-i"]}>
              <div className={styles["header-details-img"]}>
                <img src={updates} alt="Updates" />
              </div>
              <p>Daily Updates</p>
            </div>
            <div className={styles["project-updates-header-details-i"]}>
              <p>Last Updated {formatFullDate(update?.createdAt)}</p>
            </div>
          </div>
        </div>

        <ProjectSections update={update} project={project} />
      </div>

      <div className={styles["project-description"]}>
        <p>Project Description</p>
        <p>{project?.description}</p>
      </div>

      <ProjectTimeTracker startDate={project?.startDate} endDate={project?.endDate} />
    </div>

    <div className={styles["project-section-i"]}>
      <div className={styles["project-section-i-detail"]}>
        <p>Upcoming Tasks</p>
        <p>Prioritized based on urgency, deadlines, and task health due in 7 days</p>
      </div>
      <div className={styles["project-section-i-content"]}>
        <img src={notasks} alt="No tasks" />
      </div>
    </div>
  </div>
);

// -------------------- Placeholder Contents for Other Tabs --------------------
const TasksContent = ({ project }) => (
  <div className={styles["tab-content"]}>
    <p>Tasks for {project?.name}</p>
    <p>(Placeholder for tasks content)</p>
  </div>
);

const IssuesContent = ({ project }) => (
  <div className={styles["tab-content"]}>
    <p>Issues for {project?.name}</p>
    <p>(Placeholder for issues content)</p>
  </div>
);

const FilesContent = ({ project }) => (
  <div className={styles["tab-content"]}>
    <FileOverview />
  </div>
);

const RemindersContent = ({ project }) => (
  <div className={styles["tab-content"]}>
    <p>Reminders for {project?.name}</p>
    <p>(Placeholder for reminders content)</p>
  </div>
);

// -------------------- Meetings Content --------------------
const MeetingsContent = ({ project, teamMembers, openMeetingModal }) => {
  const [meetings, setMeetings] = useState([
    {
      _id: "meeting_1",
      title: "Project Kickoff Professional Adhoc",
      agenda: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      platform: "google_meet",
      platformName : "Google Meet",
      date: new Date("2025-10-20T10:00:00Z").toISOString(),
      duration: 60,
      participants: teamMembers.slice(0, 2).map(m => ({ _id: m._id, name: m.name, email: m.email })),
      link: "https://meet.google.com/abc-123",
      sendNotifications: true,
      sendReminder: true,
      createdAt: new Date("2025-10-18T12:00:00Z").toISOString(),
    },
    {
      _id: "meeting_2",
      title: "Weekly Sync daily standup",
      agenda: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      platform: "zoom",
      platformName : "Zoom",
      date: new Date("2025-10-22T14:00:00Z").toISOString(),
      duration: 30,
      participants: teamMembers.slice(1, 3).map(m => ({ _id: m._id, name: m.name, email: m.email })),
      link: "https://zoom.us/j/123456789",
      sendNotifications: true,
      sendReminder: false,
      createdAt: new Date("2025-10-18T14:00:00Z").toISOString(),
    },
    
  ]);

  return (
    <div className={styles["tab-content"]}>
      <div className={styles["menu-overview-content-wrapper"]}>
        <div className={styles["pjt-content-menu-overview-bar"]}>
          <div className={styles["menu-overview-bar-flex-item"]}>
            <div className={styles["menu-details-pill"]}>
              <p className={styles["menu-detail-heading"]}>Your Meetings</p>
              <div className={styles['meeting-counter-wrapper']}>
                <p className={styles["menu-counter"]}>{meetings.length}</p>
              </div>
            </div>
          </div>
          <div className={styles["menu-overview-bar-flex-item"]}>
            <div className={styles["header-actions"]}>
              <div className={styles["add-button"]} onClick={openMeetingModal}>
                <img src={add} alt="Add" />
                <p>Schedule Meeting</p>
              </div>
            </div>
          </div>
        </div>
        <div className={styles["meeting-list"]}>
          {meetings.length > 0 ? (
            meetings.map((meeting) => (
              <div key={meeting._id} className={styles["meeting-item"]}>
                <div className={styles["meeting-header"]}>
                  <div className={styles["meeting-info"]}>

                    <div className={styles["meeting-details"]}>
                      <p className={styles["meeting-title"]}>{meeting.title}</p>
                                            <p className={styles["meeting-agenda"]}>{meeting.agenda}</p>

                      <div className={styles["meeting-meta"]}>
                        <div>
                          <img src={calendar}/>
                          <p>{formatFullDate(meeting.date)}</p>
                        </div> 
                        <div>
                          <img src={clock}/>
                          <p>{meeting.duration} min</p>
                        </div>
                        <div> <img
                      src={meeting.platform === "google_meet" ? googlemeet : zoom}
                      alt={meeting.platform}
                      className={styles["platform-icon"]}
                    />
                    <p>{meeting.platformName}</p>
                    </div>
                      </div>
                    </div>
                  </div>
                  <div className={styles["meeting-actions"]}>
                    <a href={meeting.link} target="_blank" rel="noopener noreferrer" className={styles["join-button"]}>
                      Join Now
                    </a>
                  </div>
                </div>
                <div className={styles["meeting-participants"]}>
                  <div className={styles["participant-list"]}>
                    {meeting.participants.map((p, i) => {
                      (
                      <span key={i} className={styles["participant"]}>
                        <img src={p.picture}/>
                        <p>{p.name}</p>
                        {i < meeting.participants.length - 1 ? ", " : ""}
                      </span>
                    )})}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className={styles["no-meetings"]}>No meetings scheduled</p>
          )}
        </div>
      </div>
    </div>
  );
};

const isImageUrl = (name = "", type = "") => {
  const images = ["jpg","jpeg","png","gif","webp","svg"];
  const extType = type?.toLowerCase();
  const extName = name?.split(".").pop()?.toLowerCase();
  return images.includes(extType) || images.includes(extName);
};

const isPdfUrl = (name = "", type = "") => {
  const extType = type?.toLowerCase();
  const extName = name?.split(".").pop()?.toLowerCase();
  return extType === "pdf" || extName === "pdf";
};

const FileViewer = ({ open, file, onClose, onPrev, onNext }) => {
  const [scale, setScale] = useState(1);
  const [drag, setDrag] = useState({ active: false, x: 0, y: 0, startX: 0, startY: 0 });
  const containerRef = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    if (open) {
      const onKey = (e) => {
        if (e.key === "Escape") onClose?.();
        if (e.key === "ArrowRight") onNext?.();
        if (e.key === "ArrowLeft") onPrev?.();
      };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }
  }, [open, onClose, onPrev, onNext]);

  useEffect(() => {
    setScale(1);
    setDrag({ active: false, x: 0, y: 0, startX: 0, startY: 0 });
  }, [file]);

  if (!open || !file) return null;

  const onWheel = (e) => {
    if (!isImageUrl(file.name, file.type)) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale((s) => Math.min(5, Math.max(0.2, s + delta)));
  };

  const startDrag = (e) => {
    if (!isImageUrl(file.name, file.type) || scale <= 1) return;
    e.preventDefault();
    const startX = e.clientX || e.touches?.[0]?.clientX || 0;
    const startY = e.clientY || e.touches?.[0]?.clientY || 0;
    setDrag((d) => ({ ...d, active: true, startX: startX - d.x, startY: startY - d.y }));
  };

  const moveDrag = (e) => {
    if (!drag.active) return;
    const clientX = e.clientX || e.touches?.[0]?.clientX || 0;
    const clientY = e.clientY || e.touches?.[0]?.clientY || 0;
    setDrag((d) => ({ ...d, x: clientX - d.startX, y: clientY - d.startY }));
  };

  const endDrag = () => setDrag((d) => ({ ...d, active: false }));

  const openExternal = () => {
    if (file.url) window.open(file.url, "_blank", "noopener");
  };

  return (
    <div className={styles.backdrop} onClick={onClose} onWheel={onWheel}>
      <div className={styles.toolbar} onClick={(e) => e.stopPropagation()}>
        <div className={styles.title} title={file.name}>{file.name}</div>
        <div className={styles.actions}>
          {isImageUrl(file.name, file.type) && (
            <>
              <button onClick={() => setScale((s) => Math.min(5, s + 0.2))}>＋</button>
              <button onClick={() => setScale((s) => Math.max(0.2, s - 0.2))}>－</button>
              <button onClick={() => setScale(1)}>Reset</button>
            </>
          )}
          <button onClick={openExternal}>Open</button>
          <button onClick={onClose}>Close ✕</button>
        </div>
      </div>

      <button className={styles.nav + " " + styles.prev} onClick={(e) => { e.stopPropagation(); onPrev?.(); }}>‹</button>
      <button className={styles.nav + " " + styles.next} onClick={(e) => { e.stopPropagation(); onNext?.(); }}>›</button>

      <div
        className={styles.stage}
        ref={containerRef}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={startDrag}
        onMouseMove={moveDrag}
        onMouseUp={endDrag}
        onMouseLeave={endDrag}
        onTouchStart={startDrag}
        onTouchMove={moveDrag}
        onTouchEnd={endDrag}
      >
        {isImageUrl(file.name, file.type) && (
          <img
            ref={imgRef}
            src={file.url}
            alt={file.name}
            className={styles.media}
            style={{ transform: `translate(${drag.x}px, ${drag.y}px) scale(${scale})` }}
            draggable={false}
          />
        )}

        {isPdfUrl(file.name, file.type) && (
          <iframe
            className={styles.pdf}
            title={file.name}
            src={file.url}
            frameBorder="0"
          />
        )}

        {!isImageUrl(file.name, file.type) && !isPdfUrl(file.name, file.type) && (
          <div className={styles.fallback}>
            <p>Preview not available.</p>
            <button onClick={openExternal}>Open / Download</button>
          </div>
        )}
      </div>
    </div>
  );
};

// -------------------- File Overview --------------------
const FileOverview = () => {
  const [files, setFiles] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [commentIndex, setCommentIndex] = useState(null);
  const [commentText, setCommentText] = useState({ commentContent: "", commentedBy: "User1", createdAt: "" });
  const [currentUser] = useState("User1");



  const [viewer, setViewer] = useState({ open: false, index: 0 });
const openViewerAt = (index) => setViewer({ open: true, index });
const closeViewer = () => setViewer({ open: false, index: 0 });
const nextViewer = () => setViewer((v) => ({ open: true, index: (v.index + 1) % files.length }));
const prevViewer = () => setViewer((v) => ({ open: true, index: (v.index - 1 + files.length) % files.length }));

// Storage quota (example: 500 MB)
const DEFAULT_QUOTA_BYTES = 1024 * 1024 * 1024;

const [quotaBytes, setQuotaBytes] = useState(DEFAULT_QUOTA_BYTES);
const [usedBytes, setUsedBytes] = useState(0);

const humanSize = (bytes) => {
  if (bytes >= 1024**3) return (bytes / 1024**3).toFixed(2) + " GB";
  if (bytes >= 1024**2) return (bytes / 1024**2).toFixed(2) + " MB";
  return Math.max(1, Math.round(bytes / 1024)) + " KB";
};

const remainingBytes = Math.max(0, quotaBytes - usedBytes);
const hasSpace = (addBytes = 0) => usedBytes + addBytes <= quotaBytes;





  const [viewMode, setViewMode] = useState("list"); // "list" | "gallery"
  const fileInputRef = useRef(null);

  // Gallery helpers
  const imageExts = ["jpg", "jpeg", "png", "gif", "webp", "svg"];
  const isImage = (name, type) => {
    const extFromType = type?.toLowerCase();
    const extFromName = name?.split(".").pop()?.toLowerCase();
    return imageExts.includes(extFromType) || imageExts.includes(extFromName);
  };
  const imageFiles = files.filter((f) => isImage(f.name, f.type));

  // Lightbox
  const [lightbox, setLightbox] = useState({ open: false, index: 0 });
  const openLightbox = (imgIndexInGallery) => setLightbox({ open: true, index: imgIndexInGallery });
  const closeLightbox = () => setLightbox({ open: false, index: 0 });
  const nextLightbox = () =>
    setLightbox((prev) => ({ ...prev, index: (prev.index + 1) % imageFiles.length }));
  const prevLightbox = () =>
    setLightbox((prev) => ({ ...prev, index: (prev.index - 1 + imageFiles.length) % imageFiles.length }));

const handleFileChange = (event) => {
  const selectedFiles = Array.from(event.target.files);

  const totalIncoming = selectedFiles.reduce((s, f) => s + (f.size || 0), 0);
  if (!hasSpace(totalIncoming)) {
    // Partial accept: fit as many as possible
    let room = quotaBytes - usedBytes;
    const accepted = [];
    for (const file of selectedFiles) {
      if (file.size <= room) {
        accepted.push(file);
        room -= file.size;
      } else {
        // skip files that don't fit
      }
    }
    if (accepted.length === 0) {
      alert("Storage full. Please remove files to upload new ones.");
      event.target.value = null;
      return;
    }
    const newFiles = accepted.map((file) => ({
      name: file.name,
      size: (file.size / 1024).toFixed(2) + " KB",
      rawSize: file.size,
      type: file.type?.split("/")[1]?.toUpperCase() || file.type || "UNKNOWN",
      uploadedBy: `userid${Math.floor(Math.random() * 4) + 1}`,
      comments: [],
      url: URL.createObjectURL(file),
    }));
    setFiles((prev) => [...prev, ...newFiles]);
    alert(`${accepted.length} file(s) uploaded. Storage is now near full.`);
    event.target.value = null;
    return;
  }

  // All fit
  const newFiles = selectedFiles.map((file) => ({
    name: file.name,
    size: (file.size / 1024).toFixed(2) + " KB",
    rawSize: file.size,
    type: file.type?.split("/")[1]?.toUpperCase() || file.type || "UNKNOWN",
    uploadedBy: `userid${Math.floor(Math.random() * 4) + 1}`,
    comments: [],
    url: URL.createObjectURL(file),
  }));
  setFiles((prevFiles) => [...prevFiles, ...newFiles]);
  event.target.value = null;
};


  const handleAddClick = () => fileInputRef.current?.click();

  const handleNameEdit = (index) => setEditingIndex(index);

  const handleNameChange = (e, index) => {
    const updated = [...files];
    updated[index].name = e.target.value;
    setFiles(updated);
  };

  const handleNameBlur = () => setEditingIndex(null);

  const handleCommentClick = (index) => {
    setCommentIndex(commentIndex === index ? null : index);
    setCommentText({ commentContent: "", commentedBy: currentUser, createdAt: "" });
  };

  const handleSendComment = (index) => {
    if (commentText.commentContent.trim()) {
      const updated = [...files];
      updated[index].comments.push({
        ...commentText,
        createdAt: new Date().toISOString(),
      });
      setFiles(updated);
      setCommentIndex(null);
      setCommentText({ commentContent: "", commentedBy: currentUser, createdAt: "" });
    }
  };

  const handleCommentContentChange = (e) =>
    setCommentText((prev) => ({ ...prev, commentContent: e.target.value }));

const removeFile = (index) => {
  try {
    const f = files[index];
    if (f?.url?.startsWith("blob:")) URL.revokeObjectURL(f.url);
  } catch {}
  setFiles((prev) => prev.filter((_, i) => i !== index));
  if (commentIndex === index) {
    setCommentIndex(null);
    setCommentText({ commentContent: "", commentedBy: currentUser, createdAt: "" });
  }
};

  
  // Find original index from a gallery file reference
  const findIndexByFileRef = (fileRef) =>
    files.findIndex((f) => f.name === fileRef.name && f.size === fileRef.size && f.type === fileRef.type);


  // After setFiles, recompute usedBytes
useEffect(() => {
  const total = files.reduce((sum, f) => sum + (f.rawSize || 0), 0);
  setUsedBytes(total);
}, [files]);


  return (
    <div className={styles["menu-overview-content-wrapper"]}>
      <div className={styles["pjt-content-menu-overview-bar"]}>
        <div className={styles["menu-overview-bar-flex-item"]}>
          <div className={styles["menu-details-pill"]}>
            <p className={styles["menu-detail-heading"]}>Your Files & Attachment</p>
            <p className={styles["menu-counter"]}></p>
          </div>
        </div>

        <div className={styles["menu-overview-bar-flex-item"]}>
          <div className={styles["header-actions"]}>


  <div className={styles["storage"]}>
    <div className={styles["storage-row"]}>
      <p>{humanSize(usedBytes)}</p>
      <p>/</p>
      <p>{humanSize(quotaBytes)}</p>
      {/* <span> · Remaining:</span>
      <strong>{humanSize(remainingBytes)}</strong> */}
    </div>
    <div className={styles["storage-bar"]}>
      <div
        className={styles["storage-fill"]}
        style={{ width: `${Math.min(100, (usedBytes / quotaBytes) * 100)}%` }}
      />
    </div>
  </div>

            <div className={styles["view-toggle"]}>
              <div
                className={`${styles["toggle-btn"]} ${viewMode === "list" ? styles["active"] : ""}`}
                onClick={() => setViewMode("list")}
              >
                <img src={list}/>
                {/* <p>List</p> */}
                
              </div>
              <div
                className={`${styles["toggle-btn"]} ${viewMode === "gallery" ? styles["active"] : ""}`}
                onClick={() => setViewMode("gallery")}
                disabled={files.length === 0}
              >
                <img src={gallery}/>
                {/* <p>Gallery</p> */}
              </div>
            </div>



                    <div
    className={styles["add-button"]}
    onClick={handleAddClick}
    disabled={remainingBytes <= 0}
    title={remainingBytes <= 0 ? "Storage full" : "Upload File"}
  >
    <img src={upload} alt="Upload" />
    <p>Upload File</p>
  </div>
          </div>
        </div>
      </div>

      <div className={styles["file-list"]}>
        {files.length === 0 ? (
          <p className={styles["no-files"]}>No files uploaded</p>
        ) : viewMode === "list" ? (
          <>
            {files.map((file, index) => (
              <div key={index} className={styles["file-item"]}>
                <div className={styles["file-header"]}>
                  <div className={styles["file-item-flex"]}>
                    <div onClick={() => openViewerAt(index)} role="button" tabIndex={0} className={styles["file-info"]}>
                      <img src={fileIcon} className={styles["file-icon"]} alt="File" />
                      <div className={styles["file-details"]}>
                        {editingIndex === index ? (
                          <input
                            type="text"
                            value={file.name}
                            onChange={(e) => handleNameChange(e, index)}
                            onBlur={handleNameBlur}
                            className={styles["edit-name-input"]}
                            autoFocus
                          />
                        ) : (
                          <p className={styles["file-name"]} onClick={() => handleNameEdit(index)}>
                            {file.name}
                          </p>
                        )}
                        <p className={styles["file-meta"]}>
                          <span className={styles["file-size"]}>{file.size}</span>
                          <span className={styles["file-type"]}>{file.type}</span>
                        </p>
                      </div>
                    </div>
                    <div className={styles["file-upload-details"]}>
                      {/* <p>File uploaded by <span>{file.uploadedBy}</span></p> */}
                    </div>
                  </div>
                  <div className={styles["file-item-flex"]}>
                    {/* <img
                      src={comment_green}
                      onClick={() => handleCommentClick(index)}
                      className={styles["comment-button"]}
                      alt="Comment"
                    /> */}
                    <button className={styles["remove-button"]} onClick={() => removeFile(index)}>
                      ⋮
                    </button>
                  </div>
                </div>

                <div className={styles["file-footer"]}>
                  {/* {file.comments.length > 0 && <CommentBurger comments={file.comments} />} */}
                  {commentIndex === index && (
                    <div className={styles["comment-section"]}>
                      <input
                        type="text"
                        value={commentText.commentContent}
                        onChange={handleCommentContentChange}
                        className={styles["file-comment-input"]}
                        placeholder="Add a comment..."
                        autoFocus
                      />
                      <button className={styles["send-comment-button"]} onClick={() => handleSendComment(index)}>
                        Send
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </>
        ) : (
          // GALLERY VIEW
          <div className={styles["gallery-grid"]}>
            {imageFiles.length === 0 ? (
              <p className={styles["no-files"]}>No images to display</p>
            ) : (
              imageFiles.map((file, gIndex) => (
                <div key={`g-${gIndex}`} className={styles["gallery-card"]}>
                  <div className={styles["gallery-thumb"]} onClick={() => openLightbox(gIndex)}>
                    <img src={file.url} alt={file.name} loading="lazy" />
                  </div>
                  <div className={styles["gallery-meta"]}>
                    <p className={styles["gallery-name"]} title={file.name}>
                      {file.name}
                    </p>
                  </div>
                  <div className={styles["gallery-actions"]}>
                    <button
                      className={styles["comment-chip"]}
                      onClick={() => {
                        const idx = findIndexByFileRef(file);
                        if (idx !== -1) handleCommentClick(idx);
                      }}
                    >
                      <img src={comment_green}/> 

                      <p>      {(() => {
                        const idx = findIndexByFileRef(file);
                        return idx !== -1 ? (files[idx].comments?.length || 0) : 0;
                      })()}</p>
                
                    </button>
                                        <span className={styles["gallery-size"]}>{file.size}</span>

                    <button
                      className={styles["remove-button"]}
                      onClick={() => {
                        const idx = findIndexByFileRef(file);
                        if (idx !== -1) removeFile(idx);
                      }}
                    >
                      ⋮
                    </button>
                  </div>

                  {(() => {
                    const idx = findIndexByFileRef(file);
                    return commentIndex === idx ? (
                      <div className={styles["comment-section"]}>
                        <input
                          type="text"
                          value={commentText.commentContent}
                          onChange={handleCommentContentChange}
                          className={styles["file-comment-input"]}
                          placeholder="Add a comment..."
                          autoFocus
                        />
                        <button className={styles["send-comment-button"]} onClick={() => handleSendComment(idx)}>
                          Send
                        </button>
                      </div>
                    ) : null;
                  })()}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* LIGHTBOX */}
      {lightbox.open && imageFiles[lightbox.index] && (
        <div className={styles["lightbox"]} onClick={closeLightbox}>
          <button
            className={styles["lightbox-prev"]}
            onClick={(e) => {
              e.stopPropagation();
              prevLightbox();
            }}
          >
            ‹
          </button>
          <img
            className={styles["lightbox-img"]}
            src={imageFiles[lightbox.index].url}
            alt={imageFiles[lightbox.index].name}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className={styles["lightbox-next"]}
            onClick={(e) => {
              e.stopPropagation();
              nextLightbox();
            }}
          >
            ›
          </button>
          <button
            className={styles["lightbox-close"]}
            onClick={(e) => {
              e.stopPropagation();
              closeLightbox();
            }}
          >
            ✕
          </button>
        </div>
      )}


<FileViewer
  open={viewer.open}
  file={files[viewer.index]}
  onClose={closeViewer}
  onPrev={prevViewer}
  onNext={nextViewer}
/>

      <input type="file" multiple onChange={handleFileChange} className={styles["file-input"]} ref={fileInputRef} />
    </div>
  );
};

// -------------------- Project Config --------------------
const DashboardProjectConfig = ({ project }) => (
  <div className={styles["config-wrapper"]}>
    <div className={styles["config-header"]}>
      <div className={styles["config-header-i"]}>
        <p>Project Properties</p>
      </div>
    </div>

    <div className={styles["config-content"]}>
      <div className={styles["config-items-wrapper"]}>
        <div className={styles["config-item"]}>
          <div className={`${styles["config-item-i"]} ${styles["config-item-property"]}`}>
            <p>Status</p>
          </div>
          <div className={`${styles["config-item-i"]} ${styles["config-item-value"]}`}>
            <img src={inprogress} alt="In Progress" />
            <p>{project?.status}</p>
          </div>
        </div>

        <div className={styles["config-item"]}>
          <div className={`${styles["config-item-i"]} ${styles["config-item-property"]}`}>
            <p>Priority</p>
          </div>
          <div className={`${styles["config-item-i"]} ${styles["config-item-value"]}`}>
            <img src={highPriority} alt="High Priority" />
            <p>High</p>
          </div>
        </div>

        <div className={styles["config-item"]}>
          <div className={`${styles["config-item-i"]} ${styles["config-item-property"]}`}>
            <p>Team Members</p>
          </div>
          <div className={`${styles["config-item-i"]} ${styles["config-item-value"]}`}>
            <div className={styles["team-member"]}>
              {project?.teamMembers?.map((m, i) => (
                <img key={i} src={m.picture} alt={m.name} />
              ))}
            </div>
          </div>
        </div>

        <div className={styles["config-item"]}>
          <div className={`${styles["config-item-i"]} ${styles["config-item-property"]}`}>
            <p>Project Manager</p>
          </div>
          <div className={`${styles["config-item-i"]} ${styles["config-item-value"]}`}>
            {project?.teamMembers?.map((m, i) => {
              if (project?.creator === m._id) {
                return (
                  <div key={i} className={styles["lead-wrapper"]}>
                    <img src={m.picture} alt={m.name} />
                    <p>{m.name}</p>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>

        <div className={styles["config-item"]}>
          <div className={`${styles["config-item-i"]} ${styles["config-item-property"]}`}>
            <p>Timeline</p>
          </div>
          <div className={`${styles["config-item-i"]} ${styles["config-item-value"]}`}>
            {project?.startDate && project?.endDate && (
              <div className={styles["timeline-value-wrapper"]}>
                <div className={styles["timeline-date-wrapper"]}>
                  <p>{formatFullDate(project?.startDate)}</p>
                </div>
                <img src={right} alt="Arrow" />
                <div className={styles["timeline-date-wrapper"]}>
                  <p>{formatFullDate(project?.endDate)}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);

// -------------------- Project Progress --------------------
const ProjectProgressUI = ({ projectProgress = 83 }) => {
  const projectLines = 25;
  const illuminate = Math.floor((projectProgress / 100) * projectLines);

  return (
    <div className={styles["project-progress-wrapper"]}>
      <div className={styles["project-progress-area"]}>
        {[...Array(projectLines)].map((_, i) => (
          <div
            key={i}
            className={`${styles["progress-line"]} ${i < illuminate ? styles["progress-line-illuminate"] : ""}`}
          />
        ))}
      </div>
      <div className={styles["project-progress-number"]}>
        <p>{projectProgress}%</p>
      </div>
    </div>
  );
};

// -------------------- Dashboard Overview --------------------
const DashboardOverview = () => {
  const { user, project } = useProjectContext();
  const [isFav, setIsFav] = useState(false);
  const [update, setUpdate] = useState(null);
  const [error, setError] = useState("");
  const [kairoVisible, setKairoVisible] = useState(false);
  const [isAppCenterOpen, setAppCenterOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [activeTab, setActiveTab] = useState("Project Details");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [meetings, setMeetings] = useState([
    {
      _id: "meeting_1",
      title: "Project Kickoff",
      agenda: "Discuss project goals and timelines",
      platform: "google_meet",
      date: new Date("2025-10-20T10:00:00Z").toISOString(),
      duration: 60,
      participants: (project?.teamMembers || []).slice(0, 2).map(m => ({ _id: m._id, name: m.name, email: m.email })),
      link: "https://meet.google.com/abc-123",
      sendNotifications: true,
      sendReminder: true,
      createdAt: new Date("2025-10-18T12:00:00Z").toISOString(),
    },
    {
      _id: "meeting_2",
      title: "Weekly Sync",
      agenda: "Review progress and blockers",
      platform: "zoom",
      date: new Date("2025-10-22T14:00:00Z").toISOString(),
      duration: 30,
      participants: (project?.teamMembers || []).slice(1, 3).map(m => ({ _id: m._id, name: m.name, email: m.email })),
      link: "https://zoom.us/j/123456789",
      sendNotifications: true,
      sendReminder: false,
      createdAt: new Date("2025-10-18T14:00:00Z").toISOString(),
    },
  ]);

  useEffect(() => {
    if (!project?._id) return;
    let isMounted = true;

    async function loadProjectUpdate(projectId) {
      try {
        const update = await getLatestProjectUpdate(projectId);
        if (isMounted) setUpdate(update);
      } catch (e) {
        if (isMounted) setError("Could not load latest project update.");
      }
    }

    loadProjectUpdate(project._id);
    return () => (isMounted = false);
  }, [project?._id]);

  const handleAddMeeting = (newMeeting) => {
    setMeetings([...meetings, { _id: `meeting_${meetings.length + 1}`, ...newMeeting, createdAt: new Date().toISOString() }]);
    setIsModalOpen(false);
  };

  const tabs = ["Project Details", "Tasks", "Issues", "Files & Attachment", "Reminders", "Meetings"];

  const renderTabContent = () => {
    switch (activeTab) {
      case "Project Details":
        return <ProjectDetailsContent project={project} update={update} />;
      case "Tasks":
        return <TasksContent project={project} />;
      case "Issues":
        return <IssuesContent project={project} />;
      case "Files & Attachment":
        return <FilesContent project={project} />;
      case "Reminders":
        return <RemindersContent project={project} />;
      case "Meetings":
        return (
          <MeetingsContent
            project={project}
            teamMembers={project?.teamMembers || []}
            openMeetingModal={() => setIsModalOpen(true)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles["dashboard-overview-wrapper"]}>
      <div className={styles["dashboard-main"]}>
        <div className={styles["dashboard-main-wrapper"]}>
          <div className={styles["dashboard-main-i-wrapper"]}>
            <div className={styles["dashboard-main-i-content-wrapper"]}>
              <div className={styles["dashboard-main-i-header"]}>
                <div className={styles["pjt-header-capsule-top-right"]}>
                  <div className={styles["pjt-header-last-update-wrapper"]}>
                    <div className={styles["live"]} />
                    <p>
                      <span>Last Updated </span>
                      {formatDateTime(project?.updatedAt)}
                    </p>
                  </div>
                </div>

                <div className={styles["dashboard-main-i-header-details"]}>
                  <div className={styles["dashboard-main-i-header-details-text"]}>
                    <p>{project?.name}</p>
                    <p>{project?.description}</p>
                  </div>
                </div>

                <div className={styles["dashboard-main-i-header-footer"]}>
                  <div className={styles["dashboard-main-i-header-footer-i"]}>
                    <ProjectProgressUI projectProgress={project?.progress} />
                  </div>
                  <div className={styles["header-footer-flexer-i"]}>
                    <div className={styles["footer-i"]}>
                      {project?.teamMembers?.length > 0
                        ? project.teamMembers.map((person, index) => (
                            <img key={index} src={person.picture} />
                          ))
                        : <span className={styles["no-participants"]}>No participants</span>}
                    </div>
                    <div className={styles["footer-i"]}><img src={add} alt="Add" /></div>
                    <div className={styles["footer-i"]} />
                    <div className={styles["footer-i"]}><img src={sync} alt="Sync" /></div>
                    <div className={styles["footer-i"]}><img src={dot} alt="Dot" /></div>
                    <div className={styles["footer-i"]}>Export Data</div>
                  </div>
                </div>
              </div>

              <div className={styles["dashboard-main-i-content"]}>
                <div className={styles["dashboard-main-i-content-menu-wrapper"]}>
                  <div className={styles["menu-wrapper-i"]}>
                    {tabs.map((tab) => (
                      <p
                        key={tab}
                        className={`${styles["menu-item"]} ${activeTab === tab ? styles["menu-item-active"] : ""}`}
                        onClick={() => setActiveTab(tab)}
                      >
                        {tab}
                      </p>
                    ))}
                  </div>
                </div>

                <div className={styles["dashboard-main-children"]}>
                  {renderTabContent()}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className={styles["dashboard-side-i-wrapper"]}>
            <div className={styles["dashboard-side-i-overflow"]}>
              <DashboardProjectConfig project={project} />

              <div className={styles["dashboard-side-drift-wrapper"]}>
                <div className={styles["dashboard-side-drift-header-wrapper"]}>
                  <div className={styles["drift-header-i"]}>
                    <p><img src={driftIq} alt="DriftIQ" /> DriftIQ</p>
                  </div>
                </div>
                <div className={styles["dashboard-side-drift-content-wrapper"]}>
                  <div className={styles["drift-no-content-wrapper"]}>
                    <img src={driftIq_null} alt="No DriftIQ" />
                  </div>
                </div>
              </div>

              <TaskCharts />
            </div>
          </div>

          {selectedIntegration && (
            <SelectedIntegration
              key={selectedIntegration._id || selectedIntegration.name}
              selectedIntegration={selectedIntegration}
              setSelectedIntegration={setSelectedIntegration}
            />
          )}
        </div>

        {/* Action Bar */}
        <div className={styles["dashboard-actionbar-wrapper"]}>
          <SideActionBarTower
            setAppCenterOpen={setAppCenterOpen}
            onIntegrationSelect={(integration) => setSelectedIntegration(integration)}
          />
        </div>
      </div>

      {isModalOpen && (
        <MeetingCreatorModal
          project={project}
          teamMembers={project?.teamMembers || []}
          onClose={() => setIsModalOpen(false)}
          onCreateMeeting={handleAddMeeting}
        />
      )}

      {kairoVisible && <AiOverlay user={user} />}
      {isAppCenterOpen && <AppCenter onClose={() => setAppCenterOpen(false)} />}
    </div>
  );
};

export default DashboardOverview;
