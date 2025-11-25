'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

export default function RegisterPage() {
    const { register, isLoading, error } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        name: '',
        role: 'Sales Agent' as 'CEO' | 'Co-Founder' | 'Sales Agent',
    });
    const [localError, setLocalError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);

        // Validation
        if (!formData.email || !formData.password || !formData.name) {
            setLocalError('Please fill in all fields');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setLocalError('Passwords do not match');
            return;
        }

        if (formData.password.length < 8) {
            setLocalError('Password must be at least 8 characters');
            return;
        }

        try {
            await register({
                email: formData.email,
                password: formData.password,
                name: formData.name,
                role: formData.role,
            });
        } catch (err) {
            setLocalError(err instanceof Error ? err.message : 'Registration failed');
        }
    };

    const roles: Array<'CEO' | 'Co-Founder' | 'Sales Agent'> = ['CEO', 'Co-Founder', 'Sales Agent'];

    return (
        <div className="flex min-h-screen items-center justify-center bg-black p-4">
            <Card className="w-full max-w-md border-cyan-500/20 bg-black">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-white">
                        Create Account
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                        Register a new user for Synops Labs Dashboard
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {(error || localError) && (
                            <Alert className="border-red-500/50 bg-red-500/10 text-red-400">
                                {error || localError}
                            </Alert>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-gray-300">
                                Full Name
                            </Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                disabled={isLoading}
                                className="border-cyan-500/30 bg-black/50 text-white placeholder:text-gray-500 focus:border-cyan-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-gray-300">
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                disabled={isLoading}
                                className="border-cyan-500/30 bg-black/50 text-white placeholder:text-gray-500 focus:border-cyan-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-gray-300">
                                Password
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                disabled={isLoading}
                                className="border-cyan-500/30 bg-black/50 text-white placeholder:text-gray-500 focus:border-cyan-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-gray-300">
                                Confirm Password
                            </Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                disabled={isLoading}
                                className="border-cyan-500/30 bg-black/50 text-white placeholder:text-gray-500 focus:border-cyan-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-gray-300">Role</Label>
                            <div className="flex gap-2">
                                {roles.map((role) => (
                                    <Badge
                                        key={role}
                                        onClick={() => !isLoading && setFormData({ ...formData, role })}
                                        className={`cursor-pointer transition-colors ${formData.role === role
                                                ? 'bg-cyan-500 text-black hover:bg-cyan-400'
                                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                            }`}
                                    >
                                        {role}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-cyan-500 text-black hover:bg-cyan-400"
                        >
                            {isLoading ? 'Creating account...' : 'Create Account'}
                        </Button>
                    </form>

                    <div className="mt-4 text-center text-sm text-gray-400">
                        <span className="text-yellow-500">⚠️</span> CEO approval required for access
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
