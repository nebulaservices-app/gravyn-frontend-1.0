import axios from "axios";

const BASE_URL = "http://localhost:5001/api/v1/issues"; // Update this if your backend is hosted elsewhere

/**
 * Fetch issues with optional filters and pagination.
 * @param {Object} filters - Filtering & pagination options
 */
export const fetchIssues = async (filters = {}) => {
    try {
        const params = {
            ...(filters.projectId && { projectId: filters.projectId }),
            ...(filters.taskId && { taskId: filters.taskId }),
            ...(filters.status && { status: filters.status }),
            ...(filters.severity && { severity: filters.severity }),
            ...(filters.type && { type: filters.type }),
            ...(filters.triage && { triage: filters.triage }),
            page: filters.page || 1,
            limit: filters.limit || 20,
            sortBy: filters.sortBy || "createdAt",
            sortOrder: filters.sortOrder || "desc",
        };

        const response = await axios.get(BASE_URL, { params });
        return response.data?.data || [];
    } catch (error) {
        console.error("❌ Failed to fetch issues:", error.response?.data || error.message);
        throw error;
    }
};

/**
 * Fetch a single issue by ID.
 * @param {string} issueId
 */
export const fetchIssueById = async (issueId) => {
    try {
        const response = await axios.get(`${BASE_URL}/${issueId}`);
        return response.data?.data;
    } catch (error) {
        console.error("❌ Failed to fetch issue:", error.response?.data || error.message);
        throw error;
    }
};

/**
 * Create a new issue.
 * @param {Object} issueData
 */
export const createIssue = async (issueData) => {
    try {
        const response = await axios.post(BASE_URL, issueData);
        return response.data;
    } catch (error) {
        console.error("❌ Failed to create issue:", error.response?.data || error.message);
        throw error;
    }
};

/**
 * Update an existing issue.
 * @param {string} issueId
 * @param {Object} updates
 */
export const updateIssue = async (issueId, updates) => {
    try {
        const response = await axios.put(`${BASE_URL}/${issueId}`, updates);
        return response.data;
    } catch (error) {
        console.error("❌ Failed to update issue:", error.response?.data || error.message);
        throw error;
    }
};

/**
 * Delete an issue by ID.
 * @param {string} issueId
 */
export const deleteIssue = async (issueId) => {
    try {
        const response = await axios.delete(`${BASE_URL}/${issueId}`);
        return response.data;
    } catch (error) {
        console.error("❌ Failed to delete issue:", error.response?.data || error.message);
        throw error;
    }
};

/**
 * Add a comment to a specific issue.
 * @param {string} issueId
 * @param {Object} commentData - { text: string, author: ObjectId }
 */
export const addCommentToIssue = async (issueId, commentData) => {
    try {
        const response = await axios.post(`${BASE_URL}/${issueId}/comments`, commentData);
        return response.data;
    } catch (error) {
        console.error("❌ Failed to add comment:", error.response?.data || error.message);
        throw error;
    }
};

/**
 * Add a log to a specific issue.
 * @param {string} issueId
 * @param {Object} logEntry - { action: string, by: ObjectId, timestamp?: Date }
 */
export const addLogToIssue = async (issueId, logEntry) => {
    try {
        const response = await axios.post(`${BASE_URL}/${issueId}/logs`, logEntry);
        return response.data;
    } catch (error) {
        console.error("❌ Failed to add log:", error.response?.data || error.message);
        throw error;
    }
};


/**
 * Update specific fields of an issue (e.g., dueDate).
 * @param {string} issueId
 * @param {Object} updates - Partial fields to update (e.g., { dueDate: "2025-07-06" })
 */
export const updateIssueField = async (issueId, updates) => {
    try {
        const response = await axios.patch(`${BASE_URL}/${issueId}`, updates);
        return response.data;
    } catch (error) {
        console.error("❌ Failed to patch issue:", error.response?.data || error.message);
        throw error;
    }
};