'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';

export default function LoginPage() {
    const { login, isLoading, error } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [localError, setLocalError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);

        if (!email || !password) {
            setLocalError('Please enter both email and password');
            return;
        }

        try {
            await login({ email, password });
        } catch (err) {
            setLocalError(err instanceof Error ? err.message : 'Login failed');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-black p-4">
            <Card className="w-full max-w-md border-cyan-500/20 bg-black">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-white">
                        Synops Labs Dashboard
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                        Enter your credentials to access the dashboard
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
                            <Label htmlFor="email" className="text-gray-300">
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
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
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isLoading}
                                className="border-cyan-500/30 bg-black/50 text-white placeholder:text-gray-500 focus:border-cyan-500"
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-cyan-500 text-black hover:bg-cyan-400"
                        >
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </Button>
                    </form>

                    <div className="mt-4 text-center text-sm text-gray-400">
                        Need access? Contact your administrator
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
