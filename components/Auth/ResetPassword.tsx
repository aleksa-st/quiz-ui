import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { api } from '../../services/api';
import { ArrowLeft } from 'lucide-react';

interface ResetPasswordProps {
    email: string;
    onNavigateLogin: () => void;
}

export const ResetPassword: React.FC<ResetPasswordProps> = ({ email, onNavigateLogin }) => {
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            setIsLoading(false);
            return;
        }

        try {
            await api.auth.resetPassword({
                email,
                otp,
                password,
                password_confirmation: confirmPassword
            });
            setSuccess('Password reset successfully! Redirecting to login...');

            setTimeout(() => {
                onNavigateLogin();
            }, 2000);

        } catch (err: any) {
            setError(err.message || 'Failed to reset password.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
                    <p className="mt-2 text-sm text-gray-600">
                        Enter the OTP sent to {email}
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
                            label="OTP Code"
                            type="text"
                            required
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="123456"
                        />

                        <Input
                            label="New Password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />

                        <Input
                            label="Confirm Password"
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                        />

                        <Button type="submit" className="w-full" isLoading={isLoading}>
                            Reset Password
                        </Button>

                        <button
                            type="button"
                            onClick={onNavigateLogin}
                            className="w-full text-sm text-gray-500 hover:text-gray-900 flex items-center justify-center gap-2 mt-4"
                        >
                            <ArrowLeft className="h-4 w-4" /> Cancel
                        </button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};
