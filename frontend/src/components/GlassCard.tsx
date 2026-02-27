import React from 'react';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface GlassCardProps extends React.ComponentPropsWithoutRef<typeof motion.div> {
    children: React.ReactNode;
    className?: string;
    hoverEffect?: boolean;
}

const GlassCard: React.FC<GlassCardProps> = ({
    children,
    className,
    hoverEffect = true,
    ...props
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={hoverEffect ? {
                y: -5,
                transition: { duration: 0.2 },
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
            } : undefined}
            className={cn(
                "glass-dark rounded-3xl p-6 relative overflow-hidden group",
                className
            )}
            {...props}
        >
            {/* Subtle Inner Glow */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

            {/* Background radial glow on hover */}
            {hoverEffect && (
                <div className="absolute -inset-24 bg-primary-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            )}

            <div className="relative z-10">
                {children}
            </div>
        </motion.div>
    );
};

export default GlassCard;
