// src/context/SocketContext.js
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const SocketProvider = ({ children, initialNamespaces = [], authToken = null }) => {
    const [sockets, setSockets] = useState({});
    const [errors, setErrors] = useState({});
    const eventListeners = useRef({}); // { [namespace]: { [event]: Set(callbacks) } }

    // 🔌 Connect to a new namespace
    const addNamespace = (namespace) => {
        if (!namespace || sockets[namespace]) return;

        const socket = io(`ws://localhost:5001/${namespace}`, {
            transports: ['websocket'],
            auth: authToken ? { token: authToken } : undefined,
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
        });

        socket.on('connect', () => {
            console.log(`✅ Connected to ${namespace}`);
            setErrors(prev => ({ ...prev, [namespace]: null }));
        });

        socket.on('connect_error', (err) => {
            console.error(`❌ Connection error on ${namespace}:`, err.message);
            setErrors(prev => ({ ...prev, [namespace]: err.message }));
        });

        socket.on('disconnect', () => {
            console.log(`🔌 Disconnected from ${namespace}`);
        });

        socket.on('reconnect', (attemptNumber) => {
            console.log(`🔁 Reconnected to ${namespace} after ${attemptNumber} attempts`);
        });

        socket.on('reconnect_attempt', (attemptNumber) => {
            console.log(`⚡ Reconnection attempt ${attemptNumber} for ${namespace}`);
        });

        setSockets(prev => ({ ...prev, [namespace]: socket }));
    };

    // 🔌 Disconnect and clean up a namespace
    const removeNamespace = (namespace) => {
        if (!sockets[namespace]) return;

        sockets[namespace].disconnect();

        // Remove event listeners
        if (eventListeners.current[namespace]) {
            Object.keys(eventListeners.current[namespace]).forEach(event => {
                sockets[namespace].off(event);
            });
            delete eventListeners.current[namespace];
        }

        setSockets(prev => {
            const updated = { ...prev };
            delete updated[namespace];
            return updated;
        });
    };

    // 📡 Emit event to a namespace
    const emitEvent = (namespace, event, data) => {
        sockets[namespace]?.emit(event, data);
    };

    // 🧠 Register event listener
    const onEvent = (namespace, event, callback) => {
        if (!sockets[namespace]) return;

        if (!eventListeners.current[namespace]) {
            eventListeners.current[namespace] = {};
        }

        if (!eventListeners.current[namespace][event]) {
            eventListeners.current[namespace][event] = new Set();

            sockets[namespace].on(event, (data) => {
                eventListeners.current[namespace][event].forEach(cb => cb(data));
            });
        }

        eventListeners.current[namespace][event].add(callback);
    };

    // ❌ Remove event listener
    const offEvent = (namespace, event, callback) => {
        const listeners = eventListeners.current[namespace]?.[event];
        if (listeners) {
            listeners.delete(callback);
            if (listeners.size === 0) {
                sockets[namespace]?.off(event);
                delete eventListeners.current[namespace][event];
            }
        }
    };

    // ⏱ Auto-connect initial namespaces
    useEffect(() => {
        initialNamespaces.forEach(ns => addNamespace(ns));
        return () => {
            Object.keys(sockets).forEach(removeNamespace);
        };
    }, []);

    return (
        <SocketContext.Provider value={{
            sockets,
            errors,
            addNamespace,
            removeNamespace,
            emitEvent,
            onEvent,
            offEvent
        }}>
            {children}
        </SocketContext.Provider>
    );
};

// 🧩 Hook to use socket logic per namespace
export const useSocket = (namespace) => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error("useSocket must be used within a SocketProvider");
    }

    const {
        sockets,
        emitEvent,
        onEvent,
        offEvent,
        addNamespace,
        removeNamespace
    } = context;

    useEffect(() => {
        if (namespace && !sockets[namespace]) {
            addNamespace(namespace);
        }

        // Optional: Remove on unmount (if not shared)
        // return () => {
        //     removeNamespace(namespace);
        // };
    }, [namespace]);

    return {
        socket: sockets[namespace],
        emit: (event, data) => emitEvent(namespace, event, data),
        on: (event, callback) => onEvent(namespace, event, callback),
        off: (event, callback) => offEvent(namespace, event, callback),
        addNamespace,
        removeNamespace
    };
};