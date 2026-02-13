import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { api } from '../../services/api';
import { ArrowLeft } from 'lucide-react';

interface ForgotPasswordProps {
    onNavigateLogin: () => void;
    onNavigateReset: (email: string) => void;
}

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onNavigateLogin, onNavigateReset }) => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await api.auth.forgotPassword(email);
            setSuccess('OTP sent successfully! Please check your email.');

            // In local dev, we might want to show the OTP or just auto-navigate
            // response.data.otp is typed as string | null but the API response wraps it
            // Let's rely on the user checking their email/logs for now, unless we want to auto-fill for convenience

            setTimeout(() => {
                onNavigateReset(email);
            }, 1500);

        } catch (err: any) {
            if (err.errors && err.errors.email) {
                setError(err.errors.email[0]);
            } else {
                setError(err.message || 'Failed to send OTP. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
                    <p className="mt-2 text-sm text-gray-600">
                        Enter your email to receive a reset code
                    </p>
                </CardHeader>
                <CardContent>
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded text-sm">
                                {success}
                            </div>
                        )}
                        <Input
                            label="Email address"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                        />

                        <Button type="submit" className="w-full" isLoading={isLoading}>
                            Send Reset Code
                        </Button>

                        <button
                            type="button"
                            onClick={onNavigateLogin}
                            className="w-full text-sm text-gray-500 hover:text-gray-900 flex items-center justify-center gap-2 mt-4"
                        >
                            <ArrowLeft className="h-4 w-4" /> Back to Login
                        </button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};
