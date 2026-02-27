import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { User, BookOpen, MessageSquare, Briefcase, Plus, Trash2, Save, Loader2 } from 'lucide-react';

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

    const updateProject = (index: number, field: string, value: string) => {
        const newProjects = [...profile.projects];
        newProjects[index] = { ...newProjects[index], [field]: value };
        setProfile({ ...profile, projects: newProjects });
    };

    if (loading) return <div className="loading-screen"><Loader2 className="spinner" /></div>;
    if (!profile) return <div className="loading-screen">Could not load profile. Please refresh.</div>;

    return (
        <div style={{ background: 'var(--bg-dark)', minHeight: '100vh' }}>
            <Navbar />

            <main style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                    <header>
                        <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>Profile Settings</h1>
                        <p style={{ color: 'var(--text-muted)' }}>Complete your profile to improve your match accuracy.</p>
                    </header>
                    <button onClick={handleSave} className="btn-primary" disabled={saving} style={{ width: 'auto', padding: '0.75rem 2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {saving ? <Loader2 className="spinner" size={20} /> : <Save size={20} />} Save Changes
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Basic Info */}
                    <section className="auth-card" style={{ maxWidth: 'none' }}>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <User color="var(--primary)" size={18} /> Basic Information
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div className="form-group">
                                <label>Full Name</label>
                                <input className="input-field" value={user?.name} disabled />
                            </div>
                            <div className="form-group">
                                <label>Email Address</label>
                                <input className="input-field" value={user?.email} disabled />
                            </div>
                        </div>
                        {user?.role === 'student' ? (
                            <div className="form-group">
                                <label>Education</label>
                                <input
                                    className="input-field"
                                    placeholder="e.g. BS in Computer Science, MIT"
                                    value={profile.education || ''}
                                    onChange={e => setProfile({ ...profile, education: e.target.value })}
                                />
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div className="form-group">
                                    <label>Company Name</label>
                                    <input className="input-field" value={profile.companyName} onChange={e => setProfile({ ...profile, companyName: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Website URL</label>
                                    <input className="input-field" value={profile.website || ''} onChange={e => setProfile({ ...profile, website: e.target.value })} />
                                </div>
                            </div>
                        )}
                    </section>

                    {user?.role === 'student' && (
                        <>
                            {/* Skills */}
                            <section className="auth-card" style={{ maxWidth: 'none' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <Briefcase color="var(--accent)" size={18} /> My Skills
                                    </h2>
                                    <button onClick={addSkill} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                                        <Plus size={18} /> Add Skill
                                    </button>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {profile.skills.map((skill: any, idx: number) => (
                                        <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 150px 50px', gap: '1rem' }}>
                                            <input className="input-field" placeholder="Skill name" value={skill.name} onChange={e => updateSkill(idx, 'name', e.target.value)} />
                                            <select className="input-field" value={skill.level} onChange={e => updateSkill(idx, 'level', e.target.value)}>
                                                <option value="Beginner">Beginner</option>
                                                <option value="Intermediate">Intermediate</option>
                                                <option value="Advanced">Advanced</option>
                                            </select>
                                            <button onClick={() => removeSkill(idx)} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer' }}><Trash2 size={20} /></button>
                                        </div>
                                    ))}
                                    {profile.skills.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Add some skills to get better matches.</p>}
                                </div>
                            </section>

                            {/* Projects */}
                            <section className="auth-card" style={{ maxWidth: 'none' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <BookOpen color="var(--primary)" size={18} /> Projects
                                    </h2>
                                    <button onClick={addProject} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                                        <Plus size={18} /> Add Project
                                    </button>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    {profile.projects.map((project: any, idx: number) => (
                                        <div key={idx} style={{ padding: '1.5rem', background: '#0f172a', borderRadius: '1rem', border: '1px solid var(--border)', position: 'relative' }}>
                                            <button
                                                onClick={() => {
                                                    const newProjects = profile.projects.filter((_: any, i: number) => i !== idx);
                                                    setProfile({ ...profile, projects: newProjects });
                                                }}
                                                style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer' }}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                            <div className="form-group">
                                                <label>Project Title</label>
                                                <input className="input-field" placeholder="E-commerce App" value={project.title} onChange={e => updateProject(idx, 'title', e.target.value)} />
                                            </div>
                                            <div className="form-group" style={{ marginBottom: 0 }}>
                                                <label>Description</label>
                                                <textarea className="input-field" rows={2} placeholder="Briefly describe what you built..." value={project.description} onChange={e => updateProject(idx, 'description', e.target.value)} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Resume Text */}
                            <section className="auth-card" style={{ maxWidth: 'none' }}>
                                <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <MessageSquare color="var(--accent)" size={18} /> Resume Content
                                </h2>
                                <div className="form-group">
                                    <label>Paste your resume text here for AI scanning</label>
                                    <textarea
                                        className="input-field"
                                        rows={6}
                                        placeholder="Experience, summary, skills from your PDF/Word resume..."
                                        value={profile.resumeText || ''}
                                        onChange={e => setProfile({ ...profile, resumeText: e.target.value })}
                                    />
                                </div>
                            </section>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ProfileSetup;
