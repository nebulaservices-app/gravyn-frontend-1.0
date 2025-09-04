import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Check if user is already authenticated on mount
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch('http://localhost:5001/auth/me', {
                    credentials: 'include',
                });

                if (!res.ok) throw new Error("Not authenticated");

                const data = await res.json();
                setUser(data.user);
                if(data.user._id && !localStorage.getItem("nuid")){
                    localStorage.setItem("nuid" , data.user._id);
                }
                setIsAuthenticated(true);
                console.log("✅ Authenticated user found");
            } catch (err) {
                setUser(null);
                if(localStorage.getItem("nuid")){
                    localStorage.removeItem("nuid")
                }
                setIsAuthenticated(false);
                console.warn("❌ Not authenticated:", err.message);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    // Login manually (after successful OAuth)
    const login = (userData) => {
        setUser(userData);

        setIsAuthenticated(true);
    };

    // Logout
    const logout = async () => {
        console.log("We are loggin out")
        try {
            const res = await fetch('http://localhost:5001/auth/logout', {
                method: 'POST',
                credentials: 'include',
            });


            if (!res.ok) throw new Error("Logout failed");

            if(localStorage.getItem("nuid")){
                localStorage.removeItem("nuid")
            }


        } catch (err) {
        }

        setUser(null);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};