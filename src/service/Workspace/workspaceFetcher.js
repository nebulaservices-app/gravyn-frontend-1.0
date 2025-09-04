// utils/workspaceService.js or services/workspaceService.js

const BASE_URL = "http://localhost:5001"; // Or use env variable

export const fetchWorkspaceById = async (workspaceId) => {
    try {
        const response = await fetch(`${BASE_URL}/api/v1/workspaces/${workspaceId}`);

        if (!response.ok) {
            throw new Error("Failed to fetch workspace data");
        }

        const data = await response.json();
        return data;
    } catch (err) {
        console.error("Error fetching workspace:", err.message);
        throw err;
    }
};