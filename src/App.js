import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from "./components/script/AuthContext";
import ProtectedRoute from "./components/script/ProtectedRoute";
import Dashboard from "./views/Dashboard/Dashboard";
import OnboardMembers from "./views/Onboard/OnboardMembers";
import Login from "./views/Authentication/Login";
import HomePage from "./views/web-stack/HomePage";
import Pricing from "./views/web-stack/Pricing";
import TaskOverview from "./views/Tasks/TaskOverview";
import ProjectLayout from "./components/ui/ProjectLayout";
import IssueOverview from "./components/ui/IssueOverview";
import Messages from "./components/ui/Messages"
import CollaborationSpace from "./components/ui/CollaborationSpace";
import CalendarScheduling from "./components/ui/CalendarScheduling";
import DashboardOverview from "./components/ui/DashboardOverview";
import InboxOverview from "./components/ui/InboxOverview";
import ProjectUpdates from "./components/ui/ProjectUpdates";
import ProjectMilestones from "./components/ui/ProjectMilestones";
import TasksOverview from "./components/ui/TasksOverview";


function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path='/' element={<HomePage/>}/>
                    <Route path="/app" element={<ProtectedRoute element={<Dashboard />} />} />
                    <Route path="/app/project/:projectId/issues/overview" element={<ProtectedRoute element={<ProjectLayout><IssueOverview/></ProjectLayout>}/>} />
                    {/*<Route*/}
                    {/*    path="/app/project/:projectId/tasks/overview"*/}
                    {/*    element={<ProtectedRoute element={<TaskOverview />} />}*/}
                    {/*/>*/}

                    <Route
                        path="/app/project/:projectId/tasks/overview"
                        element={<ProtectedRoute element={<ProjectLayout><TasksOverview/></ProjectLayout>} />}
                    />

                    <Route path="/pricing" element={<Pricing/>} />
                    <Route path="/onboard/invite-members" element={<ProtectedRoute element={<OnboardMembers />} />} />
                    <Route path="/login" element={<Login />} />

                    <Route path="/app/project/:projectId/collaborate/" element={<ProtectedRoute element={<ProjectLayout><CollaborationSpace/></ProjectLayout>}/>} />

                    <Route path="/app/project/:projectId/calendar-schedule" element={<ProtectedRoute element={<ProjectLayout><CalendarScheduling/></ProjectLayout>}/>} />
                    <Route path="/app/project/:projectId/overview" element={<ProtectedRoute element={<ProjectLayout><DashboardOverview/></ProjectLayout>}/>} />
                    <Route path="/app/project/:projectId/inbox" element={<ProtectedRoute element={<ProjectLayout><InboxOverview/></ProjectLayout>}/>} />
                    <Route path="/app/project/:projectId/updates" element={<ProtectedRoute element={<ProjectLayout><ProjectUpdates/></ProjectLayout>}/>} />
                    <Route path="/app/project/:projectId/milestones" element={<ProtectedRoute element={<ProjectLayout><ProjectMilestones/></ProjectLayout>}/>} />



                    <Route
                        path="/app/project/:projectId/messages"
                        element={
                            <ProtectedRoute
                                element={
                                    <ProjectLayout
                                        headerTitle="Messages"
                                        subtitle=""
                                    >
                                        <Messages />
                                    </ProjectLayout>
                                }
                            />
                        }
                    />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;