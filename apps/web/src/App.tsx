import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginPage } from './pages/auth/login';
import { RegisterPage } from './pages/auth/register';
import { OAuthCallbackPage } from './pages/auth/oauth-callback';
import { DashboardLayout } from './pages/dashboard/layout';
import { DashboardPage } from './pages/dashboard/index';
import { useAuthStore } from './store/auth-store';
import { useEffect } from 'react';

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = () => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const checkAuth = useAuthStore((state) => state.checkAuth);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

function App() {
    const checkAuth = useAuthStore((state) => state.checkAuth);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    return (
        <QueryClientProvider client={queryClient}>
            <Router>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/oauth/callback" element={<OAuthCallbackPage />} />

                    <Route element={<ProtectedRoute />}>
                        <Route element={<DashboardLayout />}>
                            <Route path="/" element={<DashboardPage />} />
                            <Route path="/favorites" element={<DashboardPage filter="favorites" />} />
                            <Route path="/archive" element={<DashboardPage filter="archive" />} />
                            <Route path="/folder/:folderId" element={<DashboardPage />} />
                        </Route>
                    </Route>

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
                <Toaster />
            </Router>
        </QueryClientProvider>
    );
}

export default App;
