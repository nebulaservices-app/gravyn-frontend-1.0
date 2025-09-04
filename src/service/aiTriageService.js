// /services/aiTriage/aiTriageService.js
import axios from "axios";

const BASE_URL = "http://localhost:5001/api/v1/aitriage";

// Enable or disable AI Triage
export const updateAITriageConfig = async (projectId, config = {}) => {
    console.log("Updating the projectId", projectId, typeof projectId);
    const { data } = await axios.post(`${BASE_URL}/config/${projectId}`, config);
    return data;
};

// Example usage to enable
// await updateAITriageConfig(projectId, { isEnabled: true, mode: "auto" });

// Get config
export const getAITriageConfig = async (projectId) => {
    const { data } = await axios.get(`${BASE_URL}/config/${projectId}`);
    return data;
};