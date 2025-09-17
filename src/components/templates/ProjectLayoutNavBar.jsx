import React, { useState } from "react";
import styles from "./ProjectLayoutNavBar.module.css";

import useProjectContext from "../../hook/useProjectContext";

import allproject from "../../images/icons/allprojects.svg";
import projecticon from "../../images/icons/project.svg";
import slash from "../../images/icons/slash.svg";
import star_nofav from "../../images/icons/star-nofav.svg";
import star_fav from "../../images/icons/star-fav.svg";
import dot from "../../images/icons/dot.svg";
import warning from "../../images/icons/warning.svg";
import kairo from "../../images/logo/kairo.svg";
import task from "../../images/icons/tasks_i.svg"

const MenuItemFactory = ({ type, project, isFav, toggleFav, onClick }) => {
  switch (type) {
    case "allProjects":
      return (
        <div className={styles["nav-pill-i"]} onClick={onClick} role="button" tabIndex={0}>
          <img src={allproject} alt="All Projects" />
          <p>All Projects</p>
        </div>
      );

    case "project":
      return (
        <div className={styles["nav-pill-i"]} role="button" tabIndex={0}>
          <img src={projecticon} alt="Project Icon" />
          <p>{project?.name || "Loading..."}</p>
          <img
            onClick={(e) => {
              e.stopPropagation();
              toggleFav();
            }}
            className={styles["star"]}
            src={isFav ? star_fav : star_nofav}
            alt={isFav ? "Favorite" : "Not Favorite"}
            style={{ cursor: "pointer" }}
          />
          {/* <img className={styles["dot"]} src={dot} alt="Dot" /> */}
        </div>
      );

    case "issues":
      return (
        <div className={styles["nav-pill-i"]} onClick={onClick} role="button" tabIndex={0}>
          <img src={warning} alt="Issues" />
          <p>Issues</p>
        </div>
      );

    case "askKairo":
      return (
        <div className={styles["nav-pill-i"]} onClick={onClick} role="button" tabIndex={0}>
          <img src={kairo} alt="Ask Kairo" />
          <p>Ask Kairo</p>
        </div>
      );

    case "task-timeline" :
        return (
            <div className={styles['nav-pill-i']}>
                <div className={styles['nav-pill-task']}>
                    <img src={task}/>
                </div>
            </div>
        )

    // Add more cases for different types of interactive menu buttons

    default:
      return null;
  }
};

const ProjectLayoutNavBar = () => {
  const { project } = useProjectContext();
  const [isFav, setIsFav] = useState(false);
  const toggleFav = () => setIsFav((prev) => !prev);

  const [selectedMenu , setSelectedMenu] = useState("timeline");

  const handleAllProjectsClick = () => console.log("Clicked All Projects");
  const handleIssuesClick = () => console.log("Clicked Issues");
  const handleAskKairoClick = () => console.log("Clicked Ask Kairo");
  const handleProjectClick = () => console.log("Clicked Project");

  return (
    <div className={styles["issue-nav-bar"]}>
      <div className={styles["nav-capsule"]}>
        <MenuItemFactory type="allProjects" onClick={handleAllProjectsClick} />
        <img src={slash} alt="Separator" />
        <MenuItemFactory
          type="project"
          project={project}
          isFav={isFav}
          toggleFav={toggleFav}
          onClick={handleProjectClick}
        />

      </div>



      <div className={styles["nav-capsule"]}>

        {/* {selectedMenu === "timeline" &&  <MenuItemFactory type="task-timeline" onClick={handleAskKairoClick} />} */}
        <MenuItemFactory type="askKairo" onClick={handleAskKairoClick} />
      </div>
    </div>
  );
};

export default ProjectLayoutNavBar;
