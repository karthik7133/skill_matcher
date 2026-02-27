import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Building, Loader2 } from 'lucide-react';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';

const Register: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'student' as 'student' | 'recruiter',
        companyName: '',
        website: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const payload = {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: formData.role,
            companyName: formData.companyName,
            website: formData.website
        };
        console.log('[Register] Submitting payload:', payload);

        try {
            const res = await apiClient.post('/auth/register', payload);
            console.log('[Register] Success:', res.data);
            await register(res.data.token);
            navigate('/');
        } catch (err: any) {
            const msg = err.response?.data?.message || err.response?.data || err.message || 'Registration failed';
            console.error('[Register] Error:', err.response?.status, err.response?.data);
            setError(String(msg));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>Join SkillMatcher</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Create your account to get started</p>
                </div>

                <div className="role-selector">
                    <button
                        type="button"
                        className={`role-btn ${formData.role === 'student' ? 'active' : ''}`}
                        onClick={() => setFormData({ ...formData, role: 'student' })}
                    >
                        I'm a Student
                    </button>
                    <button
                        type="button"
                        className={`role-btn ${formData.role === 'recruiter' ? 'active' : ''}`}
                        onClick={() => setFormData({ ...formData, role: 'recruiter' })}
                    >
                        I'm a Recruiter
                    </button>
                </div>

                {error && <div className="error-msg">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Full Name</label>
                        <div style={{ position: 'relative' }}>
                            <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="text"
                                className="input-field"
                                style={{ paddingLeft: '40px' }}
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="email"
                                className="input-field"
                                style={{ paddingLeft: '40px' }}
                                placeholder="name@company.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    {formData.role === 'recruiter' && (
                        <div className="form-group">
                            <label>Company Name</label>
                            <div style={{ position: 'relative' }}>
                                <Building size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    type="text"
                                    className="input-field"
                                    style={{ paddingLeft: '40px' }}
                                    placeholder="Acme Inc."
                                    value={formData.companyName}
                                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                    )}

                    <div className="form-group">
                        <label>Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="password"
                                className="input-field"
                                style={{ paddingLeft: '40px' }}
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? <Loader2 className="spinner" size={20} style={{ margin: '0 auto' }} /> : 'Create Account'}
                    </button>
                </form>

                <div className="auth-footer">
                    Already have an account? <Link to="/login">Sign in</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
