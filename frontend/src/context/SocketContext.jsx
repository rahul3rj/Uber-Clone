import React, { createContext, useEffect } from 'react'
import { io } from 'socket.io-client'

export const SocketContext = createContext();

const socket = io(`${import.meta.env.VITE_BASE_URL}`);

const SocketProvider = ({ children }) => {
    useEffect(() => {
        socket.on('connect', () => {
            console.log('Connected to Server');
        });
        socket.on('disconnect', () => {
            console.log('Disconnected from Server');
        });
        
    }, []);

    const sendMessage = (eventName, message) => {
        socket.emit(eventName, message);
    };

    const receiveMessage = (eventName, callback) => {
        socket.on(eventName, callback);
    };

    const join = (userId, userType) => {
        socket.emit('join', { userId, userType });
    };

    const off = (eventName, callback) => {
        if (callback) socket.off(eventName, callback);
        else socket.off(eventName);
    };

    return (
        <SocketContext.Provider value={{ sendMessage, receiveMessage, join, off }}>
            {children}
        </SocketContext.Provider>
    );
}

export default SocketProvider
