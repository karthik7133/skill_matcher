import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import Navbar from '../components/Navbar';
import MatchBadge from '../components/MatchBadge';
import { Plus, Users, Briefcase, ChevronRight, X, Loader2, BarChart3, CheckCircle2, XCircle, Clock, Inbox, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AuthenticityBadge from '../components/AuthenticityBadge';
import AuthenticityStatusBar from '../components/AuthenticityStatusBar';
import { useNotifications } from '../context/NotificationContext';

const RecruiterDashboard: React.FC = () => {
    const { markAllRead, notifications } = useNotifications();
    // Count only unread 'application_received' notifications for the badge
    const unreadAppCount = notifications.filter(n => n.type === 'application_received' && !n.isRead).length;
    const [activeTab, setActiveTab] = useState<'postings' | 'applications'>('postings');
    const [internships, setInternships] = useState<any[]>([]);
    const [allApplications, setAllApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [appError, setAppError] = useState<string | null>(null);
    const [showPostModal, setShowPostModal] = useState(false);
    const [selectedInternship, setSelectedInternship] = useState<any | null>(null);
    const [candidates, setCandidates] = useState<any[]>([]);
    const [candidateLoading, setCandidateLoading] = useState(false);
    const [authFilter, setAuthFilter] = useState<'all' | 'human' | 'ai'>('all');
    const [sortByAuth, setSortByAuth] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        company: '',
        requiredSkills: '',
        preferredSkills: '',
        minGPA: '',
        description: '',
        duration: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        await Promise.all([fetchInternships(), fetchAllApplications()]);
        setLoading(false);
    };

    const fetchInternships = async () => {
        try {
            // Use /mine to get only this recruiter's postings
            const res = await apiClient.get('/internships/mine');
            setInternships(res.data);
        } catch (err: any) {
            console.error('[RecruiterDashboard] Fetch internships error:', err.response?.data || err.message);
        }
    };

    const fetchAllApplications = async () => {
        try {
            setAppError(null);
            const res = await apiClient.get('/applications/recruiter-all');
            setAllApplications(res.data);
            console.log('[RecruiterDashboard] Applications fetched:', res.data.length);
        } catch (err: any) {
            const msg = err.response?.data?.message || err.message;
            console.error('[RecruiterDashboard] Fetch applications error:', msg);
            setAppError(msg);
        }
    };

    const handlePostInternship = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                requiredSkills: formData.requiredSkills.split(',').map(s => s.trim()).filter(Boolean),
                preferredSkills: formData.preferredSkills.split(',').map(s => s.trim()).filter(Boolean),
                minGPA: parseFloat(formData.minGPA) || 0
            };
            await apiClient.post('/internships', payload);
            setShowPostModal(false);
            setFormData({ title: '', company: '', requiredSkills: '', preferredSkills: '', minGPA: '', description: '', duration: '' });
            fetchInternships();
        } catch (err: any) {
            console.error('[RecruiterDashboard] Post internship error:', err.response?.data || err.message);
        }
    };

    const updateStatus = async (applicationId: string, status: 'shortlisted' | 'rejected') => {
        try {
            await apiClient.put(`/applications/${applicationId}/status`, { status });
            setAllApplications(prev => prev.map(app => app._id === applicationId ? { ...app, status } : app));
        } catch (err: any) {
            console.error('[RecruiterDashboard] Update status error:', err.response?.data || err.message);
        }
    };

    const viewCandidates = async (id: string) => {
        setCandidateLoading(true);
        const internship = internships.find(i => i._id === id);
        setSelectedInternship(internship);
        try {
            const res = await apiClient.get(`/match/candidates/${id}`);
            setCandidates(res.data);
            markAllRead(id);
            // Re-fetch after 8s to pick up background AI authenticity analysis
            setTimeout(async () => {
                try {
                    const refreshed = await apiClient.get(`/match/candidates/${id}`);
                    setCandidates(refreshed.data);
                } catch (_) { /* fail silently */ }
            }, 8000);
        } catch (err: any) {
            console.error('[RecruiterDashboard] Candidates error:', err.response?.data || err.message);
            setCandidates([]);
        } finally {
            setCandidateLoading(false);
        }
    };

    const getFilteredCandidates = (items: any[]) => {
        let filtered = [...items];

        if (authFilter === 'human') {
            filtered = filtered.filter(c => (c.student?.resumeAuthenticity?.humanProbability || 0) > 70);
        } else if (authFilter === 'ai') {
            filtered = filtered.filter(c => (c.student?.resumeAuthenticity?.aiProbability || 0) > 70);
        }

        if (sortByAuth) {
            filtered.sort((a, b) => (b.student?.resumeAuthenticity?.humanProbability || 0) - (a.student?.resumeAuthenticity?.humanProbability || 0));
        }

        return filtered;
    };

    const getFilteredApplications = (items: any[]) => {
        let filtered = [...items];

        if (authFilter === 'human') {
            filtered = filtered.filter(app => (app.studentId?.resumeAuthenticity?.humanProbability || 0) > 70);
        } else if (authFilter === 'ai') {
            filtered = filtered.filter(app => (app.studentId?.resumeAuthenticity?.aiProbability || 0) > 70);
        }

        if (sortByAuth) {
            filtered.sort((a, b) => (b.studentId?.resumeAuthenticity?.humanProbability || 0) - (a.studentId?.resumeAuthenticity?.humanProbability || 0));
        }

        return filtered;
    };

    if (loading) {
        return (
            <div className="mesh-gradient min-h-screen flex items-center justify-center">
                <Navbar />
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-primary-500" size={48} />
                    <p className="text-slate-400">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="mesh-gradient min-h-screen">
            <Navbar />

            <main className="max-w-7xl mx-auto px-6 pt-32 pb-12">
                <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-extrabold text-white mb-2">Recruiter Dashboard</h1>
                        <p className="text-slate-400">Manage your postings and review potential matches.</p>
                    </div>
                    <div className="flex bg-white/5 border border-white/10 p-1.5 rounded-2xl">
                        <button
                            onClick={() => setActiveTab('postings')}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'postings' ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'text-slate-400 hover:text-white'}`}
                        >
                            My Postings
                        </button>
                        <button
                            onClick={() => { setActiveTab('applications'); fetchAllApplications(); markAllRead(); }}
                            className={`relative px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'applications' ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'text-slate-400 hover:text-white'}`}
                        >
                            Applicant Requests
                            {unreadAppCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full text-[10px] font-black text-white flex items-center justify-center animate-pulse">
                                    {unreadAppCount}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Filter Controls */}
                    <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-2 rounded-2xl">
                        <div className="flex items-center gap-2 px-3 py-1 border-r border-white/10">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Trust Filter:</span>
                            <select
                                value={authFilter}
                                onChange={(e) => setAuthFilter(e.target.value as any)}
                                className="bg-transparent text-xs font-bold text-white outline-none cursor-pointer"
                            >
                                <option value="all" className="bg-slate-900">All</option>
                                <option value="human" className="bg-slate-900 text-emerald-400">Likely Human</option>
                                <option value="ai" className="bg-slate-900 text-rose-400">High AI Prob</option>
                            </select>
                        </div>
                        <button
                            onClick={() => setSortByAuth(!sortByAuth)}
                            className={`flex items-center gap-2 px-3 py-1 rounded-xl transition-all ${sortByAuth ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' : 'text-slate-500 hover:text-white'}`}
                        >
                            <span className="text-[10px] font-bold uppercase tracking-widest">Sort by Authenticity</span>
                        </button>
                    </div>
                </header>

                <AnimatePresence mode="wait">
                    {activeTab === 'postings' ? (
                        <motion.div
                            key="postings"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
                        >
                            {/* Postings List */}
                            <div className={selectedInternship ? "lg:col-span-4" : "lg:col-span-12"}>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-white flex items-center gap-3">
                                        <Briefcase className="text-primary-400" size={22} />
                                        Your Internship Postings
                                    </h2>
                                    <button
                                        onClick={() => setShowPostModal(true)}
                                        className="btn-primary flex items-center gap-2 !w-fit !py-2 !px-4 !text-sm"
                                    >
                                        <Plus size={18} /> New Posting
                                    </button>
                                </div>

                                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-1">
                                    {loading ? (
                                        // Skeleton placeholders
                                        Array.from({ length: 3 }).map((_, i) => (
                                            <div key={i} className="glass-dark p-5 rounded-2xl border border-white/5 animate-pulse">
                                                <div className="flex justify-between">
                                                    <div className="flex-1">
                                                        <div className="h-5 bg-white/5 rounded-full w-3/4 mb-2" />
                                                        <div className="h-3 bg-white/5 rounded-full w-1/2 mb-1" />
                                                        <div className="h-3 bg-white/5 rounded-full w-1/3" />
                                                    </div>
                                                    <div className="h-5 w-5 bg-white/5 rounded-full" />
                                                </div>
                                            </div>
                                        ))
                                    ) : internships.map(internship => (
                                        <motion.div
                                            key={internship._id}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => viewCandidates(internship._id)}
                                            className={`glass-dark p-5 rounded-2xl cursor-pointer border transition-all group ${selectedInternship?._id === internship._id ? 'border-primary-500/50 bg-primary-500/5' : 'border-white/5 hover:border-white/10'}`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-bold text-lg text-white group-hover:text-primary-400 transition-colors">{internship.title}</h3>
                                                    <p className="text-xs text-slate-500 mt-1">{internship.company} • {internship.duration}</p>
                                                    <p className="text-[10px] text-slate-600 mt-1 uppercase tracking-wider font-bold">Posted {new Date(internship.createdAt).toLocaleDateString()}</p>
                                                </div>
                                                <ChevronRight className={`text-slate-600 group-hover:text-primary-400 transition-all ${selectedInternship?._id === internship._id ? 'rotate-90' : ''}`} />
                                            </div>
                                        </motion.div>
                                    ))}
                                    {internships.length === 0 && (
                                        <div className="glass-dark p-12 rounded-3xl border border-dashed border-white/10 flex flex-col items-center text-center">
                                            <Briefcase className="text-slate-700 mb-4" size={48} />
                                            <p className="text-slate-500 font-medium">No internships posted yet.</p>
                                            <button onClick={() => setShowPostModal(true)} className="text-primary-400 text-sm font-bold mt-2 hover:underline">Create your first posting</button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Candidate View */}
                            {selectedInternship && (
                                <div className="lg:col-span-8">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-bold text-white flex items-center gap-3">
                                            <Users className="text-emerald-400" size={22} />
                                            Top Matches for {selectedInternship.title}
                                        </h2>
                                        <button onClick={() => { setSelectedInternship(null); setCandidates([]); }} className="text-slate-500 hover:text-white transition-colors"><X size={24} /></button>
                                    </div>

                                    {candidateLoading ? (
                                        <div className="glass-dark p-24 rounded-3xl flex items-center justify-center">
                                            <Loader2 className="animate-spin text-primary-500" size={40} />
                                        </div>
                                    ) : (
                                        <div className="grid gap-6">
                                            {getFilteredCandidates(candidates).map((candidate: any) => (
                                                <div key={candidate.student?._id} className="glass-dark p-6 rounded-3xl border border-white/5 hover:border-white/10 transition-all">
                                                    <div className="flex flex-col md:flex-row justify-between gap-6 mb-6">
                                                        <div className="flex gap-4">
                                                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary-500/20">
                                                                {candidate.student?.userId?.name?.charAt(0) ?? '?'}
                                                            </div>
                                                            <div>
                                                                <h3 className="text-xl font-bold text-white">{candidate.student?.userId?.name ?? 'Unknown'}</h3>
                                                                <p className="text-slate-400 text-sm">{candidate.student?.userId?.email ?? ''}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <div className="text-right hidden sm:block">
                                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">AI MATCH SCORE</p>
                                                                <div className="flex flex-col items-end gap-2">
                                                                    <MatchBadge score={candidate.matchScore} size="lg" />
                                                                    <AuthenticityBadge data={candidate.student?.resumeAuthenticity} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {candidate.explanation && (
                                                        <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-5 mb-6">
                                                            <div className="flex items-center gap-2 mb-3">
                                                                <BarChart3 size={18} className="text-primary-400" />
                                                                <span className="text-sm font-bold text-white">Match Intelligence</span>
                                                            </div>
                                                            <p className="text-sm text-slate-300 leading-relaxed italic">"{candidate.explanation}"</p>
                                                            <AuthenticityStatusBar
                                                                data={candidate.student?.resumeAuthenticity}
                                                                hasResumeText={!!(candidate.student?.resumeText)}
                                                            />
                                                        </div>
                                                    )}

                                                    <div className="flex flex-wrap gap-2">
                                                        {(candidate.student?.skills ?? []).map((s: any, idx: number) => (
                                                            <span key={idx} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                                                {s.name} • {s.level}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                            {candidates.length === 0 && (
                                                <div className="glass-dark p-20 rounded-3xl flex flex-col items-center text-center">
                                                    <Users className="text-slate-800 mb-4" size={48} />
                                                    <p className="text-slate-500">No applicants found for this position yet.</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="applications"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="grid gap-6"
                        >
                            {/* Error state */}
                            {appError && (
                                <div className="glass-dark p-6 rounded-2xl border border-rose-500/20 bg-rose-500/5 flex items-center gap-4">
                                    <AlertCircle className="text-rose-400 flex-shrink-0" size={24} />
                                    <div>
                                        <p className="text-rose-300 font-semibold">Error loading applications</p>
                                        <p className="text-rose-500/70 text-sm mt-1">{appError}</p>
                                    </div>
                                    <button onClick={fetchAllApplications} className="ml-auto text-rose-400 text-sm font-bold hover:text-rose-300">Retry</button>
                                </div>
                            )}

                            {allApplications.length === 0 && !appError ? (
                                <div className="glass-dark p-24 rounded-3xl flex flex-col items-center text-center border border-dashed border-white/10">
                                    <Inbox className="text-slate-800 mb-4" size={56} />
                                    <h3 className="text-xl font-bold text-slate-300">No Application Requests Yet</h3>
                                    <p className="text-slate-500 mt-2">When students apply to your postings, they'll appear here.</p>
                                </div>
                            ) : (
                                getFilteredApplications(allApplications).map(app => {
                                    // Safe access with optional chaining
                                    const studentName = app.studentId?.userId?.name ?? 'Unknown Student';
                                    const studentEmail = app.studentId?.userId?.email ?? '';
                                    const internshipTitle = app.internshipId?.title ?? 'Unknown Internship';
                                    const firstLetter = studentName.charAt(0).toUpperCase();

                                    return (
                                        <motion.div
                                            key={app._id}
                                            layout
                                            className="glass-dark p-6 rounded-3xl border border-white/5 hover:border-white/10 transition-all flex flex-col md:flex-row justify-between gap-6 relative overflow-hidden group"
                                        >
                                            {/* Status Indicator */}
                                            <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${app.status === 'shortlisted' ? 'bg-emerald-500' : app.status === 'rejected' ? 'bg-rose-500' : 'bg-primary-500'}`} />

                                            <div className="flex gap-5 flex-1 pl-2">
                                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500/30 to-purple-500/30 border border-white/10 flex items-center justify-center">
                                                    <span className="text-2xl font-bold text-white">{firstLetter}</span>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="text-lg font-bold text-white">{studentName}</h3>
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${app.status === 'shortlisted' ? 'bg-emerald-500/10 text-emerald-400' : app.status === 'rejected' ? 'bg-rose-500/10 text-rose-400' : 'bg-primary-500/10 text-primary-400'}`}>
                                                            {app.status}
                                                        </span>
                                                    </div>
                                                    {studentEmail && <p className="text-slate-500 text-xs mb-1">{studentEmail}</p>}
                                                    <p className="text-slate-400 text-sm mb-3">Applied for <span className="text-primary-400 font-semibold">{internshipTitle}</span></p>

                                                    <div className="flex flex-wrap gap-3 items-center">
                                                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                                                            <Clock size={14} />
                                                            {new Date(app.createdAt).toLocaleDateString()}
                                                        </div>
                                                        {app.score != null && (
                                                            <>
                                                                <div className="w-1 h-1 rounded-full bg-slate-700" />
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Match Score</span>
                                                                    <MatchBadge score={app.score} size="sm" />
                                                                </div>
                                                                <div className="w-1 h-1 rounded-full bg-slate-700" />
                                                                <AuthenticityBadge data={app.studentId?.resumeAuthenticity} />
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                {app.status === 'applied' ? (
                                                    <>
                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => updateStatus(app._id, 'shortlisted')}
                                                            className="px-5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold flex items-center gap-2 hover:bg-emerald-500/20 transition-all"
                                                        >
                                                            <CheckCircle2 size={18} /> Shortlist
                                                        </motion.button>
                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => updateStatus(app._id, 'rejected')}
                                                            className="px-5 py-2.5 rounded-xl bg-rose-500/5 border border-white/5 text-slate-400 text-sm font-bold flex items-center gap-2 hover:bg-rose-500/10 hover:text-rose-400 transition-all"
                                                        >
                                                            <XCircle size={18} /> Reject
                                                        </motion.button>
                                                    </>
                                                ) : (
                                                    <div className="text-slate-500 text-sm font-medium italic flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5">
                                                        Status: <span className="text-slate-300 capitalize not-italic font-bold">{app.status}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                })
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Post Internship Modal */}
                <AnimatePresence>
                    {showPostModal && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowPostModal(false)}
                                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="glass-dark w-full max-w-2xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden relative z-10"
                            >
                                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">Create New Posting</h2>
                                        <p className="text-slate-400 text-sm mt-1">Specify your requirements for the AI matching engine.</p>
                                    </div>
                                    <button onClick={() => setShowPostModal(false)} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-colors"><X size={24} /></button>
                                </div>

                                <form onSubmit={handlePostInternship} className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div className="form-group">
                                            <label>Internship Title</label>
                                            <input className="input-field" placeholder="Full Stack Developer" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
                                        </div>
                                        <div className="form-group">
                                            <label>Company Display Name</label>
                                            <input className="input-field" placeholder="TechCorp Solutions" value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })} required />
                                        </div>
                                    </div>

                                    <div className="form-group mb-6">
                                        <label>Required Skills <span className="text-slate-600">(comma separated)</span></label>
                                        <input className="input-field" placeholder="React, Node.js, TypeScript" value={formData.requiredSkills} onChange={e => setFormData({ ...formData, requiredSkills: e.target.value })} required />
                                    </div>

                                    <div className="form-group mb-6">
                                        <label>Preferred Skills <span className="text-slate-600">(comma separated, optional)</span></label>
                                        <input className="input-field" placeholder="Docker, AWS, MongoDB" value={formData.preferredSkills} onChange={e => setFormData({ ...formData, preferredSkills: e.target.value })} />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div className="form-group">
                                            <label>Minimum GPA</label>
                                            <input className="input-field" type="number" step="0.1" min="0" max="10" placeholder="3.5" value={formData.minGPA} onChange={e => setFormData({ ...formData, minGPA: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label>Duration</label>
                                            <input className="input-field" placeholder="3 Months" value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} required />
                                        </div>
                                    </div>

                                    <div className="form-group mb-8">
                                        <label>Job Description</label>
                                        <textarea
                                            className="input-field min-h-[120px]"
                                            placeholder="Describe the role, responsibilities, and specific requirements..."
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <button type="submit" className="btn-primary flex items-center justify-center gap-2">
                                        <Plus size={20} /> Publish Internship
                                    </button>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default RecruiterDashboard;
