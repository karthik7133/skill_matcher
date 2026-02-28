import React, { useState, useEffect, useRef } from 'react';
import { Bell, Inbox } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { useNotifications } from '../context/NotificationContext';

const NotificationDropdown: React.FC = () => {
    const { notifications, unreadCount, markAsRead, markAllRead } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-colors relative"
            >
                <Bell size={18} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
                )}
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-3 w-80 glass-dark border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[100]"
                    >
                        <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between bg-white/5">
                            <h3 className="text-sm font-bold text-white">Notifications</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={() => markAllRead()}
                                    className="text-[10px] font-bold text-primary-400 hover:text-primary-300 uppercase tracking-wider transition-colors"
                                >
                                    Mark all read
                                </button>
                            )}
                        </div>

                        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                            {notifications.length > 0 ? (
                                <div className="flex flex-col">
                                    {notifications.map((n) => (
                                        <div
                                            key={n._id}
                                            onClick={() => !n.isRead && markAsRead(n._id)}
                                            className={`px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer relative group ${!n.isRead ? 'bg-primary-500/5' : ''}`}
                                        >
                                            <div className="flex gap-3">
                                                <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${!n.isRead ? 'bg-primary-500' : 'bg-transparent'}`} />
                                                <div className="flex-1">
                                                    <p className={`text-xs leading-relaxed ${!n.isRead ? 'text-white font-medium' : 'text-slate-400'}`}>
                                                        {n.message}
                                                    </p>
                                                    <p className="text-[10px] text-slate-500 mt-1">
                                                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="px-4 py-12 flex flex-col items-center justify-center text-center">
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                                        <Inbox className="text-slate-500" size={24} />
                                    </div>
                                    <p className="text-sm text-slate-400">All caught up!</p>
                                    <p className="text-xs text-slate-600 mt-1">No new notifications</p>
                                </div>
                            )}
                        </div>

                        <div className="px-4 py-2 bg-white/5 border-t border-white/5 text-center">
                            <button className="text-[10px] font-medium text-slate-500 hover:text-slate-400 transition-colors uppercase tracking-widest">
                                View all activity
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationDropdown;
