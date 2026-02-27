import React, { createContext, useState, useEffect, useContext } from 'react';
import apiClient from '../api/client';
import type { AuthState } from '../types';

interface AuthContextType extends AuthState {
    login: (token: string) => Promise<void>;
    register: (token: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = useState<AuthState>({
        user: null,
        token: localStorage.getItem('token'),
        isAuthenticated: false,
        loading: true,
    });

    const loadUser = async () => {
        if (localStorage.getItem('token')) {
            try {
                const res = await apiClient.get('/auth/me');
                setState(prev => ({
                    ...prev,
                    user: res.data,
                    isAuthenticated: true,
                    loading: false,
                }));
            } catch (err) {
                localStorage.removeItem('token');
                setState(prev => ({
                    ...prev,
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    loading: false,
                }));
            }
        } else {
            setState(prev => ({ ...prev, loading: false }));
        }
    };

    useEffect(() => {
        loadUser();
    }, []);

    const login = async (token: string) => {
        localStorage.setItem('token', token);
        setState(prev => ({ ...prev, token, loading: true }));
        await loadUser();
    };

    const register = async (token: string) => {
        localStorage.setItem('token', token);
        setState(prev => ({ ...prev, token, loading: true }));
        await loadUser();
    };

    const logout = () => {
        localStorage.removeItem('token');
        setState({
            user: null,
            token: null,
            isAuthenticated: false,
            loading: false,
        });
    };

    return (
        <AuthContext.Provider value={{ ...state, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
