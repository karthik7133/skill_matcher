import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, User as UserIcon, LogOut, Layout } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
import { useAuth } from '../context/AuthContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const NavLink = ({ to, icon: Icon, children, active }: { to: string, icon: any, children: React.ReactNode, active: boolean }) => (
    <Link to={to} className="relative group">
        <div className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300",
            active ? "text-white bg-white/10" : "text-slate-400 hover:text-white hover:bg-white/5"
        )}>
            <Icon size={18} className={cn("transition-transform duration-300 group-hover:scale-110", active && "text-primary-400")} />
            <span className="text-sm font-medium tracking-wide">{children}</span>
        </div>
        {active && (
            <motion.div
                layoutId="nav-active"
                className="absolute -bottom-1 inset-x-4 h-0.5 bg-gradient-to-r from-primary-500 to-purple-500 rounded-full"
            />
        )}
    </Link>
);

const Navbar: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const dashboardPath = user?.role === 'student' ? '/student' : '/recruiter';

    return (
        <nav className="fixed top-0 inset-x-0 z-[50] px-6 py-4">
            <div className="max-w-7xl mx-auto glass-dark border-white/5 rounded-2xl px-6 py-3 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-3 group">
                    <motion.div
                        whileHover={{ rotate: 10, scale: 1.1 }}
                        className="w-10 h-10 bg-gradient-to-tr from-primary-600 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20"
                    >
                        <Briefcase size={22} className="text-white" />
                    </motion.div>
                    <span className="text-xl font-bold tracking-tight text-white group-hover:text-primary-400 transition-colors">
                        Skill<span className="text-primary-400">Matcher</span>
                    </span>
                </Link>

                {/* Navigation Links */}
                <div className="hidden md:flex items-center gap-2">
                    <NavLink to={dashboardPath} icon={Layout} active={location.pathname === dashboardPath}>
                        Dashboard
                    </NavLink>
                    <NavLink to="/profile" icon={UserIcon} active={location.pathname === '/profile'}>
                        Profile
                    </NavLink>
                </div>

                {/* User Actions */}
                <div className="flex items-center gap-5">
                    <div className="hidden sm:flex flex-col items-right text-right">
                        <span className="text-sm font-semibold text-white leading-tight">{user?.name}</span>
                        <span className="text-[10px] font-bold text-primary-400 uppercase tracking-widest">{user?.role}</span>
                    </div>

                    <div className="h-8 w-px bg-white/10" />

                    <div className="flex items-center gap-2">
                        <NotificationDropdown />
                        <motion.button
                            onClick={handleLogout}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 transition-all shadow-lg shadow-rose-900/10"
                        >
                            <LogOut size={18} />
                        </motion.button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
