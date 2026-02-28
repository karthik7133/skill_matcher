import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import MatchBadge from '../components/MatchBadge';
import Navbar from '../components/Navbar';
import { Clock, Brain, CheckCircle, Info, Loader2 } from 'lucide-react';
import CareerAssistant from '../components/CareerAssistant';

const StudentDashboard: React.FC = () => {
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showExplanation, setShowExplanation] = useState<{ open: boolean; text: string; score: number } | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                console.log('[StudentDashboard] Fetching recommendations and applications...');
                const [recsRes, appsRes] = await Promise.all([
                    apiClient.get('/match/recommendations'),
                    apiClient.get('/applications/student')  // baseURL already has /api
                ]);
                console.log('[StudentDashboard] Recommendations:', recsRes.data);
                console.log('[StudentDashboard] Applications:', appsRes.data);
                setRecommendations(recsRes.data);
                setApplications(appsRes.data);
            } catch (err: any) {
                console.error('[StudentDashboard] Fetch error:', err?.response?.status, err?.response?.data);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleApply = async (internshipId: string) => {
        console.log('[StudentDashboard] Applying to internship:', internshipId);
        try {
            const res = await apiClient.post(`/applications/apply/${internshipId}`);
            console.log('[StudentDashboard] Apply response:', res.data);
            // Refresh applications
            const appsRes = await apiClient.get('/applications/student');
            setApplications(appsRes.data);
        } catch (err: any) {
            console.error('[StudentDashboard] Apply error:', err?.response?.status, err?.response?.data);
            alert(err.response?.data?.message || 'Application failed');
        }
    };

    if (loading) return <div className="loading-screen"><Loader2 className="spinner" /></div>;

    const isApplied = (id: string) => applications.some(app => app.internshipId._id === id);

    return (
        <div style={{ background: 'var(--bg-dark)', minHeight: '100vh' }}>
            <Navbar />

            <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
                <header style={{ marginBottom: '2.5rem' }}>
                    <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>Internship Explorer</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Intelligently matched opportunities based on your profile.</p>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
                    {/* Main List */}
                    <section>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {recommendations.length > 0 ? recommendations.map((rec) => (
                                <div key={rec.internship._id} className="auth-card" style={{ maxWidth: 'none', padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                        <div>
                                            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{rec.internship.title}</h3>
                                            <p style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.875rem' }}>{rec.internship.company}</p>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <MatchBadge score={rec.matchScore} />
                                            <button
                                                onClick={() => setShowExplanation({ open: true, text: rec.explanation, score: rec.matchScore })}
                                                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                                            >
                                                <Info size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {rec.internship.description}
                                    </p>

                                    <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            <Clock size={14} /> {rec.internship.duration}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            <Brain size={14} /> {rec.internship.requiredSkills.slice(0, 3).join(', ')}
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Posted {new Date(rec.internship.createdAt).toLocaleDateString()}</span>

                                        {isApplied(rec.internship._id) ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)', fontWeight: 600 }}>
                                                <CheckCircle size={18} /> Applied
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleApply(rec.internship._id)}
                                                className="btn-primary"
                                                style={{ padding: '0.5rem 1.5rem', fontSize: '0.875rem', width: 'auto' }}
                                            >
                                                Apply Now
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )) : (
                                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                                    No recommendation found yet. Try posting internships as recruiter or check student profile.
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Sidebar / Applications */}
                    <aside>
                        <div className="auth-card" style={{ maxWidth: 'none', padding: '1.5rem', position: 'sticky', top: '100px' }}>
                            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>My Applications</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {applications.length > 0 ? applications.map(app => (
                                    <div key={app._id} style={{ padding: '1rem', background: '#0f172a', borderRadius: '1rem', border: '1px solid var(--border)' }}>
                                        <h4 style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>{app.internshipId?.title}</h4>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Score: {app.score}%</span>
                                            <span style={{
                                                fontSize: '0.75rem',
                                                padding: '2px 8px',
                                                borderRadius: '1rem',
                                                background: 'rgba(99, 102, 241, 0.1)',
                                                color: 'var(--primary)',
                                                textTransform: 'capitalize'
                                            }}>
                                                {app.status}
                                            </span>
                                        </div>
                                    </div>
                                )) : (
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>You haven't applied to any internships yet.</p>
                                )}
                            </div>
                        </div>
                    </aside>
                </div>

                {/* Match Explanation Modal */}
                {showExplanation && showExplanation.open && (
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
                        <div className="auth-card" style={{ maxWidth: '500px' }}>
                            <h2 style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                <Brain color="var(--primary)" /> Match Insight
                            </h2>
                            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                                <MatchBadge score={showExplanation.score} size="lg" />
                            </div>
                            <p style={{ lineHeight: '1.6', color: 'var(--text-main)', marginBottom: '2rem' }}>
                                {showExplanation.text}
                            </p>
                            <button
                                className="btn-primary"
                                onClick={() => setShowExplanation(null)}
                            >
                                Got it
                            </button>
                        </div>
                    </div>
                )}
            </main>
            <CareerAssistant />
        </div>
    );
};

export default StudentDashboard;
