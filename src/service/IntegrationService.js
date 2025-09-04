import axios from "axios";

const BASE_URL = "http://localhost:5001/api/v1/integration";

export async function createIntegration(data) {
    try {
        const response = await axios.post(`${BASE_URL}/create`, data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
}

export async function getAllIntegrations() {
    try {
        const response = await axios.get(BASE_URL);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
}

export async function getIntegrationById(integrationId) {
    try {
        const response = await axios.get(`${BASE_URL}/${integrationId}`);
        return response;
    } catch (error) {
        throw error.response?.data || error;
    }
}

export async function updateIntegration(integrationId, data) {
    try {
        const response = await axios.put(`${BASE_URL}/${integrationId}`, data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
}

export async function deleteIntegration(integrationId) {
    try {
        const response = await axios.delete(`${BASE_URL}/${integrationId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
}

export async function validateIntegration() {
    try {
        const response = await axios.get(`${BASE_URL}/validate/check`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
}

export async function deleteAppSpecificIntegration(queryParams = "") {
    try {
        const response = await axios.delete(`${BASE_URL}/app/remove${queryParams}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
}