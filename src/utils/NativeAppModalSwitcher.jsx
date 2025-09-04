// NativeAppModalSwitcher.jsx
import React from "react";
import DriftIQModal from "../components/features/NativeApps/DriftIQModal";
// import AnotherNativeModal from "./AnotherNativeModal"; // extend for more

const NativeAppModalSwitcher = ({ integrationRecord, handleClose }) => {
    if (!integrationRecord) return null;

    switch (integrationRecord.key) {
        case "driftiq":
            return (
                <DriftIQModal
                    integrationRecord={integrationRecord}
                    handleClose={handleClose}
                />
            );
        // case "another_native_app":
        //     return (
        //         <AnotherNativeModal
        //             integrationRecord={integrationRecord}
        //             handleClose={handleClose}
        //         />
        //     );
        default:
            return <p>Unsupported native app: {integrationRecord.key}</p>;
    }
};

export default NativeAppModalSwitcher;
