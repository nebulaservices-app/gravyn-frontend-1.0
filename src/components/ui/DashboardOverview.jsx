import React, {useEffect, useState} from "react"
import styles from "./DashboardOverview.module.css"
import allproject from "../../images/icons/allprojects.svg";
import slash from "../../images/icons/slash.svg";
import projecticon from "../../images/icons/project.svg";
import star_fav from "../../images/icons/star-fav.svg";
import star_nofav from "../../images/icons/star-nofav.svg";
import dot from "../../images/icons/dot.svg";
import warning from "../../images/icons/warning.svg";
import triage from "../../images/icons/aitriage.svg";
import kairo from "../../images/logo/kairo.svg";
import useProjectContext from "../../hook/useProjectContext";
import SideActionBarTower from "./SideActionBarTower";
import gitlab from "../../images/int_icon/hubspot.svg";
import add from "../../images/icons/add.svg";
import sync from "../../images/icons/sync.svg";
import {formatDateTime, formatFullDate} from "../../utils/datetime";
import SelectedIntegration from "./AppAddOnModal";
import driftIq from "../../images/icons/driftiq.svg";
import driftIq_null from "../../images/icons/driftiq_null.png";
import inprogress from "../../images/icons/inprogress_icon.svg"
import calendar from "../../images/icons/calendar.svg"
import notasks from "../../images/icons/notasks.png"
import updates from "../../images/icons/update.svg"
import {getLatestProjectUpdate} from "../../service/Project/ProjectFetcher";
import ProjectSections from "./ProjectSections";
import AppCenter from "./AppCenter";
const ClockIcon = ({ width = 24, height = 24, fill = 'grey', className = '' }) => {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 11 13"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            aria-label="Clock Icon"
            role="img"
        >
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M4.86142 0.432902C4.89396 0.576618 4.86809 0.727372 4.78951 0.852021C4.71092 0.976671 4.58606 1.06501 4.44236 1.09762C4.3333 1.12244 4.22521 1.15136 4.11833 1.18433C4.04859 1.20586 3.9753 1.21344 3.90263 1.20665C3.82996 1.19985 3.75934 1.17881 3.6948 1.14472C3.63026 1.11063 3.57307 1.06417 3.52649 1.00798C3.47991 0.951784 3.44485 0.886969 3.42332 0.817229C3.40179 0.74749 3.39421 0.674193 3.401 0.601523C3.4078 0.528852 3.42884 0.458232 3.46293 0.393694C3.49702 0.329156 3.54348 0.271964 3.59967 0.225384C3.65586 0.178804 3.72068 0.143747 3.79042 0.122216C3.92381 0.080717 4.05905 0.0445907 4.19614 0.0138371C4.26734 -0.00235469 4.34104 -0.00435778 4.41301 0.00794208C4.48499 0.0202419 4.55383 0.0466037 4.61562 0.085521C4.6774 0.124438 4.73091 0.175149 4.77308 0.234754C4.81526 0.294359 4.84528 0.361691 4.86142 0.432902ZM6.00079 0.432902C6.0334 0.289203 6.12174 0.164336 6.24639 0.0857527C6.37104 0.00716925 6.5218 -0.0186982 6.66551 0.0138371C9.14099 0.575183 10.9895 2.78833 10.9895 5.43389C10.9895 8.50351 8.50073 10.9918 5.43166 10.9918C2.78555 10.9918 0.572404 9.14377 0.0110576 6.66829C-0.0177554 6.526 0.0102526 6.37808 0.0890912 6.25617C0.16793 6.13427 0.29134 6.04804 0.432928 6.01595C0.574517 5.98386 0.723043 6.00844 0.846741 6.08444C0.970439 6.16044 1.05949 6.28183 1.09485 6.42263C1.27171 7.19727 1.65291 7.91036 2.19881 8.48771C2.7447 9.06506 3.43534 9.48558 4.19886 9.70552C4.96238 9.92546 5.77089 9.93678 6.54026 9.7383C7.30964 9.53982 8.01178 9.1388 8.57362 8.57696C9.13546 8.01511 9.53649 7.31298 9.73496 6.5436C9.93344 5.77422 9.92212 4.96571 9.70218 4.20219C9.48224 3.43867 9.06172 2.74804 8.48437 2.20214C7.90702 1.65625 7.19393 1.27504 6.4193 1.09818C6.27558 1.06545 6.15075 0.976974 6.07227 0.852211C5.99378 0.727449 5.96807 0.57662 6.00079 0.432902ZM2.43763 1.38775C2.48733 1.44126 2.526 1.50405 2.55143 1.57252C2.57685 1.641 2.58853 1.71381 2.58579 1.78679C2.58305 1.85978 2.56596 1.93151 2.53548 1.99789C2.50501 2.06427 2.46174 2.12399 2.40817 2.17363C2.32592 2.24959 2.24681 2.32851 2.17085 2.4104C2.06989 2.51545 1.93171 2.57666 1.78606 2.58084C1.64041 2.58501 1.49895 2.53183 1.39213 2.43273C1.28531 2.33364 1.22168 2.19655 1.21493 2.051C1.20819 1.90545 1.25887 1.76308 1.35607 1.65452C1.45055 1.55226 1.54911 1.45351 1.65175 1.35829C1.70526 1.30858 1.76805 1.26992 1.83652 1.24449C1.90499 1.21907 1.97781 1.20739 2.05079 1.21013C2.12378 1.21286 2.19551 1.22996 2.26189 1.26044C2.32827 1.29091 2.38798 1.33417 2.43763 1.38775ZM5.43111 2.09916C5.57851 2.09916 5.71988 2.15771 5.82411 2.26194C5.92834 2.36617 5.9869 2.50754 5.9869 2.65494V5.20379L7.49141 6.70831C7.59266 6.81313 7.64868 6.95353 7.64741 7.09925C7.64614 7.24498 7.58769 7.38438 7.48464 7.48742C7.3816 7.59047 7.2422 7.64892 7.09647 7.65019C6.95075 7.65146 6.81035 7.59544 6.70553 7.49419L5.03816 5.82683C4.93393 5.72262 4.87535 5.58128 4.87532 5.43389V2.65494C4.87532 2.50754 4.93387 2.36617 5.0381 2.26194C5.14234 2.15771 5.2837 2.09916 5.43111 2.09916ZM0.814172 3.42638C0.955004 3.46981 1.07282 3.56739 1.14172 3.69768C1.21061 3.82796 1.22494 3.98027 1.18155 4.12111C1.14858 4.22799 1.11966 4.33608 1.09485 4.44514C1.05949 4.58595 0.970439 4.70733 0.846741 4.78333C0.723043 4.85933 0.574517 4.88392 0.432928 4.85182C0.29134 4.81973 0.16793 4.73351 0.0890912 4.6116C0.0102526 4.48969 -0.0177554 4.34177 0.0110576 4.19948C0.0421817 4.06239 0.0783081 3.92714 0.119436 3.79375C0.162865 3.65292 0.260451 3.5351 0.390734 3.46621C0.521016 3.39732 0.673327 3.38299 0.814172 3.42638Z"
                fill={fill}
            />
        </svg>
    );
};


const getColor = (percentRemaining) => {
    if (percentRemaining >= 70) return '#2ecc71'; // green
    if (percentRemaining >= 40) return '#f1c40f'; // yellow
    if (percentRemaining >= 15) return '#e67e22'; // orange
    return '#e74c3c'; // red
};



const formatTimeRemaining = (daysLeft) => {
    if (daysLeft > 30) return `Plenty of time left – about ${Math.floor(daysLeft / 30)} month(s) remaining to complete the project.`;
    if (daysLeft > 7) return `You have around ${Math.floor(daysLeft / 7)} week(s) left. Stay on track!`;
    if (daysLeft > 1) return `Just ${daysLeft} days remaining. Be sure to wrap up your milestones.`;
    if (daysLeft === 1) return `Only 1 day left. Time to finish strong!`;
    if (daysLeft === 0) return `Deadline is today. Final touches should be wrapping up now.`;
    return `Overdue by ${Math.abs(daysLeft)} day(s). Immediate attention required.`;
};

const ProjectTimeTracker = ({ startDate, endDate }) => {
    const [percentRemaining, setPercentRemaining] = useState(100);
    const [daysLeft, setDaysLeft] = useState(0);

    useEffect(() => {
        const now = new Date();
        const start = new Date(startDate);
        const end = new Date(endDate);

        const totalDuration = end - start;
        const elapsed = now - start;
        const remaining = end - now;

        const percentage = Math.max(0, ((end - now) / totalDuration) * 100);
        setPercentRemaining(Math.floor(percentage));
        setDaysLeft(Math.ceil(remaining / (1000 * 60 * 60 * 24)));
    }, [startDate, endDate]);

    const strokeDasharray = 2 * Math.PI * 45; // 2πr with r = 45
    const strokeDashoffset = strokeDasharray * (1 - percentRemaining / 100);
    const color = getColor(percentRemaining);

    return (
        <div className={styles['time-remaining-wrapper']}>
            <ClockIcon fill={getColor(percentRemaining)}/>
            {/* Time Remaining Message */}
            <p>
                {formatTimeRemaining(daysLeft)}
            </p>
        </div>
    );
};



const ProjectDetailsWrapper = ({user , project, update}) =>{
    return(
        <div className={styles['mutable-project-content-wrapper']}>
            <div className={styles['project-pan-description']}>

                <div className={styles['project-updates-wrapper']}>
                    <div className={styles['project-updates-header']}>
                        <div className={styles['project-updates-header-details']}>
                            <div className={styles['project-updates-header-details-i']}>
                                <div className={styles['header-details-img']}>
                                    <img src={updates}/>
                                </div>
                                <p>Daily Updates</p>
                            </div>
                            <div className={styles['project-updates-header-details-i']}>
                                <p>Last Updated {formatFullDate(update?.createdAt)}</p>
                            </div>
                        </div>
                    </div>

                    <ProjectSections update={update} project={project}/>


                </div>

                <div className={styles['project-description']}>
                    <p>Project Description</p>
                    <p>{project?.description}</p>
                </div>
                <ProjectTimeTracker startDate={project?.startDate} endDate={project?.endDate}/>

            </div>
            <div className={styles['project-section-i']}>
                <div className={styles['project-section-i-detail']}>
                    <p>Upcoming Tasks</p>
                    <p>Prioritized based on urgency, deadlines, and task health due in 7 days</p>
                </div>
                <div className={styles['project-section-i-content']}>
                    <img src={notasks}/>
                </div>
            </div>
        </div>
    )
}


const ProjectProgressUI = ({ projectProgress = 83 }) => {
    const projectLines = 25;
    const howManyLinesToIlluminate = Math.floor((projectProgress / 100) * projectLines);


    return (
        <div className={styles['project-progress-wrapper']}>
            <div className={styles['project-progress-area']}>
                {[...Array(projectLines)].map((_, i) => (
                    <div
                        key={i}
                        className={`${styles['progress-line']} ${i < howManyLinesToIlluminate ? styles['progress-line-illuminate'] : ''}`}
                    />
                ))}
            </div>
            <div className={styles['project-progress-number']}>
                <p>{projectProgress}%</p>
            </div>
        </div>
    );
};



const DashboardOverview = () => {


    const {user, project} = useProjectContext();
    const [isFav, setIsFav] = useState(false);
    const toggleFav = () => setIsFav((prev) => !prev);

    // Opening App Center

    const [isAppCenterOpen , setAppCenterOpen] = useState(false);
    const [selectedIntegration , setSelectedIntegration] = useState(null);


    const [update, setUpdate] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!project?._id) return; // nothing to load

        let isMounted = true;

        async function loadProjectUpdate(projectId) {
            try {
                const update = await getLatestProjectUpdate(projectId);
                if (isMounted) {
                    setUpdate(update);
                    console.log("Fetched update and set in state:", update);
                }
            } catch (e) {
                if (isMounted) {
                    setError("Could not load latest project update.");
                }
                console.error("Could not load latest project update.", e);
            }
        }

        loadProjectUpdate(project._id);

        // Cleanup to avoid state updates after unmount
        return () => { isMounted = false; };

    }, [project?._id]);


    useEffect(() => {
        console.log("Updates for the project" , update)
    }, [update]);




    return <>
        <div className={styles['dashboard-overview-wrapper']}>
            <div className={styles['dashboard-nav-bar']}>
                <div className={styles['nav-capsule']}>
                    <div className={styles['nav-pill-i']}>
                        <img src={allproject}/><p>All Projects</p>
                    </div>
                    <img src={slash}/>
                    <div className={styles['nav-pill-i']}>
                        <img src={projecticon}/><p>{project?.name}</p>
                        <img
                            onClick={toggleFav}
                            className={styles['star']}
                            src={isFav ? star_fav : star_nofav}
                        />
                        <img className={styles['dot']} src={dot}/>
                    </div>
                    {/*<img src={slash}/>*/}
                    {/*<div className={styles['nav-pill-i']}>*/}
                    {/*    <img src={warning}/><p>Project Health</p>*/}
                    {/*</div>*/}
                </div>
                <div className={styles['nav-capsule']}>
                    <div className={styles['nav-pill-i']}>
                        <img src={kairo}/>
                        <p>Ask Kairo</p>
                    </div>
                </div>
            </div>
            <div className={styles['dashboard-main']}>
                <div className={styles['dashboard-main-wrapper']}>
                    <div className={styles['dashboard-main-i-wrapper']}>

                        <div className={styles['dashboard-main-i-notification-wrapper']}>
                            <div className={styles['notification-img-wrapper']}>
                                                            <img src={gitlab}/>
                            </div>
                            <p>2 High severity & Critical issues are pulled from Gitlab</p>
                        </div>
                        <div className={styles['dashboard-main-i-content-wrapper']}>

                            <div className={styles['dashboard-main-i-header']}>

                                <div className={styles['pjt-header-capsule-top-right']}>
                                    <div className={styles['pjt-header-last-update-wrapper']}>
                                        <div className={styles['live']}/>
                                        <p><span>Last Updated </span>{formatDateTime(project?.updatedAt)}</p>
                                    </div>
                                </div>


                                <div className={styles['dashboard-main-i-header-details']}>
                                    <div className={styles['dashboard-main-i-header-details-text']}>
                                        <p>{project?.name}</p>
                                        <p>{project?.description}</p>
                                    </div>
                                </div>

                                <div className={styles['dashboard-main-i-header-footer']}>
                                    <div className={styles['dashboard-main-i-header-footer-i']}>
                                        <ProjectProgressUI projectProgress={project?.progress}/>
                                    </div>
                                    <div className={styles['header-footer-flexer-i']}>
                                        <div className={styles['footer-i']}>
                                            {project?.teamMembers?.length > 0 ? (
                                                project.teamMembers.map((person, index) => (
                                                    <img src={person.picture}/>
                                                ))
                                            ) : (
                                                <span className={styles['no-participants']}>No participants</span>
                                            )}
                                        </div>
                                        <div className={styles['footer-i']}>
                                            <img src={add}/>
                                        </div>
                                        <div className={styles['footer-i']}/>
                                        <div className={styles['footer-i']}>
                                            <img src={sync}/>
                                        </div>
                                        <div className={styles['footer-i']}>
                                            <img src={dot}/>
                                        </div>
                                        <div className={styles['footer-i']}>
                                            Export Data
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className={styles['dashboard-main-i-content']}>
                                <div className={styles['dashboard-main-i-content-menu-wrapper']}>
                                    <div className={styles['menu-wrapper-i']}>
                                        <p className={styles['menu-item']}>
                                            Project Details
                                        </p>
                                        <p className={styles['menu-item']}>
                                            Tasks
                                        </p>
                                        <p className={styles['menu-item']}>
                                            Issues
                                        </p>
                                        <p className={styles['menu-item']}>
                                            Files & Attachment
                                        </p>
                                        <p className={styles['menu-item']}>
                                            Reminders
                                        </p>
                                    </div>
                                    <div className={styles['menu-wrapper-i']}>

                                    </div>
                                </div>
                                <div className={styles['dashboard-main-children']}>
                                    <ProjectDetailsWrapper user={user} project={project} update={update}/>
                                </div>
                            </div>

                        </div>



                    </div>
                    <div className={styles['dashboard-side-i-wrapper']}>

                        <div className={styles['dashboard-side-i-overflow']}>

                            <div className={styles['dashboard-side-drift-wrapper']}>
                                <div className={styles['dashboard-side-drift-header-wrapper']}>
                                    <div className={styles['drift-header-i']}>
                                        <p><img src={driftIq}/> DriftIQ</p>
                                    </div>
                                </div>
                                <div className={styles['dashboard-side-drift-content-wrapper']}>
                                    <div className={styles['drift-no-content-wrapper']}>
                                        <img src={driftIq_null}/>
                                    </div>
                                </div>
                            </div>

                        </div>

                    </div>

                    {
                        selectedIntegration &&
                        <SelectedIntegration
                            key={selectedIntegration._id || selectedIntegration.name} // or anything unique
                            selectedIntegration={selectedIntegration}
                            setSelectedIntegration = {setSelectedIntegration}
                        />
                    }

                </div>
                <div className={styles['dashboard-actionbar-wrapper']}>
                    <SideActionBarTower
                        setAppCenterOpen={setAppCenterOpen}
                        onIntegrationSelect={(integration) => {
                            setSelectedIntegration(integration)
                        }}
                    />
                </div>



            </div>

            {isAppCenterOpen && <AppCenter onClose={()=>{setAppCenterOpen(false)}}/>}

        </div>
    </>
}

export default DashboardOverview;