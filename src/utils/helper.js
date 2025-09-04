export const getInitials = (text) => {
    if (!text || typeof text !== 'string') return ''; // Handle invalid input
    const words = text.trim().split(/\s+/); // Split by whitespace
    const initials = words
        .slice(0, 2) // Take only the first two words
        .map(word => word.charAt(0).toUpperCase())
        .join(''); // Join the first letters
    return initials || ''; // Ensure return value if no valid initials
};