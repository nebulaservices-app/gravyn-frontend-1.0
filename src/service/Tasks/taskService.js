// /service/Task/taskService.js
import axios from "axios";

const BASE_URL = "http://localhost:5001/api/v1/tasks";

// Optional: Central axios instance
const api = axios.create({
    baseURL: BASE_URL,
    timeout: 5000,
    headers: {
        "Content-Type": "application/json"
        // You can also inject Auth token here
    }
});

/**
 * Fetch all tasks for a specific project
 * @param {string} projectId
 * @returns {Promise<Array>}
 */
export const fetchTasksByProjectId = async (projectId) => {
    try {
        const response = await api.get(`/project/${projectId}`);
        return response.data;
    } catch (error) {
        console.error("❌ Failed to fetch tasks by project ID:", error.response?.data || error.message);
        throw error;
    }
};

/**
 * Fetch a single task by its ID
 * @param {string} taskId
 * @returns {Promise<Object>}
 */
export const fetchTaskById = async (taskId) => {
    try {
        const response = await api.get(`/${taskId}`);
        return response.data;
    } catch (error) {
        console.error("❌ Failed to fetch task:", error.response?.data || error.message);
        throw error;
    }
};

/**
 * Create a new task
 * @param {Object} taskData
 * @returns {Promise<Object>}
 */
export const createTask = async (taskData) => {
    try {
        const response = await api.post(`/`, taskData);
        return response.data;
    } catch (error) {
        console.error("❌ Failed to create task:", error.response?.data || error.message);
        throw error;
    }
};

/**
 * Update an existing task
 * @param {string} taskId
 * @param {Object} updateData
 * @returns {Promise<Object>}
 */
export const updateTask = async (taskId, updateData) => {
    try {
        const response = await api.put(`/${taskId}`, updateData);
        return response.data;
    } catch (error) {
        console.error("❌ Failed to update task:", error.response?.data || error.message);
        throw error;
    }
};

/**
 * Delete a task by ID
 * @param {string} taskId
 * @returns {Promise<Object>}
 */
export const deleteTask = async (taskId) => {
    try {
        const response = await api.delete(`/${taskId}`);
        return response.data;
    } catch (error) {
        console.error("❌ Failed to delete task:", error.response?.data || error.message);
        throw error;
    }
};

/**
 * Assign users to a task
 * @param {string} taskId
 * @param {Array<string>} userIds
 * @returns {Promise<Object>}
 */
export const assignUsersToTask = async (taskId, userIds) => {
    try {
        const response = await api.put(`/${taskId}/assign`, { userIds });
        return response.data;
    } catch (error) {
        console.error("❌ Failed to assign users:", error.response?.data || error.message);
        throw error;
    }
};

/**
 * Add comment to task
 * @param {string} taskId
 * @param {Object} commentData { text, authorId }
 * @returns {Promise<Object>}
 */
export const addCommentToTask = async (taskId, commentData) => {
    try {
        const response = await api.post(`/${taskId}/comments`, commentData);
        return response.data;
    } catch (error) {
        console.error("❌ Failed to add comment:", error.response?.data || error.message);
        throw error;
    }
};