import axios from "axios";

const BASE_URL = "http://localhost:5001/api/v1/google_meet";

// Create a new Google Meet meeting
// Modify createMeeting
// api/meeting.js
export const createMeeting = async ({ userId, projectId, meetingDetails }) => {
    try {
        const response = await axios.post(`${BASE_URL}/create`, {
            userId,
            projectId,
            meetingDetails
        });

        return response.data;
    } catch (err) {
        console.error("🔴 Error creating Google Meet:", err.response?.data || err.message);
        throw err;
    }
};

// (Optional) Get all scheduled meetings for a project
export const getMeetings = async (projectId) => {
    try {
        const response = await axios.get(`${BASE_URL}/list`, {
            params: { projectId }
        });

        return response.data.meetings;
    } catch (err) {
        console.error("🔴 Error fetching meetings:", err.message);
        throw err;
    }
};

// (Optional) Delete/cancel a meeting
export const deleteMeeting = async ({ eventId, integrationInstanceId }) => {
    try {
        const response = await axios.delete(`${BASE_URL}/delete`, {
            data: { eventId, integrationInstanceId }
        });

        return response.data;
    } catch (err) {
        console.error("🔴 Error deleting meeting:", err.message);
        throw err;
    }
};