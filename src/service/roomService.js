// src/services/roomService.js

import axios from "axios";

// ✅ Axios instance
const api = axios.create({
    baseURL: "http://localhost:5001/api/v1/rooms",
    withCredentials: true
});

// 🏗️ Create a new room
export const createRoom = async (roomData) => {
    const res = await api.post("/", roomData);
    return res.data;
};

// 📥 Get a room by its ID
export const getRoomById = async (roomId) => {
    const res = await api.get(`/${roomId}`);
    return res.data;
};

// 📦 Get all rooms a user is part of
export const getRoomsByUserId = async (userId) => {
    const res = await api.get(`/user/${userId}`);
    return res.data;
};

// ✏️ Update a room's details
export const updateRoom = async (roomId, updateData) => {
    const res = await api.put(`/${roomId}`, updateData);
    return res.data;
};

// ⚙️ Update config only
export const updateRoomConfig = async (roomId, configUpdate) => {
    const res = await api.put(`/${roomId}/config`, configUpdate);
    return res.data;
};

// ➕ Add a participant to a room
export const addParticipant = async (roomId, participantData) => {
    const res = await api.post(`/${roomId}/participants`, participantData);
    return res.data;
};

// ➖ Remove a participant from a room
export const removeParticipant = async (roomId, userId) => {
    const res = await api.delete(`/${roomId}/participants/${userId}`);
    return res.data;
};

// 🗑️ Soft delete a room for a user
export const softDeleteRoomForUser = async (roomId, userId) => {
    const res = await api.delete(`/${roomId}/soft-delete/${userId}`);
    return res.data;
};


// 📁 Get all rooms under a specific project
export const getRoomsByProjectId = async (projectId) => {
    const res = await api.get(`/project/${projectId}`);
    return res.data;
};

// 📁 Get all rooms a user is part of in a specific project
export const getUserRoomsByProject = async (projectId, userId) => {
    const res = await api.get(`/project/${projectId}/user/${userId}`);
    return res.data;
};

// 📌 Check if DM room exists between two users in a project
export const checkDMRoom = async (projectId, user1Id, user2Id) => {
    try {
        const res = await api.get(`/project/${projectId}/dm/${user1Id}/${user2Id}`);
        return res.data; // Expected: { exists: true/false, room: {...} }
    } catch (err) {
        console.error("❌ Failed to check DM room:", err);
        return { exists: false };
    }
};

// 📌 Boolean version: checks if a DM room exists between two users in a project
export const doesDMRoomExist = async (projectId, user1Id, user2Id) => {
    try {
        const res = await api.get(`/project/${projectId}/dm/${user1Id}/${user2Id}`);
        return res.data.exists === true;
    } catch (err) {
        console.error("❌ Failed to check DM room existence:", err);
        return false;
    }
};