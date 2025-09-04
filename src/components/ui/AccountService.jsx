import React, { useState, useEffect, useRef, useCallback } from "react";
import styles from "./Account.module.css";
import axios from "axios";
import verified from "../../images/icons/verified-tick.svg";
import profile from "../../images/icons/profile.svg";
import setting from "../../images/icons/acounts.svg";
import billing from "../../images/icons/billing.svg";
import workspace from "../../images/icons/workspace.svg";
import notification from "../../images/icons/notification.svg";
import tick from "../../images/icons/tick.svg";
import close from "../../images/icons/close.svg";
import useProjectContext from "../../hook/useProjectContext";


// Debounce function to delay API calls
const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
};

// ModalChildren Component
const ModalChildren = ({ menu = ["Profile", "Account", "Billing", "Workspace", "Notification"], user, fetchUser, tickVisible, setTickVisible }) => {
    // State to track the active menu item, default to the first item
    const [activeMenu, setActiveMenu] = useState(menu[0]);

    // State to manage form data, initialized with user data
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        location: user?.location || '',
    });

    // State for loading, success, and error messages
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);

    // Sync formData with user prop whenever user changes
    useEffect(() => {
        setFormData({
            name: user?.name || '',
            email: user?.email || '',
            location: user?.location || '',
        });
    }, [user]);

    // Clear success/error messages after 3 seconds
    useEffect(() => {
        if (success || error) {
            const timer = setTimeout(() => {
                setSuccess(null);
                setError(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [success, error]);

    const menuIcons = {
        Profile: profile,
        Account: setting,
        Billing: billing,
        Workspace: workspace,
        Notification: notification,
    };

    // Function to update the backend with only the changed field
    const updateProfileField = async (field, value) => {
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await axios.put(
                'http://localhost:4000/fetchData/users/update-user-field',
                {
                    userId: user?._id,
                    [field]: value,
                    databaseName: 'Lexxov_Shell',
                    collectionName: 'Users',
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                    timeout: 5000,
                }
            );

            console.log("Response.data ", response.data);
            if (response.data.success) {
                // Show tick for the updated field
                setTickVisible((prev) => ({
                    ...prev,
                    [field]: true,
                }));

                // Hide tick after 2 seconds
                setTimeout(async () => {
                    setTickVisible((prev) => ({
                        ...prev,
                        [field]: false,
                    }));
                    await fetchUser(); // Refresh user data after successful update

                }, 2000);

                setSuccess(`${field} updated successfully!`);

                console.log(`${field} updated successfully!`);


            } else {
                throw new Error(response.data.message || `Failed to update ${field}`);
            }
        } catch (err) {
            console.error(`Error updating ${field}:`, err);
            setError(err.message || `Failed to update ${field}`);
            // Revert the field to the original value on failure
            setFormData((prev) => ({
                ...prev,
                [field]: user?.[field] || '',
            }));
        } finally {
            setLoading(false);
        }
    };

    // Debounced version of the updateProfileField function (2-second delay)
    const debouncedUpdateProfileField = useCallback(debounce(updateProfileField, 2000), [user, fetchUser]);

    // Handle input changes with validation
    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Basic validation
        if (name === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            setError('Please enter a valid email address');
            return;
        }
        if (name === 'name' && !value.trim()) {
            setError('Full Name cannot be empty');
            return;
        }

        setError(null);
        setFormData((prev) => {
            const updatedData = { ...prev, [name]: value };
            // Trigger the debounced API call with the changed field
            if (value !== user?.[name]) {
                debouncedUpdateProfileField(name, value);
            }
            return updatedData;
        });
    };

    // Define content for each menu item
    const renderContent = () => {
        switch (activeMenu) {
            case 'Profile':
                return (
                    <div className={styles['profile-form']}>
                        <div className={styles['form-group']}>
                            <label htmlFor="fullName">Full Name</label>
                            <div className={styles['input-group-wrapper']}>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Enter your Full name"
                                    disabled={loading}
                                    className={`${styles['input-group-wrapper']} ${tickVisible.fullName ? styles['active'] : ''}`}                                />
                                {tickVisible.name && (
                                    <img
                                        src={tick}
                                        alt="Success Tick"
                                        className={styles['success-tick']}
                                    />)}
                            </div>
                        </div>
                        <div className={styles['form-group']}>
                            <label htmlFor="email">Email Address</label>
                            <div className={styles['input-group-wrapper']}>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="Enter your Email Address"
                                    disabled={loading}
                                />
                                {tickVisible.email && (
                                    <img
                                        src={tick}
                                        alt="Success Tick"
                                        className={styles['success-tick']}
                                    />
                                )}
                            </div>
                        </div>
                        <div className={styles['form-group']}>
                            <label htmlFor="location">Your Location</label>
                            <div className={styles['input-group-wrapper']}>
                                <input
                                    type="text"
                                    id="location"
                                    name="location"
                                    value={`${formData.location.address.street } ,  ${formData.location.address.city} , ${formData.location.address.country}`}
                                    onChange={handleInputChange}
                                    placeholder="Enter your location"
                                    disabled={loading}
                                />
                                {tickVisible.location && (
                                    <img
                                        src={tick}
                                        alt="Success Tick"
                                        className={styles['success-tick']}
                                    />
                                )}
                            </div>
                            <p className={styles['note']}>
                                Providing an accurate location ensures we can charge you fairly based on your region, as pricing and taxes
                                may vary depending on where you are.
                            </p>
                        </div>
                        {loading && <p className={styles['loading-message']}>Saving...</p>}
                        {success && <p className={styles['success-message']}>{success}</p>}
                        {error && <p className={styles['error-message']}>{error}</p>}
                    </div>
                );
            case 'Account':
                return <div>Account Settings: Manage your account details here.</div>;
            case 'Billing':
                return <div>Billing Information: View and update your billing details.</div>;
            case 'Workspace':
                return <div>Workspace Settings: Configure your workspace preferences.</div>;
            case 'Notification':
                return <div>Notification Preferences: Manage your notification settings.</div>;
            default:
                return <div>Select a menu item to view content.</div>;
        }
    };

    return (
        <div className={styles['modal-body-children-wrapper']}>
            <div className={styles['modal-body-children-menu-wrapper']}>
                {menu.map((item, index) => (
                    <div
                        key={index}
                        className={`${styles['menu-item']} ${activeMenu === item ? styles['active'] : ''}`}
                        onClick={() => setActiveMenu(item)}
                    >
                        <img
                            src={menuIcons[item]}
                            alt={`${item} icon`}
                            className={styles['menu-icon']}
                        />
                        <p className={styles['menu-label']}>{item}</p>
                    </div>
                ))}
            </div>
            <div className={styles['modal-body-children-content-wrapper']}>
                {renderContent()}
            </div>
        </div>
    );
};

// Account Component
const Account = ({ user }) => {
    const FETCH_API_BASE_URL = "http://localhost:4000/fetchData";
    const API_BASE_URL = "http://localhost:4000/api/users";
    const [userData, setUserData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [tickVisible, setTickVisible] = useState({
        fullName: false,
        email: false,
        location: false,
    });


    const profilePictureRef = useRef(null);
    const fileInputRef = useRef(null);

    const modal = useRef(null)


    // Handle click on profile picture to toggle popup
    const handleProfilePictureClick = () => {
        if (actionLoading) return;
        setShowPopup((prev) => !prev);
    };





    // Close popup when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profilePictureRef.current && !profilePictureRef.current.contains(event.target)) {
                setShowPopup(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Clear success/error messages after 3 seconds
    useEffect(() => {
        if (successMessage || error) {
            const timer = setTimeout(() => {
                setSuccessMessage(null);
                setError(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage, error]);

    // Placeholder functions for other options
    const handleUseAvatars = () => {
        console.log("Use Avatars clicked");
        setShowPopup(false);
    };

    const handleTakePicture = () => {
        console.log("Take Picture clicked");
        setShowPopup(false);
    };


    // Trigger file input click for uploading a picture
    const handleUploadPicture = () => {
        if (actionLoading) return;
        setShowPopup(false);
        setError(null);
        setSuccessMessage(null);
        fileInputRef.current.click();
    };



    // Handle file selection and upload
    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        const validTypes = ["image/jpeg", "image/png", "image/gif"];
        if (!validTypes.includes(file.type)) {
            setError("Please upload a valid image (JPEG, PNG, or GIF)");
            return;
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            setError("File size exceeds 5MB limit");
            return;
        }

        if (actionLoading) return;
        setActionLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const formData = new FormData();
            formData.append("profilePicture", file);
            formData.append("databaseName", "Lexxov_Shell");
            formData.append("collectionName", "Users");

            const response = await axios.post(
                `${FETCH_API_BASE_URL}/users/upload-profile-picture`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                    timeout: 10000,
                }
            );

            if (response.data.status !== "success") {
                throw new Error(response.data.message || "Failed to upload image");
            }



            setUserData((prev) => ({
                ...prev,
                profileImage: response.data.data.profileImage,
            }));
            setSuccessMessage("Profile picture uploaded successfully!");
        } catch (err) {
            console.error("Error uploading image:", err);
            let errorMessage = "Failed to upload image";
            if (err.response) {
                errorMessage = err.response.data.message || errorMessage;
                if (err.response.status === 400) errorMessage = err.response.data.message || "Invalid request.";
                else if (err.response.status === 404) errorMessage = "User not found.";
                else if (err.response.status === 401) errorMessage = "Unauthorized. Please log in again.";
                else if (err.response.status === 500) errorMessage = "Server error. Please try again later.";
            } else if (err.request) {
                errorMessage = "Network error. Please check your connection.";
            }
            setError(errorMessage);
        } finally {
            setActionLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    // Handle loading and error states
    if (loading) {
        return <div className={styles["modal-overlay-wrapper"]}>Loading...</div>;
    }

    if (error && !userData) {
        return (
            <div className={styles["modal-overlay-wrapper"]}>
                <div className={styles["modal-wrapper"]}>
                    <p>Error: {error}</p>
                    <button>Close</button>
                </div>
            </div>
        );
    }

    if (!userData) {
        return (
            <div className={styles["modal-overlay-wrapper"]}>
                <div className={styles["modal-wrapper"]}>
                    <p>No user data found.</p>
                    <button>Close</button>
                </div>
            </div>
        );
    }






    return (
        <div className={styles["modal-overlay-wrapper"]}>
            <div ref={modal} className={styles["modal-wrapper"]}>
                <div className={styles["modal-header-image-wrapper"]}>
                    <img onClick={()=>{}} src={close} className={styles['close-icon']}/>
                    <div className={styles["modal-header-cover-wrapper"]}></div>
                    <div className={styles["modal-header-profile-picture-parent-wrapper"]}>
                        <div ref={profilePictureRef} style={{position: "relative"}}>
                            <img
                                className={styles["modal-header-profile-picture-wrapper"]}
                                src={user?.picture}
                                alt="Profile"
                                onClick={handleProfilePictureClick}
                                style={{cursor: actionLoading ? "not-allowed" : "pointer"}}
                                onError={(e) => {
                                    console.error("Failed to load profile image:", e);
                                    e.target.src = "/default-avatar.png";
                                }}
                            />
                            <img
                                className={styles["verified-tick"]}
                                src={verified}
                                alt="Verified"
                            />
                            {showPopup && (
                                <div className={styles["profile-picture-popup"]}>
                                    <div onClick={handleUseAvatars}>Use Avatars</div>
                                    <div onClick={handleTakePicture}>Take Picture</div>
                                    <div onClick={handleUploadPicture}>
                                        {actionLoading ? "Uploading..." : "Upload Picture"}
                                    </div>
                                    <div>
                                        {actionLoading ? "Deleting..." : "Delete Picture"}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className={styles["modal-body"]}>
                    <div className={styles["user-detail-wrapper"]}>
                        <div className={styles["user-detail-flex-left"]}>
                            <div className={styles["user-detail-1-wrapper"]}>
                                <div className={styles["user-name"]}>{user?.name}</div>
                                <div className={styles["user-email"]}>{user?.email}</div>
                                {/*{successMessage && (*/}
                                {/*    <div className={styles["success-message"]}>*/}
                                {/*        {successMessage}*/}
                                {/*    </div>*/}
                                {/*)}*/}
                                {/*{error && (*/}
                                {/*    <div className={styles["error-message"]}>*/}
                                {/*        {error}*/}
                                {/*    </div>*/}
                                {/*)}*/}
                            </div>
                        </div>
                    </div>
                    <div className={styles['modal-body-children']}>
                        <ModalChildren
                            user={userData}
                            fetchUser={user}
                            tickVisible={tickVisible}
                            setTickVisible={setTickVisible}
                        />
                    </div>
                </div>
                <div className={styles["modal-footer"]}></div>
                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={actionLoading}
                />
            </div>
        </div>
    );
};

export default Account;
