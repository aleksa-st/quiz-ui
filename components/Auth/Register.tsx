import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { api } from '../../services/api';
import { User } from '../../types';

interface RegisterProps {
  onRegisterSuccess: (token: string, user: User) => void;
  onNavigateLogin: () => void;
}

export const Register: React.FC<RegisterProps> = ({ onRegisterSuccess, onNavigateLogin }) => {
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.auth.register(formData);
      if (response.success && response.data) {
        onRegisterSuccess(response.data.token, response.data.user);
      } else {
        setError(response.message || 'Registration failed');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Create your account</CardTitle>
          <p className="mt-2 text-sm text-gray-600">
            Start creating and taking quizzes today
          </p>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                {error}
              </div>
            )}
            <Input
              label="Full Name"
              name="fullName"
              required
              value={formData.fullName}
              onChange={handleChange}
            />
            <Input
              label="Email address"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
            />
            <Input
              label="Password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
            />
            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
            />

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Create account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <button onClick={onNavigateLogin} className="font-medium text-violet-600 hover:text-violet-500">
              Sign in
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

