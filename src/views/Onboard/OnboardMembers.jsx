import React, { useState, useEffect } from "react";
import { useAuth } from "../../components/script/AuthContext"; // Import the useAuth hook
import styles from "../../styles/Onboard/OnboardMembers.module.css";
import logo from "../../images/logo/nebula-logo.svg";
import onboard_members_banner from "../../images/onboard/memberlist.svg";
import onboard_members_rba_banner from "../../images/onboard/rba-banner-main.svg";
import onboard_members_rba_guest from "../../images/onboard/guest-capusule.svg";
import globe from "../../images/onboard/globe.svg";
import link from "../../images/onboard/link.svg";
import members from "../../images/onboard/members.svg";
import logowhite from "../../images/onboard/logo-white.svg";
import emailIcon from "../../images/onboard/email.svg";
import {useNavigate} from "react-router-dom";

const OnboardMembers = () => {
    const { isAuthenticated, loading } = useAuth(); // Access authentication state
    const navigate = useNavigate();
    const [isActive, setIsActive] = useState(false);
    const [email, setEmail] = useState("");

    // If still loading or not authenticated, show a loading state or redirect
    if (loading) {
        return <p>Loading...</p>; // Or a loading spinner
    }

    if(isAuthenticated){
        if(localStorage.getItem("nuid")){
            console.log("User id" , localStorage.getItem("nuid"))
        }
    }

    if (!isAuthenticated) {
        // Optionally, you can redirect to a login page
        return <p>You are not authenticated. Please log in to access this page.</p>;
    }


    const handleSendInvite = async () => {
        if (!email) return alert("Please enter an email.");
        try {
            const res = await fetch('http://localhost:5001/onboarding/onboard-members/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (data.success) {
                alert("Invitation sent!");
                setEmail("");
            } else {
                alert(data.message || "Something went wrong.");
            }
        } catch (err) {
            console.error(err);
            alert("Failed to send invitation.");
        }
    };

    function handleNavigation(s) {
        navigate('/')
    }

    return (
        <section className={styles['page-wrapper']}>
            <div className={styles['page-left-flex-wrapper']}>
                <div className={styles['left-header']}>
                    <div className={styles['left-header-top']}>
                        <div onClick={()=>{
                            // eslint-disable-next-line react-hooks/rules-of-hooks
                            handleNavigation('/')
                        }} className={styles['left-header-logo-wrapper']}>
                            <img src={logo} alt="Logo" />
                        </div>
                    </div>
                    <div className={styles['left-header-bottom']}>
                        <div className={styles['counter']}>
                            <p>STEP 2 OF 3</p>
                        </div>
                        <div className={styles['left-header-bottom-text-wrapper']}>
                            <p>Invite Collaborators</p>
                            <p>Invite collaborators to your organization for seamless teamwork.</p>
                        </div>

                        <div
                            className={`${styles['left-header-bottom-capsule']} ${styles['left-header-bottom-capsule-first-child']}`}>

                            <div className={styles['left-header-bottom-capsule-flexer']}>
                                <div className={styles['left-header-bottom-capsule-flex']}>
                                    <div className={styles['left-header-bottom-capsule-header']}>
                                        <img src={globe} alt="Globe" /> <p>Public Access</p>
                                    </div>
                                    <p className={styles['left-header-bottom-capsule-subheading']}>Allow anyone with the
                                        link to join the team</p>
                                </div>
                                <div className={styles['left-header-bottom-capsule-flex']}>
                                    <div
                                        className={`${styles['toggle-button-wrapper']} ${isActive ? styles['active'] : ''}`}
                                        onClick={() => setIsActive(!isActive)}
                                    >
                                        <div className={styles['toggle-switch']}/>
                                    </div>
                                </div>
                            </div>
                            {isActive &&
                                <div className={styles['left-header-bottom-capsule-input-wrapper']}>
                                    <div className={styles['left-header-bottom-capsule-input-flex-wrapper']}>
                                        <img src={link} alt="Link" />
                                        <input
                                            value={"nebula.lexxov.com/o/join-team?c=z21a983sd112bmn12m904"}
                                        />
                                    </div>

                                    <button>COPY</button>
                                </div>
                            }

                        </div>

                        <div className={styles['left-header-bottom-capsule']}>

                            <div className={styles['left-header-bottom-capsule-flexer']}>
                                <div className={styles['left-header-bottom-capsule-flex']}>
                                    <div className={styles['left-header-bottom-capsule-header']}>
                                        <img src={members} alt="Members Icon"/>
                                        <p>Invited Members</p>
                                    </div>
                                    <p className={styles['left-header-bottom-capsule-subheading']}>
                                        These Users Have Been Invited but Not Yet Joined
                                    </p>
                                </div>


                            </div>
                            <div className={styles['invite-input-section']}>
                                <div className={styles['invite-input-flex-left']}>
                                    <img src={emailIcon} alt="Email Icon" />
                                    <input
                                        type="email"
                                        placeholder="Enter Gmail address"
                                        className={styles['invite-input']}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                                <button
                                    className={styles['invite-button']}
                                    onClick={handleSendInvite}
                                >
                                    Send Invitation
                                </button>
                            </div>

                        </div>

                    </div>
                </div>
                <div className={styles['left-footer']}>

                </div>
            </div>
            <div className={styles['page-right-flex-wrapper']}>
                <div className={styles['right-header']}>
                    <div className={styles['right-header-text-wrapper']}>
                        <p className={styles['right-header-text-main']}>Great things happen when teams collaborate!
                            Invite your teammates to this workspace. You can always manage roles and permissions
                            later.</p>
                        <p className={styles['right-header-text-source']}>Aryan Kumar, Nebula CEO</p>
                    </div>
                </div>
                <div className={styles['right-footer']}>
                    <div className={styles['right-footer-onboard-members-image-wrapper']}>
                        <img src={onboard_members_banner} alt="Onboard Members Banner"/>
                    </div>
                    <div className={styles['right-footer-onboard-roles']}>
                        <img src={onboard_members_rba_banner} alt="Roles Banner"/>
                    </div>
                    <div className={styles['right-footer-onboard-guest']}>
                        <img src={onboard_members_rba_guest} alt="Guest Banner"/>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default OnboardMembers;