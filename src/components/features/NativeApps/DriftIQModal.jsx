import React from "react"
import styles from "./DriftIQModal.module.css"
import close from "../../../images/icons/close.svg";

const DriftIQModal = ({integrationRecord , handleClose}) => {
    return <>
        <div className={styles['native-modal-wrapper']}>
            <div className={styles['native-notification-wrapper']}>

            </div>
            <div className={styles['native-header-wrapper']}>
                <div className={styles['native-header-i']}>
                    <div className={styles['native-header-details']}>
                        <p><img src={integrationRecord.icon}/>{integrationRecord?.name}</p>
                        <p>{integrationRecord?.description}</p>
                    </div>
                </div>
                <div className={styles['selected-native-action-wrapper']}>
                    <img
                        className={styles['close-btn']}
                        src={close}
                        onClick={() => {
                            handleClose()
                        }}
                        alt="Close"
                    />
                </div>
            </div>
        </div>
    </>
}

export default DriftIQModal;