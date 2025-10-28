import React from "react"
import styles from "./waitlist.module.css"
import hero_banner  from "../images/web-stack-images/herobanner2.png"
import search from "../images/icons/search.svg"
import notification from "../images/icons/notification.svg"
import face from "../images/waitlist/face1.png"
import Aurora from "../components/ui/Aurora"
import Orbiez from "../components/ui/Orbiez"
import NavBar from "../components/features/NavBar"
import dropdown from "../images/icons/dropdown.svg"
import champions from "../images/icons/champion.svg"
import all from "../images/icons/allprojects.svg"
import project from "../images/icons/project.svg"
import arrow from "../images/icons/rightarrow.svg"
import { formatDateTime } from "../utils/datetime"
import kanban from "../images/icons/kanban.svg"
import spreadsheet from "../images/icons/spreadsheet.svg"
import calendar from "../images/icons/calendar.svg"
import hero from "../images/graphics/hero_screen.svg"
import email from "../images/icons/email.svg"
import subscribed from "../images/graphics/subscribed.png"
import issue from "../images/icons/issues.svg"
import task from "../images/icons/tasks_i.svg"
import face11 from "../images/waitlist/infographic/faces/face11.png"
import face13 from "../images/waitlist/infographic/faces/face13.png"
import face14 from "../images/waitlist/infographic/faces/face14.png"
import face15 from "../images/waitlist/infographic/faces/face15.png"
import texture from "../images/waitlist/texture_grad.svg"
import milestoneig from "../images/waitlist/milestone_final.png"
import MessageToTask from "../components/waitlist/messagetotask"
import milestoneig1 from "../images/waitlist/infographic/milestone_info_1.svg"
import milestoneig2 from "../images/waitlist/infographic/milestone_info_2.svg"
import milestoneig3 from "../images/waitlist/infographic/milestone_info_3.svg"

const HeroWrapper = () => {

    const date = new Date();

    return (
       <div className={styles['hero-banner-wrapper']}>
            <div className={styles['hero-sidebar']}>

            </div>
            <div className={styles['hero-main-main']}>
            <div className={styles['hero-main']}>
                <div className={styles['hero-main-nav']}>
                    <div className={styles['hero-main-nav-i']}>
                       <div className={styles['main-nav-i-item']}>
                          <div className={styles['wrapper-img']}>
                            OS
                          </div>
                          <p className={styles['wrapper-p']}>Oracle Salesforce Inc.</p>
                          <img src={dropdown}/>
                       </div>
                    </div>
                    <div className={styles['hero-main-nav-i']}>
                        <div className={styles['main-nav-i-item']}>
                            <img src={search}/>
                        </div>
                        <div className={styles['main-nav-i-item']}>
                            <img src={notification}/>
                        </div>
                        <div className={styles['main-nav-i-item']}>
                            <img src={face}/>
                        </div>
                    </div>
                </div>
                <div className={styles['hero-main-content']}>
                    <div className={styles['main-content-nav']}>
                        <div className={styles['nav-parent-i']}>
                            <div className={styles['nav-i']}>
                                <img src={all}/>
                                <p>All Projects</p>
                            </div>
                            <img src={arrow}/>
                             <div className={styles['nav-i']}>
                                <img src={project}/>
                                <p>Gravyn v1 Launch</p>
                            </div>
                        </div>
                    </div>
                     <div className={styles['main-content-wrapper']}>
                        <div className={styles['main-content-main']}>
                            <div className={styles['main-content-main-header']}>
                                <div className={styles['mcm-header-top']}>
                                    <div className={styles['mcm-last-updated']}>
                                        <p>Last updated {formatDateTime(date)}</p>
                                    </div>
                                    <div className={styles['mcm-header-top-text']}>
                                        <p>Tasks Overview</p>
                                        <p>View, manage, and track all tasks across your project in one unified dashboard.</p>
                                    </div>
                                </div>
                                <div className={styles['mcm-header-bottom']}>
                                    <div className={styles['mcm-bottom-nav']}>
                                       <div className={styles['mcm-bottom-nav-i']}>
                                          <img src={kanban}/>
                                          <p>Kanban</p>
                                       </div>
                                       <div className={styles['mcm-bottom-nav-i']}>
                                          <img src={spreadsheet}/>
                                          <p>Spreadsheet</p>
                                       </div>
                                       <div className={styles['mcm-bottom-nav-i']}>
                                          <img src={calendar}/>
                                          <p>Calendar</p>
                                       </div>
                                    </div>
                                </div>
                            </div>
                            <div className={styles['mcm-content']}>
                                
                            </div>
                        </div>
                        <div className={styles['main-content-side']}>

                        </div>
                    </div>
                </div>
            </div>
            </div>

       </div>
    )
}














const items = [
  { type: 'task', name: 'Conduct security audit', status: 'Scheduled', priority: 'High', assignee: face15, dueDate: 'Oct 25' },
  { type: 'issue', name: 'Fix urgent bugs', status: 'Open', severity: 'Critical', assignee: face15, dueDate: 'Mar 12' },
  { type: 'task', name: 'Design UI components', status: 'To Do', priority: 'Medium', assignee: face14, dueDate: 'Apr 15' },
  { type: 'issue', name: 'Handle client escalations', status: 'Investigating', severity: 'Major', assignee: face15, dueDate: 'May 30' },
  { type: 'issue', name: 'Resolve deployment failures', status: 'Open', severity: 'High', assignee: face11, dueDate: 'Jul 10' },
  { type: 'task', name: 'Develop API end points', status: 'In Progress', priority: 'High', assignee: face13, dueDate: 'Aug 05' },
  { type: 'issue', name: 'Performance issues investigation', status: 'Open', severity: 'Medium', assignee: face14, dueDate: 'Sep 11' },
  { type: 'task', name: 'Create marketing campaign', status: 'To Do', priority: 'Low', assignee: face11, dueDate: 'Oct 21' },
  { type: 'issue', name: 'Update security patches', status: 'Open', severity: 'Critical', assignee: face11, dueDate: 'Nov 16' },
  { type: 'task', name: 'Conduct user testing', status: 'In Review', priority: 'Medium', assignee: face13, dueDate: 'Dec 07' },
  { type: 'task', name: 'Prepare live demo video', status: 'In Progress', priority: 'Medium', assignee: face14, dueDate: 'Jan 18' },
  { type: 'issue', name: 'Reprioritize tasks after delay', status: 'Open', severity: 'Low', assignee: face15, dueDate: 'Feb 28' },
  { type: 'issue', name: 'Fix UX bugs found in feedback', status: 'Investigating', severity: 'High', assignee: face13, dueDate: 'Mar 23' },
  { type: 'task', name: 'Refine UI components for mobile', status: 'To Do', priority: 'High', assignee: face13, dueDate: 'Apr 29' },
  { type: 'issue', name: 'Investigate API latency spikes', status: 'Open', severity: 'Major', assignee: face14, dueDate: 'May 14' },
  { type: 'task', name: 'Prepare product launch presentation', status: 'To Do', priority: 'High', assignee: face11, dueDate: 'Jun 22' },
  { type: 'issue', name: 'Address server downtime issue', status: 'Critical', severity: 'Critical', assignee: face11, dueDate: 'Jul 08' },
  { type: 'task', name: 'Update documentation for new features', status: 'In Review', priority: 'Medium', assignee: face13, dueDate: 'Aug 19' },
  { type: 'issue', name: 'Fix broken links on homepage', status: 'Open', severity: 'Low', assignee: face14, dueDate: 'Sep 30' },
];


function chunkArrayRandomly(arr, min = 4, max = 4) {
  let result = [];
  let i = 0;

  while(i < arr.length) {
    // Random chunk size between min and max but clipped by remaining items
    const chunkSize = Math.min(min + Math.floor(Math.random() * (max - min + 1)), arr.length - i);
    result.push(arr.slice(i, i + chunkSize));
    i += chunkSize;
  }

  return result;
}


function InfographicMultiRow() {
  const rows = chunkArrayRandomly(items);

  return (
    <div className={styles['infographic-multiflow']}>
      {rows.map((row, rowIndex) => {
        const translateX = -5 - Math.floor(Math.random() * 300);
        return (
          <div
            key={rowIndex}
            className={styles['flow-row']}
            style={{ transform: `translateX(${translateX}px)` }}
          >
            {row.map((item, idx) => (

                <div className={styles['flow-card-outer']}>
                     <div key={idx} className={styles['flow-card']} data-type={item.type}>
                        <div className={styles['flow-card-i']}>
                           <div className={styles['card-type']}>
                             {item.type === 'task' ? <img src={task} alt="task" /> : <img src={issue} alt="issue" />}
                            </div>
                           <div className={styles['card-name']}>{item.name}</div>
                        </div>
                        <div className={styles['flow-card-i']}>
                            <div className={styles['flow-card-due']}> 
                                <p>{item.dueDate}</p>
                            </div>
                            <div className={styles['flow-card-img']}>
                                <img src={item.assignee}/>
                            </div>
                        </div>
                     </div>
                </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}




const Waitlist = ({}) => {
    return (
        <div className={styles['page-wrapper']}>
            {/* <NavBar/> */}
            <div className={styles['page-hero']}>
                {/* <Aurora/> */}
                <Orbiez/>

                <div className={styles['page-hero-text-wrapper']}>
                    <div className={styles['hero-title']}>
                        {/* <Orbiez/> */}
                        <img src={champions}/>
                        <p>Lock in a lifetime Founding 100 badge and member perks</p>
                    </div>
                    <p className={styles['hero-heading']}>Gravyn makes project management feel effortless—and delivery predictable.</p>
                    <p className={styles['hero-subheading']}>Join the early access waitlist for faster planning, instant assignments, and automated client updates—built to turn simple chat into shipped work.</p>
                    <div className={styles['hero-waitlist']}>
                        <div className={styles['hero-waitlist-i']}>
                            <img src={email}/>
                            <input placeholder={"Enter your email address..."}/>
                        </div>
                        <div className={styles['hero-waitlist-i']}>
                            <div className={styles['hero-waitlist-action-wrapper']}>
                                <p>Join Waitlist</p>
                            </div>
                        </div>
                    </div>
                    <div className={styles['subscription']}>
                        <img src={subscribed}/>
                        <p>Subscribed by 28+ more people.</p>
                    </div>
                </div>

              

                <img className={styles['hero-img']} src={hero}/>
                {/* <img src={texture} className={styles['texture']}/> */}
            </div>



            <div className={styles['page-section-wrapper']}>

                <div className={styles['section-wrapper']}>
                    <div className={styles['section-header']}>
                        <div className={styles['section-header-i']}>
                            <div className={styles['section-header-text']}>
                                <p>Plan with precision and adapt effortlessly to shifting priorities</p>
                            </div>
                        </div>
                    </div>
                    <div className={styles['section-content']}>
                                                <div className={styles['col-p']}>
                            <div className={styles['row-c']}>
                                <img className={styles['texture-grad-1-2-1']} src={texture}/>
                                <div className={styles['c-header']}>
                                    <p className={styles['c-header-heading']}>Manage Projects with Dual Parallel Workstreams</p>
                                    <p className={styles['c-header-subheading']}>Use Tasks for planned strategies and Issues for urgent challenges to stay focused and adapt swiftly.</p>

                                </div>
                                <div className={styles['c-content']}>
                                    {/* Create a infographic seperate component with tasks and issues in rows stream */}
                                   <InfographicMultiRow/>
                                </div>
                      

                            </div>
                            
                            <div className={styles['row-c']}>
                                <div className={styles['c-header']}>
                                    <p className={styles['c-header-heading']}>Our Visual Roadmap is a fluid, interactive timeline that shows dependencies, tracks team capacity, and highlights shifting priorities. It stays current and guides your team through every change.</p>
                                </div>
                                <div className={styles['c-content']}>
                                    
                                </div>
                            </div>
                        </div>

                        <div className={styles['col-p']}>
                            <div className={styles['row-c']}>
                                <div className={styles['c-header']}>
  <p className={styles['c-header-heading']}>
    Smart Milestones Drive Progress
  </p>
  <p className={styles['c-header-subheading']}>
    They automate next steps, notify stakeholders, and keep momentum alive so your projects never stall.
  </p>                                </div>
                                <div className={styles['c-content']}>
                                    <img className={styles['milestone-info-graphic']} src={milestoneig}/>

                                    {/* <div className={styles['milestone-info-wrapper']}>
                                        <img className={styles['milestone-info-1']} src={milestoneig1}/>
                                        <img className={styles['milestone-info-2']} src={milestoneig2}/>
                                        <img className={styles['milestone-info-3']} src={milestoneig3}/>

                                    </div> */}





                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            
            </div>

        </div>
    )
}

export default Waitlist;