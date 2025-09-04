import React, { useEffect, useState } from "react";
import styles from "./AppCenter.module.css";
import axios from "axios";
import IntegrationApp from "../features/IntegrationApp";
import icon from "../../images/int_icon/bitbucket.svg"

// Category icons
import allapps from "../../images/int_cat/allapps.svg";
import analytics from "../../images/int_cat/analytics.svg";
import automation from "../../images/int_cat/automation.svg";
import calendar from "../../images/int_cat/calendar&scheduling.svg";
import communication from "../../images/int_cat/communication.svg";
import dev from "../../images/int_cat/dev.svg";
import payment from "../../images/int_cat/paymentgateway.svg";
import storage from "../../images/int_cat/storage&filemanagement.svg";

// Category icons mapping
const categoryIcons = {
    "All Apps": allapps,
    "Analytics": analytics,
    "Automation": automation,
    "Calendar & Scheduling": calendar,
    "Communication": communication,
    "Developer Tools": dev,
    "Payment Gateway": payment,
    "Storage & File Management": storage,
};

const IntegrationCard = ({ integrationData, icon, name, description, isConnected, setSelectedIntegration }) => (
    <div onClick={() => setSelectedIntegration(integrationData._id)} className={styles.card}>
        <div className={styles["action-wrapper"]}>
            <p>{isConnected ? "Connected" : "Connect"}</p>
        </div>
        <div className={styles.cardHeader}>
            <img src={icon} className={styles.cardIcon} />
        </div>
        <div className={styles.cardBody}>
            <p>{name}</p>
            <p>{description}</p>
        </div>
    </div>
);

const AppCenter = ({onClose}) => {
    const [userId, setUserId] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState("All Apps");
    const [selectedIntegration, setSelectedIntegration] = useState(null);
    const [integrations, setIntegrations] = useState([]);
    const [categories, setCategories] = useState([
        "All Apps",
        "Analytics",
        "Automation",
        "Calendar & Scheduling",
        "Communication",
        "Developer Tools",
        "Payment Gateway",
        "Storage & File Management",
        "CRM",
        "Collaboration",
        "Video Conferencing",
        "Monitoring",
        "Source Control",
        "Testing",
    ]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get("http://localhost:5001/api/v1/integration");
                const data = res.data;
                setIntegrations(data);
            } catch (err) {
                console.error("Failed to fetch integrations:", err);
            }
        };

        setUserId(localStorage.getItem("nuid"));
        fetchData();
    }, []);

    const filteredIntegrations =
        selectedCategory === "All Apps"
            ? integrations
            : integrations.filter((i) => i.category === selectedCategory);



    const wrapperRef = React.useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                onClose(); // Call close handler
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [onClose]);

    return (
        <section className={styles["page-wrapper-overlay"]}>
            <div ref={wrapperRef} className={styles["page-wrapper"]}>
                {/* Sidebar */}
                <div className={styles["integration-side-bar"]}>
                    <div className={styles["integration-side-bar-head"]}>
                        <div className={styles["sidebar-heading"]}>
                            <p>LIBRARY</p>
                        </div>

                        {categories.map((cat) => (
                            <div
                                key={cat}
                                className={`${styles["sidebar-item"]} ${
                                    selectedCategory === cat ? styles["active"] : ""
                                }`}
                                onClick={() => {
                                    setSelectedCategory(cat);
                                    setSelectedIntegration(null);
                                }}
                            >
                                <img
                                    src={categoryIcons[cat] || allapps}
                                    alt={cat}
                                    className={styles["sidebar-icon"]}
                                />
                                <span>{cat}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main panel */}
                <div className={styles["integration-panel"]}>
                    <div className={styles["integration-nav-bar"]}>
                        <div className={styles["int-sitemap"]}>
                            <p className={styles["breadcrumb"]}>{selectedCategory}</p>
                        </div>
                    </div>

                    {selectedIntegration ? (
                        <IntegrationApp
                            integrationId={selectedIntegration}
                            userId={userId}
                        />
                    ) : (
                        <div className={styles["integration-app-list-wrapper"]}>
                            <div className={styles["header-wrapper"]}>
                                <div className={styles["header-left-flex"]}>
                                    <div className={styles["header-left-text-wrapper"]}>
                                        <p>Integration Apps</p>
                                        <p>Lorem ipsum dolor sit amet consectetur adipiscing elit.</p>
                                    </div>
                                </div>
                            </div>

                            <div className={styles["integration-list-child-wrapper"]}>
                                {filteredIntegrations.map((integration, index) => (
                                    <IntegrationCard
                                        key={index}
                                        integrationData={integration}
                                        icon={
                                            integration.icon
                                        }
                                        name={integration.name}
                                        description={integration.description}
                                        isConnected={integration.isConnected}
                                        setSelectedIntegration={setSelectedIntegration}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default AppCenter;