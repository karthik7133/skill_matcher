import React from 'react';
import { motion } from 'framer-motion';
import { User, GraduationCap, MapPin, Mail } from 'lucide-react';
import GlassCard from './GlassCard';

interface ProfileHeaderProps {
    name: string;
    education?: string;
    email?: string;
    role: string;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ name, education, email, role }) => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 },
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full mb-8"
        >
            <GlassCard className="flex flex-col md:flex-row items-center md:items-start gap-8 py-10" hoverEffect={false}>
                {/* Avatar with Glowing Ring */}
                <div className="relative group">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, type: "spring" }}
                        className="relative z-10 w-32 h-32 rounded-full bg-slate-800 flex items-center justify-center border-2 border-white/10 shadow-2xl overflow-hidden"
                    >
                        <User size={64} className="text-slate-400" />

                        {/* Inner Glow Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </motion.div>

                    {/* Glowing Rings */}
                    <div className="absolute inset-0 rounded-full border border-primary-500/50 animate-ping opacity-20" />
                    <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-primary-500 to-purple-500 opacity-20 blur-md group-hover:opacity-40 transition-opacity duration-500" />
                    <div className="absolute -inset-4 rounded-full bg-primary-500/5 blur-2xl pointer-events-none" />
                </div>

                {/* User Info */}
                <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
                    <motion.div variants={itemVariants} className="flex flex-col gap-1 mb-4">
                        <span className="text-xs font-bold text-primary-400 uppercase tracking-[0.2em]">
                            {role} Profile
                        </span>
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                            {name}
                        </h1>
                    </motion.div>

                    <motion.div variants={itemVariants} className="flex flex-wrap justify-center md:justify-start gap-4 md:gap-6 text-slate-400">
                        {education && (
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <GraduationCap size={18} className="text-primary-400" />
                                <span>{education}</span>
                            </div>
                        )}
                        {email && (
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <Mail size={18} className="text-primary-400" />
                                <span>{email}</span>
                            </div>
                        )}
                    </motion.div>

                    <motion.div variants={itemVariants} className="mt-8 flex gap-3">
                        <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-slate-300">
                            Verified Talent
                        </div>
                        <div className="px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-xs font-semibold text-primary-400">
                            Available for Roles
                        </div>
                    </motion.div>
                </div>

                {/* Action Button - Moved here or kept in page? roadmap says "top section of profile page" */}
                {/* We'll keep the actual "Save" button in the ProfileSetup page for logic clarity, 
            but maybe add a visual summary here */}
            </GlassCard>
        </motion.div>
    );
};

export default ProfileHeader;
