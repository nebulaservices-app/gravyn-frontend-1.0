import React, {useEffect, useState} from "react";
import styles from "./MeetingCreatorModal.module.css";
import videorecorder from "../../images/integration/google_integration/meeting-black.svg";
import googlemeet from "../../images/integration/google_integration/google-meet-icon.svg";
import zoom from "../../images/integration/google_integration/zoom_logo.png";
import gmail from "../../images/icons/gmail.svg"
import clock from "../../images/icons/clock.svg"
import crown from "../../images/icons/crown_y.svg"
import close from "../../images/icons/close.svg"
import axios from "axios";
import {createMeeting} from "../../service/googleMeet/gmeetCRUD";
import {isGoogleTokenExpired, refreshGoogleAccessToken} from "../../service/googleMeet/gmeetAuth";

const MeetingCreatorModal = ({project, teamMembers, onClose}) => {
    const [step, setStep] = useState(1);
    const maxStep = 3;
    const userId = localStorage.getItem("nuid");
    const [meetingData, setMeetingData] = useState({
        title: "",
        agenda: "",
        location: "virtual",
        platform: "google_meet",
        date: new Date().toISOString(),
        duration: "",
        participants: [],
        link : "",
        sendNotifications: true,
        sendReminder: false
    });

    const nextStep = () => {
        if (step < maxStep) setStep(step + 1);
    };

    const prevStep = () => {
        if (step > 1) setStep(step - 1);
    };



    useEffect(() => {
        if (Array.isArray(teamMembers) && teamMembers.length > 0) {
            setMeetingData(prev => ({
                ...prev,
                participants: teamMembers  // store full objects, not just emails
            }));
        }
    }, [teamMembers]);

    const handleCreateMeeting = async () => {
        try {
            const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata";
            const { title, agenda, date, duration, location, platform, participants, sendNotifications, sendReminder } = meetingData;

            if (!date || !duration) {
                alert("Please provide both date and duration.");
                return;
            }





            const appIntRes = await axios.get(`http://localhost:5001/api/v1/app-integrations/find/by-user-project`, {
                params: {
                    userId: userId,
                    projectId : project._id,
                    key : "google_meet"
                }
            });

            const integration = appIntRes?.data?.data;

            const payload = {
                userId: userId,       // from context/auth
                creatorId: userId,    // same as above unless different
                projectId: project._id,  // from selected project
                title,
                agenda,
                location,
                platform,
                date,
                duration,
                participants,
                sendNotifications,
                sendReminder
            };



            if(isGoogleTokenExpired(integration.tokenExpiry)){
                console.warn("Is expired" , integration)
                const res = await refreshGoogleAccessToken(integration._id);
            }
            const res = await axios.post("http://localhost:5001/api/v1/google_meet/create", payload);

            console.log("✅ Meeting created:", res.data);
            alert("Meeting successfully scheduled!");

            // Optional reset
            setStep(1);
            setMeetingData({ ...meetingData });

        } catch (error) {
            console.error("❌ Failed to create meeting:", error.response?.data || error.message);
            alert("Error creating meeting");
        }
    };

    const StepperView = ({ step, maxstep }) => {
        const steps = Array.from({ length: maxstep }, (_, i) => i + 1);
        return (
            <div className={styles['stepper-bar-wrapper']}>
                {steps.map((s) => (
                    <div
                        key={s}
                        className={`${styles['step-bar']} ${s <= step ? styles['active'] : ''}`}
                    ></div>
                ))}
            </div>
        );
    };

    const renderMeetingSummaryNote = () => {
        if (!meetingData.date || !meetingData.duration) return null;

        const date = new Date(meetingData.date);

        const options = {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        };

        const formattedDateTime = date.toLocaleString("en-US", options);
        const durationText = `${meetingData.duration} min${meetingData.duration > 1 ? "s" : ""}`;

        return (
            <div className={styles["meeting-summary-note"]}>
                *Meeting will be scheduled for <strong>{formattedDateTime}</strong> for a duration of <strong>{durationText}</strong>.
            </div>
        );
    };

    const renderStep = () => {
        // Format datetime to match input[type=datetime-local] (in local time)
        function formatDateTimeLocal(date) {
            const pad = (n) => (n < 10 ? '0' + n : n);
            return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
        }

        // Generate the earliest allowed time, rounded to the next 5-minute slot
        function generateMinDateTime() {
            const now = new Date();
            const remainder = 5 - (now.getMinutes() % 5);
            now.setMinutes(now.getMinutes() + remainder);
            now.setSeconds(0);
            now.setMilliseconds(0);
            return formatDateTimeLocal(now);
        }

        // Generate a list of suggested time slots starting from now, every 5 min
        function generateTimeSuggestions() {
            const now = new Date();
            const remainder = 5 - (now.getMinutes() % 5);
            now.setMinutes(now.getMinutes() + remainder);
            now.setSeconds(0);
            now.setMilliseconds(0);

            const suggestions = [];
            for (let i = 0; i < 5; i++) {
                const suggestion = new Date(now.getTime() + i * 5 * 60 * 1000);
                suggestions.push(formatDateTimeLocal(suggestion));
            }
            return suggestions;
        }
        switch (step) {
            case 1:
                return (
                    <div className={styles['meeting-form-wrapper']}>
                        <StepperView step={step} maxstep={maxStep} />
                        <div className={styles['form-step-heading']}>
                            <p>Provide the details of this meeting</p>
                        </div>

                        <div className={styles['form-name-wrapper']}>
                            <p className={styles['form-title']}>Meeting Summary</p>
                            <input
                                placeholder="Provide a title for your meeting"
                                value={meetingData.title}
                                onChange={(e) => setMeetingData({ ...meetingData, title: e.target.value })}
                            />
                        </div>

                        <div className={styles['form-description-wrapper']}>
                            <p className={styles['form-title']}>Meeting Agenda</p>
                            <textarea
                                placeholder="Describe your meeting agenda here."
                                value={meetingData.agenda}
                                onChange={(e) => setMeetingData({ ...meetingData, agenda: e.target.value })}
                            />
                        </div>

                        <div className={styles['meeting-location-wrapper']}>
                            <p className={styles['form-title']}>Meeting Location</p>

                            <div className={styles['radio-group']}>
                                {["physical", "virtual"].map((type) => (
                                    <label key={type} className={styles['radio-label']}>
                                        <input
                                            type="radio"
                                            name="meetingLocation"
                                            value={type}
                                            checked={meetingData.location === type}
                                            onChange={() => setMeetingData({ ...meetingData, location: type })}
                                        />
                                        <span className={styles['custom-radio']}></span>
                                        {type === "physical" ? "Physical Meeting" : "Virtual Meeting"}
                                    </label>
                                ))}
                            </div>

                            {meetingData.location === "virtual" && (
                                <div className={styles['platform-selector']}>
                                    {["google_meet", "zoom"].map((plat) => (
                                        <button
                                            key={plat}
                                            className={`${styles['platform-button']} ${meetingData.platform === plat ? styles['active'] : ''}`}
                                            onClick={() => setMeetingData({ ...meetingData, platform: plat })}
                                        >
                                            <img src={plat === "google_meet" ? googlemeet : zoom} alt={plat} />
                                            {plat === "google_meet" ? "Google Meet" : "Zoom"}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className={styles['meeting-form-wrapper']}>
                        <StepperView step={step} maxstep={maxStep}/>
                        <div className={styles['form-step-heading']}>
                            <p>When would you like the meeting to start, and how long should it last?</p>
                        </div>




                        <div className={styles['form-date-time-group']}>
                            <div className={styles['form-date-time-wrapper']}>
                                <p className={styles['form-title']}>Start Date & Time</p>
                                <input
                                    type="datetime-local"
                                    step="300"
                                    min={generateMinDateTime()}
                                    value={meetingData.date}
                                    onChange={(e) => setMeetingData({...meetingData, date: e.target.value})}
                                />
                                <div className={styles['time-suggestions']}>
                                    {generateTimeSuggestions().map((time) => (
                                        <div
                                            key={time}
                                            className={styles['time-suggestion']}
                                            onClick={() => setMeetingData({...meetingData, date: time})}
                                        >
                                            {new Date(time).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                hour12: true
                                            })}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className={styles['form-duration-wrapper']}>
                                <p className={styles['form-title']}>Duration (min)</p>
                                <input
                                    type="number"
                                    min={15}
                                    step={5}
                                    value={meetingData.duration}
                                    onChange={(e) => setMeetingData({
                                        ...meetingData,
                                        duration: parseInt(e.target.value)
                                    })}
                                />
                                <div className={styles['time-suggestions']}>
                                    {[15, 30, 45, 60].map((d) => (
                                        <div
                                            key={d}
                                            className={styles['time-suggestion']}
                                            onClick={() => setMeetingData({...meetingData, duration: d})}
                                        >
                                            {d} min
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                {renderMeetingSummaryNote()}
                            </div>
                        </div>

                    </div>
                );

            case 3:
                return (
                    <div className={styles['meeting-form-wrapper']}>
                        <StepperView step={step} maxstep={maxStep}/>

                        <div className={styles['form-step-heading']}>
                            <p>Select the assignees for the meeting who should be available ?</p>
                        </div>

                        <div className={styles['form-description-wrapper']}>
                            <p className={styles['form-title']}>Participants ({teamMembers.length})</p>
                            <div className={styles['team-members-list']}>
                                {teamMembers.map(member => {
                                    const isSelected = meetingData.participants.includes(member._id);
                                    const imgURL = member.picture;
                                    return (
                                        <div key={member._id} className={styles['team-member-item']}>
                                            <img
                                                className={styles['member-close']}
                                                src={close}/>
                                            {userId === member._id ?
                                                <img className={styles['organizer']} src={crown}/> : null
                                            }
                                            <img
                                                className={styles['member-picture']}
                                                src={imgURL} alt={member.name}/>
                                            <div className={styles['member-details']}>
                                                <p>{member.name}</p><p>{member.email}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className={styles['meeting-settings-group']}>
                            <p className={styles['form-title']}>Meeting Notifications</p>

                            <div className={styles['checkbox-group']}>
                                <div className={styles['checkbox-wrapper']}>
                                    <span id="notify-label"><img src={gmail}/> Notify all participants via email</span>
                                    <input
                                        type="checkbox"
                                        id="notify"
                                        aria-labelledby="notify-label"
                                        checked={meetingData.sendNotifications}
                                        onChange={(e) =>
                                            setMeetingData({...meetingData, sendNotifications: e.target.checked})
                                        }
                                    />
                                </div>

                                <div className={styles['checkbox-wrapper']}>
                                    <span id="remind-label"><img src={clock}/> Remind participants 10 minutes before start</span>
                                    <input
                                        type="checkbox"
                                        id="remind"
                                        aria-labelledby="remind-label"
                                        checked={meetingData.sendReminder}
                                        onChange={(e) =>
                                            setMeetingData({...meetingData, sendReminder: e.target.checked})
                                        }
                                    />
                                </div>
                            </div>

                        </div>
                    </div>);

            default:
                return null;
        }
    };
    return (
        <div className={styles['meeting-creator-overlay']}>
            <div className={styles['glassmorphism']}>
                <div className={styles['meeting-creator-modal']}>
                    <div className={styles['header']}>
                        <div className={styles['header-flex']}>
                            <div className={styles['header-text']}>
                                <div><img src={videorecorder} alt="meeting"/></div>
                                <div>
                                    <p>Schedule A Meeting</p>
                                    <p>Schedule meetings easily by adding a title, time, and agenda. Get an instant join
                                        link and stay organized without switching tools.</p>
                                </div>
                            </div>
                        </div>
                        <img onClick={onClose} className={styles['close-modal']} src={close}/>
                        <div className={styles['header-flex']}>
                        </div>
                    </div>

                    <div className={styles['content']}>
                        <div className={styles['content-flex']}>
                            {renderStep()}
                        </div>
                    </div>

                    <div className={styles['footer']}>
                        <button onClick={prevStep} disabled={step === 1}>Back</button>
                        <button onClick={step === maxStep ? handleCreateMeeting : nextStep}>
                        {/*{step === maxStep ? <img src={videorecorder} alt="icon" /> : null}*/}
                            {step === maxStep ? "Create Meeting" : "Next"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MeetingCreatorModal;