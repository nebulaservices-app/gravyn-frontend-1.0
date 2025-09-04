import styles from "./IssueOverview.module.css";
import close from "../../images/icons/close.svg";
import {useEffect, useState} from "react";
import IntegrationModalSwitcher from "../../utils/IntegrationModalSwitcher";
import NativeAppModalSwitcher from "../../utils/NativeAppModalSwitcher"
const SelectedIntegration = ({ selectedIntegration, setSelectedIntegration }) => {
    const [isLoading, setLoading] = useState(true);
    const [isClosing, setIsClosing] = useState(false);


    const handleClose = () => {
        setIsClosing(true); // Trigger the slide-out animation

        setTimeout(() => {
            setSelectedIntegration(null); // Actually remove it after animation
            setIsClosing(false); // Reset
        }, 300); // Match the animation duration
    };


    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1500); // 1.5 seconds

        return () => clearTimeout(timer);
    }, []);

    console.log("RKO" , selectedIntegration);

    return (
        <div className={styles['selected-modal-overlay']}>
            <div
                className={`${styles['selected-modal-wrapper']} ${isClosing ? styles['slide-out'] : styles['slide-in']}`}>
                {isLoading ? (
                    <div className={styles['loading-selected-main']}>
                        <div className={styles['loading-selected-modal']}>
                            <img src={selectedIntegration.integration.icon}/>
                        </div>
                    </div>
                ) : selectedIntegration ? (
                    <div className={styles['loaded-selected-main']}>
                        <div className={styles['selected-integration-on']}>
                            {selectedIntegration?.type === "native" ?
                                <NativeAppModalSwitcher integrationRecord={selectedIntegration}
                                                        handleClose={handleClose}

                                /> :
                                <IntegrationModalSwitcher integrationRecord={selectedIntegration}
                                                          handleClose={handleClose}/>
                            }
                        </div>
                    </div>
                ) : null}
            </div>

        </div>
    );
};

export default SelectedIntegration;