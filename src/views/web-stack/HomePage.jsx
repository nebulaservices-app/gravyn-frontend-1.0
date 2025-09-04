import React, {useCallback, useEffect, useState} from "react"
import styles from "../../styles/web-stack-styles/HomePage.module.css"
import NavBar from "../../components/features/NavBar";
import nebula_hero_bg from "../../images/web-stack-images/nebula-hero-bg.svg"
import nebula_logo from "../../images/common/nebula-logo.svg"
import right_arrow  from "../../images/icons/rightarrow.svg"
import hero_banner  from "../../images/web-stack-images/herobanner2.png"
import hero_banner_2  from "../../images/web-stack-images/banner-2.png"
import kairo_ai  from "../../images/web-stack-images/kairo.svg"
import Dashboard from "../Dashboard/Dashboard";
import f_file_attachment  from "../../images/web-stack-images/f_file.png"
import noise_blue  from "../../images/web-stack-images/noise_blue.svg"

import f_task  from "../../images/web-stack-images/f_task.png"
import noise_orange  from "../../images/web-stack-images/noise_orange.svg"

import moon from "../../images/web-stack-images/moon.png"


import f_meet  from "../../images/web-stack-images/f_meet.png"
import f_rba  from "../../images/web-stack-images/f_rba.png"
import gmail_invoice  from "../../images/features/gmail-invoice.png"
import gmail_invoice1  from "../../images/features/gmail-invoice.png"

import invoicereminder  from "../../images/features/invoice-reminder.png"

import gmail_invoice2  from "../../images/features/gmail-invoice-2.svg"
import uniq_brand_invocie  from "../../images/features/invoice-branded-1-1.png"
import uniq_brand_invoice2  from "../../images/features/invoice-branded-2.png"
import inovice_status_f  from "../../images/features/inovice-2.png"
import payment  from "../../images/features/payment.svg"


import noise_purple  from "../../images/web-stack-images/noise_purple.svg"
import f_i_file  from "../../images/icons/files.svg"
import f_i_meet  from "../../images/icons/video.svg"
import f_i_task  from "../../images/icons/tasks.svg"
import f_i_key  from "../../images/icons/key.svg"
import Aurora from "../../components/ui/Aurora";
import ShinyText from "../../components/ui/ShinyText";

import face1 from "../../images/teamp/face1.jpeg"
import face2 from "../../images/teamp/face2.jpeg"
import face3 from "../../images/teamp/face3.jpeg"

import star from "../../images/teamp/stars.svg"
import {useNavigate} from "react-router-dom";

import airbnb from "../../images/collaborators/airbnb.png"
import google from "../../images/collaborators/google.png"
import deepmind from "../../images/collaborators/deepmind.png"
import starbucks from "../../images/collaborators/microsoft.svg"
import figma from "../../images/collaborators/figma.png"
import webflow from "../../images/collaborators/webflow.svg"
import zerodha from "../../images/collaborators/zerodha.png"
import amazon from "../../images/collaborators/amazon.png"
import stripe from "../../images/collaborators/stripe.png"
import invoicebanner from "../../images/web-stack-images/invoice-banner.png"
import cash from "../../images/web-stack-images/cash.svg"
import FinanceProto from "../../components/ui/FinanceProto";



// --- ICONS FOR NEW SECTIONS (FIX) ---
// Note: Ensure these file paths are correct relative to your project structure.
import canvas_tasks_issues from "../../images/icons/verified-tick.svg";
import canvas_milestone from "../../images/icons/verified-tick.svg";
import canvas_messaging from "../../images/icons/verified-tick.svg";
import canvas_tracking from "../../images/icons/verified-tick.svg";
import os_lifecycle from "../../images/icons/verified-tick.svg";
import os_revenue from "../../images/icons/verified-tick.svg";
import os_clarity from "../../images/icons/verified-tick.svg";

// --- END ICONS FOR NEW SECTIONS ---


const HeroHeader = () => {
    const text = "Coming Soon";
    const [letters, setLetters] = useState([]);

    useEffect(() => {
        setLetters(text.split(""));
    }, []);

    return (
        <p className={styles["hero-header-text-title"]}>
            {letters.map((letter, index) => (
                <span
                    key={index}
                    className={styles.letter}
                    style={{
                        animationDelay: `${index * 0.03}s` }} // Delay for each letter
                >
                    {letter === " " ? "\u00A0" : letter}
                </span>
            ))}
        </p>
    );
};


const TheCanvasSection = () => {
    return (
        <div className={styles['product-section-wrapper']}>
            <div className={styles['product-section-intro']}>
                <p className={styles['product-section-title']}>The Canvas</p>
                <h2 className={styles['product-section-heading']}>From the First Spark of an Idea to the Final Impact, All in a State of Controlled Flow.</h2>
                <p className={styles['product-section-subheading']}>
                    Canvas is a fluid, real-time space where projects are organized, tracked, and executed. It’s built to bring clarity to complexity and to turn your team’s momentum into a competitive advantage.
                </p>
            </div>
                 <div className={styles['product-feature-grid']}>
                {/* Card 1: Dual-Flow - REVISED */}
                 <div className={styles['feature-card']}>
                    <div className={styles['feature-card-icon-wrapper']}>
                        <img src={canvas_tasks_issues} alt="Tasks & Issues Icon"/>
                    </div>
                    <h3 className={styles['feature-card-heading']}>Strategic Focus with Dual-Flow Workflows.</h3>
                    <p className={styles['feature-card-text']}>
                        Bring clarity to your operations by managing planned work with <strong>Tasks</strong> and responsive work with <strong>Issues</strong> This distinct, parallel approach allows your team to maintain focus on long-term goals while effectively handling unforeseen challenges.
                    </p>
                </div>
                {/* Card 2: Milestones - REVISED */}
                <div className={styles['feature-card']}>
                    <div className={styles['feature-card-icon-wrapper']}>
                        <img src={canvas_milestone} alt="Automated Milestones Icon"/>
                    </div>
                    <h3 className={styles['feature-card-heading']}>Activate Progress with Smart Milestones.</h3>
                    <p className={styles['feature-card-text']}>
                        Transform milestones from static checkpoints into intelligent triggers. Automate next steps, notify stakeholders, and keep your projects accelerating forward without manual intervention.
                    </p>
                </div>

                {/* Card 3: Scheduling & Updates - NEW & REVISED */}
                <div className={styles['feature-card']}>
                    <div className={styles['feature-card-ig-img']}>
                     <img src={f_meet} alt="Scheduling & Updates Icon"/>
                    </div>
                    <h3 className={styles['feature-card-heading']}>Sync Your Team, Effortlessly.</h3>
                    <p className={styles['feature-card-text']}>
                        Connect your calendar to schedule meetings in a single click. Keep everyone in the loop with automated, real-time project updates delivered exactly when—and where—they matter most.
                    </p>
                </div>

                {/* Card 4: Dashboards - REVISED */}
                <div className={styles['feature-card']}>
                    <div className={styles['feature-card-icon-wrapper']}>
                        <img src={canvas_tracking} alt="Momentum Tracking Icon"/>
                    </div>
                    <h3 className={styles['feature-card-heading']}>Insightful Dashboards, Not Stale Reports.</h3>
                    <p className={styles['feature-card-text']}>
                        See the truth of your team's progress. Our live dashboards spotlight momentum and expose blockers early, empowering you to make confident decisions without another tedious status meeting.
                    </p>
                </div>
            </div>
        </div>
    );
}

const TheBusinessOSSection = () => {
    return (
        <div className={`${styles['product-section-wrapper']} ${styles['business-os-section']}`}>
            <div className={styles['product-section-intro']}>
                <p className={styles['product-section-title']}>The Business OS</p>
                <h2 className={styles['product-section-heading']}>Connect Every Action to a Business Outcome.</h2>
                <p className={styles['product-section-subheading']}>
                   Business OS bridges the gap between project delivery and financial performance. It gives you a live, consolidated view of your company’s health, from a single project to your entire portfolio.
                </p>
            </div>

            <div className={`${styles['product-feature-grid']} ${styles['grid-three-col']}`}>
                {/* Card 1: Lifecycle */}
                <div className={styles['feature-card']}>
                    <div className={styles['feature-card-icon-wrapper']}>
                        <img src={os_lifecycle} alt="Client Lifecycle Icon"/>
                    </div>
                    <h3 className={styles['feature-card-heading']}>Full Client Lifecycle Management</h3>
                    <p className={styles['feature-card-text']}>
                        From sending a contract for e-signature to creating shared Client Spaces, manage the entire client relationship in one place.
                    </p>
                </div>

                {/* Card 2: Revenue */}
                <div className={styles['feature-card']}>
                    <div className={styles['feature-card-icon-wrapper']}>
                        <img src={os_revenue} alt="Work to Revenue Icon"/>
                    </div>
                    <h3 className={styles['feature-card-heading']}>Work-to-Revenue Connection</h3>
                    <p className={styles['feature-card-text']}>
                        Issue invoices directly from completed milestones. Track budgets against actual burn in real-time and understand the profitability of every project.
                    </p>
                </div>

                {/* Card 3: Clarity */}
                <div className={styles['feature-card']}>
                    <div className={styles['feature-card-icon-wrapper']}>
                        <img src={os_clarity} alt="Business Clarity Icon"/>
                    </div>
                    <h3 className={styles['feature-card-heading']}>A Clear Business Picture</h3>
                    <p className={styles['feature-card-text']}>
                        Get a consolidated, live view of your company’s financial health. Track revenue, monitor cash flow, and forecast with data you can actually trust.
                    </p>
                </div>
            </div>
        </div>
    );
}



// You can create a simple arrow component or use an SVG library like lucide-react
export const ChevronLeft = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>;
export const ChevronRight = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>;


const ShowcaseSection = () => {
    const carouselItems = [
        { id: 'predictability', title: 'Intelligence', heading: 'Deliver with Predictability.', visual: '[Visual of DriftIQ Dashboard]' },
        { id: 'clarity', title: 'Unification', heading: 'Operate with Clarity.', visual: '[Visual of Unified Workspace]' },
        { id: 'scalability', title: 'Structure', heading: 'Scale without Chaos.', visual: '[Visual of Portfolio Management]' },
        { id: 'automation', title: 'Efficiency', heading: 'Automate Repetitive Work.', visual: '[Visual of KairoAI Triage]' },
        { id: 'integration', title: 'Ecosystem', heading: 'Connect Your Entire Stack.', visual: '[Visual of Integration Logos]' }
    ];

    const [activeIndex, setActiveIndex] = useState(0);
    const totalItems = carouselItems.length;

    // useCallback ensures handleNext is not recreated on every render
    const handleNext = useCallback(() => {
        setActiveIndex((prevIndex) => (prevIndex + 1) % totalItems);
    }, [totalItems]);

    const handlePrev = () => {
        setActiveIndex((prevIndex) => (prevIndex - 1 + totalItems) % totalItems);
    };

    // NEW: useEffect for automatic advancement
    useEffect(() => {
        const timer = setInterval(() => {
            handleNext();
        }, 7000); // 7 seconds

        // Cleanup the interval on component unmount or when activeIndex changes
        return () => {
            clearInterval(timer);
        };
    }, [activeIndex, handleNext]); // Reset timer whenever the user navigates manually

    const getCardPosition = (index) => {
        if (totalItems <= 3) {
            if (index === activeIndex) return styles.center;
            if (index === (activeIndex - 1 + totalItems) % totalItems) return styles.left;
            if (index === (activeIndex + 1) % totalItems) return styles.right;
        }

        if (index === activeIndex) return styles.center;
        if (index === (activeIndex + 1) % totalItems) return styles.right;
        if (index === (activeIndex - 1 + totalItems) % totalItems) return styles.left;
        if (index === (activeIndex + 2) % totalItems) return styles.farRight;
        if (index === (activeIndex - 2 + totalItems) % totalItems) return styles.farLeft;

        return styles.hidden;
    };

    return (
        <div className={styles['showcase-section']}>
            <div className={styles['showcase-intro']}>

                {/*<ShinyText className={styles['showcase-section-title']}/>*/}
                <p className={styles['showcase-section-title']}>A New Standard for Modern Teams</p>
                <p className={styles['showcase-heading']}>Not everything powerful has to look complicated.</p>
                <p className={styles['showcase-subheading']}>Gravyn is designed from the ground up to be both incredibly
                    powerful and beautifully simple. Explore the core principles that make it possible.</p>
            </div>

            <div className={styles['carousel-viewport']}>
                {carouselItems.map((item, index) => (
                    // The .center class is now used for specific styling
                    <div key={item.id} className={`${styles['carousel-card']} ${getCardPosition(index)}`}>
                        <div className={styles['card-header']}>
                            <p className={styles['card-title']}>{item.title}</p>
                            <p className={styles['card-heading']}>{item.heading}</p>
                        </div>
                        <div className={styles['card-visual']}>
                            {/*<p className={styles['visual-placeholder']}>{item.visual}</p>*/}
                        </div>
                    </div>
                ))}
            </div>

            <div className={styles['carousel-navigation']}>
                <button onClick={handlePrev} className={styles['nav-button']}>
                    <ChevronLeft/>
                </button>
                {/*<div className={styles['carousel-dots']}>*/}
                {/*    {carouselItems.map((_, index) => (*/}
                {/*        <div*/}
                {/*            key={index}*/}
                {/*            className={`${styles.dot} ${activeIndex === index ? styles.active : ''}`}*/}
                {/*            onClick={() => setActiveIndex(index)}*/}
                {/*        />*/}
                {/*    ))}*/}
                {/*</div>*/}
                <button onClick={handleNext} className={styles['nav-button']}>
                    <ChevronRight/>
                </button>
            </div>
        </div>
    );
};

const HomePage = () => {


    const navigate = useNavigate();
    const handleNavigation = (path) => {
        navigate(path)
    }

    const [offsetY, setOffsetY] = useState(0);

    useEffect(() => {
        const handleScroll = () => setOffsetY(window.scrollY);
        window.addEventListener('scroll', handleScroll);

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scale = 1 + offsetY * 0.0005; // zooms slowly as scroll increases
    const translateY = offsetY * 0.3;   // parallax effect
    const text = "Launching Nebula - Powered By Kairo.ai"

    return (
        <div className={styles['page-wrapper']}>
            <div className={styles['hero-section']}>
                <NavBar/>
                <img src={nebula_hero_bg} className={styles['nebula-hero-bg']}/>
                {/*<img src={moon} className={styles['moon']}/>*/}
                <Aurora/>

                <div className={styles['hero-content-wrapper']}>

                    <div className={styles['logo-wrapper']}>
                        <img src={nebula_logo} className={styles['hero-logo']}/>
                    </div>
                    {/*<div className={`${styles['block_magic--box']} ${styles['block_magic--box-0']}`}>*/}
                    {/*    <div className={`${styles['block_magic--box']} ${styles['block_magic--box-1']}`}>*/}
                    {/*        <div className={`${styles['block_magic--box']} ${styles['block_magic--box-2']}`}>*/}
                    {/*            <p>LAUNCHING NEBULA - COMING SOON</p>*/}
                    {/*        </div>*/}
                    {/*    </div>*/}
                    {/*</div>*/}

                    <div className={styles['launch-capsule']}>
                        <img src={kairo_ai}/>
                        <p>Launching Gravyn - Powered By Kairo.ai</p>
                        <div className={styles['right-arrow-wrapper']}>
                            <img src={right_arrow}/>
                            <div className={styles['right-arrow-tip']}/>
                        </div>

                        {/*<div className={styles['coming-soon']}>Coming Soon</div>*/}
                    </div>
                    <div
                        style={{
                            transform: `translateY(${-translateY * 0.5}px))`,
                            transition: 'transform 0.05s linear',
                        }}
                        className={styles['hero-text-wrapper']}>
                        <div className={styles['hero-text-flex']}>
                            <div className={styles['hero-heading']}>
                                {/*Rethink Work, Collaboration & Building with Nebula*/}
                                Smarter Work. Better Collaboration. Powerful Building with Gravyn.

                                {/*Nebula handles operations, so you can focus on growth.*/}
                            </div>
                            <div className={styles['hero-subheading']}>
                                Designed for freelancers , creators, teams, and visionaries — Gravyn empowers you to
                                plan smarter,
                                build
                                faster, and bring your product ideas to life with clarity and precision.
                            </div>

                            <div className={styles['hero-text-button-action']}>
                                <div onClick={() => {
                                    handleNavigation('app/project/68159219cdb8524689046498/issues/overview')
                                }} className={styles['hero-button-free']}>Launch Gravyn
                                </div>
                                <div className={styles['hero-button']}>Contact Sales</div>
                                {/*<div className={styles['nebula-review-wrapper']}>*/}
                                {/*    <div className={styles['faces-wrapper']}>*/}
                                {/*        <img src={face1}/>*/}
                                {/*        <img src={face2}/>*/}
                                {/*        <img src={face3}/>*/}
                                {/*    </div>*/}
                                {/*    <div className={styles['nebula-review-details']}>*/}
                                {/*        <div className={styles['nebula-review-details-header']}><img src={star}/>*/}
                                {/*            <p>4.8</p></div>*/}
                                {/*        <p>32,499 Customer reviews</p>*/}
                                {/*    </div>*/}
                                {/*</div>*/}
                            </div>

                        </div>
                        <div className={styles['hero-text-flex']}>


                        </div>

                    </div>

                    <div
                        className={styles['hero-banner-parent-wrapper']}>
                        <div


                            className={styles['hero-banner-wrapper']}>
                            <img

                                className={styles['hero-banner-image']} src={hero_banner}/>
                        </div>
                    </div>

                </div>
                {/*<img src={hero_banner_2} className={styles['nebula-hero-fg-1']}/>*/}

            </div>











            {/*<div className={styles['page-section']}>*/}

            {/*    <div className={styles['collaborators-content-wrapper']}>*/}
            {/*        /!*<div className={styles['collaborators-text-wrapper']}>*!/*/}
            {/*        /!*    <div className={styles['collaborators-title']}>*!/*/}
            {/*        /!*        Nebula powers collaboration for over 25,500+ teams and creators.*!/*/}
            {/*        /!*    </div>*!/*/}
            {/*        /!*    <p className={styles['collaborators-heading']}>Trusted by Pioneers, Powered by Forward-Thinking*!/*/}
            {/*        /!*        Teams</p>*!/*/}
            {/*        /!*    <p className={styles['collaborators-subheading']}>From fast-moving startups and creative studios*!/*/}
            {/*        /!*        to enterprise leaders — Nebula is the collaborative engine behind how modern teams plan,*!/*/}
            {/*        /!*        build, and deliver better, together.</p>*!/*/}
            {/*        /!*</div>*!/*/}
            {/*        <div className={styles['collaborators-logo-wrapper']}>*/}
            {/*            <div><img src={airbnb} alt="Airbnb"/></div>*/}
            {/*            <div><img src={google} alt="Google"/></div>*/}
            {/*            <div><img src={deepmind} alt="DeepMind"/></div>*/}
            {/*            <div><img src={starbucks} alt="Starbucks"/></div>*/}
            {/*            <div><img src={stripe} alt="Stripe"/></div>*/}
            {/*            <div><img src={webflow} alt="Figma"/></div>*/}
            {/*            <div><img src={zerodha} alt="Zerodha"/></div>*/}
            {/*            <div><img src={amazon} alt="Amazon"/></div>*/}
            {/*        </div>*/}

            {/*    </div>*/}
            {/*</div>*/}



            {/*<div className={styles['page-section']}>*/}
            {/*    <div className={styles['page-section-text-wrapper']}>*/}
            {/*        <p className={styles['page-section-title']}>Seamless Enviorment</p>*/}
            {/*        <p className={styles['page-section-heading']}>Everything You Need. All in One Workspace.</p>*/}
            {/*        <p className={styles['page-section-subheading']}>Explore how Nebula unifies meetings, tasks,*/}
            {/*            integrations, and team collaboration to help you work smarter and move faster.</p>*/}


            {/*    </div>*/}
            {/*    <div className={styles['page-content-wrapper']}>*/}
            {/*        <div className={styles['feature-bonito-grid']}>*/}
            {/*            <div className={styles['feature-bonito-row-1']}>*/}
            {/*                <div className={styles['feature-bonito-feature']}>*/}
            {/*                    <img src={noise_orange} className={styles['noise-orange']}/>*/}
            {/*                    <img src={f_task} className={styles['feature-img-task']}/>*/}
            {/*                    <div className={styles['feature-text-wrapper']}>*/}
            {/*                        <img src={f_i_task} className={styles['feature-icon']}/>*/}
            {/*                        <p className={styles['feature-text-heading']}>Smarter Task Management with*/}
            {/*                            Nebula</p>*/}
            {/*                        <p className={styles['feature-text-subheading']}>*/}
            {/*                            Smarter Task Management with NebulaTurn meetings and notes into actionable*/}
            {/*                            tasks, assign teammates, and track progress—all in one place.*/}
            {/*                        </p>*/}
            {/*                    </div>*/}
            {/*                </div>*/}
            {/*                <div className={styles['feature-bonito-feature']}>*/}
            {/*                    /!*<img src={noise_blue} className={styles['noise-blue']}/>*!/*/}
            {/*                    <img src={f_file_attachment} className={styles['feature-img']}/>*/}
            {/*                    <div className={styles['feature-text-wrapper']}>*/}
            {/*                        <img src={f_i_file} className={styles['feature-icon']}/>*/}
            {/*                        <p className={styles['feature-text-heading']}> Share everything your team needs</p>*/}
            {/*                        <p className={styles['feature-text-subheading']}>Nebula makes it easy to attach*/}
            {/*                            files, media, and resources to any task, meeting, or document. No more scattered*/}
            {/*                            links or email hunting — everything is organized and accessible</p>*/}
            {/*                    </div>*/}
            {/*                </div>*/}
            {/*            </div>*/}

            {/*            <div className={styles['feature-bonito-row-2']}>*/}
            {/*                <div className={styles['feature-bonito-feature']}>*/}
            {/*                    /!*<img src={noise_purple} className={styles['noise-purple']}/>*!/*/}
            {/*                    <img src={f_meet} className={styles['feature-img-meet']}/>*/}
            {/*                    <div className={styles['feature-text-wrapper']}>*/}
            {/*                        <img src={f_i_meet} className={styles['feature-icon']}/>*/}
            {/*                        <p className={styles['feature-text-heading']}>One-Click to Meet, Always on Time</p>*/}
            {/*                        <p className={styles['feature-text-subheading']}>*/}
            {/*                            Join meetings instantly while Nebula auto-syncs with your calendar, manages*/}
            {/*                            reminders, and ensures you’re always prepared — no copy-pasting links, no missed*/}
            {/*                            updates.*/}
            {/*                        </p>*/}
            {/*                    </div>*/}
            {/*                </div>*/}

            {/*                <div className={styles['feature-bonito-feature']}>*/}
            {/*                    <img src={f_rba} className={styles['feature-img-rba']}/>*/}
            {/*                    <div className={styles['feature-text-wrapper']}>*/}
            {/*                        <img src={f_i_key} className={styles['feature-icon']}/>*/}
            {/*                        <p className={styles['feature-text-heading']}>Control Access, Empower Teams</p>*/}
            {/*                        <p className={styles['feature-text-subheading']}>*/}
            {/*                            Assign roles like Administrator, Creator, Sub-Admin, Read-Only, or Custom to*/}
            {/*                            control what each user can view or manage—ensuring security and streamlined*/}
            {/*                            collaboration.*/}
            {/*                        </p>*/}
            {/*                    </div>*/}

            {/*                </div>*/}

            {/*            </div>*/}
            {/*        </div>*/}
            {/*    </div>*/}
            {/*</div>*/}

            {/*<div className={`${styles['page-section']} ${styles['page-section-finances']}`}>*/}
            {/*    <div className={styles['ding-ding']}>*/}
            {/*        <div className={styles['page-title']}>*/}
            {/*            <img src={cash}/>*/}
            {/*            <p>Command Your Project Finances</p>*/}
            {/*            <div className={styles['right-arrow-wrapper']}>*/}
            {/*                <img src={right_arrow}/>*/}
            {/*                <div className={styles['right-arrow-tip']}/>*/}
            {/*            </div>*/}
            {/*        </div>*/}
            {/*        <div className={styles['hero-heading']}>*/}
            {/*            <span>Powerful Financial Layer </span>That Works in Sync With Your Projects*/}
            {/*        </div>*/}
            {/*        <div className={styles['hero-subheading']}>*/}
            {/*            Seamlessly manage contracts, invoices, and payments—automatically generated from your workflows.*/}
            {/*            With Nebula’s smart finance add-on, you get total financial clarity and control without leaving*/}
            {/*            your workspace.*/}
            {/*        </div>*/}
            {/*    </div>*/}

            {/*    <div className={styles['page-section-cic']}>*/}
            {/*        <div className={styles['grad']}/>*/}
            {/*        /!*<img*!/*/}
            {/*        /!*    className={styles['page-section-invoice']}*!/*/}
            {/*        /!*    src={invoicebanner}/>*!/*/}
            {/*        <FinanceProto/>*/}

            {/*    </div>*/}


            {/*    <div className={styles['finances-features-wrapper']}>*/}
            {/*        <div className={`${styles['row-2']} ${styles['row']}`}>*/}
            {/*            <div className={`${styles['row-2-col-1']} ${styles['column-m']}`}>*/}
            {/*                <div className={`${styles['row-2-col-1-1']} ${styles['column-i-2']}`}>*/}
            {/*                    <div className={styles['feature-column-text-wrapper']}>*/}
            {/*                        <p>*/}
            {/*                            <span>Stay Ahead with Automatic Payment Reminders</span> as you gently nudge*/}
            {/*                            clients using personalized reminder flows to ensure you get paid on time every*/}
            {/*                            time.*/}
            {/*                        </p>*/}
            {/*                    </div>*/}
            {/*                    <div className={styles['invoice-status-image']}>*/}
            {/*                    </div>*/}
            {/*                </div>*/}
            {/*                <div className={`${styles['row-2-col-1-2']} ${styles['column-i-2']}`}>*/}
            {/*                <div className={styles['feature-column-text-wrapper']}>*/}
            {/*                        <p>*/}
            {/*                            <span>Stay Ahead with Automatic Payment Reminders</span> as you gently nudge clients using personalized reminder flows to ensure you get paid on time every time.*/}
            {/*                        </p>*/}
            {/*                    </div>*/}
            {/*                    <div className={styles['invoice-reminder-image']}>*/}
            {/*                        <img src={invoicereminder}/>*/}
            {/*                    </div>*/}
            {/*                </div>*/}
            {/*            </div>*/}
            {/*            <div className={`${styles['row-2-col-2']} ${styles['column-m']}`}>*/}
            {/*                <div className={`${styles['row-2-col-2-1']} ${styles['column-i']}`}>*/}
            {/*                    <div className={styles['feature-column-text-wrapper']}>*/}
            {/*                        <p><span>Real-Time Invoice Activity Tracking</span> gives you instant visibility*/}
            {/*                            when an invoice is opened, clicked, signed, or paid — so you’re never left*/}
            {/*                            guessing.</p>*/}
            {/*                    </div>*/}
            {/*                    <div className={styles['invoice-status-image']}>*/}
            {/*                        <img src={inovice_status_f}/>*/}
            {/*                    </div>*/}
            {/*                </div>*/}
            {/*                <div className={`${styles['row-2-col-2-1']} ${styles['column-i']}`}>*/}
            {/*                    <div className={styles['feature-column-text-wrapper']}>*/}
            {/*                        <p>*/}
            {/*                            <span>Plug In Any Payment Gateway You Prefer</span> — including Stripe,*/}
            {/*                            Razorpay, PayPal, or your own custom solution for global reach.*/}
            {/*                        </p>*/}
            {/*                    </div>*/}
            {/*                    <div className={styles['invoice-payment-image']}>*/}
            {/*                    <img src={payment}/>*/}
            {/*                    </div>*/}
            {/*                </div>*/}
            {/*            </div>*/}
            {/*        </div>*/}
            {/*        <div className={`${styles['row-1']} ${styles['row']}`}>*/}
            {/*            <div className={`${styles['row-1-col-1']} ${styles['column']}`}>*/}
            {/*                <div className={styles['feature-column-text-wrapper']}>*/}
            {/*                    <p><span>Send Branded Invoices Instantly via Email</span> — No Logins, Just One Click to*/}
            {/*                        View, Review & Pay.</p>*/}
            {/*                </div>*/}
            {/*                <div className={styles['feature-banner-img-wrapper']}>*/}
            {/*                    <div className={styles['image-wrapper-multi']}>*/}
            {/*                        <img src={gmail_invoice1}/>*/}
            {/*                    </div>*/}
            {/*                </div>*/}
            {/*            </div>*/}
            {/*            <div className={`${styles['row-1-col-2']} ${styles['column']}`}>*/}
            {/*                <div className={styles['feature-column-text-wrapper']}>*/}
            {/*                    <p><span>Craft legally solid, beautifully styled contracts</span> with your brand tone —*/}
            {/*                        attach them directly with invoices or send separately.</p>*/}
            {/*                </div>*/}

            {/*            </div>*/}
            {/*        </div>*/}
            {/*    </div>*/}

            {/*</div>*/}









            <ShowcaseSection/>

            <TheCanvasSection/>
            <TheBusinessOSSection/>








        </div>
    )
}

export default HomePage