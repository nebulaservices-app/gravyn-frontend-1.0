// src/hooks/useAITriage.js
import axios from 'axios';
import { useState } from 'react';

const BASELINE_URL = "http://localhost:5001";
let scanAttempts = 0;
const MAX_RESCAN_ATTEMPTS = 5;
export const useAITriage = ({ mode = "auto" } = {}) => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState([]);
    const [error, setError] = useState(null);

    // 🧠 Core Triage Runner (can take single or multiple issues)
    const triggerTriage = async (issues = []) => {
        setLoading(true);
        setError(null);

        try {
            const payload = Array.isArray(issues)
                ? { issues, mode }                   // Bulk triage
                : { issueId: issues, mode };         // Single triage

            const { data } = await axios.post(`${BASELINE_URL}/api/aitriage/run`, payload);
            setResult(prev => [...prev, ...(Array.isArray(data) ? data : [data])]);

            // 🔁 Auto-rescan logic (assumes server tells if more to scan)
            if (data?.nextScanRequired && scanAttempts < MAX_RESCAN_ATTEMPTS) {
                setTimeout(() => {
                    triggerTriage(); // Recursively recheck
                }, 1000); // Delay between checks (prevent spamming)
                scanAttempts++;
            }

            return data;
        } catch (err) {
            console.error("AI Triage failed", err);
            setError(err.response?.data?.message || "Triage failed.");
        } finally {
            setLoading(false);
        }
    };

    return {
        triggerTriage,
        loading,
        result,
        error
    };
};