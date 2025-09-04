import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import styles from "./IntegrationApp.module.css";
import { handleAppConnect } from "../../utils/appConnectorHandlers";

// Import your images
import disconnectIcon from "../../images/icons/disconnect.svg";
import lockIcon from "../../images/integration/lock.svg";
import successIcon from "../../images/integration/google_integration/success.svg";

const IntegrationApp = ({ integrationId, userId, projectId = "68159219cdb8524689046498" }) => {
    const [integration, setIntegration] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState(null);

    // A single, efficient function to fetch all necessary data.
    const fetchData = useCallback(async () => {
        setLoading(true);
        const userIdToUse = localStorage.getItem("nuid") || userId;
        if (!integrationId || !userIdToUse) {
            setLoading(false);
            return;
        }

        try {
            // 1. Fetch the static details of the integration (name, description, etc.)
            const integrationRes = await axios.get(`http://localhost:5001/api/v1/integration/${integrationId}`);
            const integrationData = integrationRes.data;
            setIntegration(integrationData);

            // 2. Check if the user has an active connection for this integration key
            const appIntRes = await axios.get(`http://localhost:5001/api/v1/app-integrations/find/by-user-project`, {
                params: { userId: userIdToUse, projectId, key: integrationData.key }
            });

            if (appIntRes.data?.data) {
                setIsConnected(true);
                // 3. If connected, fetch the user's profile for display
                const userRes = await axios.get(`http://localhost:5001/api/v1/users/${userIdToUse}`);
                setUserData(userRes.data.data);
            } else {
                setIsConnected(false);
                setUserData(null);
            }
        } catch (error) {
            console.error("Error loading integration data:", error);
            setIsConnected(false); // Assume not connected on error
        } finally {
            setLoading(false);
        }
    }, [integrationId, userId, projectId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDisconnection = async () => {
        if (!window.confirm("Are you sure you want to disconnect this integration?")) return;
        const userIdToUse = localStorage.getItem("nuid") || userId;
        try {
            await axios.delete(`http://localhost:5001/api/v1/integration/app-integration/delete`, {
                params: { integrationId, userId: userIdToUse, projectId }
            });
            alert("Integration successfully disconnected.");
            fetchData(); // Refresh the component's state
        } catch (error) {
            console.error("Error disconnecting integration:", error);
            alert("An error occurred while disconnecting the integration.");
        }
    };

    if (loading) return <div className={styles['loading-container']}>Loading...</div>;
    if (!integration) return <div className={styles['loading-container']}>Integration not found.</div>;

    return (
        <div className={styles["integration-wrapper"]}>
            <div className={styles['app-integration-overflow-wrapper']}>
                <div className={styles["app-integration-wrapper"]}>
                    <div className={styles["header"]}>
                        <img className={styles["integration-icon"]} src={integration.icon} alt="icon" />
                        <p className={styles["integration-name"]}>{integration.name}</p>
                    </div>

                    <div className={styles['content']}>
                        {isConnected && userData && (
                            <div className={styles['connection-capsule-parent-wrapper']}>
                                <div className={styles['connected-user-wrapper']}>
                                    <div className={styles['connected-user-flex-left']}>
                                        <img src={userData.picture} className={styles['connected-user-picture']} alt="user" />
                                        <div className={styles['connected-user-details']}>
                                            <p className={styles['connected-user-name']}>{userData.name}</p>
                                            <p className={styles['connected-user-email']}>{userData.email}</p>
                                        </div>
                                    </div>
                                    <div onClick={handleDisconnection} className={styles['connected-disconnection-button']}>
                                        <img src={disconnectIcon} alt="disconnect"/>
                                        <p>Disconnect</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className={styles['integration-overview']}>
                            <h3>App Overview</h3>
                            <div dangerouslySetInnerHTML={{ __html: integration.longDescription }} />
                        </div>
                        {/* ... other sections like Features and Permissions ... */}
                    </div>
                </div>
            </div>

            <div className={styles['app-integration-meta-wrapper']}>
                {/* ... your metadata items ... */}
                {isConnected ? (
                    <div className={`${styles['connect-button']} ${styles['connected']}`}>
                        ✓ Connected
                    </div>
                ) : (
                    <div onClick={() => handleAppConnect(integration.name, integration._id, projectId)} className={styles['connect-button']}>
                        Connect {integration.name}
                    </div>
                )}
            </div>
        </div>
    );
};

export default IntegrationApp;
