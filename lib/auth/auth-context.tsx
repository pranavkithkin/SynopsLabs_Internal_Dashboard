'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from './auth-service';
import type { AuthContextType, User, LoginCredentials, RegisterData } from './types';
import { useChatState } from '@/components/chat/use-chat-state';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const { loadUserConversations, clearUserConversations } = useChatState();

    // Initialize auth state on mount
    useEffect(() => {
        const initAuth = async () => {
            const accessToken = AuthService.getAccessToken();

            if (!accessToken) {
                setIsLoading(false);
                return;
            }

            // Restore cached user immediately for instant UI restoration
            const cachedUser = AuthService.getUser();
            if (cachedUser) {
                setUser(cachedUser);
                setIsLoading(false);
            }

            // Check if token is expired
            if (AuthService.isTokenExpired(accessToken)) {
                try {
                    await refreshToken();
                } catch {
                    AuthService.clearTokens();
                    AuthService.clearUser();
                    setUser(null);
                    setIsLoading(false);
                }
                return;
            }

            // Validate and refresh user data from API in background
            try {
                const userData = await AuthService.getCurrentUser();
                setUser(userData);
            } catch (err) {
                console.error('Failed to fetch user:', err);
                AuthService.clearTokens();
                AuthService.clearUser();
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        initAuth();
    }, []);

    // Auto-refresh token before expiry
    useEffect(() => {
        if (!user) return;

        const checkTokenRefresh = setInterval(async () => {
            const accessToken = AuthService.getAccessToken();

            if (accessToken && AuthService.shouldRefreshToken(accessToken)) {
                try {
                    await refreshToken();
                } catch (err) {
                    console.error('Auto token refresh failed:', err);
                    await logout();
                }
            }
        }, 60000); // Check every minute

        return () => clearInterval(checkTokenRefresh);
    }, [user]);

    const login = useCallback(async (credentials: LoginCredentials) => {
        setIsLoading(true);
        setError(null);

        try {
            const { user: userData, tokens } = await AuthService.login(credentials);
            AuthService.setTokens(tokens);
            setUser(userData);

            // Load user-specific chat history
            loadUserConversations(userData.email);

            router.push('/');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Login failed';
            setError(message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [router, loadUserConversations]);

    const register = useCallback(async (data: RegisterData) => {
        setIsLoading(true);
        setError(null);

        try {
            const { user: userData, tokens } = await AuthService.register(data);
            AuthService.setTokens(tokens);
            setUser(userData);
            router.push('/');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Registration failed';
            setError(message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [router]);

    const logout = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            await AuthService.logout();

            // Clear chat history for this user
            clearUserConversations();

            setUser(null);
            router.push('/login');
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            setIsLoading(false);
        }
    }, [router, clearUserConversations]);

    const refreshToken = useCallback(async () => {
        try {
            const tokens = await AuthService.refreshAccessToken();
            AuthService.setTokens(tokens);

            // Fetch updated user profile
            const userData = await AuthService.getCurrentUser();
            setUser(userData);
        } catch (err) {
            console.error('Token refresh failed:', err);
            throw err;
        }
    }, []);

    const value: AuthContextType = {
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        login,
        logout,
        register,
        refreshToken,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
}
