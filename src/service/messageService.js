// src/services/messageService.js

import axios from "axios";

// ✅ Axios instance (optional improvement)
const api = axios.create({
    baseURL: "http://localhost:5001/api/v1/messages",
    withCredentials: true
});

// 📤 Send a new message
export const sendMessage = async (messageData) => {
    const res = await api.post("/", messageData);
    return res.data;
};

// 📥 Get all messages in a room (supports pagination)
export const getMessagesByRoomId = async (roomId, limit = 50, skip = 0) => {
    const res = await api.get(`/room/${roomId}`, {
        params: { limit, skip }
    });
    console.log("Messages from the frontend ", res.data);
    return res.data;
};

// ❌ Soft delete a message for a specific user
export const softDeleteMessageForUser = async (messageId, userId) => {
    const res = await api.delete(`/${messageId}/soft-delete/${userId}`);
    return res.data;
};

// 🧹 Hard delete a message for everyone (admin/moderator only)
export const hardDeleteMessage = async (messageId) => {
    const res = await api.delete(`/${messageId}`);
    return res.data;
};

// 📌 (Optional) Pin a message
export const pinMessage = async (messageId) => {
    const res = await api.patch(`/${messageId}/pin`);
    return res.data;
};

// 📎 (Optional) Upload media or attachment
export const uploadAttachment = async (formData) => {
    const res = await api.post("/upload", formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });
    return res.data;
};