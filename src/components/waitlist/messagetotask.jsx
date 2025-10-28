import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./messagetotask.module.css";
import message from "../../images/waitlist/infographic/message.png";
import dot from "../../images/icons/dot.svg";

// Timing (seconds)
const T = {
  showMenu: 1.0,       // meatball appears + menu fades in
  selectItem: 1.8,     // highlight "Create task"
  showCard: 2.3,       // task card slides in
  confirmPost: 3.1,    // confirmation chip appears
  loopDelay: 5.0       // total loop length
};

const ease = [0.22, 1, 0.36, 1];

const MessageToTask = () => {
  return (
    <div className={styles.component} aria-label="Infographic: Convert message to task">
      <div className={styles.scene}>
        {/* Base message bubble */}
        <motion.img
          src={message}
          alt="Project chat message"
          className={styles.message}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.4, ease } }}
        />

        {/* Meatball (three-dot) */}
        <motion.button
          className={styles.meatball}
          aria-hidden
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: [0, 1, 1, 0],
            scale: [0.8, 1, 1, 1],
            transition: { times: [0, T.showMenu / T.loopDelay, 0.9, 1], duration: T.loopDelay, ease }
          }}
        >
          <img src={dot} alt="" />
        </motion.button>

        {/* Dropdown menu (visual only) */}
        <motion.div
          className={styles.menu}
          initial={{ opacity: 0, y: -6, scale: 0.98 }}
          animate={{
            opacity: [0, 1, 1, 0],
            y: [-6, 0, 0, -6],
            scale: [0.98, 1, 1, 0.98],
            transition: { delay: T.showMenu, duration: T.loopDelay - T.showMenu, ease }
          }}
        >
          <MenuItem label="Create task from message" hotkey="T" activeAt={T.selectItem} />
          <MenuItem label="Create issue from message" hotkey="I" />
          <Divider />
          <MenuItem label="Add to existing item" />
          <Divider />
          <MenuItem label="Extract action with AI" />
        </motion.div>

        {/* Prefilled task card mock */}
        <motion.div
          className={styles.card}
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{
            opacity: [0, 0, 1, 1, 0],
            y: [10, 10, 0, 0, 0],
            scale: [0.98, 0.98, 1, 1, 1],
            transition: { delay: T.showCard, duration: T.loopDelay - T.showCard, ease }
          }}
          aria-hidden
        >
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Fix support link in onboarding email</span>
            <span className={styles.sev}>High</span>
          </div>
          <div className={styles.cardRow}>
            <span className={styles.key}>Assignee</span>
            <span className={styles.val}>Suggested: Alex</span>
          </div>
          <div className={styles.cardRow}>
            <span className={styles.key}>Due</span>
            <span className={styles.val}>Tomorrow, 3:00 PM</span>
          </div>
          <div className={styles.cardRow}>
            <span className={styles.key}>Links</span>
            <span className={styles.val}>Back‑link to message • Screenshot.png</span>
          </div>
          <div className={styles.cardRow}>
            <span className={styles.key}>Dependency</span>
            <span className={styles.val}>Demo prep checklist</span>
          </div>
          <div className={styles.tags}>
            <span>Email</span><span>Client‑impact</span><span>Hotfix</span>
          </div>
          <motion.div
            className={styles.createBtn}
            initial={{ opacity: 0.6 }}
            animate={{ opacity: [0.6, 1, 1], transition: { delay: T.showCard + 0.4, duration: 0.8 } }}
          >
            Create task
          </motion.div>
        </motion.div>

        {/* Confirmation chip posted back to chat */}
        <motion.div
          className={styles.confirm}
          initial={{ opacity: 0, y: 6 }}
          animate={{
            opacity: [0, 0, 1, 1, 0],
            y: [6, 6, 0, 0, 0],
            transition: { delay: T.confirmPost, duration: T.loopDelay - T.confirmPost, ease }
          }}
        >
          Task #2146 created — due Tomorrow 3 PM — assigned to Alex
        </motion.div>
      </div>
    </div>
  );
};

const MenuItem = ({ label, hotkey, activeAt }) => (
  <motion.div
    className={styles.menuItem}
    initial={{ opacity: 0, y: -4 }}
    animate={{
      opacity: 1,
      y: 0,
      backgroundColor: activeAt ? ["transparent", "transparent", "rgba(28,38,56,0.6)", "transparent"] : "transparent",
      transition: activeAt
        ? { delay: activeAt, duration: 0.8, ease }
        : { delay: 0.1, duration: 0.18 }
    }}
  >
    <span className={styles.bullet}>•</span>
    <span className={styles.menuLabel}>{label}</span>
    {hotkey && <span className={styles.hotkey}>{hotkey}</span>}
  </motion.div>
);

const Divider = () => <div className={styles.sep} />;

export default MessageToTask;
