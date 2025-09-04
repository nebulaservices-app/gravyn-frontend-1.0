import React, {useEffect, useState} from "react";
import styles from "../../styles/web-stack-styles/pricing.module.css";
import NavBar from "../../components/features/NavBar";
import single from "../../images/features/single.svg";
import enterprise from "../../images/features/enterprise.svg";

import arrow from "../../images/features/grey-top-right-arrow.svg"

import tick from "../../images/features/tick-includes.svg"
import basic from "../../images/features/basic.svg"
import premium from "../../images/features/growth.svg"
import { FaMinus, FaPlus } from "react-icons/fa"; // Make sure to install react-icons


// Pricing data
const pricingPlans1 = {
    individual: [
        {
            title: "Starter",
            price: "₹149/mo",
            description: "Perfect for solo creators just getting started.",
            features: [
                "Up to 3 projects",
                "Smart invoicing",
                "Basic task management",
                "Client sharing access",
            ],
            buttonText: "Start Free",
        },
        {
            title: "Pro",
            price: "₹299/mo",
            description: "For freelancers managing multiple clients with ease.",
            features: [
                "Unlimited projects",
                "Advanced automations",
                "Finance dashboard",
                "Calendar integrations",
            ],
            buttonText: "Upgrade",
        },
        {
            title: "Creator Plus",
            price: "₹499/mo",
            description: "Ideal for serious freelancers and consultants.",
            features: [
                "Contract templates & branding",
                "Recurring invoices",
                "File storage (20 GB)",
                "Priority support",
            ],
            buttonText: "Get Started",
        },
    ],
    business: [
        {
            title: "Team",
            price: "₹999/mo",
            description:
                "For growing teams managing clients, projects, and team performance.",
            features: [
                "5 team seats",
                "Shared dashboards",
                "Permission controls",
                "Invoice & contract management",
            ],
            buttonText: "Start Team Plan",
        },
        {
            title: "Business",
            price: "₹2499/mo",
            description:
                "Advanced workflows & financial control for teams scaling fast.",
            features: [
                "20 seats included",
                "Full finance suite",
                "Smart notifications & AI assist",
                "Slack & Gmail integrations",
            ],
            buttonText: "Choose Plan",
        },
        {
            title: "Enterprise",
            price: "Custom",
            description:
                "Tailored solutions for enterprises with complex needs and advanced support.",
            features: [
                "Unlimited team members",
                "Custom integrations",
                "Dedicated account manager",
                "Onboarding & migration support",
            ],
            buttonText: "Contact Us",
        },
    ],
};



const pricingPlans = [
    {
        icon: basic,
        type: "Basic Package",
        suitable: "Best for Startups & Small Businesses looking to boost online visibility with a budget-friendly solution.",
        price: 14999,
        originalPrice: 19999,
        discount: "25% OFF",
        features: ["Keyword Research", "GMB Setup", "10 Backlinks", "SEO Audit", "SEO Report"],
    },
    {
        icon: premium,
        type: "Advanced Package",
        suitable: "Ideal for Growing Businesses aiming to scale online reach and outpace competitors.",
        price: 59999,
        originalPrice: 79999,
        discount: "25% OFF",
        features: [
            "Competitor Analysis",
            "Core Web Vitals",
            "30+ Backlinks",
            "Content SEO",
            "Full Audit",
        ],
        popular: true,
    },
    {
        icon: enterprise,
        type: "Premium Package",
        suitable: "Perfect for Enterprises in high-competition niches seeking to dominate search rankings.",
        price: 159999,
        originalPrice: 290999,
        discount: "30% OFF",
        features: [
            "AI SEO Automation",
            "Conversion Optimization",
            "Digital PR",
            "SEO Manager",
            "Full SEO Revamp",
        ],
    },
];
const PricingCardsPartTwo = ({ serviceType }) => {
    const [pricingData, setPricingData] = useState([]);

    const formatPrice = (price, isIndian = false) => {
        const options = {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        };

        const formatter = new Intl.NumberFormat(isIndian ? "en-IN" : "en-US", options);
        return formatter.format(price);
    };

    useEffect(() => {
        // Set the pricingPlans array as pricing data
        setPricingData(pricingPlans);
    }, []);

    const renderCategory = (categoryCode) => {
        let categoryName = "";
        if (categoryCode === "0o0") {
            categoryName = "Basic Package";
        } else if (categoryCode === "0o1") {
            categoryName = "Advanced Package";
        } else if (categoryCode === "1o0") {
            categoryName = "Premium Package";
        }

        // Show all packages by default, filter if categoryName is set
        const categoryData = categoryName
            ? pricingData.filter((item) => item.type === categoryName)
            : pricingData;
        if (!categoryData || categoryData.length === 0) return null;

        return categoryData.map((item, index) => (
            <div
                key={index}
                className={`${styles["pricing-card"]} ${item.popular ? styles["popular"] : ""}`}
            >
                <div className={styles["price-card-top-right-arrow"]}>
                    <img src={arrow} alt="Arrow" />
                </div>
                <img className={styles['pricing-card-icon']} src={item.icon} alt={`${item.type} Icon`} />
                {/* {item.popular && <span className={styles["badge"]}>Most Popular</span>} */}
                <p className={styles["pricing-card-category"]}>{item.type}</p>
                <p className={styles["pricing-card-audience"]}>{item.suitable}</p>
                <div className={styles["pricing-card-price-pill"]}>
                    <div className={styles["pricing-card-price-pill-left-flex"]}>
                        <p className={styles["pricing-card-price-pill-title"]}>Starting at</p>
                        <p className={styles["pricing-card-price"]}>
                            {formatPrice(item.price, true)}{" "}
                            {item.originalPrice && (
                                <div className={styles["original-price-wrapper"]}>
                                    <div className={styles["original-price"]}>
                                        {formatPrice(item.originalPrice, true)}
                                    </div>
                                    <div className={styles["discount-percentage"]}>{item.discount}</div>
                                </div>
                            )}
                        </p>
                    </div>
                </div>
                <p className={styles["description"]}>PACKAGE INCLUDES</p>
                <div className={styles["includes-wrapper"]}>
                    {item.features.map((feature, i) => (
                        <div className={styles["includes"]} key={i}>
                            <img src={tick} alt="Tick" />
                            <p key={i}>{feature}</p>
                        </div>
                    ))}
                </div>
            </div>
        ));
    };

    return (
        <section className={styles["pricing-section"]}>
            {renderCategory(serviceType || "all")} {/* Default to "all" to show all packages */}
        </section>
    );
};


const Pricing = () => {
    const [activeTab, setActiveTab] = useState("individual");
// Add to your component's state:
    const [teamCount, setTeamCount] = useState(5); // default to 5 members

    const handleTeamCount = (type) => {
        setTeamCount(prev => {
            if (type === "inc") {
                return prev + 5 <= 100 ? prev + 5 : 100;
            } else {
                return prev - 5 >= 5 ? prev - 5 : 5;
            }
        });
    };

    const renderCards = (plans) => {
        return plans.map((plan, index) => (
            <div key={index} className={styles["pricing-card"]}>
                <p>{plan.title}</p>
                <p className={styles["price"]}>{plan.price}</p>
                <p className={styles["desc"]}>{plan.description}</p>
                <div>
                    {plan.features.map((feature, i) => (
                        <p key={i}>{feature}</p>
                    ))}
                </div>
                <button className={styles["select-button"]}>{plan.buttonText}</button>
            </div>
        ));
    };

    return (
        <div className={styles["page-wrapper"]}>
            <NavBar />
            <div className={styles["page-section"]}>
                <div className={styles["page-section-flexer"]}>
                    <div className={styles["page-section-flexer-item"]}>
                        <div className={styles["page-flexer-item-text-wrapper"]}>
                            <p className={styles["page-flexer-item-text-heading"]}>
                                Simple, transparent plans built for creators, teams, and
                                organizations who mean business.
                            </p>
                            <p className={styles["page-flexer-item-text-subheading"]}>
                                Unlock unlimited projects, smart finance tools, advanced
                                collaboration layers, and enterprise-grade control when you
                                need more.
                            </p>
                        </div>

                        <div className={styles["page-toggle-pricing"]}>
                            <div
                                className={`${styles["page-toggle-pricing-item"]} ${
                                    activeTab === "individual" ? styles["active-tab"] : ""
                                }`}
                                onClick={() => setActiveTab("individual")}
                            >
                                <img src={single} alt="Individuals"/>
                                <p>For Individuals & Freelancers</p>
                            </div>

                            <div
                                className={`${styles["page-toggle-pricing-item"]} ${
                                    activeTab === "business" ? styles["active-tab"] : ""
                                }`}
                                onClick={() => setActiveTab("business")}
                            >
                                <img src={enterprise} alt="Businesses"/>
                                <p>For Teams & Businesses</p>

                                {
                                    activeTab === "business" &&
                                    <div className={styles['team-count-offer']}>
                                        <div className={styles['team-counter']}>
                                            <button onClick={() => handleTeamCount("dec")}><FaMinus/></button>
                                            <span>{teamCount} seats included</span>
                                            <button onClick={() => handleTeamCount("inc")}><FaPlus/></button>
                                        </div>
                                    </div>
                                }
                            </div>
                        </div>

                    </div>

                    <div className={styles["page-section-flexer-item"]}>
                        <div className={styles["yearly-discount-wrapper"]}>
                            <div className={styles["page-flexer-toggle-parent-wrapper"]}>
                                <div className={styles["page-flexer-toggle-left-wrapper"]}>
                                    <p>MONTHLY</p>
                                </div>
                                <div className={styles["page-flexer-toggle-wrapper"]}>
                                    <div className={styles["page-toggle-switch"]}/>
                                </div>
                                <div className={styles["page-flexer-toggle-right-wrapper"]}>
                                    <p>YEARLY</p>
                                    <div className={styles["discount-yearly"]}>Save 14%</div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
                {/* Pricing Cards */}
                <div className={styles["pricing-cards-container"]}>
                    <PricingCardsPartTwo/>
                </div>
            </div>
        </div>
    );
};

export default Pricing;