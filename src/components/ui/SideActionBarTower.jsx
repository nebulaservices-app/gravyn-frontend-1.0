import React, { useState, useEffect, useRef } from "react";
import styles from "./SideActionBarTower.module.css";
import { getAppIntegrationByUserAndProject } from "../../service/appIntegrationService";
import { getIntegrationById } from "../../service/IntegrationService";
import { useParams } from "react-router-dom";
import add from "../../images/icons/add.svg";
import driftiq from "../../images/icons/driftiq.svg";
import aiTriage from "../../images/icons/aitriage.svg";
import useProjectContext from "../../hook/useProjectContext";
import tt1 from "../../images/aitriage/tt_aitriage_1.png";
import tt2 from "../../images/aitriage/tt_aitriage_2.png";
import tt3 from "../../images/aitriage/tt_aitriage_3.png";

// ------------- AI TRIAGE TOOLTIP STEPPER -------------
const steps = [
    {
        img: tt1,
        title: "Collect & Import",
        body: (
            <>Issues are automatically gathered from your workspace and all integrations (GitHub, GitLab, Figma, Intercom, and more).</>
        ),
    },
    {
        img: tt2,
        title: "Intelligent Analysis",
        body: (
            <>AI Triage automatically rates each issue’s urgency and impact, then classifies it as Severe, Critical, Medium, or Low—so priority is always clear.</>
        ),
    },
    {
        img: tt3,
        title: "Smart Assignment",
        body: (
            <>Severe and Critical issues are routed right away to the most appropriate team or member, ensuring urgent items get action without manual triage.</>
        ),
    },
];

const TooltipStepper = ({ children }) => {
    const HOVER_DELAY = 500;
    const STEP_AUTOPLAY_MS = 5000;
    const UNHOVER_CLOSE_DELAY = 700;
    const TOOLTIP_GAP = 8;

    const [show, setShow] = useState(false);
    const [waitingToShow, setWaitingToShow] = useState(false);
    const [step, setStep] = useState(0);
    const [isOverIcon, setIsOverIcon] = useState(false);
    const [isOverTooltip, setIsOverTooltip] = useState(false);
    // New: state for tooltip absolute position
    const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });

    const showDelayRef = useRef();
    const stepperIntervalRef = useRef();
    const closeDelayRef = useRef();
    const iconRef = useRef();

    // ----- Delayed open on hover of icon -----
    useEffect(() => {
        if (isOverIcon) {
            setWaitingToShow(true);
            showDelayRef.current = setTimeout(() => {
                // When showing, compute position relative to screen
                if (iconRef.current) {
                    const rect = iconRef.current.getBoundingClientRect();
                    setTooltipPos({
                        top: rect.bottom + window.scrollY + TOOLTIP_GAP,
                        left: rect.left + window.scrollX + rect.width / 2,
                    });
                }
                setShow(true);
                setWaitingToShow(false);
            }, HOVER_DELAY);
        } else {
            setWaitingToShow(false);
            clearTimeout(showDelayRef.current);
        }
        return () => clearTimeout(showDelayRef.current);
    }, [isOverIcon]);

    // ----- Unhover: delayed close -----
    useEffect(() => {
        if (show && !isOverIcon && !isOverTooltip) {
            closeDelayRef.current = setTimeout(() => setShow(false), UNHOVER_CLOSE_DELAY);
        } else {
            clearTimeout(closeDelayRef.current);
        }
        if (!isOverIcon && !isOverTooltip && !show) setWaitingToShow(false);
        return () => clearTimeout(closeDelayRef.current);
    }, [isOverIcon, isOverTooltip, show]);

    // ----- Reset step and start autoplay when open -----
    useEffect(() => {
        if (show) {
            setStep(0);
            stepperIntervalRef.current = setInterval(() => {
                setStep((prev) => prev < steps.length - 1 ? prev + 1 : 0);
            }, STEP_AUTOPLAY_MS);
        } else {
            clearInterval(stepperIntervalRef.current);
        }
        return () => clearInterval(stepperIntervalRef.current);
    }, [show]);

    // Manual navigation dot restarts interval
    const handleDotClick = (idx) => {
        setStep(idx);
        clearInterval(stepperIntervalRef.current);
        stepperIntervalRef.current = setInterval(() => {
            setStep((prev) => prev < steps.length - 1 ? prev + 1 : 0);
        }, STEP_AUTOPLAY_MS);
    };

    // If window scrolls/resizes WHILE tooltip is open, re-align!
    useEffect(() => {
        if (!show) return;
        function updatePos() {
            if (iconRef.current) {
                const rect = iconRef.current.getBoundingClientRect();
                setTooltipPos({
                    top: rect.bottom + window.scrollY - rect.height,
                    left: rect.left + window.scrollX + rect.width / 5,
                });
            }
        }
        window.addEventListener("scroll", updatePos, true);
        window.addEventListener("resize", updatePos, true);
        return () => {
            window.removeEventListener("scroll", updatePos, true);
            window.removeEventListener("resize", updatePos, true);
        };
    }, [show]);

    return (
        <span
            ref={iconRef}
            style={{ position: "relative", display: "inline-block" }}
            onMouseEnter={() => setIsOverIcon(true)}
            onMouseLeave={() => setIsOverIcon(false)}
            tabIndex={0}
        >
            {children}
            {show && (
                <div
                    className={styles["ai-triage-tooltip"]}
                    style={{
                        position: "fixed",
                        top: tooltipPos.top,
                        left: tooltipPos.left,
                        // transform: "translate(-50%, 0)",
                        zIndex: 2500,
                    }}
                    onMouseEnter={() => setIsOverTooltip(true)}
                    onMouseLeave={() => setIsOverTooltip(false)}
                >
                    {/* Now your regular header and step content... */}
                    <div className={styles['step-header']}>
                        <div className={styles['step-header-i']}>
                            <img src={aiTriage} alt="AI Triage Icon"/>
                            <p>How AI Triage Works</p>
                        </div>
                    </div>
                    <div className={styles["stepper-content"]}>
                        <div
                            className={
                                `${styles["stepper-image"]} ${styles[`stepper-image--step${step}`]}`
                            }
                        >
                            <img src={steps[step].img} alt={`Step ${step + 1}`}/>
                        </div>

                        <div className={styles["stepper-text"]}>
                            <div className={styles["stepper-title"]}>{steps[step].title}</div>
                            <div className={styles["stepper-body"]}>{steps[step].body}</div>
                        </div>
                    </div>
                    <div className={styles["stepper-nav"]}>
                        {steps.map((_, idx) => (
                            <div
                                key={idx}
                                className={`${styles["stepper-dot"]} ${idx === step ? styles["active"] : ""}`}
                                aria-label={idx === step ? `Step ${idx+1} (current)` : `Go to step ${idx+1}`}
                                tabIndex={0}
                                onClick={() => handleDotClick(idx)}
                                type="button"
                            />
                        ))}
                    </div>
                </div>
            )}
            {(waitingToShow && !show) && (
                <></>
            )}
        </span>
    );
};
const SideActionBarTower = ({
                                setAppCenterOpen,
                                onIntegrationSelect,
                                selectedKey,
                            }) => {
    const { projectId } = useParams();
    const userId = localStorage.getItem("nuid");
    const [appIntegrations, setAppIntegrations] = useState([]);
    const { project } = useProjectContext();

    useEffect(() => {
        if (!userId || !projectId) return;
        const fetchIntegrations = async () => {
            try {
                const { data: appIntegrationsData = [] } = await getAppIntegrationByUserAndProject(
                    userId,
                    projectId
                );
                const enrichedIntegrations = await Promise.all(
                    appIntegrationsData.map(async (app) => {
                        if (!app.integrationId)
                            return { ...app, integration: null };
                        try {
                            const res = await getIntegrationById(app.integrationId);
                            const integrationData = await res.data;
                            return { ...app, integration: integrationData || {} };
                        } catch {
                            return { ...app, integration: null };
                        }
                    })
                );
                setAppIntegrations(enrichedIntegrations);
            } catch (error) {
                console.error("Error fetching app integrations:", error);
            }
        };
        fetchIntegrations();
    }, [userId, projectId]);

    // Native Nebula apps
    const permanentNativeApps = [
        {
            key: "driftiq",
            name: "Drift IQ",
            icon: driftiq,
            description: "Combine clarity, control, and data visibility in a seamless visual experience. From a high-level overview to deep-dive insights, this concept brings everything together."
        }
    ];
    if (project?.aiTriage?.enabled) {
        permanentNativeApps.push({
            key: "aitriage",
            name: "AI Triage",
            icon: aiTriage,
            description: "AI-driven, automatic triage and assignment of urgent issues.",
        });
    }

    return (
        <div className={styles["side-actionbar-wrapper"]}>
            <div className={styles["permanent-members"]}>
                {permanentNativeApps.map((nativeApp) => {
                    if (nativeApp.key === "aitriage") {
                        return (
                            <TooltipStepper key={nativeApp.key}>
                                <div
                                    className={
                                        `${styles["integration-item"]} ${selectedKey === nativeApp.key ? styles["active"] : ""}`
                                    }
                                    onClick={() => {
                                        if (onIntegrationSelect) {
                                            onIntegrationSelect({
                                                type: "native",
                                                key: nativeApp.key,
                                                name: nativeApp.name,
                                                icon: nativeApp.icon,
                                                description: nativeApp.description,
                                            });
                                        }
                                    }}
                                >
                                    <div className={styles["item-int"]}>
                                        <img src={nativeApp.icon} alt={nativeApp.name}/>
                                    </div>
                                </div>
                            </TooltipStepper>
                        );
                    }
                    return (
                        <div
                            className={
                                `${styles["integration-item"]} ${selectedKey === nativeApp.key ? styles["active"] : ""}`
                            }
                            key={nativeApp.key}
                            onClick={() => {
                                if (onIntegrationSelect) {
                                    onIntegrationSelect({
                                        type: "native",
                                        key: nativeApp.key,
                                        name: nativeApp.name,
                                        icon: nativeApp.icon,
                                        description: nativeApp.description,
                                    });
                                }
                            }}
                        >
                            <div className={styles["item-int"]}>
                                <img src={nativeApp.icon} alt={nativeApp.name}/>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ... add-on integrations and add button as before ... */}

            <div className={styles["addon-members"]}>
                {appIntegrations.map((integration) => (
                    <div
                        key={integration.id}
                        className={
                            `${styles["integration-item"]} ${selectedKey === integration.integrationId ? styles["active"] : ""}`
                        }
                        onClick={() => {
                            if (onIntegrationSelect) {
                                onIntegrationSelect(integration);
                            }
                        }}
                    >
                        <div className={styles["item-int"]}>
                            <img src={integration.integration?.icon ?? add}
                                 alt={integration.integration?.name ?? "Add-on Integration"}/>
                        </div>
                    </div>
                ))}
                {/* Add new add-on integration */}
                <div
                    className={`${styles["integration-item"]} ${styles["add-new-item"]}`}
                    onClick={() => setAppCenterOpen(true)}
                    tabIndex={0}
                >
                    <div className={`${styles["item-int"]} ${styles["item-int-last"]}`}>
                        <img src={add} alt="Add Integration"/>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default SideActionBarTower;
