export interface User {
    _id: string;
    name: string;
    email: string;
    role: 'student' | 'recruiter' | 'admin';
    createdAt: string;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    loading: boolean;
}
