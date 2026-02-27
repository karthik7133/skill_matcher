import React from 'react';
import { motion } from 'framer-motion';
import { Trash2, ExternalLink, Code, Database, Globe, Cpu } from 'lucide-react';
import GlassCard from './GlassCard';

interface ProjectCardProps {
    title: string;
    description: string;
    technologies?: string[];
    onRemove?: () => void;
    onUpdate?: (field: string, value: any) => void;
    isEditable?: boolean;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
    title,
    description,
    technologies = [],
    onRemove,
    onUpdate,
    isEditable = true
}) => {

    const getIcon = (title: string) => {
        const t = title.toLowerCase();
        if (t.includes('web') || t.includes('site')) return <Globe className="text-blue-400" size={20} />;
        if (t.includes('ai') || t.includes('ml') || t.includes('bot')) return <Cpu className="text-purple-400" size={20} />;
        if (t.includes('data') || t.includes('db') || t.includes('sql')) return <Database className="text-emerald-400" size={20} />;
        return <Code className="text-primary-400" size={20} />;
    };

    return (
        <GlassCard className="group relative">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-primary-500/30 transition-colors">
                        {getIcon(title)}
                    </div>
                    {isEditable ? (
                        <input
                            className="bg-transparent text-white font-bold text-xl focus:outline-none w-full border-b border-transparent focus:border-primary-500/50 transition-all"
                            value={title}
                            placeholder="Project Title"
                            onChange={(e) => onUpdate?.('title', e.target.value)}
                        />
                    ) : (
                        <h3 className="text-white font-bold text-xl">{title}</h3>
                    )}
                </div>

                {isEditable && onRemove && (
                    <motion.button
                        whileHover={{ scale: 1.1, color: '#ef4444' }}
                        onClick={onRemove}
                        className="text-slate-500 transition-colors opacity-0 group-hover:opacity-100 p-2"
                    >
                        <Trash2 size={18} />
                    </motion.button>
                )}
            </div>

            <div className="space-y-4">
                {isEditable ? (
                    <textarea
                        className="w-full bg-slate-950/30 border border-white/5 rounded-xl px-4 py-3 text-slate-300 text-sm focus:outline-none focus:border-primary-500/30 transition-all min-h-[100px] max-h-[200px] resize-none overflow-y-auto custom-scrollbar"
                        value={description}
                        placeholder="Describe your project, impact, and role..."
                        onChange={(e) => onUpdate?.('description', e.target.value)}
                    />
                ) : (
                    <div className="max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                        <p className="text-slate-400 text-sm leading-relaxed">
                            {description}
                        </p>
                    </div>
                )}

                <div className="flex flex-wrap gap-2">
                    {technologies.map((tech, i) => (
                        <span
                            key={i}
                            className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary-500/10 border border-primary-500/20 text-primary-400"
                        >
                            {tech}
                        </span>
                    ))}
                    {isEditable && (
                        <div className="flex items-center gap-2 w-full mt-2">
                            <input
                                className="flex-1 bg-transparent text-[10px] text-white border-b border-white/10 focus:outline-none focus:border-primary-500/50"
                                placeholder="Add tech (comma separated)"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        const val = (e.target as HTMLInputElement).value;
                                        const newTechs = val.split(',').map(t => t.trim()).filter(Boolean);
                                        onUpdate?.('technologies', [...technologies, ...newTechs]);
                                        (e.target as HTMLInputElement).value = '';
                                        e.preventDefault();
                                    }
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Subtle Link Decoration if not editable */}
            {!isEditable && (
                <div className="mt-6 pt-4 border-t border-white/5 flex justify-end">
                    <button className="flex items-center gap-2 text-xs font-bold text-primary-400 hover:text-primary-300 transition-colors uppercase tracking-widest">
                        View Details <ExternalLink size={14} />
                    </button>
                </div>
            )}
        </GlassCard>
    );
};

export default ProjectCard;
