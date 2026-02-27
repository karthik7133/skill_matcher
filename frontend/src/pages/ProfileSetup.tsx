import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { User, BookOpen, MessageSquare, Briefcase, Plus, Trash2, Save, Loader2, Sparkles, Code } from 'lucide-react';
import ResumeUpload from '../components/ResumeUpload';
import ProfileHeader from '../components/ProfileHeader';
import GlassCard from '../components/GlassCard';
import SkillCard from '../components/SkillCard';
import ProjectCard from '../components/ProjectCard';
import { motion, AnimatePresence } from 'framer-motion';

const ProfileSetup: React.FC = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const endpoint = user?.role === 'student' ? '/students/profile' : '/recruiters/profile';
                console.log('[ProfileSetup] Fetching profile from:', endpoint);
                const res = await apiClient.get(endpoint);
                console.log('[ProfileSetup] Profile loaded:', res.data);
                setProfile(res.data);
            } catch (err: any) {
                console.error('[ProfileSetup] Error loading profile:', err?.response?.status, err?.response?.data);
                // Set a safe default to avoid null crash
                setProfile(user?.role === 'student'
                    ? { education: '', skills: [], projects: [], certifications: [], resumeText: '', availability: '' }
                    : { companyName: '', website: '' }
                );
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchProfile();
    }, [user]);

    const handleResumeUploadSuccess = (parsedData: any) => {
        // Merge parsed data into existing profile
        const newProfile = { ...profile };

        if (parsedData.education) {
            newProfile.education = parsedData.education;
        }

        if (parsedData.skills && parsedData.skills.length > 0) {
            // Merge skills avoiding duplicates
            const existingSkillNames = new Set(newProfile.skills.map((s: any) => s.name.toLowerCase()));
            parsedData.skills.forEach((newSkill: any) => {
                if (!existingSkillNames.has(newSkill.name.toLowerCase())) {
                    newProfile.skills.push(newSkill);
                }
            });
        }

        if (parsedData.projects && parsedData.projects.length > 0) {
            // Add unique projects from resume
            parsedData.projects.forEach((newProject: any) => {
                if (!newProfile.projects.some((p: any) => p.title.toLowerCase() === newProject.title.toLowerCase())) {
                    newProfile.projects.push(newProject);
                }
            });
        }

        if (parsedData.rawText) {
            newProfile.resumeText = parsedData.rawText;
        }

        setProfile(newProfile);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const endpoint = user?.role === 'student' ? '/students/profile' : '/recruiters/profile';
            console.log('[ProfileSetup] Saving profile to:', endpoint, profile);
            await apiClient.put(endpoint, profile);
            alert('Profile updated successfully!');
        } catch (err: any) {
            console.error('[ProfileSetup] Save error:', err?.response?.status, err?.response?.data);
            alert('Update failed');
        } finally {
            setSaving(false);
        }
    };

    const updateSkill = (index: number, field: string, value: string) => {
        const newSkills = [...profile.skills];
        newSkills[index] = { ...newSkills[index], [field]: value };
        setProfile({ ...profile, skills: newSkills });
    };

    const addSkill = () => {
        setProfile({ ...profile, skills: [...profile.skills, { name: '', level: 'Beginner' }] });
    };

    const removeSkill = (index: number) => {
        setProfile({ ...profile, skills: profile.skills.filter((_: any, i: number) => i !== index) });
    };

    const addProject = () => {
        setProfile({ ...profile, projects: [...profile.projects, { title: '', description: '' }] });
    };


    if (loading) return <div className="loading-screen"><Loader2 className="spinner" /></div>;
    if (!profile) return <div className="loading-screen">Could not load profile. Please refresh.</div>;

    return (
        <div className="min-h-screen">
            <Navbar />

            <main className="max-w-5xl mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                    <div className="flex-1 w-full">
                        <ProfileHeader
                            name={user?.name || ''}
                            education={profile.education}
                            email={user?.email}
                            role={user?.role || 'Student'}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-8">
                    {/* Header Action / Save Button Floating or Top? 
                        Let's put a premium sticky save bar or just a nice top action */}
                    <div className="flex justify-end mb-4">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleSave}
                            className="bg-primary-600 hover:bg-primary-500 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-3 shadow-lg shadow-primary-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={saving}
                        >
                            {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                            <span>Save Profile</span>
                        </motion.button>
                    </div>

                    {user?.role === 'student' && (
                        <div className="mb-4">
                            <ResumeUpload onUploadSuccess={handleResumeUploadSuccess} />
                        </div>
                    )}

                    {/* Basic Info */}
                    <GlassCard>
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-white">
                            <User className="text-primary-400" size={20} />
                            <span>Account Details</span>
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-400 ml-1">Full Name</label>
                                <input className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-slate-300 focus:outline-none opacity-70 cursor-not-allowed" value={user?.name} disabled />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-400 ml-1">Email Address</label>
                                <input className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-slate-300 focus:outline-none opacity-70 cursor-not-allowed" value={user?.email} disabled />
                            </div>
                        </div>

                        <div className="mt-6">
                            {user?.role === 'student' ? (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-400 ml-1">Education Summary</label>
                                    <input
                                        className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 transition-all outline-none"
                                        placeholder="e.g. B.Tech in Computer Science – VIT (2025)"
                                        value={profile.education || ''}
                                        onChange={e => setProfile({ ...profile, education: e.target.value })}
                                    />
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-400 ml-1">Company Name</label>
                                        <input className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 transition-all outline-none" value={profile.companyName} onChange={e => setProfile({ ...profile, companyName: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-400 ml-1">Website URL</label>
                                        <input className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 transition-all outline-none" value={profile.website || ''} onChange={e => setProfile({ ...profile, website: e.target.value })} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </GlassCard>

                    {user?.role === 'student' && (
                        <>
                            {/* Skills Section */}
                            <section className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                        <Sparkles className="text-primary-400" size={24} />
                                        <span>Expertise & Skills</span>
                                    </h2>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={addSkill}
                                        className="bg-white/5 border border-white/10 text-primary-400 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-white/10 transition-all shadow-lg shadow-black/20"
                                    >
                                        <Plus size={18} /> Add New Skill
                                    </motion.button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <AnimatePresence mode="popLayout">
                                        {profile.skills.map((skill: any, idx: number) => (
                                            <div key={idx}>
                                                <SkillCard
                                                    name={skill.name}
                                                    level={skill.level}
                                                    onRemove={() => removeSkill(idx)}
                                                    onUpdate={(field, val) => updateSkill(idx, field, val)}
                                                />
                                            </div>
                                        ))}
                                    </AnimatePresence>
                                </div>

                                {profile.skills.length === 0 && (
                                    <GlassCard className="text-center py-12 border-dashed border-2 border-white/5">
                                        <div className="flex flex-col items-center gap-3 text-slate-500">
                                            <Briefcase size={40} className="mb-2 opacity-20" />
                                            <p className="font-medium">No skills added yet.</p>
                                            <p className="text-sm">Upload your resume or add skills manually to stand out to recruiters.</p>
                                        </div>
                                    </GlassCard>
                                )}
                            </section>

                            {/* Projects Section */}
                            <section className="space-y-6 pt-4">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                        <BookOpen className="text-primary-400" size={24} />
                                        <span>Featured Projects</span>
                                    </h2>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={addProject}
                                        className="bg-white/5 border border-white/10 text-primary-400 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-white/10 transition-all shadow-lg shadow-black/20"
                                    >
                                        <Plus size={18} /> Add Project
                                    </motion.button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <AnimatePresence mode="popLayout">
                                        {profile.projects.map((project: any, idx: number) => (
                                            <div key={idx}>
                                                <ProjectCard
                                                    title={project.title}
                                                    description={project.description}
                                                    technologies={project.technologies}
                                                    onRemove={() => {
                                                        const newProjects = profile.projects.filter((_: any, i: number) => i !== idx);
                                                        setProfile({ ...profile, projects: newProjects });
                                                    }}
                                                    onUpdate={(field, val) => {
                                                        const newProjects = [...profile.projects];
                                                        newProjects[idx] = { ...newProjects[idx], [field]: val };
                                                        setProfile({ ...profile, projects: newProjects });
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </AnimatePresence>
                                </div>

                                {profile.projects.length === 0 && (
                                    <GlassCard className="text-center py-12 border-dashed border-2 border-white/5">
                                        <div className="flex flex-col items-center gap-3 text-slate-500">
                                            <Code size={40} className="mb-2 opacity-20" />
                                            <p className="font-medium">Showcase your best work.</p>
                                            <p className="text-sm text-slate-600 max-w-xs mx-auto">Projects are the best way to prove your skills to recruiters. Click the button above to start adding!</p>
                                        </div>
                                    </GlassCard>
                                )}
                            </section>

                            {/* Resume Content (Modernized) */}
                            <GlassCard className="mt-8 border-dashed border-primary-500/20">
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-white">
                                    <MessageSquare className="text-primary-400" size={20} />
                                    <span>AI Resume Context</span>
                                </h2>
                                <div className="space-y-3">
                                    <p className="text-xs text-slate-400 ml-1">Your raw resume text helps our AI find the best internship matches for you.</p>
                                    <textarea
                                        className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-slate-400 text-xs focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500/50 transition-all outline-none min-h-[150px]"
                                        placeholder="Experience details, summaries, etc..."
                                        value={profile.resumeText || ''}
                                        onChange={e => setProfile({ ...profile, resumeText: e.target.value })}
                                    />
                                </div>
                            </GlassCard>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ProfileSetup;
