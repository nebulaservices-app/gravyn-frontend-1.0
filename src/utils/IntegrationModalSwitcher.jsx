// IntegrationModalSwitcher.jsx
import React from "react";
import GithubModal from "../components/features/Integrations/GithubModal";
// import GitlabModal from "./GitlabModal"; // for future extensions

const IntegrationModalSwitcher = ({ integrationRecord , handleClose}) => {
    if (!integrationRecord) return null;

    switch (integrationRecord.key) {
        case "github":
            return <GithubModal integrationRecord={integrationRecord} handleClose={handleClose} />;
        // case "gitlab":
        //     return <GitlabModal integrationRecord={integrationRecord} />;
        default:
            return <p>Unsupported integration provider: {integrationRecord.key}</p>;
    }
};

export default IntegrationModalSwitcher;