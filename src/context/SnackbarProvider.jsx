import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import styles from "../components/ui/SnackBar.module.css";
// Import the new toastTemplates map
import { toastTemplates } from "../components/templates/toastTemplates"; // Assuming this path

// Configuration settings
const MAX_VISIBLE = 3; // Maximum number of toasts visible in the compact stack
const MIN_ANIMATION_DURATION = 10; // Minimum allowed animation duration (e.g., if interval is 0 or very small)
const FIXED_MAX_ANIMATION_DURATION = 500; // The fixed 0.5s max for the dynamic entry animation logic

const SnackbarContext = createContext();
export const useSnackbar = () => useContext(SnackbarContext);

export const SnackbarProvider = ({ children }) => {
    const [snackbars, setSnackbars] = useState([]);
    const [lastToastAddedTime, setLastToastAddedTime] = useState(0); // To calculate dynamic entry animation duration
    const [currentEntryAnimationDuration, setCurrentEntryAnimationDuration] = useState(FIXED_MAX_ANIMATION_DURATION); // Dynamic duration for new toast entry
    const [isHovered, setIsHovered] = useState(false); // To control expanded view on hover
    const [maxToastContentHeight, setMaxToastContentHeight] = useState(0); // State to store the maximum height of a toast content

    // Function to show a new snackbar - now accepts templateKey and templateData
    const showSnackbar = useCallback(({ message, actions, variant = "default", duration = 50000000, templateKey, templateData }) => {
        const now = Date.now();
        const id = now + Math.random();

        // Calculate dynamic entry animation duration based on time since last toast was added
        const intervalSinceLastToast = lastToastAddedTime ? now - lastToastAddedTime : FIXED_MAX_ANIMATION_DURATION; // Default to max if first toast

        // Determine the new entry animation duration: Math.min(actual_interval, FIXED_MAX_ANIMATION_DURATION)
        // Then ensure it doesn't go below MIN_ANIMATION_DURATION
        const newEntryAnimationDuration = Math.max(MIN_ANIMATION_DURATION, Math.min(intervalSinceLastToast, FIXED_MAX_ANIMATION_DURATION));

        setCurrentEntryAnimationDuration(newEntryAnimationDuration);
        setLastToastAddedTime(now); // Update last added time

        // Add new toast to the beginning of the array
        setSnackbars(prev => {
            const newSnackbars = [{ id, message, actions, variant, templateKey, templateData, addedTime: now }, ...prev];
            return newSnackbars;
        });

        // --- AUTOMATIC DISMISSAL LOGIC ---
        // Set a timeout to mark the toast as 'exiting' after its specified duration
        setTimeout(() => {
            setSnackbars(prev =>
                prev.map(snack =>
                    snack.id === id ? { ...snack, exiting: true } : snack
                )
            );
        }, duration); // Use the provided 'duration' for auto-dismissal
        // --- END AUTOMATIC DISMISSAL LOGIC ---

    }, [lastToastAddedTime]); // Dependency to track last added time for duration calculation

    // Function to mark a snackbar for dismissal animation (called manually or by auto-dismissal timeout)
    const dismissSnackbar = useCallback((id) => {
        setSnackbars(prev =>
            prev.map(snack =>
                snack.id === id ? { ...snack, exiting: true } : snack
            )
        );
    }, []);

    // Function to actually remove snackbar from state after its exit animation completes
    const handleAnimationEnd = useCallback((id) => {
        setSnackbars(prev => prev.filter(snack => snack.id !== id));
    }, []);

    // Effect to mark the oldest snackbar as 'overLimit' for specific styling, if beyond MAX_VISIBLE
    useEffect(() => {
        setSnackbars(prev => {
            // Find the first snackbar that is beyond MAX_VISIBLE and is not already exiting/overLimit
            if (prev.length > MAX_VISIBLE) {
                const oldestIndex = prev.length - 1;
                if (!prev[oldestIndex].exiting && !prev[oldestIndex].overLimit) {
                    const updatedPrev = [...prev];
                    updatedPrev[oldestIndex] = { ...updatedPrev[oldestIndex], overLimit: true };
                    return updatedPrev;
                }
            }
            // If count is MAX_VISIBLE or less, ensure no 'overLimit' flag is set from previous state
            return prev.map(snack => (snack.overLimit ? { ...snack, overLimit: false } : snack));
        });
    }, [snackbars.length]); // Re-run when total snackbar count changes

    // Determine which snackbars to render:
    // - If hovered, render all snackbars currently in state.
    // - If not hovered, render only MAX_VISIBLE + 1 (the +1 is for the 'overLimit' toast to animate out)
    const snackbarsToRender = isHovered
        ? snackbars
        : snackbars.slice(0, MAX_VISIBLE + 1);

    // Callback to receive height from each Snackbar component
    const updateMaxToastHeight = useCallback((height) => {
        setMaxToastContentHeight(prevMax => Math.max(prevMax, height));
    }, []);

    // Reset maxToastContentHeight when snackbars change to ensure accurate measurement
    useEffect(() => {
        if (snackbars.length === 0) {
            setMaxToastContentHeight(0);
        }
    }, [snackbars.length]);

    return (
        <SnackbarContext.Provider value={{ showSnackbar }}>
            {children}
            <div
                style={{ ...containerStyle, height: `${maxToastContentHeight + 15}px` }} // +15 for bottom offset
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {snackbarsToRender.map((snack, idx, arr) => (
                    <Snackbar
                        key={snack.id}
                        id={snack.id}
                        message={snack.message} // Original message prop, potentially unused if template is used
                        templateKey={snack.templateKey} // Pass templateKey
                        templateData={snack.templateData} // Pass templateData
                        actions={snack.actions}
                        variant={snack.variant}
                        isTop={idx === 0} // True for the newest snackbar in the array
                        exiting={snack.exiting} // True if manually dismissed or auto-dismissed
                        // 'overLimit' is true if not expanded AND it's the last toast in the rendered array
                        // (meaning it's the one that's about to be pushed off the visible stack)
                        overLimit={!isHovered && !!snack.overLimit && idx === arr.length - 1}
                        animationDuration={currentEntryAnimationDuration} // Pass dynamic entry animation duration
                        onClose={() => dismissSnackbar(snack.id)}
                        // Call handleAnimationEnd when 'exiting' or 'overLimit' animation finishes
                        onAnimationEnd={() => (snack.exiting || (!!snack.overLimit && idx === arr.length - 1)) && handleAnimationEnd(snack.id)}
                        onHeightChange={updateMaxToastHeight} // Pass height update callback
                        style={{
                            position: "absolute",
                            top: 0, // All positioned from bottom 0
                            left: 0,
                            right: 0,
                            // Z-index ensures newer toasts are on top, and older are below them
                            zIndex: snackbars.length - idx,
                            // Transform for visual stacking and scaling (compact vs. expanded view)
                            transform: isHovered
                                ? `translateY(${-idx * 80}px) scale(1)` // Spread out on hover
                                : `translateY(${-idx * 15}px) scale(${1 - idx * 0.05})`, // Compact stack
                            pointerEvents: idx === 0 ? "auto" : "none", // Only the top toast is interactive by default
                            cursor: isHovered ? "default" : idx === 0 ? "pointer" : "inherit", // Cursor changes based on interactivity
                        }}
                    />
                ))}
            </div>
        </SnackbarContext.Provider>
    );
};

// Styles for the main container that holds all snackbars
const containerStyle = {
    position: "fixed",
    bottom: 15, // This is the bottom offset of the container from the viewport edge
    left: 15,
    zIndex : 100000,
    width : "auto", // Fixed width for container
    background : "Red",
    // height: will be set dynamically inline
    pointerEvents: "auto", // Allows mouse events on the container (for hover)
    overflow: "visible", // Ensures animations are not clipped by container boundaries
    cursor: "default", // Default cursor for the container area
};

// Snackbar component (receives props from SnackbarProvider)
const Snackbar = ({
                      id,
                      message, // This prop might be unused if templateKey/Data is used
                      templateKey, // New prop for template key
                      templateData, // New prop for template data
                      actions,
                      onClose,
                      isTop,
                      exiting,
                      overLimit,
                      animationDuration, // Dynamic entry animation duration passed from provider
                      onAnimationEnd,
                      onHeightChange, // New callback to report its height
                      style, // Styles passed from provider for positioning/transform
                  }) => {
    const [animationClass, setAnimationClass] = useState("");
    const ref = useRef(null); // Ref to measure the div's height

    // Measure height of the snackbar after render
    useEffect(() => {
        if (ref.current && onHeightChange) {
            onHeightChange(ref.current.offsetHeight);
        }
    }, [templateKey, templateData, onHeightChange]); // Re-measure if content changes

    // Effect to apply/remove CSS animation classes based on snackbar state
    useEffect(() => {
        if (overLimit) {
            // Specific exit animation for the 'overLimit' toast (fixed duration)
            setAnimationClass(styles.toastExitOverLimit);
        } else if (exiting) {
            // General exit animation for manually or auto-dismissed toasts (fixed duration)
            setAnimationClass(styles.toastExit);
        } else if (isTop) {
            // Entry animation for the newest toast (dynamic duration)
            setAnimationClass(styles.toastEnter);
            // Remove the animation class after its duration to allow other transitions or prevent re-triggering
            const timer = setTimeout(() => setAnimationClass(""), animationDuration);
            return () => clearTimeout(timer);
        } else {
            // No animation class for static (non-top, non-exiting) toasts in the stack
            setAnimationClass("");
        }
    }, [isTop, exiting, overLimit, animationDuration]); // Re-run this effect if these state/prop values change

    // Render the content based on the templateKey and templateData
    const renderToastContent = useCallback(() => {
        const templateFunction = toastTemplates.get(templateKey);
        if (templateFunction) {
            return templateFunction(templateData);
        }
        // Fallback if templateKey is not found (or if it was just a plain message)
        return (
            <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 4 }}>
                {templateData && templateData.message ? templateData.message : `Toast ID: ${id}`}
            </div>
        );
    }, [templateKey, templateData, id]); // Depend on templateKey and templateData

    return (
        <div
            ref={ref} // Attach ref here to measure height
            className={`${animationClass} ${styles['toast']}`}
            style={{
                minWidth: 320,
                maxWidth: 420,
                minHeight : 120,
                borderRadius: 16,
                color: "#fff",
                padding: "20px 24px 18px 24px",
                boxShadow: "0 6px 34px rgba(0,0,0,0.4), 0 1.5px 8px rgba(0,0,0,0.3)",
                display: "flex",
                flexDirection: "column",
                position: "absolute",
                right: 0,
                left: 0,
                transition: `all ${animationDuration}ms cubic-bezier(.25,1.2,.5,1)`, // Apply transition for smooth stacking transitions
                ...style, // Apply positioning and transform styles from parent SnackbarProvider
            }}
            // Trigger onAnimationEnd callback when any applied CSS animation finishes
            // This is crucial for removing the toast from state after it has visually disappeared
            onAnimationEnd={() => (exiting || overLimit) && onAnimationEnd(id)}
        >
            {renderToastContent()} {/* Render dynamic content here */}

            {actions && (
                <div style={{ display: "flex", gap: 24, marginTop: 8 }}>
                    {actions.map(({ label, onClick }) => (
                        <button
                            key={label}
                            onClick={onClick}
                            disabled={!isTop} // Only the top toast's actions are interactive
                            style={{
                                background: "none",
                                color: "#fff",
                                border: "none",
                                fontWeight: "bold",
                                padding: 0,
                                fontSize: 15,
                                cursor: isTop ? "pointer" : "default", // Pointer cursor only for top toast actions
                                opacity: isTop ? 1 : 0.6, // Dim action buttons for non-top toasts
                            }}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            )}
            {isTop && (
                // Close button only visible and interactive for the top toast
                <button
                    onClick={onClose} // Calls dismissSnackbar in the provider
                    aria-label="Dismiss"
                    style={{
                        position: "absolute",
                        right: 12,
                        top: 10,
                        fontSize: 18,
                        background: "none",
                        color: "#aaa",
                        border: "none",
                        cursor: "pointer", // Always a pointer for the close button
                    }}
                >
                    ×
                </button>
            )}
        </div>
    );
};

export default SnackbarProvider;
