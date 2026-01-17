import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { User } from '../../types';

interface GoogleCallbackProps {
    onLoginSuccess: (token: string, user: User) => void;
    onNavigateLogin: () => void;
}

export const GoogleCallback: React.FC<GoogleCallbackProps> = ({ onLoginSuccess, onNavigateLogin }) => {
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const processCallback = async () => {
            try {
                // Get params from hash (format: #google-callback?token=...&user_id=...)
                // or query string if hash routing wasn't used strictly
                const hash = window.location.hash;
                const queryString = hash.split('?')[1] || window.location.search.replace('?', '');
                const urlParams = new URLSearchParams(queryString);

                const token = urlParams.get('token');
                const errorParam = urlParams.get('error');
                const messageParam = urlParams.get('message');

                if (errorParam) {
                    throw new Error(decodeURIComponent(messageParam || 'Google authentication failed'));
                }

                if (token) {
                    // Validate token and get user details
                    // We manually set the token first so the validate call works
                    localStorage.setItem('auth_token', token);

                    const response = await api.auth.validateToken();

                    if (response.success && response.data) {
                        onLoginSuccess(token, response.data);
                    } else {
                        throw new Error('Failed to validate session');
                    }
                } else {
                    // If no token and no error, maybe just landed here?
                    throw new Error('No authentication token received');
                }

            } catch (err: any) {
                console.error('Google login error:', err);
                setError(err.message || 'Authentication failed');
                // Clear potential bad token
                localStorage.removeItem('auth_token');
                // Redirect to login after a delay
                setTimeout(onNavigateLogin, 3000);
            }
        };

        processCallback();
    }, [onLoginSuccess, onNavigateLogin]);

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-red-100 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Login Failed</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={onNavigateLogin}
                        className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors"
                    >
                        Return to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                <h2 className="text-xl font-bold text-gray-900">Completing login...</h2>
                <p className="text-gray-500">Please wait while we verify your account.</p>
            </div>
        </div>
    );
};
