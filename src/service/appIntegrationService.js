import axios from "axios";

const BASE_URL = "http://localhost:5001/api/v1"; // fixed missing "//"

// ------------------ App Integrations ------------------

export async function createAppIntegration(data) {
    const response = await axios.post(`${BASE_URL}/app-integrations`, data);
    return response.data;
}

export async function getAllAppIntegrations() {
    const response = await axios.get(`${BASE_URL}/app-integrations`);
    return response.data;
}

export async function getAppIntegrationById(id) {
    const response = await axios.get(`${BASE_URL}/app-integrations/${id}`);
    return response.data;
}

export async function getAppIntegrationByUserAndProject(userId, projectId, key) {
    const params = { userId, projectId };
    if (key) params.key = key;

    const response = await axios.get(
        `${BASE_URL}/app-integrations/find/by-user-project`,
        { params }
    );
    return response.data;
}

export async function updateAppIntegration(id, data) {
    const response = await axios.put(`${BASE_URL}/app-integrations/${id}`, data);
    return response.data;
}

export async function deleteAppIntegration(id) {
    const response = await axios.delete(`${BASE_URL}/app-integrations/${id}`);
    return response.data;
}