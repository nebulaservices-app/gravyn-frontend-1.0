import axios from "axios";

const BASE_URL = "http://localhost:5001"; // or your actual base URL

/**
 * Fetch a single project by ID.
 * @param {string} projectId - The ID of the project to fetch.
 * @returns {Promise<object>} - The fetched project data.
 */
export const getProjectById = async (projectId) => {
    try {
        const response = await axios.get(`${BASE_URL}/api/v1/projects/${projectId}`);
        return response.data;
    } catch (error) {
        if (error.response) {
            console.error(`❌ Error fetching project (status ${error.response.status}):`, error.response.data);
        } else {
            console.error("❌ Error fetching project:", error.message);
        }
        throw error;
    }
};

/**
 * Fetch the latest project update for a given project.
 * @param {string} projectId - The ID of the project to fetch the latest update for.
 * @returns {Promise<object>} - The latest project update data.
 */
export const getLatestProjectUpdate = async (projectId) => {
    try {
        const response = await axios.get(`${BASE_URL}/api/v1/projects/updates/latest/${projectId}`);
        console.log("Response generated " , response)
        return response?.data;
    } catch (error) {
        if (error.response) {
            console.error(`❌ Error fetching latest project update (status ${error.response.status}):`, error.response.data);
        } else {
            console.error("❌ Error fetching latest project update:", error.message);
        }
        throw error;
    }
};



















// DriftIQ Functions - Added to project service
/**
 * Check for drift bottlenecks in a project
 * @param {string} projectId - The ID of the project to check
 * @param {string} userId - The ID of the requesting user
 * @param {boolean} forceFresh - Whether to force a fresh analysis
 * @returns {Promise<object>} - Drift analysis results
 */
export const checkProjectDrift = async (projectId, userId, forceFresh = false) => {
    try {
        const response = await axios.post(`${BASE_URL}/api/v1/projects/${projectId}/drift-check`, {
            userId,
            forceFresh
        });

        console.log("Response datea", response.data)
        return response.data;
    } catch (error) {
        if (error.response) {
            console.error(`❌ Error checking project drift (status ${error.response.status}):`, error.response.data);
        } else {
            console.error("❌ Error checking project drift:", error.message);
        }
        throw error;
    }
};

/**
 * Create a drift for a project
 * @param {string} projectId - The ID of the project
 * @param {string} userId - The ID of the requesting user
 * @param {boolean} acceptDrift - Whether to accept and create the drift
 * @returns {Promise<object>} - Drift creation results
 */
export const createProjectDrift = async (projectId, userId, acceptDrift = true) => {
    try {
        const response = await axios.post(`${BASE_URL}/api/v1/projects/${projectId}/create-drift`, {
            userId,
            acceptDrift
        });
        return response.data;
    } catch (error) {
        if (error.response) {
            console.error(`❌ Error creating project drift (status ${error.response.status}):`, error.response.data);
        } else {
            console.error("❌ Error creating project drift:", error.message);
        }
        throw error;
    }
};

/**
 * Get active drifts for a project
 * @param {string} projectId - The ID of the project
 * @returns {Promise<object>} - Active drifts data
 */
export const getProjectDrifts = async (projectId) => {
    try {
        const response = await axios.get(`${BASE_URL}/api/v1/projects/${projectId}/drifts`);
        return response.data;
    } catch (error) {
        if (error.response) {
            console.error(`❌ Error fetching project drifts (status ${error.response.status}):`, error.response.data);
        } else {
            console.error("❌ Error fetching project drifts:", error.message);
        }
        throw error;
    }
};













/**
 * Trigger AI Triage Auto Mode on a specific issue
 * @param {string} projectId - The ID of the project
 * @returns {Promise<object>} - Response from AI triage auto mode
 */
export const aiTriageAutoMode = async (projectId) => {
    try {
        const response = await axios.post(`${BASE_URL}/api/v1/projects/${projectId}/triage-issue`);
        return response.data;
    } catch (error) {
        if (error.response) {
            console.error(`❌ Error calling AI Triage auto mode (status ${error.response.status}):`, error.response.data);
        } else {
            console.error("❌ Error calling AI Triage auto mode:", error.message);
        }
        throw error;
    }
};

