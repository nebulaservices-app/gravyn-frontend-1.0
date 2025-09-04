// 📌 Utility Module for Date and Time Formatting

// ✅ Format time in 12-hour format (HH:MM AM/PM)
export const formatTime12Hour = (timestamp) => {
    const date = new Date(timestamp);
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12; // Convert to 12-hour format
    return `${hours}:${minutes} ${ampm}`;
};

export const formatFullDateUTC = (timestamp) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "UTC", // Ensures consistent UTC output
    }).format(date);
};
export const formatMonthDayUTC = (timestamp) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        timeZone: "UTC", // Force UTC
    }).format(date);
};

// ✅ Format time in 24-hour format (HH:MM)
export const formatTime24Hour = (timestamp) => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
};

// ✅ Format full date (e.g., "March 18, 2025")
export const formatFullDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
};

// ✅ Format short date (e.g., "18/03/2025")
export const formatShortDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-GB"); // DD/MM/YYYY format
};

// ✅ Get day of the week (e.g., "Monday")
export const getDayOfWeek = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", { weekday: "long" });
};

// ✅ Convert timestamp to "Time Ago" (e.g., "5 minutes ago", "Yesterday")
export const timeAgo = (timestamp) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return formatFullDate(timestamp);
};

// ✅ Get current timestamp in ISO format (YYYY-MM-DDTHH:MM:SSZ)
export const getISOTimeStamp = () => {
    return new Date().toISOString();
};

// ✅ Get current time in Unix timestamp (seconds)
export const getUnixTimestamp = () => {
    return Math.floor(Date.now() / 1000);
};

// ✅ Convert Unix timestamp to readable date
export const unixToReadable = (unixTimestamp) => {
    return formatFullDate(unixTimestamp * 1000);
};

// ✅ Format Date & Time together (e.g., "March 18, 2025 - 12:30 PM")
export const formatDateTime = (timestamp) => {
    return `${formatFullDate(timestamp)} - ${formatTime12Hour(timestamp)}`;
};

// ✅ Custom Date Formatting using Intl API
export const customFormatDate = (timestamp, locale = "en-US", options = {}) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString(locale, options);
};

// ✅ Check if a given timestamp is today
export const isToday = (timestamp) => {
    const today = new Date();
    const date = new Date(timestamp);
    return (
        today.getFullYear() === date.getFullYear() &&
        today.getMonth() === date.getMonth() &&
        today.getDate() === date.getDate()
    );
};

// ✅ Check if a given timestamp is yesterday
export const isYesterday = (timestamp) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const date = new Date(timestamp);
    return (
        yesterday.getFullYear() === date.getFullYear() &&
        yesterday.getMonth() === date.getMonth() &&
        yesterday.getDate() === date.getDate()
    );
};


export const getTimeElapsed = (dateString) => {
    // Parse the input date string
    const inputDate = new Date(dateString);
    const now = new Date();

    // Check for invalid date
    if (isNaN(inputDate)) {
        return "Invalid date";
    }

    // Calculate difference in milliseconds
    const diffMs = now - inputDate;

    // If the date is in the future, return a message
    if (diffMs < 0) {
        return "In the future";
    }

    // Convert to seconds
    const diffSec = Math.floor(diffMs / 1000);

    // Define time units and their thresholds
    const units = [
        { label: "yr", seconds: 365 * 24 * 60 * 60 }, // 1 year
        { label: "day", seconds: 24 * 60 * 60 },      // 1 day
        { label: "hr", seconds: 60 * 60 },            // 1 hour
        { label: "min", seconds: 60 },                // 1 minute
        { label: "sec", seconds: 1 }                  // 1 second
    ];

    // Find the appropriate unit
    for (const unit of units) {
        const value = Math.floor(diffSec / unit.seconds);
        if (value >= 1) {
            return `${value} ${unit.label}${value > 1 ? "s" : ""} ago`;
        }
    }

    // If less than 1 second
    return "Just now";
};

export const formatMeetingTime = (startTimeISO, durationInMinutes) => {
    const start = new Date(startTimeISO);
    const end = new Date(start.getTime() + durationInMinutes * 60000);

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    return `${formatTime(start)} - ${formatTime(end)}`;
};

export function formatToShortDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short', // e.g. "Mar"
        day: 'numeric', // e.g. "12"
    });
}
