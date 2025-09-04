import React, {useState} from "react"
import styles from "./MeetingIntegration.module.css"
// import googleMeet from "../../../public/images/integration/google_integration/google-meet-icon.svg"
// import authIcon from "../../images/integration/google_integration/lock.svg"
// import meetingIcon from "../../images/integration/google_integration/meeting.svg"
// import linkIcon from "../../images/integration/google_integration/link.svg"
// import managementIcon from "../../images/integration/google_integration/manage.svg"
// import kairoIcon from "../../images/integration/google_integration/kario-mono.svg"
// import addParticipantIcon from "../../images/integration/google_integration/participant.svg"
// import successIcon from "../../images/integration/google_integration/success.svg"


// const MeetingIntegration = ({userId}) => {
//
//
//     const [isConnected, setIsConnected] = useState(false);
//     const features = [
//         {
//             title: 'OAuth Authentication',
//             description: 'Securely authenticate with your Google account to connect Google Meet to your Nebula project and start scheduling meetings instantly.',
//             icon: authIcon
//         },
//         {
//             title: 'Meeting Creation',
//             description: 'Create new Google Meet sessions directly from the Nebula platform with seamless integration and scheduling.',
//             icon: meetingIcon
//         },
//         {
//             title: 'One-click Join Links',
//             description: 'Easily join scheduled meetings by clicking on a simple, secure Google Meet link directly from the Nebula interface.',
//             icon: linkIcon
//         },
//         {
//             title: 'Meeting Management',
//             description: 'Manage all your Google Meet sessions from within the Nebula project, including scheduling, editing, and deleting meetings.',
//             icon: managementIcon
//         },
//         {
//             title: 'Kairo.ai Support',
//             description: 'Leverage Kairo, the AI assistant, to monitor, analyze, and optimize your meetings with smart recommendations and insights.',
//             icon: kairoIcon
//         },
//         {
//             title: 'Participants Sync',
//             description: 'Sync meeting participants seamlessly between Nebula and Google Meet to ensure everyone is up-to-date with meeting schedules and access.',
//             icon: addParticipantIcon
//         }
//     ];
//
//
//     return (
//         <div className={styles['integration-wrapper']}>
//             <div className={styles['app-integration-wrapper']}>
//                 <div className={styles['header']}>
//                     <div className={styles['header-flex-left']}>
//                         <img className={styles['integration-icon']} src={googleMeet}/>
//                         <p className={styles['integration-name']}>Google Meet</p>
//                         <p className={styles['integration-description']}>
//                             Google Meet integration in Nebula allows users to securely connect their accounts and manage meetings directly within the platform, streamlining collaboration without switching tools.
//                         </p>
//                     </div>
//                 </div>
//                 <div className={styles['connection-wrapper']}>
//
//                     {!isConnected ?
//                         <div className={styles['connection-capsule']}>
//                             <p className={styles['connection-meta']}>Service is not yet connected, Please connect to
//                                 proceed.</p>
//                             <div
//                                 onClick={()=>{setIsConnected(!isConnected)}}
//                                 className={styles['connection-button']}>
//                                 Connect
//                             </div>
//                         </div> :
//
//                         <div className={styles['connection-capsule-success']}>
//                             <img src={successIcon}/>
//                             <p className={styles['connection-meta-success']}>
//                                 You have already successfully connected the service in nebula
//                             </p>
//
//                         </div>
//
//                     }
//
//
//                 </div>
//
//                 <div className={styles['integration-feature-wrapper']}>
//                     <div className={styles['integration-feature-header']}>
//                         <p className={styles['integration-feature-heading']}>integration features</p>
//
//                         <div className={styles['features-list']}>
//                         {features.map((feature, index) => (
//                                 <div className={styles['feature-item']} key={index}>
//                                     <div className={`${styles['feature-flex-item']} ${styles['feature-flex-left']}`}>
//                                         <img src={feature.icon}/>
//                                     </div>
//                                     <div className={styles['feature-flex-item']}>
//                                         <p className={styles['feature-heading']}>{feature.title}</p>
//                                         <p className={styles['feature-description']}>{feature.description}</p>
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>
//
//                     </div>
//                 </div>
//             </div>
//             <div className={styles['app-integration-meta-wrapper']}>
//
//             </div>
//         </div>
//     )
// }
//
