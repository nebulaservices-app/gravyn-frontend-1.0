import React, {useEffect, useMemo, useRef, useState} from "react";
import styles from "./ProjectLayout.module.css";
import SideBar_Proj from "../ui/SideBar_Proj";
import downarrow from "../../images/icons/downarrow.svg";
import notification from "../../images/icons/notification.svg";
import search from "../../images/icons/search.svg";
import kairo from "../../images/logo/kairo.svg";
import useProjectContext from "../../hook/useProjectContext.js";
import {getInitials} from "../../utils/helper";
import AccountService from "./AccountService"; // ⬅️ import the hook
import confetti from "canvas-confetti";

import champion from "../../images/icons/champion.svg"

import tierBox from "../../images/icons/tier-box.svg"
import checkBoxIncludes from "../../images/icons/checkbox-inludes.svg"
import axios from "axios";

import championbadge from "../../images/icons/championbage.svg"
import Orbiez from "./Orbiez";
import Aurora from "./Aurora";
import {checkProjectDrift} from "../../service/Project/ProjectFetcher";

import driftiq from "../../images/icons/driftiq.svg"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import issues from "../../images/icons/issues.svg"
import {getUserById} from "../../service/User/UserFetcher";

import aiTriageService from "../../service/AiTriage/aiTriageService.js";
import {SnackbarProvider, useSnackbar} from "../../context/SnackbarProvider";
const TierModal = ({user , championTierVisibility , setChampionTierVisibility}) =>{

    const fireConfetti = () => {
        confetti({
            zIndex: 1000, // Ensures visibility above other elements
            colors: ["#036CFE", "#00FF00", "#549bff"], // Red, Green, Blue
            particleCount: 100,
            spread: 150,
            origin: { y: 0.6 }, // Controls where the explosion happens
        });
    };
    const modalRef = useRef(null);

    const handleToggleModal = () => {
        setChampionTierVisibility(!championTierVisibility);
    };

    const handleClickOutside = (event) => {
        if (modalRef.current && !modalRef.current.contains(event.target)) {
            setChampionTierVisibility(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);






















    return <div className={styles['tier-modal-overlay']}>
        <div ref={modalRef} className={styles['tier-modal-wrapper']}>
            <div className={styles['tier-header']}>


                {/*<img className={styles['style-badge-blur']} src={championbadge}/>*/}
                {/*<img className={styles['style-badge-blur']} src={championbadge}/>*/}
                <Orbiez/>
                <Aurora
                    // width="200px"
                    // height="200px"
                    amplitude={0.6}
                    colorStops={["#036CFE", "#549bff", "#036CFE"]}
                />
                <div className={styles['tier-modal-header-img']}>
                    <img src={championbadge}/>
                </div>
                {/*{fireConfetti()}*/}
            </div>
            <div className={styles['tier-modal-content']}>
                <div className={styles['tier-content-header']}>
                    <p className={styles['tier-content-header-heading']}>
                        Nebula <span>Champion</span><p>Exclusive Member</p>
                    </p>

                    <p className={styles['tier-content-header-subheading']}>
                        You are a valued part of our journey, inspiring us to deliver our best every step of the way.
                    </p>
                </div>
                <div className={styles['tier-perks-wrapper']}>
                    <div className={styles['perks-heading']}>
                        <p>PERKS INCLUDED</p>
                        <svg xmlns="http://www.w3.org/2000/svg" width="74" height="2" viewBox="0 0 74 2" fill="none">
                            <path
                                d="M1 0.4C0.668629 0.4 0.4 0.668629 0.4 1C0.4 1.33137 0.668629 1.6 1 1.6V0.4ZM1 1.6H74V0.4H1V1.6Z"
                                fill="url(#paint0_linear_266_290)"/>
                            <defs>
                                <linearGradient id="paint0_linear_266_290" x1="1" y1="1" x2="74" y2="1"
                                                gradientUnits="userSpaceOnUse">
                                    <stop stop-color="#036CFE"/>
                                    <stop offset="0.5" stop-color="#036CFE" stop-opacity="0.5"/>
                                    <stop offset="1" stop-color="#036CFE" stop-opacity="0"/>
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                    <div className={styles['perks-wrapper']}>
                        <div className={styles['perk-wrapper']}>
                            <img src={checkBoxIncludes}/>
                            <div className={styles['perk-text-wrapper']}>
                                <p className={styles['perk-text-heading']}>10% Lifetime Discount</p>
                                <p className={styles['perk-text-subheading']}>Ongoing savings on every future
                                    project.</p>
                            </div>
                        </div>
                        <div className={styles['perk-wrapper']}>
                            <img src={checkBoxIncludes}/>
                            <div className={styles['perk-text-wrapper']}>
                                <p className={styles['perk-text-heading']}>Exclusive Champion Care Package</p>
                                <p className={styles['perk-text-subheading']}>Special offers, curated just for you.</p>
                            </div>
                        </div>
                        <div className={styles['perk-wrapper']}>
                            <img src={checkBoxIncludes}/>
                            <div className={styles['perk-text-wrapper']}>
                                <p className={styles['perk-text-heading']}>Annual Brand Audit</p>
                                <p className={styles['perk-text-subheading']}>Keep your brand fresh and dynamic.</p>
                            </div>
                        </div>
                        <div className={styles['perk-wrapper']}>
                            <img src={checkBoxIncludes}/>
                            <div className={styles['perk-text-wrapper']}>
                                <p className={styles['perk-text-heading']}>Beta Program Access</p>
                                <p className={styles['perk-text-subheading']}>Try new features and tools before
                                    others.</p>
                            </div>
                        </div>

                        <div className={styles['perk-wrapper']}>
                            <img src={checkBoxIncludes}/>
                            <div className={styles['perk-text-wrapper']}>
                                <p className={styles['perk-text-heading']}>Exclusive Birthday Rewards</p>
                                <p className={styles['perk-text-subheading']}>Enjoy personalized gifts and early access
                                    to new
                                    features.</p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    </div>
}


const SingleUserGraph = ({
                             userData,
                             width = 650,
                             height = 350,
                             thresholdWPS = 2
                         }) => {
    // Internal padding for all layout
    const padding = 20

    const [animationProgress, setAnimationProgress] = useState(0);

    const { chartData, scales, maxWPS } = useMemo(() => {
        if (!userData?.dailySummary?.length) {
            return { chartData: [], scales: null, maxWPS: 0 };
        }

        const chartData = userData.dailySummary.map((day, idx) => ({
            dateLabel: day.dateLabel,
            dayIndex: idx,
            wlc: day.cumulativeWLC,
            threshold: thresholdWPS
        }));

        const allValues = chartData.map(d => Math.max(d.wlc, d.threshold));
        const maxWPSRaw = Math.max(...allValues);
        const maxWPS = Math.round(maxWPSRaw + 1);

        const chartWidth = width - (padding * 2);
        const chartHeight = height - (padding * 2) - 60;
        const dateStartOffset = chartWidth / 14;
        const dateDifference = chartWidth / 7;
        const wpsPixelValue = chartHeight / maxWPS;

        const xScale = (dayIndex) => padding + dateStartOffset + (dayIndex * dateDifference);
        const yScale = (wpsValue) => padding + 40 + chartHeight - (wpsValue * wpsPixelValue);

        return {
            chartData,
            scales: { xScale, yScale, maxWPS, chartWidth, chartHeight },
            maxWPS
        };
    }, [userData, width, height, thresholdWPS]);

    // Animation effect - runs on mount and data changes
    useEffect(() => {
        setAnimationProgress(0);
        const animation = setTimeout(() => {
            setAnimationProgress(1);
        }, 100);

        return () => clearTimeout(animation);
    }, [userData, chartData]);

    const generateAnimatedPath = () => {
        if (!chartData.length || !scales) return '';

        const pathCommands = chartData.map((point, index) => {
            const x = scales.xScale(index);
            const baselineY = scales.yScale(0);
            const targetY = scales.yScale(point.wlc);
            const currentY = baselineY + (targetY - baselineY) * animationProgress;

            return index === 0 ? `M ${x} ${currentY}` : `L ${x} ${currentY}`;
        });

        return pathCommands.join(' ');
    };

    const generateAnimatedAreaPath = () => {
        if (!chartData.length || !scales) return '';

        const linePath = chartData.map((point, index) => {
            const x = scales.xScale(index);
            const baselineY = scales.yScale(0);
            const targetY = scales.yScale(point.wlc);
            const currentY = baselineY + (targetY - baselineY) * animationProgress;

            return index === 0 ? `M ${x} ${currentY}` : `L ${x} ${currentY}`;
        }).join(' ');

        const bottomY = scales.yScale(0);
        const lastX = scales.xScale(chartData.length - 1);
        const firstX = scales.xScale(0);

        return `${linePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
    };

    const generateThresholdPath = () => {
        if (!chartData.length || !scales) return '';

        const y = scales.yScale(thresholdWPS);
        const startX = padding;
        const endX = padding + scales.chartWidth;

        return `M ${startX} ${y} L ${endX} ${y}`;
    };

    const getUserColor = () => {
        const maxWLC = Math.max(...chartData.map(d => d.wlc));
        if (maxWLC > thresholdWPS) return '#6366F1';
        return '#10B981';
    };

    if (!chartData.length) {
        return (
            <div className={styles['minimal-graph']} style={{ width, height }}>
                <div className={styles['no-data']}>No data</div>
            </div>
        );
    }

    const userColor = getUserColor();
    const sanitizedUserId = userData.userName.replace(/[^a-zA-Z0-9]/g, '');

    return (
        <div className={styles['minimal-graph']} style={{ width, height }}>
            <div className={styles['minimal-header']}>
                <div className={styles['minimal-header-i']}>
                    {userData.picture && (
                        <img
                            src={userData.picture}
                            alt={userData.userName}
                            className={styles['user-avatar']}
                        />
                    )}
                    <p className={styles['user-label']}>{userData.userName}</p>
                </div>
                <p className={styles['max-load']}>
                    Peak Pressure <span>{(Math.max(...chartData.map(d => d.wlc)) * 100).toFixed(1)}%</span>
                </p>
            </div>

            <svg width={width} height={height} className={styles['minimal-chart']}>
                <defs>
                    {/* Normal gradient for below threshold */}
                    <linearGradient id={`area-gradient-${sanitizedUserId}`} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor={userColor} stopOpacity="0.5"/>
                        <stop offset="70%" stopColor={userColor} stopOpacity="0.1"/>
                        <stop offset="100%" stopColor={userColor} stopOpacity="0.1"/>
                    </linearGradient>

                    <linearGradient id="hover-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="rgba(99, 102, 241, 0.08)"/>
                        <stop offset="30%" stopColor="rgba(99, 102, 241, 0.035)"/>
                        <stop offset="70%" stopColor="rgba(99, 102, 241, 0.02)"/>
                        <stop offset="100%" stopColor="rgba(99, 102, 241, 0.01)"/>
                    </linearGradient>

                    <pattern
                        id={`stripe-pattern-${sanitizedUserId}`}
                        patternUnits="userSpaceOnUse"
                        width="10"
                        height="10"
                        patternTransform="rotate(45)"
                    >
                        <rect width="10" height="6" fill="rgba(99, 102, 241, 0.05)"/>
                        <rect width="10" height="6" fill="rgba(99, 102, 241, 0.15)"/>
                    </pattern>

                    <clipPath id={`above-threshold-${sanitizedUserId}`}>
                        <rect
                            x={padding}
                            y={padding + 40}
                            width={scales.chartWidth}
                            height={scales.yScale(thresholdWPS) - (padding + 40)}
                        />
                    </clipPath>

                    <clipPath id={`below-threshold-${sanitizedUserId}`}>
                        <rect
                            x={padding}
                            y={scales.yScale(thresholdWPS)}
                            width={scales.chartWidth}
                            height={(padding + 40 + scales.chartHeight) - scales.yScale(thresholdWPS)}
                        />
                    </clipPath>
                </defs>

                <rect
                    x={padding}
                    y={padding + 40}
                    width={scales.chartWidth || 0}
                    height={scales?.chartHeight || 0}
                    fill="transparent"
                    className={styles['chart-space']}
                />

                {/* Hover columns */}
                {chartData.map((point, index) => {
                    const x = scales.xScale(index);
                    const columnWidth = scales.chartWidth / 7;
                    const columnX = x - columnWidth / 2;

                    // Animated point position for tooltip
                    const baselineY = scales.yScale(0);
                    const targetY = scales.yScale(point.wlc);
                    const currentY = baselineY + (targetY - baselineY) * animationProgress;

                    return (
                        <g key={`column-${index}`} className={styles['hover-column']}>
                            <rect
                                x={columnX}
                                y={padding + 40}
                                width={columnWidth}
                                height={scales.chartHeight}
                                fill="transparent"
                                className={styles['hover-trigger']}
                                data-wpc={point.wlc.toFixed(1)}
                                data-date={point.dateLabel}
                            />

                            <g className={styles['tooltip']} opacity="0">
                                <rect
                                    x={x - 25}
                                    y={currentY - 35}
                                    width="50"
                                    height="25"
                                    fill="rgba(0, 0, 0, 0)"
                                    rx="4"
                                />
                                <text
                                    x={x}
                                    y={currentY - 25}
                                    textAnchor="middle"
                                    fontSize="11"
                                    fill="white"
                                    fontWeight="600"
                                >
                                    {point.wlc.toFixed(1)}
                                </text>
                                <text
                                    x={x}
                                    y={currentY - 15}
                                    textAnchor="middle"
                                    fontSize="9"
                                    fill="rgba(255, 255, 255, 0.7)"
                                >
                                    WPC
                                </text>
                            </g>
                        </g>
                    );
                })}

                {/* Area fill below threshold - normal color */}
                <path
                    d={generateAnimatedAreaPath()}
                    fill={`url(#area-gradient-${sanitizedUserId})`}
                    opacity="0.8"
                    clipPath={`url(#below-threshold-${sanitizedUserId})`}
                    style={{
                        transition: animationProgress < 1 ? 'all 0.3s ease' : 'all 0.3s ease 1s'
                    }}
                />

                {/* Area fill above threshold - striped pattern */}
                <path
                    d={generateAnimatedAreaPath()}
                    fill={`url(#stripe-pattern-${sanitizedUserId})`}
                    opacity="1"
                    clipPath={`url(#above-threshold-${sanitizedUserId})`}
                    style={{
                        transition: animationProgress < 1 ? 'all 0.3s ease' : 'all 0.3s ease 1s'
                    }}
                />

                {/* Threshold line */}
                <path
                    d={generateThresholdPath()}
                    stroke="rgba(220, 38, 38, 0.5)"
                    strokeWidth="1"
                    strokeDasharray="4 2"
                    fill="none"
                />

                {/* X-axis line */}
                <line
                    x1={padding}
                    y1={padding + 40 + scales.chartHeight}
                    x2={padding + scales.chartWidth}
                    y2={padding + 40 + scales.chartHeight}
                    stroke="rgba(107, 114, 128, 0.2)"
                    strokeWidth="1"
                />

                {/* Animated workload line */}
                <path
                    d={generateAnimatedPath()}
                    stroke={userColor}
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="1"
                    style={{
                        transition: animationProgress < 1 ? 'none' : 'all 0.3s ease 1s'
                    }}
                />

                {/* Animated data points */}
                {chartData.map((point, index) => {
                    const x = scales.xScale(index);
                    const baselineY = scales.yScale(0);
                    const targetY = scales.yScale(point.wlc);
                    const currentY = baselineY + (targetY - baselineY) * animationProgress;

                    return (
                        <circle
                            key={index}
                            cx={x}
                            cy={currentY}
                            r="0"
                            fill={userColor}
                            opacity="0.8"
                            className={styles['data-point']}
                            style={{
                                transition: animationProgress < 1 ? 'none' : 'all 0.3s ease'
                            }}
                        />
                    );
                })}

                {/* X-axis labels */}
                {chartData.map((day, index) => {
                    const x = scales.xScale(index);
                    return (
                        <text
                            key={index}
                            x={x}
                            y={padding + 40 + scales.chartHeight + 25}
                            textAnchor="middle"
                            fontSize="11"
                            fill="#6B7280"
                            fontWeight="400"
                            className={styles['date']}
                        >
                            {day.dateLabel}
                        </text>
                    );
                })}
            </svg>
        </div>
    );
};



// Function to transform your graph data for the SingleUserGraph component
const transformGraphDataForUsers = async (graphData) => {
    if (!graphData?.projectWLCData?.length) {
        return [];
    }

    // Single API call per user instead of two
    const usersWithDetails = await Promise.all(
        graphData.projectWLCData.map(async (user) => {
            try {
                const userDetails = await getUserById(user.userId);
                return {
                    userName: userDetails.name || user.userName,
                    userId: user.userId,
                    picture: userDetails.picture || null,
                    dailySummary: user.dailySummary.map(day => ({
                        dateLabel: day.dateLabel,
                        cumulativeWLC: day.cumulativeWLC,
                        date: day.date,
                        isOverThreshold: day.isOverThreshold,
                        threshold: day.threshold
                    })),
                    analysisMetrics: user.analysisMetrics,
                    taskBreakdown: user.taskBreakdown
                };
            } catch (error) {
                console.error(`Failed to fetch details for user ${user.userId}:`, error);
                // Fallback to basic data
                return {
                    userName: user.userName,
                    userId: user.userId,
                    picture: null,
                    dailySummary: user.dailySummary,
                    analysisMetrics: user.analysisMetrics,
                    taskBreakdown: user.taskBreakdown
                };
            }
        })
    );

    return usersWithDetails;
};


const DriftIQUserGraphsContainer = ({ graphData }) => {
    const [usersData, setUsersData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const graphsRef = useRef(null);


    const [width, setWidth] = useState(0);

    useEffect(() => {
        function updateWidth() {
            if (graphsRef.current) {
                setWidth(graphsRef.current.clientWidth);
            }
        }
        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    }, []);


    useEffect(() => {
        const processUsers = async () => {
            if (!graphData?.projectWLCData?.length) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                const transformedUsers = await transformGraphDataForUsers(graphData);
                setUsersData(transformedUsers);
            } catch (err) {
                console.error("Error processing user data:", err);
                setError("Failed to load user details");
                // Fallback to basic data without pictures/names
                const basicUsers = graphData.projectWLCData.map(user => ({
                    userName: user.userName,
                    userId: user.userId,
                    picture: null,
                    dailySummary: user.dailySummary,
                    analysisMetrics: user.analysisMetrics,
                    taskBreakdown: user.taskBreakdown
                }));
                setUsersData(basicUsers);
            } finally {
                setLoading(false);
            }
        };

        processUsers();
    }, [graphData]);

    if (loading) {
        return (
            <div className={styles['loading-container']}>
                <p>Loading user workload analysis...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles['error-container']}>
                <p>⚠️ {error}</p>
                <p>Showing basic analysis without user details</p>
            </div>
        );
    }

    if (!usersData.length) {
        return (
            <div className={styles['no-data-container']}>
                <p>📊 No user data available for visualization</p>
            </div>
        );
    }

    return (
        <div
            ref={graphsRef}
            className={styles['graphs-grid']}>
            {usersData.map((userData, index) => (
                <SingleUserGraph
                    key={userData.userId || index}
                    userData={userData}
                    width={width || 670}
                    height={300}
                    thresholdWPS={1}
                />
            ))}
        </div>
    );
};

const DriftIQMinimalGraphs = ({graphData, useDemoData = true}) => {
    const demoData = {
        projectWLCData: [
            {
                userName: "1234",
                dailySummary: [
                    {dateLabel: "Jul 28", cumulativeWLC: 3.2},
                    {dateLabel: "Jul 29", cumulativeWLC: 4.1},
                    {dateLabel: "Jul 30", cumulativeWLC: 5.8},
                    {dateLabel: "Jul 31", cumulativeWLC: 6.5},
                    {dateLabel: "Aug 01", cumulativeWLC: 7.2},
                    {dateLabel: "Aug 02", cumulativeWLC: 8.1},
                    {dateLabel: "Aug 03", cumulativeWLC: 6.8}
                ]
            },
            {
                userName: "5678",
                dailySummary: [
                    {dateLabel: "Jul 28", cumulativeWLC: 2.1},
                    {dateLabel: "Jul 29", cumulativeWLC: 1.4},
                    {dateLabel: "Jul 30", cumulativeWLC: 1.2},
                    {dateLabel: "Jul 31", cumulativeWLC: 1.1},
                    {dateLabel: "Aug 01", cumulativeWLC: 1.9},
                    {dateLabel: "Aug 02", cumulativeWLC: 2},
                    {dateLabel: "Aug 03", cumulativeWLC: 3.6}
                ]
            }
        ]
    };

    const workingData = useDemoData ? demoData : graphData;

    return (
        <div className={styles['minimal-grid']}>
            {workingData?.projectWLCData?.map((userData) => (
                <SingleUserGraph
                    key={userData.userName}
                    userData={userData}
                    padding={20}
                    thresholdWPS={2.0}
                />
            ))}
        </div>
    );
};


const DriftIQModal = ({drift, graphData, isOpen, onClose, onAccept, onViewDetails}) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [activeTab, setActiveTab] = useState('overview'); // 'overview' or 'graph'


    console.log("graph data" , graphData);

    if (!isOpen || !drift) return null;

    const handleAccept = async () => {
        setIsProcessing(true);
        try {
            await onAccept(drift);
        } finally {
            setIsProcessing(false);
        }
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getSeverityColor = (userCount) => {
        if (userCount >= 4) return '#FF4444'; // High
        if (userCount >= 2) return '#FF8C00'; // Medium
        return '#FFA500'; // Low
    };

    // Prepare graph data for visualization
    const prepareGraphData = () => {
        if (!graphData?.projectWLCData) return [];

        // Get all dates from the first user
        const firstUser = graphData.projectWLCData[0];
        if (!firstUser?.dailySummary) return [];

        // Create combined data structure for the graph
        return firstUser.dailySummary.map((day, index) => {
            const dataPoint = {
                date: day.dateLabel,
                fullDate: day.date,
                threshold: day.threshold
            };

            // Add each user's WLC data for this day
            graphData.projectWLCData.forEach(user => {
                if (user.dailySummary[index]) {
                    dataPoint[`user_${user.userName}`] = user.dailySummary[index].cumulativeWLC;
                }
            });

            return dataPoint;
        });
    };

    const chartData = prepareGraphData();

    // Get colors for different users
    const getUserColors = () => {
        const colors = ['#036CFE', '#FF4444', '#00D4AA', '#FF8C00', '#8B5CF6', '#F59E0B', '#10B981'];
        return graphData?.projectWLCData?.map((user, index) => ({
            userId: user.userName,
            color: colors[index % colors.length]
        })) || [];
    };

    const userColors = getUserColors();

    return (
        <div className={styles['modal-overlay']} onClick={onClose}>
            <div className={styles['modal-wrapper']} onClick={(e) => e.stopPropagation()}>


                <div className={styles['modal-left-wrapper']}>
                    {/* Header */}
                    <div className={styles['modal-header-wrapper']}>

                        <div className={styles['modal-noti-wrapper']}>
                            <img src={issues}/>
                            <p>DriftIQ have scanned a discovered a potential bottleneck</p>
                        </div>

                        <div className={styles['modal-header-content']}>
                            <img src={driftiq} alt="DriftIQ"/>
                            <div className={styles['modal-header-text']}>
                                <p className={styles['header-title']}>Potential Bottleneck Detected</p>
                                <p className={styles['header-subtitle']}>
                                    We've identified potential workload issues in your project that may impact upcoming
                                    deadlines.
                                </p>
                            </div>
                        </div>
                    </div>

                </div>


                <div className={styles['modal-right-wrapper']}>

                    <div className={styles['modal-right-header']}>
                        <div className={styles['modal-right-header-i']}>
                            <div className={styles['modal-right-header-i-text']}>
                                <p>DriftIQ Scan</p>
                                <p>We've identified potential workload issues in your project that may impact upcoming
                                    deadlines.</p>
                            </div>
                        </div>


                        <div className={styles['modal-right-toggle-wrapper']}>
                            <p
                                className={activeTab === 'overview' ? styles['modal-tab-active'] : styles['modal-tab']}
                                onClick={() => setActiveTab('overview')}
                            >
                                Scan Overview
                            </p>
                            <p
                                className={activeTab === 'analysis' ? styles['modal-tab-active'] : styles['modal-tab']}
                                onClick={() => setActiveTab('analysis')}
                            >
                                Bottleneck Analysis
                            </p>
                        </div>

                        <div className={styles['modal-right-analysis-wrapper']}>
                            {activeTab === 'overview' ? (
                                <div>
                                    {/* You can put whatever overview content you want here: */}
                                    <h3>DriftIQ Scan Summary</h3>
                                    <ul>
                                        <li>
                                            <strong>Period:</strong> {drift?.startDate && drift?.endDate ? `${formatDate(drift.startDate)} – ${formatDate(drift.endDate)}` : "N/A"}
                                        </li>
                                        <li><strong>Affected
                                            Users:</strong> {drift?.metadata?.affectedUsers ?? drift?.affectedUsers ?? "N/A"}
                                        </li>
                                        <li><strong>Affected
                                            Tasks:</strong> {drift?.metadata?.affectedTasks ?? drift?.totalTasks ?? "N/A"}
                                        </li>
                                        <li><strong>Severity:</strong> {drift?.severity ?? "N/A"}</li>
                                    </ul>
                                    {/* Add action buttons / details as needed */}
                                </div>
                            ) : (
                                <DriftIQUserGraphsContainer graphData={graphData}/>
                            )}
                        </div>



                    </div>


                </div>

            </div>
        </div>
    );
};



function SomeComponent() {
    const { showSnackbar } = useSnackbar();

    // Define all your possible toast configurations in an array
    const toastConfigurations = [
        {
            templateKey: 'issues-creation',
            templateData: {
                title: 'Bug in Login Flow',
                details: 'User reported unable to sign in.',
                onView: () => console.log('Viewing issue...'),
            },
            duration: 7000,
        },
        {
            templateKey: 'project-template',
            templateData: {
                name: 'Website Redesign',
                status: 'Updated',
                onOpen: () => console.log('Opening project...'),
            },
        },
        {
            templateKey: 'issues-deletion', // Example of another template
            templateData: {
                title: 'Old Task Removed',
                reason: 'Completed long ago',
                onUndo: () => console.log('Undoing deletion...'),
            },
        },
        {
            templateKey: 'tasks-template', // Example of another template
            templateData: {
                taskName: 'Review Q3 Report',
                dueDate: 'August 30, 2025',
                onComplete: () => console.log('Marking task complete...'),
            },
        },
        {
            templateData: { message: 'This is a simple alert without a specific template!' },
        },
    ];

    const handleClick = () => {
        // Select a random toast configuration from the array
        const randomIndex = Math.floor(Math.random() * toastConfigurations.length);
        const randomToastConfig = toastConfigurations[randomIndex];

        // Call showSnackbar with the randomly selected configuration
        // Using spread operator (...) to pass all properties
        showSnackbar(randomToastConfig);
    };

    return (
        <div>
            <button onClick={handleClick}>Show Random Toast</button>
        </div>
    );
}


// TestDemo.jsx (your code with calls updated)
const TestDemo = () => {
    const { showSnackbar } = useSnackbar();

    showSnackbar('1', 'info', 'right');


    return null;
};

const ProjectLayout = ({
                           children,
                           onAskKairo = () => {
                           },
                           showKairo = true,
                           customTabs = null,
                           subtitle = "Overview",
                           headerTitle = "Dashboard",
                           headerDescription = ""
                       }) => {
    const {
        user,
        project,
        workspaceData,
        selectedView,
        setSearchParams
    } = useProjectContext(); // ⬅️ pull required data


    const [championTierVisibility, setChampionTierVisibility] = useState(false)

    function handleTierOpening(tier) {
        if (tier === 'champion') {
            setChampionTierVisibility(true)
        }
    }

    const views = [
        {icon: require("../../images/icons/kanban.svg"), label: "Kanban"},
        {icon: require("../../images/icons/list.svg"), label: "Spreadsheet"},
        {icon: require("../../images/icons/timeline.svg"), label: "Gantt View"},
        {icon: require("../../images/icons/calendar.svg"), label: "Calendar"},
        {icon: require("../../images/icons/clock.svg"), label: "Time Grid"},
        {icon: require("../../images/int_cat/analytics.svg"), label: "Analytics & Reporting"},
        {icon: require("../../images/icons/recent_activity.svg"), label: "Activity"}
    ];





















    const [driftModalOpen, setDriftModalOpen] = useState(true);
    const [currentDrift, setCurrentDrift] = useState(null);


    const [currentGraphData , setCurrentGraphData] = useState(null);


// DriftIQ Check Function
    const runDriftIQCheck = async () => {
        if (!project?._id || !user?._id) return;

        try {
            console.log('🔍 Running DriftIQ check for project:', project._id);

            const result = await checkProjectDrift(project._id, user._id, false);

            // Check the correct property structure from your API response
            if (result.needsAttention && result.drift) {
                console.log('🚨 Drift detected:', result.drift);
                console.log('📊 Graph data available:', result.graphData);

                setCurrentDrift(result.drift);
                setCurrentGraphData(result.graphData); // Add this line for graph data
                setDriftModalOpen(true);
            } else {
                console.log('✅ No bottlenecks detected - team workload is healthy');
                // You can still store graph data even when no drift for potential dashboard visualization
                if (result.graphData) {
                    setCurrentGraphData(result.graphData);
                }
            }

        } catch (error) {
            console.error('❌ DriftIQ check failed:', error);
        }
    };

    // Modal Handlers
    const handleAcceptDrift = async (drift) => {
        try {
            const response = await axios.post(`/api/v1/projects/${project._id}/create-drift`, {
                userId: user._id,
                acceptDrift: true
            });

            if (response.data.success) {
                console.log('🎯 Drift created successfully!');
                setDriftModalOpen(true);
                setCurrentDrift(null);

                // Show success notification
                alert('Drift created successfully! Timeline has been adjusted and team notified.');
            }
        } catch (error) {
            console.error('❌ Failed to create drift:', error);
            alert('Failed to create drift. Please try again.');
        }
    };

    const handleViewDriftDetails = (drift) => {
        console.log('📋 Viewing drift details:', drift);
        // Navigate to detailed drift view or open expanded modal
        // You can implement this based on your routing setup
    };

    const handleCloseDriftModal = () => {
        setDriftModalOpen(false);
        setCurrentDrift(null);
    };

    // Run DriftIQ check when component loads
    useEffect(() => {
        if (project?._id && user?._id) {
            runDriftIQCheck();
        }
    }, [project?._id, user?._id]);







    // Run AITriage
    useEffect(() => {
        if (project?.aiTriage?.enabled) {
            // Start/initialize/subscribe to AI Triage service
            aiTriageService.start(project);
            // Optionally: log, analytics, user prompt, etc.

        } else {
            // Optionally: stop or clean up service if project switched
            aiTriageService.stop?.();
            console.log("AI Triage disabled for project.");
        }

        // Clean up service on unmount/project change
        return () => {
            aiTriageService.stop?.();
        };
    }, [project?._id, project?.aiTriage?.enabled]);





    return (
        <SnackbarProvider>
            <div className={styles['page-wrapper']}>
                <SideBar_Proj/>
                <div className={styles['page-content-parent-wrapper']}>
                    <div className={styles['page-content-children-wrapper']}>
                        {/* NAVBAR */}
                        <nav className={styles['page-navbar-wrapper']}>
                            <div className={styles['navbar-flex-item']}>
                                <div className={styles['workspace-pill']}>
                                    <div className={styles['workspace-pill-img-wrapper']}>
                                        {workspaceData?.img ? (
                                            <img
                                                className={styles['workspace-pill-img']}
                                                src={workspaceData?.img}
                                                alt="workspace"
                                            />
                                        ) : (
                                            <p className={styles['workspace-initials']}>
                                                {getInitials(workspaceData?.name)}
                                            </p>
                                        )}
                                    </div>
                                    <p className={styles['workspace-pill-name']}>
                                        {workspaceData?.name}
                                        <span>
                                        <img src={downarrow} alt="expand"/>
                                    </span>
                                    </p>

                                    {/*<SomeComponent/>*/}

                                </div>
                            </div>
                            <div className={styles['navbar-flex-item']}>
                                <div className={styles['navbar-action-wrapper']}>
                                    <div className={styles['action-wrapper']}><img src={search}/></div>
                                    <div className={styles['action-wrapper']}><img src={notification}/></div>
                                    <div onClick={() => {
                                        setChampionTierVisibility(true)
                                    }} className={styles['action-wrapper']}><img src={user?.picture}/>
                                        <div className={styles['champion-tier-wrapper']}>
                                            <img
                                                className={styles['champion-tier']}
                                                src={champion}/>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </nav>
                        <div className={styles['project-layout-children-wrapper']}>
                            {children}
                        </div>
                    </div>
                </div>

                <DriftIQModal
                    drift={currentDrift}
                    graphData={currentGraphData}
                    isOpen={driftModalOpen}
                    onClose={handleCloseDriftModal}
                    onAccept={handleAcceptDrift}
                    onViewDetails={handleViewDriftDetails}
                />

                {/*<DriftIQMinimalGraphs/>*/}

                {/**/}

                {championTierVisibility &&
                    <TierModal user={user} championTierVisibility={championTierVisibility}
                               setChampionTierVisibility={setChampionTierVisibility}/>
                }

                {/*<SnackbarSimulator/>*/}
            </div>
        </SnackbarProvider>
    );
};

export default ProjectLayout;