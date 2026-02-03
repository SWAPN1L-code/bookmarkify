import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/api';

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    organizationId: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    login: (data: any) => Promise<void>;
    register: (data: any) => Promise<void>;
    logout: () => void;
    checkAuth: () => boolean;
    setAuth: (accessToken: string, refreshToken: string, user: any) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            login: async (credentials) => {
                const { data } = await api.post('/auth/login', credentials);
                localStorage.setItem('accessToken', data.accessToken);
                localStorage.setItem('refreshToken', data.refreshToken);
                set({ user: data.user, isAuthenticated: true });
            },
            register: async (credentials) => {
                const { data } = await api.post('/auth/signup', credentials);
                localStorage.setItem('accessToken', data.accessToken);
                localStorage.setItem('refreshToken', data.refreshToken);
                set({ user: data.user, isAuthenticated: true });
            },
            logout: () => {
                localStorage.clear(); // Clear everything
                set({ user: null, isAuthenticated: false });
                window.location.href = '/login'; // Force full reload to login page
            },
            checkAuth: () => {
                const token = localStorage.getItem('accessToken');
                const isAuthenticated = !!token;
                set({ isAuthenticated });
                return isAuthenticated;
            },
            setAuth: (accessToken, refreshToken, user) => {
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);
                set({ user, isAuthenticated: true });
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
        }
    )
);
