import axios from 'axios';

const redirectToOAuth = ({ authBaseUrl, clientId, redirectUri, scopes, state, extraParams = "", responseType = "code" }) => {
    const encodedScopes = encodeURIComponent(scopes.join(" "));
    const encodedRedirectUri = encodeURIComponent(redirectUri);
    const encodedState = encodeURIComponent(state);

    const url = `${authBaseUrl}?client_id=${clientId}&redirect_uri=${encodedRedirectUri}&response_type=${responseType}&scope=${encodedScopes}&state=${encodedState}${extraParams}`;
    window.location.href = url;
};

const getIntegrationType = (name) => {
    const lower = name.toLowerCase();

    if (lower.includes("slack")) return "slack";
    if (lower.includes("meet")) return "google_meet";
    if (lower.includes("discord")) return "discord";
    if (lower.includes("github")) return "github";
    if (lower.includes("gitlab")) return "gitlab";
    if (lower.includes("notion")) return "notion";
    if (lower.includes("drive")) return "google_drive";
    if (lower.includes("hubspot")) return "hubspot";
    if (lower.includes("paypal")) return "paypal";
    if (lower.includes("stripe")) return "stripe";
    if (lower.includes("postman")) return "postman";
    if (lower.includes("zapier")) return "zapier";
    if (lower.includes("bitbucket")) return "bitbucket";
    if (lower.includes("hotjar")) return "hotjar";
    if (lower.includes("analytics")) return "google_analytics";
    if (lower.includes("calendar")) return "google_calendar";
    if (lower.includes("onedrive")) return "onedrive";
    if (lower.includes("dropbox")) return "dropbox";

    return null;
};

// Integration Handlers
const handlers = {
    google_meet: async (integrationId, userId, projectId) => {
        const { data } = await axios.get(`http://localhost:5001/api/v1/integration/${integrationId}`);
        const { oauth } = data;

        const statePayload = {
            userId,
            projectId,
            integrationId
        };

        const state = encodeURIComponent(JSON.stringify(statePayload));

        redirectToOAuth({
            authBaseUrl: oauth.authBaseUrl,
            clientId: oauth.clientId,
            redirectUri: oauth.redirectUri,
            scopes: oauth.scopes,
            state,
            extraParams: "&access_type=offline&prompt=consent"
        });
    },

    google_calendar: async (integrationId, userId, projectId) => {
        const { data } = await axios.get(`http://localhost:5001/api/v1/integration/${integrationId}`);
        const { oauth } = data;

        const statePayload = {
            userId,
            projectId,
            integrationId
        };

        const state = encodeURIComponent(JSON.stringify(statePayload));

        redirectToOAuth({
            authBaseUrl: oauth.authBaseUrl,
            clientId: oauth.clientId,
            redirectUri: oauth.redirectUri,
            scopes: oauth.scopes,
            state,
            extraParams: "&access_type=offline&prompt=consent"
        });
    },


    slack: async (integrationId, userId) => {
        const { data } = await axios.get(`http://localhost:5001/api/v1/integration/${integrationId}`);
        const { oauth } = data;

        console.log("Oauth data" , oauth)

        const encodedScopes = encodeURIComponent(oauth.scopes.join(","));
        const encodedRedirectUri = encodeURIComponent(oauth.redirectUri);
        const encodedState = encodeURIComponent(userId);

        const url = `${oauth.authBaseUrl}?client_id=${oauth.clientId}&scope=${encodedScopes}&redirect_uri=${encodedRedirectUri}&state=${encodedState}`;
        window.location.href = url;
    },

    discord: async (integrationId, userId) => {
        const { data } = await axios.get(`http://localhost:5001/api/v1/integration/${integrationId}`);
        const { oauth } = data;

        redirectToOAuth({
            authBaseUrl: oauth.authBaseUrl,
            clientId: oauth.clientId,
            redirectUri: oauth.redirectUri,
            scopes: oauth.scopes,
            state: userId,
            extraParams: "&prompt=consent"
        });
    },

    github: async (integrationId, userId, projectId) => {
        // For an OAuth app, you get this information from a generic integration config.
        const { data } = await axios.get(`http://localhost:5001/api/v1/integration/${integrationId}`);
        const { oauth } = data; // Assuming your backend provides the OAuth details

        // Construct the state payload.
        const statePayload = { userId, projectId, key: 'github' };
        const state = encodeURIComponent(JSON.stringify(statePayload));

        // Use the generic helper to build the correct OAuth URL
        redirectToOAuth({
            authBaseUrl: 'https://github.com/login/oauth/authorize', // The standard GitHub OAuth URL
            clientId: oauth.clientId, // Your app's public Client ID
            redirectUri: oauth.redirectUri, // Your pre-configured callback URL
            scopes: oauth.scopes, // e.g., ['repo', 'read:user']
            state: state
        });
    },
};

// Main Dynamic Handler
export const handleAppConnect = async (integrationName, integrationId, projectId) => {
    try {
        const userId = localStorage.getItem("nuid");
        if (!userId || !integrationId || !integrationName || !projectId) {
            alert("Missing user, integration, or project info.");
            return;
        }

        const type = getIntegrationType(integrationName);

        console.log("Intergation type" , type)

        if (!type || !handlers[type]) {
            alert(`Unsupported or unknown integration: ${integrationName}`);
            return;
        }

        await handlers[type](integrationId, userId, projectId); // 👈 now passes all 3
    } catch (err) {
        console.error("🔴 App connect error:", err.message);
        alert("Failed to initiate app connection.");
    }
};