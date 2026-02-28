import React from 'react';
import { Bot, User, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthenticityBadgeProps {
    data?: {
        aiProbability: number;
        humanProbability: number;
        analysisReasoning: string;
    };
}

const AuthenticityBadge: React.FC<AuthenticityBadgeProps> = ({ data }) => {
    if (!data || (data.aiProbability === 0 && data.humanProbability === 0)) {
        return null;
    }

    const { aiProbability, humanProbability, analysisReasoning } = data;
    const isAI = aiProbability > 70;
    const isHuman = humanProbability > 70;

    // Default to neutral/mixed if neither is > 70
    let badgeColor = "bg-white/5 border-white/10 text-slate-400";
    let icon = <Info size={14} />;
    let label = "Mixed Authenticity";

    if (isAI) {
        badgeColor = "bg-rose-500/10 border-rose-500/20 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.1)]";
        icon = <Bot size={14} />;
        label = "High AI Probability";
    } else if (isHuman) {
        badgeColor = "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]";
        icon = <User size={14} />;
        label = "Likely Human Authored";
    }

    return (
        <div className="relative group">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-bold uppercase tracking-widest cursor-help transition-all hover:bg-white/10 ${badgeColor}`}
            >
                {icon}
                <span>{label} ({isAI ? aiProbability : humanProbability}%)</span>
            </motion.div>

            {/* Hover Tooltip */}
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    className="absolute bottom-full left-0 mb-3 w-64 p-4 rounded-2xl bg-slate-900 border border-white/10 shadow-2xl z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <div className="flex items-center gap-2 mb-2">
                        <div className={`p-1 rounded-lg ${isAI ? 'bg-rose-500/20 text-rose-400' : isHuman ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-slate-400'}`}>
                            {icon}
                        </div>
                        <span className="text-xs font-bold text-white">AI Analysis Detail</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed italic">
                        "{analysisReasoning || "No detailed reasoning provided."}"
                    </p>
                    <div className="mt-3 pt-3 border-t border-white/5 flex justify-between items-center text-[10px] font-black uppercase tracking-tighter">
                        <span className="text-rose-500/60">AI: {aiProbability}%</span>
                        <span className="text-emerald-500/60">Human: {humanProbability}%</span>
                    </div>
                    <div className="absolute -bottom-1.5 left-6 w-3 h-3 bg-slate-900 border-r border-b border-white/10 rotate-45" />
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default AuthenticityBadge;
