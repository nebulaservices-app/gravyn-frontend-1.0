import axios from "axios";

/**
 * Handles integration connections based on their type.
 * @param {Object} options
 * @param {Object} options.integration - The full integration object.
 * @param {string} options.userId - The user's unique ID.
 * @param {string} options.projectId - The project ID (optional, but defaults to Nebula).
 */
export const handleIntegrationConnect = async ({ integration, userId, projectId = "68159219cdb8524689046498" }) => {
    if (!integration || !integration.type || !integration.name) {
        console.warn("Invalid integration data.");
        return;
    }

    const { name, type, connectUrl } = integration;

    try {
        switch (type) {
            case "oauth":
                await handleOAuthConnect({ integrationName: name, userId, projectId });
                break;

            case "apikey":
                await handleAPIKeyConnect({ integration, userId, projectId });
                break;

            case "webhook":
                await handleWebhookConnect({ integration, userId, projectId });
                break;

            case "manual":
                handleManualSetup({ integration });
                break;

            default:
                alert("Unsupported integration type.");
                break;
        }
    } catch (error) {
        console.error(`Failed to connect ${name}:`, error.message);
        alert(`Failed to connect to ${name}.`);
    }
};

// ----------------- OAuth Handler ------------------
const handleOAuthConnect = async ({ integrationName, userId, projectId }) => {
    const endpointMap = {
        "Google Meet": "google-meet",
        "Google Calendar": "google-calendar",
        "Slack": "slack",
        "Microsoft Teams": "microsoft-teams",
    };

    const endpointKey = endpointMap[integrationName];
    if (!endpointKey) throw new Error(`OAuth endpoint not configured for ${integrationName}`);

    const res = await axios.get(`http://localhost:5001/auth/${endpointKey}/getUrl`, {
        params: { userId, projectId },
    });

    if (res?.data?.authUrl) {
        window.location.href = res.data.authUrl;
    } else {
        throw new Error("No auth URL returned from server.");
    }
};

// ----------------- API Key Handler ------------------
const handleAPIKeyConnect = async ({ integration, userId, projectId }) => {
    const apiKey = prompt(`Please enter your API key for ${integration.name}`);
    if (!apiKey) return;

    const res = await axios.post("http://localhost:5001/api/v1/integration/apikey-auth", {
        integrationId: integration._id,
        userId,
        projectId,
        apiKey,
    });

    if (res.status === 200) {
        alert(`${integration.name} connected successfully.`);
    } else {
        throw new Error("API key connection failed.");
    }
};

// ----------------- Webhook Handler ------------------
const handleWebhookConnect = async ({ integration, userId, projectId }) => {
    const callbackUrl = `https://yourdomain.com/webhooks/${integration.slug}/${userId}`;
    alert(`Please set this URL in ${integration.name}'s dashboard: ${callbackUrl}`);

    const res = await axios.post("http://localhost:5001/api/v1/integration/webhook-connect", {
        integrationId: integration._id,
        userId,
        projectId,
        callbackUrl,
    });

    if (res.status === 200) {
        alert(`${integration.name} webhook connection initiated.`);
    } else {
        throw new Error("Webhook setup failed.");
    }
};

// ----------------- Manual Setup ------------------
const handleManualSetup = ({ integration }) => {
    alert(`To connect ${integration.name}, please follow manual instructions provided in documentation.`);
};