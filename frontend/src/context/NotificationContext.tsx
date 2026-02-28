import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiClient from '../api/client';
import { useSocket } from './SocketContext';

interface Notification {
    _id: string;
    type: 'application_received' | 'status_updated' | 'system';
    message: string;
    isRead: boolean;
    createdAt: string;
    relatedInternshipId?: string;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    fetchNotifications: () => Promise<void>;
    markAsRead: (id: string) => Promise<void>;
    markAllRead: (internshipId?: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) throw new Error('useNotifications must be used within a NotificationProvider');
    return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const { socket } = useSocket();

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await apiClient.get('/notifications');
            setNotifications(res.data);
        } catch (err) {
            console.error('[NotificationContext] Fetch error:', err);
        }
    }, []);

    const markAsRead = async (id: string) => {
        try {
            await apiClient.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (err) {
            console.error('[NotificationContext] Mark read error:', err);
        }
    };

    const markAllRead = useCallback(async (internshipId?: string) => {
        try {
            await apiClient.put('/notifications/mark-all-read', { internshipId });
            // Optimistically update local state — no need to refetch
            setNotifications(prev => prev.map(n => {
                if (internshipId) {
                    const relId = n.relatedInternshipId?.toString();
                    return relId === internshipId.toString() ? { ...n, isRead: true } : n;
                }
                return { ...n, isRead: true };
            }));
        } catch (err) {
            console.error('[NotificationContext] Mark all read error:', err);
        }
    }, []);


    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    useEffect(() => {
        if (socket) {
            socket.on('notification', (newNotification: Notification) => {
                setNotifications(prev => [newNotification, ...prev]);
            });
            return () => {
                socket.off('notification');
            };
        }
    }, [socket]);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, fetchNotifications, markAsRead, markAllRead }}>
            {children}
        </NotificationContext.Provider>
    );
};
