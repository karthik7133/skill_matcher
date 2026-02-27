import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import Navbar from '../components/Navbar';
import MatchBadge from '../components/MatchBadge';
import { Plus, Users, Briefcase, ChevronRight, X, Loader2, BarChart3 } from 'lucide-react';

const RecruiterDashboard: React.FC = () => {
    const [internships, setInternships] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showPostModal, setShowPostModal] = useState(false);
    const [selectedInternship, setSelectedInternship] = useState<any | null>(null);
    const [candidates, setCandidates] = useState<any[]>([]);
    const [candidateLoading, setCandidateLoading] = useState(false);

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
        fetchInternships();
    }, []);

    const fetchInternships = async () => {
        console.log('[RecruiterDashboard] Fetching internships...');
        try {
            const res = await apiClient.get('/internships');
            console.log('[RecruiterDashboard] Internships:', res.data);
            setInternships(res.data);
        } catch (err: any) {
            console.error('[RecruiterDashboard] Fetch internships error:', err?.response?.status, err?.response?.data);
        } finally {
            setLoading(false);
        }
    };

    const handlePostInternship = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                requiredSkills: formData.requiredSkills.split(',').map(s => s.trim()),
                preferredSkills: formData.preferredSkills.split(',').map(s => s.trim()),
                minGPA: parseFloat(formData.minGPA) || 0
            };
            console.log('[RecruiterDashboard] Posting internship payload:', payload);
            const res = await apiClient.post('/internships', payload); // baseURL already has /api
            console.log('[RecruiterDashboard] Post internship response:', res.data);
            setShowPostModal(false);
            setFormData({ title: '', company: '', requiredSkills: '', preferredSkills: '', minGPA: '', description: '', duration: '' });
            fetchInternships();
        } catch (err: any) {
            console.error('[RecruiterDashboard] Post internship error:', err?.response?.status, err?.response?.data);
        }
    };

    const viewCandidates = async (id: string) => {
        setCandidateLoading(true);
        const internship = internships.find(i => i._id === id);
        setSelectedInternship(internship);
        console.log('[RecruiterDashboard] Fetching ranked candidates for internship:', id);
        try {
            const res = await apiClient.get(`/match/candidates/${id}`);
            console.log('[RecruiterDashboard] Candidates:', res.data);
            setCandidates(res.data);
        } catch (err: any) {
            console.error('[RecruiterDashboard] Candidates error:', err?.response?.status, err?.response?.data);
        } finally {
            setCandidateLoading(false);
        }
    };

    if (loading) return <div className="loading-screen"><Loader2 className="spinner" /></div>;

    return (
        <div style={{ background: 'var(--bg-dark)', minHeight: '100vh' }}>
            <Navbar />

            <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                    <header>
                        <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>Recruiter Dashboard</h1>
                        <p style={{ color: 'var(--text-muted)' }}>Manage your internship postings and track top candidates.</p>
                    </header>
                    <button onClick={() => setShowPostModal(true)} className="btn-primary" style={{ width: 'auto', padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Plus size={20} /> Post Internship
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: selectedInternship ? '400px 1fr' : '1fr', gap: '2rem', transition: 'all 0.3s' }}>
                    {/* Postings List */}
                    <section>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Briefcase size={20} color="var(--primary)" /> My Postings
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {internships.map(internship => (
                                <div
                                    key={internship._id}
                                    className={`auth-card ${selectedInternship?._id === internship._id ? 'active' : ''}`}
                                    style={{
                                        maxWidth: 'none',
                                        padding: '1.25rem',
                                        cursor: 'pointer',
                                        borderColor: selectedInternship?._id === internship._id ? 'var(--primary)' : 'var(--border)'
                                    }}
                                    onClick={() => viewCandidates(internship._id)}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <h3 style={{ fontSize: '1.125rem' }}>{internship.title}</h3>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Posted on {new Date(internship.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <ChevronRight size={20} color="var(--text-muted)" />
                                    </div>
                                </div>
                            ))}
                            {internships.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No internships posted yet.</p>}
                        </div>
                    </section>

                    {/* Candidate View */}
                    {selectedInternship && (
                        <section>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <Users size={20} color="var(--accent)" /> Ranked Candidates for {selectedInternship.title}
                                </h2>
                                <button
                                    onClick={() => setSelectedInternship(null)}
                                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {candidateLoading ? (
                                <div style={{ textAlign: 'center', padding: '4rem' }}><Loader2 className="spinner" /></div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    {candidates.map(candidate => (
                                        <div key={candidate.student._id} className="auth-card" style={{ maxWidth: 'none', padding: '1.5rem', background: 'rgba(30, 41, 59, 0.5)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                                <div>
                                                    <h3 style={{ fontSize: '1.25rem' }}>{candidate.student.userId.name}</h3>
                                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{candidate.student.userId.email}</p>
                                                </div>
                                                <MatchBadge score={candidate.matchScore} size="lg" />
                                            </div>

                                            <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '1rem', border: '1px solid var(--border)', marginBottom: '1rem' }}>
                                                <p style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <BarChart3 size={16} color="var(--primary)" /> <strong>Match Reasoning:</strong>
                                                </p>
                                                <p style={{ fontSize: '0.875rem', color: 'var(--text-main)', marginTop: '0.5rem', lineHeight: '1.6' }}>
                                                    {candidate.explanation}
                                                </p>
                                            </div>

                                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                {candidate.student.skills.map((s: any, idx: number) => (
                                                    <span key={idx} style={{ padding: '4px 10px', background: 'var(--bg-dark)', borderRadius: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                                                        {s.name} ({s.level})
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                    {candidates.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem' }}>No candidates found for this matching criteria.</p>}
                                </div>
                            )}
                        </section>
                    )}
                </div>

                {/* Post Internship Modal */}
                {showPostModal && (
                    <div style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '1rem'
                    }}>
                        <div className="auth-card" style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                <h2>Post New Internship</h2>
                                <button onClick={() => setShowPostModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={24} /></button>
                            </div>

                            <form onSubmit={handlePostInternship}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="form-group">
                                        <label>Internship Title</label>
                                        <input className="input-field" placeholder="Full Stack Developer" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Company Display Name</label>
                                        <input className="input-field" placeholder="Your Company" value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })} required />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Required Skills (Comma separated)</label>
                                    <input className="input-field" placeholder="React, Node.js, TypeScript" value={formData.requiredSkills} onChange={e => setFormData({ ...formData, requiredSkills: e.target.value })} required />
                                </div>

                                <div className="form-group">
                                    <label>Preferred Skills (Comma separated)</label>
                                    <input className="input-field" placeholder="Docker, AWS, MongoDB" value={formData.preferredSkills} onChange={e => setFormData({ ...formData, preferredSkills: e.target.value })} />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="form-group">
                                        <label>Minimum GPA</label>
                                        <input className="input-field" type="number" step="0.1" placeholder="3.5" value={formData.minGPA} onChange={e => setFormData({ ...formData, minGPA: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>Duration (e.g., 3 Months)</label>
                                        <input className="input-field" placeholder="3 Months" value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} required />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Job Description</label>
                                    <textarea
                                        className="input-field"
                                        rows={4}
                                        placeholder="Describe the role, responsibilities, and requirements..."
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        required
                                        style={{ minHeight: '100px', resize: 'vertical' }}
                                    />
                                </div>

                                <button type="submit" className="btn-primary">Publish Posting</button>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default RecruiterDashboard;
