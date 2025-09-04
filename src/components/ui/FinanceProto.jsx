
import React from "react"
import styles from "./FeatureProto.module.css"
import nebula_white from "../../images/proto/nebula-white.svg"
import inbox from "../../images/proto/inbox.svg"
import dashboard from "../../images/proto/dashboard.svg"
import messages from "../../images/proto/messages.svg"
import finances from "../../images/proto/billing.svg"
import files from "../../images/proto/files.svg"
import issue from "../../images/proto/issue.svg"
import setting from "../../images/proto/setting.svg"
import downarrow from "../../images/icons/downarrow.svg";
import cube from "../../images/icons/cube.svg";
import alert from "../../images/icons/alert.svg";
import kairo from "../../images/logo/kairo.svg";

import invoice_icon from "../../images/proto/invoice.svg"
import pending from "../../images/proto/pending.svg"
import hashtag from "../../images/proto/hashtag.svg"

import warning from "../../images/proto/warning.svg"
import invoice_warning from "../../images/proto/invoice-warning.svg"
import pennding_yellow from "../../images/proto/pending-yellow.svg"
import calendar from "../../images/icons/calendar.svg"

import gmail from "../../images/proto/gmail.svg"
import slack from "../../images/proto/slack.svg"
import github from "../../images/proto/github.svg"
import vscode from "../../images/proto/Vector.svg"


const SideBarProto = () => {
    return (
        <div className={styles['side-bar-wrapper']}>
            <div className={styles['side-bar-header']}>
                <img src={nebula_white}/>
            </div>
            <div className={styles['side-bar-content']}>
                <div className={styles['side-bar-group']}>
                    <div className={styles['side-bar-menu-wrapper']}>
                        <div className={styles['side-bar-menu-item']}>
                            <img src={inbox}/>
                            <p>My Inbox</p>
                        </div>
                    </div>
                </div>
                <div className={styles['side-bar-group']}>
                    <p className={styles['side-bar-menu-item']}>GENERAL</p>
                    <div className={styles['side-bar-menu-wrapper']}>
                        <div className={styles['side-bar-menu-item']}>
                            <img src={dashboard}/>
                            <p>Dashboard</p>
                        </div>
                        <div className={styles['side-bar-menu-item']}>
                            <img src={messages}/>
                            <p>Messages</p>
                        </div>
                        <div className={styles['side-bar-menu-item']}>
                            <img src={finances}/>
                            <p>Billing & Contract</p>
                        </div>
                        <div className={styles['side-bar-menu-item']}>
                            <img src={files}/>
                            <p>Files & Attachment</p>
                        </div>
                        <div className={styles['side-bar-menu-item']}>
                            <img src={issue}/>
                            <p>Issue</p>
                        </div>
                        <div className={styles['side-bar-menu-item']}>
                            <img src={setting}/>
                            <p>Workspace Setting</p>
                        </div>
                    </div>
                </div>
                <div className={styles['side-bar-group']}>
                    <p className={styles['side-bar-menu-item']}>CHANNELS</p>
                    <div className={styles['side-bar-menu-wrapper']}>
                        <div className={styles['side-bar-menu-item']}>
                            <img src={hashtag}/>
                            <p>Dashboard</p>
                        </div>
                        <div className={styles['side-bar-menu-item']}>
                            <img src={hashtag}/>
                            <p>Messages</p>
                        </div>
                    </div>
                </div>
                <div className={styles['side-bar-group']}>
                    <p className={styles['side-bar-menu-item']}>INTEGRATIONS</p>
                    <div className={styles['side-bar-menu-wrapper']}>
                        <div className={styles['side-bar-menu-item']}>
                            <img src={slack}/>
                            <p>Slack</p>
                        </div>
                        <div className={styles['side-bar-menu-item']}>
                            <img src={vscode}/>
                            <p>VS Code</p>
                        </div>
                        <div className={styles['side-bar-menu-item']}>
                            <img src={github}/>
                            <p>Github</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
const FinanceProto = () => {
    return (
        <div className={styles['dashboard-wrapper']}>
        <div className={styles['side-bar-static-wrapper']}>
                <SideBarProto/>
            </div>
            <div className={styles['dashboard-content-wrapper']}>
                <div className={styles['dashboard-content-nav-wrapper']}>
                    <div className={styles['workspace-wrapper']}>
                        <div className={styles['workspace-icon']}>SG</div>
                        <p className={styles['workspace-name']}>Salesforce Global inc.</p>
                    </div>
                </div>
                <div className={styles['finance-board-wrapper']}>
                    <div className={styles['page-main-content-nav-wrapper']}>
                        <div className={styles['page-main-content-nav-item-flex']}>
                            <div className={styles['page-main-content-nav-capsule']}>
                                <div className={styles['page-main-content-nav-pill']}>
                                    <p>Workspace projects</p>
                                    <img src={downarrow}/>
                                </div>
                                <div className={styles['page-main-content-nav-pill']}>
                                    <img src={cube}/>
                                    <p>SalesForce Inc.</p>
                                    <img src={downarrow}/>
                                    {/*<img src={fav}/>*/}
                                </div>
                                <div
                                    style={{
                                        marginLeft: 10
                                    }}
                                    className={styles['page-main-content-nav-pill']}>
                                    <img src={alert}/>
                                    <p>Raise An Issue</p>
                                </div>
                            </div>
                        </div>
                        <div className={styles['page-main-content-nav-item-flex']}>
                            <div className={styles['page-main-content-nav-pill']}>
                                <img src={kairo}/>
                                <p>Ask Kairo</p>
                            </div>
                        </div>
                    </div>
                    <div className={styles['page-content-wrapper']}>
                        <div className={styles['page-content-flex-item']}>
                            <div className={styles['pcfl-header']}>
                                <div className={styles['pcfl-header-text-wrapper']}>
                                    <p>Billing & Finances</p>
                                    <p>All Your Earnings, Contracts & Invoices — Right Where the Work Lives</p>
                                </div>
                                <div className={styles['pcfl-toggle-wrapper']}>
                                    <p>Invoice Management</p>
                                    <p>Transaction Summary</p>
                                    <p>Contracts Management</p>

                                </div>
                            </div>
                            <div className={styles['pcfl-content']}>
                                <div className={styles['pcfl-content-flex-item']}>
                                    <img src={invoice_icon}/>
                                    <p className={styles['invoice-flex-item-value']}>$12,500 <span>+5%</span></p>
                                    <p className={styles['invoice-static']}>Total Invoice Value</p>
                                </div>
                                <div className={styles['pcfl-content-flex-item']}>
                                    <img src={pending}/>
                                    <p className={styles['invoice-flex-item-value']}>$2290 <span>+5%</span></p>
                                    <p className={styles['invoice-static']}>Pending Invoice Value</p>
                                </div>
                                <div className={styles['pcfl-content-flex-item']}>
                                    <img src={warning}/>
                                    <p className={styles['invoice-flex-item-value']}>$110</p>
                                    <p className={styles['invoice-static']}>Overdue Invoices</p>
                                </div>
                                <div className={styles['pcfl-content-flex-item']}>
                                    <img src={invoice_warning}/>
                                    <p className={styles['invoice-flex-item-value']}>$2400</p>
                                    <p className={styles['invoice-static']}>Total Overdue Value</p>
                                </div>
                            </div>
                            <div className={styles['invoice-wrapper']}>
                                <div className={styles['invoice-header-wrapper']}>
                                    <div className={styles['invoice-header-flex-item']}>
                                        <div className={styles['pill-wrapper']}>
                                            <p>Project Invoices</p>
                                            <span>23</span>
                                        </div>
                                    </div>
                                    <div className={styles['invoice-header-flex-item']}>

                                    </div>
                                </div>
                                <div className={styles['invoice-list-wrapper']}>
                                    <div className={styles['invoice']}>
                                        <div className={styles['invoice-item-header-wrapper']}>
                                            <div className={styles['invoice-item-header']}>
                                                <p>Invoice #92KL2K0-23AB8OS
                                                    <div className={styles['invoice-item-header-span']}>
                                                        <img src={pennding_yellow}/>
                                                        <p>Pending</p>
                                                    </div>
                                                </p>
                                                <p>Great news! Phase 3 has been completed on time. Please process your
                                                    invoice payment to allow us to kick off the subsequent phase of the
                                                    project.</p>
                                            </div>

                                        </div>
                                        <div className={styles['invoice-config-wrapper']}>
                                            <div className={styles['config-pill-wrapper']}>
                                                <img src={gmail}/>
                                                <p>Email has been delivered to samy james</p>
                                            </div>
                                        </div>
                                        <div className={styles['invoice-item-footer-wrapper']}>
                                            <div className={styles['iifw-capsule']}>
                                                <p>Issued on</p>
                                                <div><img src={calendar}/><p>March 12, 2025</p></div>
                                            </div>
                                            <div className={styles['iifw-capsule']}>
                                                <p>Due Date</p>
                                                <div><img src={calendar}/><p>March 17, 2025</p></div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                        <div className={styles['page-content-flex-item']}>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FinanceProto;
