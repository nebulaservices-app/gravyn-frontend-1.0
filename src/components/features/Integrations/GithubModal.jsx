import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import axios from "axios";
import useProjectContext from "../../../hook/useProjectContext";
import styles from "./GithubModal.module.css";

// --- Import your images here ---
import close from "../../../images/icons/close.svg";
import github from "../../../images/int_icon/github.svg";
import lock from "../../../images/icons/lock1.svg";
import branch_i from "../../../images/icons/branch.svg";
import nebula from "../../../images/icons/gravyn.svg";
import search from "../../../images/icons/search.svg";
import dropdown from "../../../images/icons/dropdown.svg";
import tickGreen from "../../../images/icons/tick_green.svg";
import github_issues from "../../../images/icons/github_issues.svg"
import pr from "../../../images/icons/pr.svg"
import commit from "../../../images/icons/commit.svg"


// --- FloatingBubbles: beautiful ambient animation (no changes needed) ---
const FloatingBubbles = () => {
    // ... (your existing FloatingBubbles code)
    const [bubbles, setBubbles] = useState([]);
    useEffect(() => {
        const newBubbles = Array.from({ length: 20 }).map((_, i) => ({ id: i, size: Math.random() * 6.5 + 2.5, xStart: Math.random() * 10 + 10, yStart: (Math.random() * 2 - 1) * 175, duration: Math.random() * 3, delay: Math.random() * 2.5 }));
        setBubbles(newBubbles);
    }, []);
    return (
        <div className={styles['floater-wrapper']} style={{ position: "relative", zIndex: 1 }}>
            <div className={styles['floater-icon-wrapper']}><img src={github} alt="github"/></div>
            {bubbles.map(bubble => (<motion.div key={bubble.id} initial={{ opacity: 0.5, x: `${bubble.xStart}%`, y: `${bubble.yStart}%` }} animate={{ opacity: 1, x: `150px`, y: `${bubble.yStart + Math.random() * 10}%` }} transition={{ duration: bubble.duration, repeat: Infinity, repeatType: "loop", animationTimingFunction: "ease-in-out", delay: bubble.delay }} style={{ width: `${bubble.size}px`, height: `${bubble.size}px`, background: `rgba(3, 108, 254, ${Math.random() * 0.9 + 0.1})`, borderRadius: "50%", position: "absolute" }} />))}
            <div className={styles['floater-icon-wrapper']}><img src={nebula} alt="nebula"/></div>
        </div>
    );
};

// --- Repo & Branch Selection Flow (no changes needed) ---
const SelectGithubRepoComponent = ({ integrationId, handleClose, onLinkSuccess }) => {
    const [repos, setRepos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [showAll, setShowAll] = useState(false);
    const { user } = useProjectContext();
    const [selectedRepo, setSelectedRepo] = useState(null);
    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);
    const dropdownAnchorRef = useRef(null);

    useEffect(() => {
        if (!integrationId) return;
        const fetchRepos = async () => {
            setLoading(true);
            try {
                const response = await axios.get("http://localhost:5001/api/v1/github/repos", { params: { integrationId } });
                setRepos(response.data.repositories || []);
            } catch (err) {
                setError("Failed to load repositories.");
            } finally {
                setLoading(false);
            }
        };
        fetchRepos();
    }, [integrationId]);

    useEffect(() => {
        if (!selectedRepo) return;
        const fetchBranches = async () => {
            try {
                const response = await axios.get("http://localhost:5001/api/v1/github/branches", { params: { integrationId, repoFullName: selectedRepo.fullName } });
                setBranches(response.data.branches || []);
            } catch (err) {
                setError("Failed to load branches.");
            }
        };
        fetchBranches();
    }, [selectedRepo, integrationId]);

    const handleRepoSelect = (repo) => {
        setSelectedRepo(repo);
        setSelectedBranch(repo.default_branch);
    };

    const handleBranchSelect = (branchName) => {
        setSelectedBranch(branchName);
        setIsBranchDropdownOpen(false);
    };

    const handleConfirmAndContinue = async () => {
        if (!selectedRepo || !selectedBranch) {
            setError("A repository and branch must be selected.");
            return;
        }

        // ✅ THE FIX: Pass the entire `selectedRepo` object.
        // Instead of manually building a new `repo` object (and forgetting the id),
        // we now pass the whole object we received from the GitHub API. This ensures
        // the crucial `id` field is always included in the payload.
        const payload = {
            inid: integrationId,
            inkey: `github:repo`,
            payload: {
                repo: selectedRepo,
                branches: [{ name: selectedBranch, createdBy: user?.email, status: "active", linkedTask: null, collaborators: [user?.email] }],
                installation: { installedBy: user?.email, installedAt: new Date().toISOString() }
            },
            userId: user?._id,
            status: "linked"
        };
        try {
            await axios.post("http://localhost:5001/api/v1/github/link-repo", payload, { params: { integrationId } });
            onLinkSuccess();
        } catch (err) {
            setError("Failed to link the repository.");
        }
    };

    const handleBackToRepoList = () => {
        setSelectedRepo(null);
        setSelectedBranch(null);
        setBranches([]);
    };

    const filteredRepos = repos.filter((repo) => repo.fullName.toLowerCase().includes(searchTerm.toLowerCase()));

    if (loading) return <p>Loading repositories...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className={styles['repo-selection-modal']}>
            <div className={styles['selected-integration-action-wrapper']}><img className={styles['close-btn']} src={close} onClick={handleClose} alt="Close"/></div>
            <div className={styles['step-1-details']}><FloatingBubbles/><div className={styles['step-1-text']}><p>Set Up GitHub Collaboration</p><p>{!selectedRepo ? "Link a repository to enable code collaboration and tracking." : `You're ready to link ${selectedRepo.fullName}.`}</p></div></div>
            {!selectedRepo ? (
                <>
                    <div className={styles['search-repo-wrapper']}><img src={search} alt="Search"/><input type="text" placeholder="Search repository..." className={styles["repo-search-input"]} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/></div>
                    <div className={styles['repo-wrapper']}>
                        {(showAll ? filteredRepos : filteredRepos.slice(0, 4)).map((repo) => (
                            <div className={styles['repo-item']} key={repo.id} onClick={() => handleRepoSelect(repo)}>
                                <div className={styles['repo-item-i']}><img src={github} alt="GitHub"/><p>{repo.fullName}</p></div>
                                <div className={styles['repo-item-i']}>{repo.private && <img src={lock} alt="Private"/>}</div>
                            </div>
                        ))}
                        {!showAll && filteredRepos.length > 4 && (<div className={styles['more-repos-info']} onClick={() => setShowAll(true)}><p style={{cursor: 'pointer'}}>+{filteredRepos.length - 4} more</p></div>)}
                    </div>
                </>
            ) : (
                <div className={styles['confirmation-view']}>
                    <div className={styles['selected-repo-display']}><img src={github} alt="Repo"/><p>{selectedRepo.fullName}</p></div>
                    <div className={styles['branch-selector-wrapper']}>
                        <label>Selected Branch</label>
                        <div className={styles['branch-selector-box']} onClick={() => setIsBranchDropdownOpen(true)} ref={dropdownAnchorRef}>
                            <img src={branch_i} alt="Branch"/><p>{selectedBranch || 'Select a branch...'}</p><img src={dropdown} alt="Dropdown"/>
                        </div>
                    </div>
                    <div className={styles['confirmation-actions']}>
                        <button onClick={handleBackToRepoList} className={styles['back-button']}>Back</button>
                        <button onClick={handleConfirmAndContinue} className={styles['confirm-button']}>Confirm and Link Repo</button>
                    </div>
                    <DropdownBoxWrapper open={isBranchDropdownOpen} onClose={() => setIsBranchDropdownOpen(false)} anchorRef={dropdownAnchorRef} className={styles['branch-dropdown-box']}>
                        {branches.map((branch) => (<div key={branch.name} className={styles['branch-dropdown-item']} onClick={() => handleBranchSelect(branch.name)}>{branch.name}{branch.name === selectedBranch && <div className={styles['checkmark']}>✓</div>}</div>))}
                    </DropdownBoxWrapper>
                </div>
            )}
        </div>
    );
};


// --- CORRECTED DropdownBoxWrapper ---
// This version uses `position: fixed` and updates on scroll for maximum reliability.
const DropdownBoxWrapper = ({ open, onClose, anchorRef, children, className, style }) => {
    const dropdownRef = useRef(null);
    const [boxStyles, setBoxStyles] = useState({ visibility: "hidden" });

    const updatePosition = useCallback(() => {
        if (!open || !anchorRef.current || !dropdownRef.current) return;
        const anchorRect = anchorRef.current.getBoundingClientRect();
        const dropdown = dropdownRef.current;
        const GAP = 7;
        let top = anchorRect.bottom + GAP;
        let left = anchorRect.left;
        const ddRect = dropdown.getBoundingClientRect();
        if (top + ddRect.height > window.innerHeight) top = anchorRect.top - ddRect.height - GAP;
        if (left + ddRect.width > window.innerWidth) left = window.innerWidth - ddRect.width - 8;
        top = Math.max(top, 8);
        left = Math.max(left, 8);
        setBoxStyles({ position: "fixed", top: `${top}px`, left: `${left}px`, minWidth: `${anchorRect.width}px`, zIndex: 9999, ...style });
    }, [open, anchorRef, style]);

    useEffect(() => {
        if (!open) return;
        updatePosition();
        function handleMouseDown(event) { if (dropdownRef.current && !dropdownRef.current.contains(event.target) && anchorRef.current && !anchorRef.current.contains(event.target)) onClose?.(); }
        function handleKeyDown(event) { if (event.key === "Escape") onClose?.(); }
        document.addEventListener("mousedown", handleMouseDown);
        document.addEventListener("keydown", handleKeyDown);
        window.addEventListener('scroll', updatePosition, true);
        return () => {
            document.removeEventListener("mousedown", handleMouseDown);
            document.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener('scroll', updatePosition, true);
        };
    }, [open, onClose, anchorRef, updatePosition]);

    if (!open) return null;
    return createPortal(<div ref={dropdownRef} className={className} style={boxStyles} tabIndex={-1}>{children}</div>, document.body);
};

// --- REFACTORED GithubContextModal (Dumb Component) ---
// This component now receives all its state and logic as props.
// --- Formatted GithubContextModal ("Dumb" Component) ---
const GithubContextModal = ({
                                activeRepo,
                                handleClose,
                                onDataChange,
                                // Props for branch switcher
                                showBranchModal,
                                handleToggleBranchSwitcher,
                                fetchedBranches,
                                isFetchingBranches,
                                branchFetchError,
                                // Props for creating a new branch
                                branchNameInput,
                                setBranchNameInput,
                                isCreatingBranch,
                                setIsCreatingBranch,
                                apiIsLoading,
                                setApiIsLoading,
                                apiError,
                                setApiError,
                            }) => {
    const dropdownAnchorRef = useRef(null);
    if (!activeRepo) {
        return null;
    }

    const payload = activeRepo.payload || {};
    const repo = payload.repo || {};

    const handleCloseBranchModal = () => {
        handleToggleBranchSwitcher(false);
        setIsCreatingBranch(false);
        setBranchNameInput("");
        setApiError("");
    };

    const handleSelectBranch = async (selectedBranchName) => {
        // TODO: Add logic to update the default branch in your DB
        console.log("Branch selected:", selectedBranchName);
        handleCloseBranchModal();
    };

    const handleCreateBranch = async () => {
        if (!branchNameInput.trim()) {
            setApiError("Branch name cannot be empty.");
            return;
        }
        setApiIsLoading(true);
        setApiError("");
        try {
            const createPayload = {
                repoFullName: repo.fullName,
                newBranchName: branchNameInput.trim(),
                sourceBranchName: repo.default_branch,
            };
            await axios.post(
                "http://localhost:5001/api/v1/github/create-branch",
                createPayload,
                { params: { integrationId: activeRepo.inid } }
            );
            handleCloseBranchModal();
            onDataChange?.(); // Refresh data in the parent component
        } catch (err) {
            setApiError(err.response?.data?.message || "Could not create the branch.");
        } finally {
            setApiIsLoading(false);
        }
    };

    return (
        <div className={styles['selected-integration-content']}>
            <DropdownBoxWrapper
                open={showBranchModal}
                onClose={handleCloseBranchModal}
                anchorRef={dropdownAnchorRef}
                className={styles['outer-box']}
            >
                <div className={styles['branch-switcher-modal-content']} onMouseDown={(e) => e.stopPropagation()}>
                    <p className={styles['branch-switcher-modal-header']}>Switch branch</p>
                    <div className={styles['branch-list-modal']}>
                        {isFetchingBranches ? (
                            <p>Loading branches...</p>
                        ) : branchFetchError ? (
                            <p className={styles['error-message']}>{branchFetchError}</p>
                        ) : (
                            fetchedBranches.map((branch) => (
                                <div
                                    key={branch.name}
                                    className={`${styles['branch-item-modal']} ${branch.name === repo.default_branch ? styles['selected-branch'] : ""}`}
                                    onClick={() => handleSelectBranch(branch.name)}
                                >
                                    <p>{branch.name}</p>
                                    {branch.name === repo.default_branch && <img src={tickGreen} className={styles['checkmark']}/>}
                                </div>
                            ))
                        )}


                        {isCreatingBranch ? (
                            <div className={styles['create-branch-section']}>
                                <input
                                    value={branchNameInput}
                                    onChange={(e) => setBranchNameInput(e.target.value)}
                                    placeholder="new-feature-branch"
                                    className={styles['branch-name-input']}
                                    disabled={apiIsLoading}
                                />
                                <button onClick={handleCreateBranch} disabled={apiIsLoading}>
                                    {apiIsLoading ? "Creating..." : "Create"}
                                </button>
                                <button onClick={() => setIsCreatingBranch(false)} disabled={apiIsLoading}>
                                    Cancel
                                </button>
                                {apiError && <p className={styles['error-message']}>{apiError}</p>}
                            </div>
                        ) : (
                            <button onClick={() => setIsCreatingBranch(true)} className={styles['create-branch-button']}>
                                + Create New Branch
                            </button>
                        )}
                    </div>

                </div>
            </DropdownBoxWrapper>

            <div className={styles['repo-details-header']}>
                <div className={styles['repo-details-header-i']}>
                    <img src={github} alt="GitHub" />
                    <div className={styles['repo-pill']}>
                        <p className={styles['repo-fullName']}>{repo.fullName || <span>—</span>}</p>
                        <div className={styles['repo-private']}>
                            {repo.private && <img src={lock} alt="Private" title="Private repo" style={{ width: 16 }} />}
                        </div>
                    </div>
                    <div
                        className={styles['repo-active-branch']}
                        onClick={() => handleToggleBranchSwitcher(true)}
                        style={{ cursor: 'pointer' }}
                        ref={dropdownAnchorRef}
                    >
                        <img src={branch_i} alt="Branch" />
                        <p>{repo.default_branch || <span>—</span>}</p>
                        <img src={dropdown} alt="Dropdown" />
                    </div>
                </div>
                <div className={styles['repo-details-header-i']}>
                    <div onClick={handleClose} className={styles['selected-integration-action-wrapper']}>
                        <img className={styles['close-btn']} src={close} alt="Close" />
                    </div>
                </div>
            </div>

            <div className={styles['repo-details-content']}>
                <div className={styles['repo-details-i']}>
                    <div className={styles['repo-details-content-header']}>
                        <div
                            className={`${styles['repo-details-content-header-i']} ${styles['repo-details-header-menu-wrapper']}`}>
                            <div className={styles['repo-detail-menu-item']}>
                                <img src={github_issues}/>
                                <p>Github Issues</p>
                            </div>
                            <div className={styles['repo-detail-menu-item']}>
                                <img src={pr}/>
                                <p>Pull Requests</p>
                            </div>
                            <div className={styles['repo-detail-menu-item']}>
                                <img src={commit}/>
                                <p>Commits</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={`${styles['repo-details-i']} ${styles['repo-details-last-i']}`}>

                </div>
            </div>
        </div>
    );
};


// --- REFACTORED GithubModal (Smart Parent) ---
// This component now holds all the state and passes it down.
const GithubModal = ({ integrationRecord, handleClose }) => {
    const { user } = useProjectContext();
    const [needsRepoSelection, setNeedsRepoSelection] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeRepo, setActiveRepo] = useState(null);
    const [showBranchModal, setShowBranchModal] = useState(false);
    const [branchNameInput, setBranchNameInput] = useState("");
    const [isCreatingBranch, setIsCreatingBranch] = useState(false);
    const [apiIsLoading, setApiIsLoading] = useState(false);
    const [apiError, setApiError] = useState("");

    // ✅ NEW STATE: For fetching live branches for the switcher
    const [fetchedBranches, setFetchedBranches] = useState([]);
    const [isFetchingBranches, setIsFetchingBranches] = useState(false);
    const [branchFetchError, setBranchFetchError] = useState("");

    const fetchConnectedRepo = useCallback(async () => {
        if (!integrationRecord?._id || !user?._id) return;
        setLoading(true);
        try {
            const res = await axios.get("http://localhost:5001/api/v1/github/integration-entity", { params: { inkey: "github:repo", inid: integrationRecord._id, userId: user._id } });
            const repoEntity = res.data.entity || (Array.isArray(res.data.repos) && res.data.repos[0]);
            if (repoEntity) { setActiveRepo(repoEntity); setNeedsRepoSelection(false); } else { setActiveRepo(null); setNeedsRepoSelection(true); }
        } catch (err) {
            setActiveRepo(null); setNeedsRepoSelection(true);
            if (!err.response || err.response.status !== 404) console.error("Error checking repo entity:", err);
        } finally { setLoading(false); }
    }, [integrationRecord, user]);

    useEffect(() => { fetchConnectedRepo(); }, [fetchConnectedRepo]);

    // ✅ NEW FUNCTION: Fetches the live branch list from the API
    const fetchLiveBranches = async () => {
        if (!activeRepo?.payload?.repo?.fullName) return;
        setIsFetchingBranches(true);
        setBranchFetchError("");
        try {
            const response = await axios.get("http://localhost:5001/api/v1/github/branches", { params: { integrationId: activeRepo.inid, repoFullName: activeRepo.payload.repo.fullName } });
            setFetchedBranches(response.data.branches || []);
        } catch (err) {
            setBranchFetchError("Could not load branches.");
        } finally {
            setIsFetchingBranches(false);
        }
    };

    // ✅ NEW FUNCTION: Controls the branch switcher modal visibility and triggers the fetch
    const handleToggleBranchSwitcher = (show) => {
        setShowBranchModal(show);
        if (show) {
            fetchLiveBranches();
        }
    };

    if (loading) return <div className={styles['loading']}>Loading…</div>;

    return (
        <div className={styles['integrated-modal']}>
            {needsRepoSelection ? (
                <SelectGithubRepoComponent integrationId={integrationRecord._id} handleClose={handleClose} onLinkSuccess={fetchConnectedRepo} />
            ) : (
                <GithubContextModal
                    activeRepo={activeRepo}
                    handleClose={handleClose}
                    onDataChange={fetchConnectedRepo}
                    // Pass down all the new state and handlers
                    showBranchModal={showBranchModal}
                    handleToggleBranchSwitcher={handleToggleBranchSwitcher}
                    fetchedBranches={fetchedBranches}
                    isFetchingBranches={isFetchingBranches}
                    branchFetchError={branchFetchError}
                    // Pass down the state for creating branches
                    branchNameInput={branchNameInput} setBranchNameInput={setBranchNameInput}
                    isCreatingBranch={isCreatingBranch} setIsCreatingBranch={setIsCreatingBranch}
                    apiIsLoading={apiIsLoading} setApiIsLoading={setApiIsLoading}
                    apiError={apiError} setApiError={setApiError}
                />
            )}
        </div>
    );
};

export default GithubModal;
