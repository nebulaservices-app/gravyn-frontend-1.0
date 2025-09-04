// accessControlMiddleware.js

const { getUserAppPermissions } = require("../service/permissionService");

async function accessControlMiddleware(req, res, next) {
    const userId = req.userId || req.session?.userId; // Assume you attach userId via auth
    const { appKey } = req.params; // Or from req.body/query, as appropriate

    if (!userId || !appKey) {
        return res.status(401).json({ error: "Missing user or app identifier" });
    }

    try {
        // This function should return true/false if user can access appKey
        const hasAccess = await getUserAppPermissions(userId, appKey);

        if (!hasAccess) {
            return res.status(403).json({ error: "Access denied to this app/service" });
        }

        next(); // User is authorized, proceed to the handler
    } catch (err) {
        console.error("Access check error:", err);
        return res.status(500).json({ error: "Server error during access check" });
    }
}

module.exports = accessControlMiddleware;
