import React, {useEffect, useState} from "react"
import styles from "./MeetingOverview.module.css"
import videorecorder from "../../images/icons/video_recorder_dark.svg"
import people from "../../images/icons/people.svg"
import axios from "axios";
import googleMeet from "../../images/integration/google_integration/google-meet-icon.svg"
import timeline from "../../images/icons/timeline.svg"
import {
    formatDateTime,
    formatFullDate,
    formatMeetingTime,
    formatTime12Hour,
    formatTime24Hour, getTimeElapsed
} from "../../utils/datetime";
const MeetingOverview = ({ project , userId , onOpenModal}) => {


    const GOOGLE_MEET_KEY = "google_key";

    const [meetings , setMeetings] = useState([]);

    const fetchMeetings = async ( projectId, userId ) => {
        console.log()
        try {
            const response = await axios.get(`http://localhost:5001/api/v1/google_meet/list`, {
                params: { userId, projectId }
            });

            setMeetings(response.data)
            return response.data;
        } catch (err) {
            console.error("❌ Failed to fetch meetings:", err.response?.data || err.message);
            throw err;
        }
    };

    useEffect(() => {
        fetchMeetings(project._id  , userId )
    }, []);
    return(
        <div className={styles['meeting-overview-wrapper']}>
            <div className={styles['meeting-overview-tab-wrapper']}>
                <div className={styles['m-o-flex-item']}>
                    <div className={styles['m-o-flex-item-i']}>
                        <p className={styles['tab-heading']}>Meeting Overview</p>
                        <div className={styles['tab-count-wrapper']}>
                            <span className={styles['tab-count']}>
                                {meetings.length < 10 ? `0${meetings.length}` : meetings.length}
                            </span>
                        </div>
                    </div>
                </div>
                <div className={styles['m-o-flex-item']}>
                    <div className={styles['m-o-flex-item-i']}>

                    </div>
                </div>
            </div>
            <div className={styles['meeting-overview-list-wrapper']}>
                {
                    meetings.length > 0 ? (
                        <div className={styles['meeting-list-wrapper']}>
                            {meetings.map((meeting, index) => (
                                <div key={index} className={styles['meeting-card']}>

                                    <div
                                        className={styles['action-wrapper']}>
                                        <a href={meeting.link}>Join Now</a>
                                    </div>

                                    <div className={styles['meeting-card-header']}>

                                        <div className={styles['meeting-card-details']}>

                                            <div className={styles['meeting-title-wrapper']}>
                                                <p className={styles['meeting-title']}>{meeting.title}</p>
                                                <p className={styles['meeting-status']}>Upcoming</p>
                                                <p className={styles['meeting-time-elapsed']}>{getTimeElapsed(meeting.createdAt)}</p>
                                            </div>

                                            <p className={styles['meeting-agenda']}>{meeting.agenda}</p>

                                        </div>
                                    </div>

                                    <div className={styles['meeting-card-footer']}>
                                        <div className={styles['meeting-footer-capsule']}>
                                            <div className={styles['meeting-footer-pill']}>
                                                {meeting.participants.length > 0 &&
                                                    meeting.participants.map((participant, i) => (
                                                        <img
                                                            key={i}
                                                            className={styles['participant-avatar']}
                                                            src={participant.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(participant.name)}&background=random`}
                                                            alt={participant.name}
                                                            title={participant.name}
                                                        />
                                                    ))
                                                }
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className={styles['no-meeting-wrapper']}>
                            <div className={styles['no-meeting-details-wrapper']}>
                                <img src={videorecorder} alt="No meetings" className={styles['no-meeting-icon']}/>
                                <p className={styles['no-meeting-text']}>No meetings scheduled</p>
                                <p className={styles['no-meeting-subtext']}>
                                    You don't have any upcoming meetings. Create one to get started!
                                </p>
                                <div
                                    onClick={onOpenModal}
                                    className={styles['create-meet-no']}>
                                    Create now
                                </div>
                            </div>
                        </div>
                    )
                }
            </div>
        </div>
    )
}

export default MeetingOverview;