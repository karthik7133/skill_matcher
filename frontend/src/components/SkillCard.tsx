import React from 'react';
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import SkillIcon from './SkillIcon';

interface SkillCardProps {
    name: string;
    level: string;
    onRemove?: () => void;
    onUpdate?: (field: string, value: string) => void;
    isEditable?: boolean;
}

const SkillCard: React.FC<SkillCardProps> = ({ name, level, onRemove, onUpdate, isEditable = true }) => {
    const levels = ['Beginner', 'Intermediate', 'Advanced'];
    const levelIndex = levels.indexOf(level);

    return (
        <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            className="glass-dark p-5 rounded-2xl relative group border border-white/5 hover:border-primary-500/30 transition-all duration-300 shadow-lg hover:shadow-primary-500/10"
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <SkillIcon name={name} className="w-8 h-8" />
                    {isEditable ? (
                        <input
                            className="bg-transparent text-white font-bold text-lg focus:outline-none w-32 border-b border-transparent focus:border-primary-500/50 transition-all"
                            value={name}
                            placeholder="Skill name"
                            onChange={(e) => onUpdate?.('name', e.target.value)}
                        />
                    ) : (
                        <div className="overflow-hidden whitespace-nowrap w-32 relative">
                            <div className="inline-block group-hover:animate-[marquee_5s_linear_infinite]">
                                <span className="text-white font-bold text-lg pr-4">{name}</span>
                                <span className="text-white font-bold text-lg pr-4 hidden group-hover:inline-block absolute left-full">{name}</span>
                            </div>
                        </div>
                    )}
                </div>
                {isEditable && onRemove && (
                    <motion.button
                        whileHover={{ scale: 1.1, color: '#ef4444' }}
                        onClick={onRemove}
                        className="text-slate-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                        <Trash2 size={18} />
                    </motion.button>
                )}
            </div>

            <div className="flex items-center justify-between mt-auto">
                {isEditable ? (
                    <select
                        className="bg-slate-950/50 text-slate-400 text-xs font-bold uppercase tracking-wider rounded-lg px-2 py-1 border border-white/5 focus:outline-none"
                        value={level}
                        onChange={(e) => onUpdate?.('level', e.target.value)}
                    >
                        {levels.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                ) : (
                    <span className="text-primary-400 text-xs font-bold uppercase tracking-widest">{level}</span>
                )}

                <div className="flex gap-1.5">
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            initial={false}
                            animate={{
                                backgroundColor: i <= levelIndex ? '#8b5cf6' : 'rgba(255,255,255,0.1)',
                                boxShadow: i <= levelIndex ? '0 0 10px rgba(139, 92, 246, 0.5)' : 'none'
                            }}
                            className="w-2.5 h-2.5 rounded-full transition-all duration-500"
                        />
                    ))}
                </div>
            </div>

            {/* Hover Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-tr from-primary-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-5 blur-xl transition-opacity duration-500 pointer-events-none" />
        </motion.div>
    );
};

export default SkillCard;
