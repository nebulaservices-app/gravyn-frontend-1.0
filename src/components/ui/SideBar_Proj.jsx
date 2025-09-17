import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./SideBar_Proj.module.css";

import logo from "../../images/icons/gravyn.svg";
import dashboard from "../../images/icons/dashboard.svg";
import inbox from "../../images/icons/inbox.svg";
import notes from "../../images/icons/notes.svg";
import tasks from "../../images/icons/tasks_i.svg";
import issues from "../../images/icons/issues.svg";
import milestone from "../../images/icons/milestones_i.svg";
import messages from "../../images/icons/messages.svg";
import calendar from "../../images/icons/calendar.svg";
import files from "../../images/icons/files.svg";
import teams from "../../images/icons/teams.svg";
import settings from "../../images/icons/settings.svg";
import help from "../../images/icons/help.svg";
import logout from "../../images/icons/logout.svg";
import topdown from "../../images/icons/topdown.svg";

const menuStructure = [
  {
    title: null,
    items: [
      { label: "Dashboard", icon: dashboard, path: "/app/project/68159219cdb8524689046498/overview" },
      { label: "My Inbox", icon: inbox, path: "/app/project/68159219cdb8524689046498/inbox" },
      { label: "Project Updates", icon: notes, path: "/app/project/68159219cdb8524689046498/updates" },
    ],
  },
  {
    title: "Planning & Execution",
    items: [
      { label: "Tasks", icon: tasks, path: "/app/project/68159219cdb8524689046498/tasks/overview" },
      { label: "Issues", icon: issues, path: "/app/project/68159219cdb8524689046498/issues/overview" },
      { label: "Milestones", icon: milestone, path: "/app/project/68159219cdb8524689046498/milestones" },
    ],
  },
  {
    title: "Collaboration",
    items: [
      {
        label: "Messages",
        icon: messages,
        path: "/app/project/68159219cdb8524689046498/messages/",
      },
      {
        label: "Calendar & Scheduling",
        icon: calendar,
        path: "/app/project/68159219cdb8524689046498/calendar-schedule",
        subItems: [
          {
            label: "Calendar",
            path: "/app/project/68159219cdb8524689046498/calendar-schedule",
          },
          {
            label: "Timeline",
            path: "/app/project/68159219cdb8524689046498/timeline",
          },
          {
            label: "Workload Analysis",
            path: "/app/project/68159219cdb8524689046498/calendar-schedule/workload",
          },
        ],
      },
      { label: "Files & Documents", icon: files, path: "/project/files" },
      {
        label: "Team & Roles",
        icon: teams,
        path: "/app/project/68159219cdb8524689046498/collaborate",
      },
    ],
  },
];

const bottomMenu = [
  // { label: "Settings", icon: settings, path: "/settings" },
  // { label: "Help & Support", icon: help, path: "/help" },
  // { label: "Log out", icon: logout, path: "/logout" },
];

const MenuItem = ({ item, activePath, onClick, hasSubmenu, isOpen, onToggle, collapsed }) => {
  const isActive =
    activePath === item.path ||
    (hasSubmenu && item.subItems.some((sub) => sub.path === activePath));

  return (
    <div>
      <div
        className={`${styles["menu-item-i"]} ${isActive ? styles["active"] : ""}`}
        onClick={() => (hasSubmenu ? onToggle(item.label) : onClick(item.path, item.label))}
        role="button"
        tabIndex={0}
        onKeyPress={() => (hasSubmenu ? onToggle(item.label) : onClick(item.path))}
        title={collapsed ? item.label : undefined}
      >
        <img src={item.icon} alt={`${item.label} icon`} />
        {!collapsed && <p>{item.label}</p>}
        {hasSubmenu && !collapsed && (
          <span className={styles["submenu-toggle"]}>{isOpen ? "-" : "+"}</span>
        )}
      </div>

      {hasSubmenu && isOpen && !collapsed && (
        <div className={styles["submenu-wrapper"]}>
          {item.subItems.map((subItem, idx) => (
            <div
              key={idx}
              className={`${styles["submenu-item"]} ${
                activePath === subItem.path ? styles["active"] : ""
              }`}
              onClick={() => onClick(subItem.path)}
              role="button"
              tabIndex={0}
              onKeyPress={() => onClick(subItem.path , subItem.label)}
            >
              <p>{subItem.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const MenuSection = ({
  title,
  items,
  activePath,
  onClick,
  openSubmenus,
  toggleSubmenu,
  collapsed,
  collapsibleCategory = false,
}) => {
  const [categoryOpen, setCategoryOpen] = useState(true);

  const hasSubmenuItems = items.some(
    (item) => Array.isArray(item.subItems) && item.subItems.length > 0
  );

  const toggleCategory = () => {
    if (collapsibleCategory && hasSubmenuItems) {
      setCategoryOpen((prev) => !prev);
    }
  };

  return (
    <div className={styles["menu-jr-block-wrapper"]}>
      <div className={styles["menu-item-wrapper"]}>
        {title && (
          <p
            className={styles["menu-type-title"]}
            style={collapsibleCategory && hasSubmenuItems ? { cursor: "pointer" } : {}}
            onClick={toggleCategory}
            role={collapsibleCategory && hasSubmenuItems ? "button" : undefined}
            tabIndex={collapsibleCategory && hasSubmenuItems ? 0 : undefined}
            onKeyPress={(e) => {
              if (
                collapsibleCategory &&
                hasSubmenuItems &&
                (e.key === "Enter" || e.key === " ")
              ) {
                toggleCategory();
              }
            }}
          >
            {title} {collapsibleCategory && hasSubmenuItems && (categoryOpen ? "▾" : "▸")}
          </p>
        )}
        <div
          className={styles["menu-capsule"]}
          style={
            collapsibleCategory && !categoryOpen
              ? { display: "none" }
              : undefined
          }
        >
          {items.map((item, idx) => {
            const hasSubmenu =
              Array.isArray(item.subItems) && item.subItems.length > 0;
            const isOpen = openSubmenus.includes(item.label);
            return (
              <MenuItem
                key={idx}
                item={item}
                activePath={activePath}
                onClick={onClick}
                hasSubmenu={hasSubmenu}
                isOpen={isOpen}
                onToggle={toggleSubmenu}
                collapsed={collapsed}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

const SideBar_Proj = ({onMenuSelect}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [openSubmenus, setOpenSubmenus] = useState([]);
  const [collapsed, setCollapsed] = useState(false);
  const activePath = location.pathname;

  const toggleSubmenu = (label) => {
    setOpenSubmenus((prev) =>
      prev.includes(label)
        ? prev.filter((l) => l !== label)
        : [...prev, label]
    );
  };

  const handleLogout = () => {
    console.log("Logging out...");
  };

   const handleClick = (path, label) => {
    if (path === "/logout") {
      handleLogout();
    } else {
      navigate(path);
      if (onMenuSelect) {
        onMenuSelect(label);  // Send the label back to parent here
      }
    }
  };

  const handleCollapse = () => setCollapsed(prev => !prev);

  return (
    <div
      className={`${styles["sidebar-wrapper"]} ${collapsed ? styles["collapsed"] : ""}`}
      style={{ width: collapsed ? 60 : undefined }}
    >
      <div className={styles["sidebar-proj-header-wrapper"]}>
        <div className={styles["sidebar-flex"]}>
          <div className={styles["sidebar-flex-i"]}>
            <div className={styles["sidebar-logo-wrapper"]}>
              <img src={logo} alt="Gravyn Logo" />
              {!collapsed && <p>Gravyn</p>}
            </div>
          </div>
        </div>
        <div className={styles["sidebar-flex"]}>
          <img
            src={topdown}
            alt={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            style={{ cursor: "pointer", display: "block" }}
            onClick={handleCollapse}
          />
        </div>
      </div>

      <div className={styles["sidebar-proj-content-wrapper"]}>
        <div className={styles["menu-sr-wrapper"]}>
          <div className={styles["menu-blocks-wrapper"]}>
            {menuStructure.map((section, idx) => (
              <MenuSection
                key={idx}
                title={section.title}
                items={section.items}
                activePath={activePath}
                onClick={handleClick}
                openSubmenus={openSubmenus}
                toggleSubmenu={toggleSubmenu}
                collapsed={collapsed}
                collapsibleCategory={true} // Enable collapsible category here
              />
            ))}
          </div>

          <div
            className={`${styles["menu-blocks-wrapper"]} ${styles["menu-non-collapsible-block-wrapper"]}`}
          >
            <div className={styles["menu-jr-block-wrapper"]}>
              <div className={styles["menu-item-wrapper"]}>
                <div className={styles["menu-capsule"]}>
                  {bottomMenu.map((item, idx) => (
                    <MenuItem
                      key={idx}
                      item={item}
                      isActive={activePath === item.path}
                      onClick={handleClick}
                      collapsed={collapsed}
                      activePath={activePath}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideBar_Proj;
