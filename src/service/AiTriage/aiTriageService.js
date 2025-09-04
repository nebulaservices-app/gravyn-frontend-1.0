

// aiTriageService.js
import {aiTriageAutoMode} from "../Project/ProjectFetcher";

const aiTriageService = {
    autoTriageIntervalId: null,

    start: (project) => {
        // Expect project object: { _id, aiTriage: { isEnabled, mode } }
        if (!project?.aiTriage?.isEnabled) return;

        const mode = project.aiTriage.mode || "auto"; // Default to auto

        if (mode === "auto") {
            aiTriageService.startAutoTriagePolling(project._id);
            const result = aiTriageAutoMode(project?._id);
        } else {
            // Manual: Just ensure auto-poller is stopped
            aiTriageService.stopAutoTriagePolling();
        }
        console.log(`AI Triage Service started for project ${project._id} | Mode: ${mode}`);
    },

    stop: () => {
        aiTriageService.stopAutoTriagePolling();
        console.log("AI Triage Service stopped/cleaned up.");
    },

    // ----- Optional private helpers -----
    startAutoTriagePolling(projectId) {
        aiTriageService.stopAutoTriagePolling(); // Cancel previous polling if any
        aiTriageService.autoTriageIntervalId = setInterval(() => {
            // 🔄 TODO: Replace with your backend polling/API call
            console.log(`[AI Triage Poll] Project ${projectId} - backend check`);

            //Example: fetch('/api/ai-triage/poll', { method: 'POST', body: JSON.stringify({ projectId }) })//

        }, 3000); // Poll every 30 seconds
    },

    stopAutoTriagePolling() {
        if (aiTriageService.autoTriageIntervalId !== null) {
            clearInterval(aiTriageService.autoTriageIntervalId);
            aiTriageService.autoTriageIntervalId = null;
        }
    }
};

export default aiTriageService;
