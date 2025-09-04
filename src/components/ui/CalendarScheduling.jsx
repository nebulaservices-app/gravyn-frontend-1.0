import React, {useEffect, useState} from "react"
import UniversalCalendarView from "./UniversalCalendarView";
import styles from "./CalendarScheduling.module.css"
import dropdown from "../../images/icons/dropdown.svg"
import allproject from "../../images/icons/allprojects.svg";
import slash from "../../images/icons/slash.svg";
import projecticon from "../../images/icons/project.svg";
import star_fav from "../../images/icons/star-fav.svg";
import star_nofav from "../../images/icons/star-nofav.svg";
import calendar from "../../images/icons/calendar.svg";
import google_calendar from "../../images/int_icon/googlecalendar.svg";

import add from "../../images/icons/add.svg";

import dot from "../../images/icons/dot.svg";
import team from "../../images/icons/teams.svg";
import kairo from "../../images/logo/kairo.svg";
import useProjectContext from "../../hook/useProjectContext";
import AppCenter from "./AppCenter";
import axios from "axios";
import SideActionBarTower from "./SideActionBarTower";
import SelectedIntegration from "./AppAddOnModal";




const getDaysInMonth = (year, month) => {
    const firstDay = new Date(year, month, 1).getDay(); // 0-6 (Sun-Sat)
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const days = [];
    for (let i = firstDay - 1; i >= 0; i--) {
        days.push({ day: prevMonthDays - i, current: false });
    }

    for (let i = 1; i <= daysInMonth; i++) {
        days.push({ day: i, current: true });
    }

    return days;
};

const SingleDayCalendar = () => {
    const [viewDate, setViewDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);

    const getMonthDays = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const start = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const days = [];

        for (let i = 0; i < (start === 0 ? 6 : start - 1); i++) {
            days.push({ day: null, current: false });
        }

        for (let i = 1; i <= daysInMonth; i++) {
            days.push({ day: i, current: true });
        }

        return days;
    };

    const days = getMonthDays(viewDate);

    const handlePrevMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    };

    const isSelected = (day) =>
        selectedDate &&
        selectedDate.getFullYear() === viewDate.getFullYear() &&
        selectedDate.getMonth() === viewDate.getMonth() &&
        selectedDate.getDate() === day;

    return (
        <div className={styles["calendar"]}>
            <div className={styles["calendarHeader"]}>
                <img
                    style={{
                        transform : 'rotate(90deg)'
                    }}
                    src={dropdown} onClick={handlePrevMonth}/>
                <h3>
                    {viewDate.toLocaleString("default", {month: "long"})}{" "}
                    {viewDate.getFullYear()}
                </h3>
                <img
                    style={{
                        transform : 'rotate(-90deg)'
                    }}
                    src={dropdown} onClick={handleNextMonth}/>
            </div>

            <div className={styles["calendarGrid"]}>
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                    <div key={day} className={styles["calendarDayHeader"]}>
                        {day}
                    </div>
                ))}

                {days.map((d, idx) => (
                    <div
                        key={idx}
                        className={`${styles["calendarDay"]} ${d.current ? styles["current"] : styles["dimmed"]} ${
                            isSelected(d.day) ? styles["selected"] : ""
                        }`}
                        onClick={() =>
                            d.current &&
                            setSelectedDate(new Date(viewDate.getFullYear(), viewDate.getMonth(), d.day))
                        }
                    >
                        {d.day ? String(d.day).padStart(2, '0') : ""}
                    </div>
                ))}
            </div>
        </div>
    );
};






const checkAppIntegrationPresence = async ({
                                               key,
                                               projectId,
                                               userId,
                                               setIsConnected
                                           }) => {
    try {



        const appIntRes = await axios.get(`http://localhost:5001/api/v1/app-integrations/find/by-user-project`, {
            params: {
                userId: userId,
                projectId,
                key
            }
        });

        const exists = appIntRes?.data?.data;

        if (exists) {
            setIsConnected(true);
        } else {
            setIsConnected(false);
        }
    } catch (err) {
        console.error("❌ Error checking app integration:", err.message);
        setIsConnected(false);
    }
};






const GoogleMeetMiniModal = () => {
    const [isLoading , setLoading] = useState(true)
    return (
        <div className={styles['google-meet-mini-wrapper']}>
            {isLoading &&
                <div className={styles['google-calendar-wrapper']}>
                    <img src={google_calendar}/>
                </div>
            }
        </div>
    )
}




const CalendarScheduling = () => {
    const { user, project } = useProjectContext();
    const userId = localStorage.getItem("nuid");

    const [isFav, setIsFav] = useState(true);
    const [isAppCenterVisible, setAppCenterVisible] = useState(false);
    const [isConnected, setIsConnected] = useState(false);

    const [googleEvents, setGoogleEvents] = useState([]);
    const [projectEntities, setProjectEntities] = useState([]);

    const [selectedIntegration , setSelectedIntegration] = useState(null);

    const [isGoogleMeetMiniModalVisible , setGoogleMeetMiniModalVisible] = useState(false);
    const toggleFav = () => setIsFav(prev => !prev);

    const normalizeGoogleEvents = (events) => {
        return events.map(ev => ({
            _id: ev.id,
            title: ev.summary || "(No Title)",
            dueDate: ev.start?.dateTime || ev.start?.date,
            type: "google_calendar/event",
            source: "google",
            raw: ev
        }));
    };

    const fetchProjectEntities = async () => {
        try {
            const response = await axios.get(`http://localhost:5001/api/v1/entity/project`, {
                params: {
                    projectId: project?._id
                }
            });
            setProjectEntities(response.data || []);
        } catch (err) {
            console.error("❌ Error fetching project entities:", err);
        }
    };

    const fetchGoogleCalendarEvents = async () => {


        try {
            const response = await axios.get(`http://localhost:5001/api/v1/google_calendar/events`, {
                params: {
                    userId,
                    projectId: project?._id
                }
            });


            console.log("Google events un normalised", response.data.events)
            const normalized = normalizeGoogleEvents(response.data.events || []);
            setGoogleEvents(normalized);
        } catch (err) {
            console.error("❌ Failed to fetch Google Calendar events", err);
        }
    };

    const updateEntity = async (entityId, updates) => {
        try {
            const response = await axios.put(`http://localhost:5001/api/v1/entity/${entityId}`, updates);
            const updated = response.data;
            const updatedEntities = projectEntities.map(ent => ent._id === updated._id ? updated : ent);
            setProjectEntities(updatedEntities);
        } catch (err) {
            console.error("❌ Error updating entity:", err);
        }
    };

    // Integration check
    useEffect(() => {
        checkAppIntegrationPresence({
            key: "google_calendar",
            projectId: project?._id,
            userId,
            setIsConnected
        });
    }, [project]);

    // Once connection is verified, fetch Google Events
    useEffect(() => {
        console.log("Connection verified...")
        if (isConnected) fetchGoogleCalendarEvents();
    }, [isConnected]);

    // Always fetch project data
    useEffect(() => {
        if (project?._id) fetchProjectEntities();
    }, [project]);

    const combinedItems = [...[], ...googleEvents];


    useEffect(() => {
        console.log("Google events", googleEvents)
    }, [googleEvents]);
    return (
        <div className={styles['calendar-scheduling-wrapper']}>

            {/* Nav Bar */}
            <div className={styles['calendar-nav-bar']}>
                <div className={styles['nav-capsule']}>
                    <div className={styles['nav-pill-i']}>
                        <img src={allproject}/><p>All Projects</p>
                    </div>
                    <img src={slash}/>
                    <div className={styles['nav-pill-i']}>
                        <img src={projecticon}/><p>{project?.name || "Uber Website Development"}</p>
                        <img
                            onClick={toggleFav}
                            className={styles['star']}
                            src={isFav ? star_fav : star_nofav}
                        />
                        {/*<img className={styles['dot']} src={dot}/>*/}
                    </div>
                    <img src={slash}/>
                    <div className={styles['nav-pill-i']}>
                        <img src={calendar}/><p>Calendar & Scheduling</p>
                    </div>
                </div>
                <div className={styles['nav-capsule']}>
                    <div className={styles['nav-pill-i']}>
                        <img src={kairo}/>
                        <p>Ask Kairo</p>
                    </div>
                </div>
            </div>

            {/* Main Calendar */}
            <div className={styles['calendar-schedule-main']}>
                <div className={styles['calendar-scheduling-main-wrapper']}>
                    <UniversalCalendarView
                        combinedItems={combinedItems}
                        updateEntity={updateEntity}
                    />

                    {selectedIntegration &&
                        <SelectedIntegration
                            selectedIntegration={selectedIntegration}
                            setSelectedIntegration={setSelectedIntegration}
                        />
                    }

                </div>

                <div className={styles['calendar-actionbar-wrapper']}>
                    <SideActionBarTower
                        setAppCenterOpen={setAppCenterVisible}
                        onIntegrationSelect={(integrationSelection)=>{
                            setSelectedIntegration((integrationSelection))
                        }}
                    />
                </div>
            </div>

            {isGoogleMeetMiniModalVisible && <GoogleMeetMiniModal/>}

            {isAppCenterVisible && <AppCenter onClose={() => setAppCenterVisible(false)} />}
        </div>
    );
};


export default CalendarScheduling;