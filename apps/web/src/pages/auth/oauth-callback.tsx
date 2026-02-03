import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../store/auth-store';

export const OAuthCallbackPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setAuth);

    useEffect(() => {
        const accessToken = searchParams.get('accessToken');
        const refreshToken = searchParams.get('refreshToken');
        const userId = searchParams.get('userId');

        if (accessToken && refreshToken && userId) {
            setAuth(accessToken, refreshToken, { id: userId, email: '', name: '' });
            navigate('/');
        } else {
            navigate('/login');
        }
    }, [searchParams, setAuth, navigate]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    );
};
