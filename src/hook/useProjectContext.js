// src/hooks/useProjectContext.js
import { useEffect, useState, useRef } from "react";
import { useParams, useLocation, useSearchParams, useNavigate } from "react-router-dom";
import { getProjectById } from "../service/Project/ProjectFetcher";
import { fetchWorkspaceById } from "../service/Workspace/workspaceFetcher";
import { getUserById } from "../service/User/UserFetcher";

const useProjectContext = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();

    const [project, setProject] = useState(null);
    const [workspaceData, setWorkspaceData] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isKairoVisible, setKairoVisible] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [isAppCenterVisible, setIsAppCenterVisible] = useState(false);



    const navbarRef = useRef(null);
    const summaryRef = useRef(null);
    const contentRef = useRef(null);
    const [contentHeight, setContentHeight] = useState("auto");

    const userId = localStorage.getItem("nuid");
    const selectedView = searchParams.get("view") || "Kanban";



    // 1. Auto Resize Layout Height
    useEffect(() => {
        const updateHeight = () => {
            const navbarHeight = navbarRef.current?.offsetHeight || 0;
            const summaryHeight = summaryRef.current?.offsetHeight || 0;
            setContentHeight(window.innerHeight - navbarHeight - summaryHeight);
        };
        updateHeight();
        window.addEventListener("resize", updateHeight);
        return () => window.removeEventListener("resize", updateHeight);
    }, []);

    // 2. Fetch Project
    useEffect(() => {
        const fetchProject = async () => {
            try {
                const data = await getProjectById(projectId);
                setProject(data);
            } catch (err) {
                console.error("❌ Error loading project:", err);
            }
        };
        if (projectId) fetchProject();
    }, []);

    // 3. Fetch Workspace after Project
    useEffect(() => {
        const getWorkspace = async () => {
            if (!project?.workspaceId) return;
            try {
                setLoading(true);
                const data = await fetchWorkspaceById(project?.workspaceId);
                setWorkspaceData(data);
            } catch (err) {
                console.error("❌ Error loading workspace:", err);
            } finally {
                setLoading(false);
            }
        };
        getWorkspace();
    }, [project]);

    // 4. Show AppCenter modal logic
    useEffect(() => {
        const appCenterValue = new URLSearchParams(location.search).get("appCenter");
        setIsAppCenterVisible(appCenterValue === "true");
    }, [location.search]);

    // 5. Fetch User Securely
    useEffect(() => {
        let isCancelled = false;

        const fetchUser = async () => {
            if (!userId || userId.length < 5) {
                localStorage.removeItem("nuid");
                setUser(null);
                return navigate("/login");
            }

            try {
                const userData = await getUserById(userId); // ✅ use secure, centralized fetcher
                if (!isCancelled) {
                    setUser(userData);
                }
            } catch (err) {
                console.error("❌ Error fetching user:", err);
                if (!isCancelled) {
                    setUser(null);
                    localStorage.removeItem("nuid");
                    navigate("/login");
                }
            }
        };

        fetchUser();
        return () => {
            isCancelled = true;
        };
    }, [userId]);

    return {
        project,
        workspaceData,
        user,
        loading,
        contentHeight,
        navbarRef,
        summaryRef,
        contentRef,
        searchQuery:  "",
        selectedView,
        setSearchParams,
        setSelectedTask,
        selectedTask,
        isKairoVisible,
        setKairoVisible,
        isAppCenterVisible,
    };
};

export default useProjectContext;