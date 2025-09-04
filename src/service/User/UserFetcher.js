import axios from "axios";

const BASE_URL = "http://localhost:5001/api/v1";

/**
 * Fetch a user by their userId.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<Object>} - The user data.
 * @throws {Error} - Throws error if the request fails.
 */
export const getUserById = async (userId) => {
    try {
        const response = await axios.get(`${BASE_URL}/users/${userId}`, {
            headers: {
                Authorization: `Bearer ${userId}`, // Optional: Replace with actual auth token if needed
            },
        });

        return response.data?.data;
    } catch (error) {
        console.error("🔴 Failed to fetch user:", error.response?.data || error.message);
        throw error;
    }
};

/**
 * Fetch only the name and picture of a user by their userId.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<{ name: string, picture: string }>} - The user's name and picture.
 * @throws {Error} - Throws error if the request fails.
 */
export const getUserNameAndImageById = async (userId) => {
    try {
        const response = await axios.get(`${BASE_URL}/users/${userId}`, {
            headers: {
                Authorization: `Bearer ${userId}`,
            },
        });

        const { name, picture } = response.data?.data || {};
        return { name, picture };
    } catch (error) {
        console.error("🔴 Failed to fetch user name and image:", error.response?.data || error.message);
        throw error;
    }
};