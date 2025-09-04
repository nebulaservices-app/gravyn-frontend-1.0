import axios from "axios";

const BASE_URL = "http://localhost:5001/api/v1/google_meet";

/**
 * Refreshes Google OAuth access token using the refresh token.
 * Automatically stores the new access token and expiry if needed.
 */
export const refreshGoogleAccessToken = async (integrationInstanceId) => {
    try {
        const response = await axios.post(`${BASE_URL}/refresh-token`, {
            integrationInstanceId
        });

        const { accessToken, expiresAt } = response.data;

        console.log("✅ Refreshed access token:", accessToken);
        return { accessToken, expiresAt };
    } catch (err) {
        console.error("🔴 Error refreshing token:", err.response?.data || err.message);
        throw err;
    }
};

/**
 * Checks whether the current access token is expired based on expiry time.
 */
export const isGoogleTokenExpired = (expiresAt) => {
    if (!expiresAt) return true;
    return new Date() >= new Date(expiresAt);
};