import type { LoginCredentials, RegisterData, AuthTokens, User } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Token storage keys
const ACCESS_TOKEN_KEY = 'auth_access_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';
const USER_DATA_KEY = 'auth_user_data';

export class AuthService {
    // Store tokens in localStorage
    static setTokens(tokens: AuthTokens): void {
        if (typeof window !== 'undefined') {
            localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
            localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
        }
    }

    // Get access token
    static getAccessToken(): string | null {
        if (typeof window !== 'undefined') {
            return localStorage.getItem(ACCESS_TOKEN_KEY);
        }
        return null;
    }

    // Get refresh token
    static getRefreshToken(): string | null {
        if (typeof window !== 'undefined') {
            return localStorage.getItem(REFRESH_TOKEN_KEY);
        }
        return null;
    }

    // Clear all tokens
    static clearTokens(): void {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(ACCESS_TOKEN_KEY);
            localStorage.removeItem(REFRESH_TOKEN_KEY);
        }
    }

    // Store user data in localStorage
    static setUser(user: User): void {
        if (typeof window !== 'undefined') {
            localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
        }
    }

    // Get cached user data
    static getUser(): User | null {
        if (typeof window !== 'undefined') {
            const userData = localStorage.getItem(USER_DATA_KEY);
            if (userData) {
                try {
                    return JSON.parse(userData);
                } catch {
                    return null;
                }
            }
        }
        return null;
    }

    // Clear cached user data
    static clearUser(): void {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(USER_DATA_KEY);
        }
    }

    // Login
    static async login(credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> {
        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Login failed' }));
            throw new Error(error.message || 'Login failed');
        }

        const data = await response.json();
        // Cache user data for persistence
        this.setUser(data.user);
        return data;
    }

    // Register
    static async register(registerData: RegisterData): Promise<{ user: User; tokens: AuthTokens }> {
        const response = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(registerData),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Registration failed' }));
            throw new Error(error.message || 'Registration failed');
        }

        const data = await response.json();
        // Cache user data for persistence
        this.setUser(data.user);
        return data;
    }

    // Refresh access token
    static async refreshAccessToken(): Promise<AuthTokens> {
        const refreshToken = this.getRefreshToken();

        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        const response = await fetch(`${API_URL}/api/auth/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) {
            this.clearTokens();
            throw new Error('Token refresh failed');
        }

        const data = await response.json();
        return data.tokens;
    }

    // Logout
    static async logout(): Promise<void> {
        const accessToken = this.getAccessToken();

        if (accessToken) {
            try {
                await fetch(`${API_URL}/api/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                });
            } catch (error) {
                console.error('Logout request failed:', error);
            }
        }

        this.clearTokens();
        this.clearUser();
    }

    // Get current user profile
    static async getCurrentUser(): Promise<User> {
        const accessToken = this.getAccessToken();

        if (!accessToken) {
            throw new Error('No access token available');
        }

        const response = await fetch(`${API_URL}/api/auth/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            if (response.status === 401) {
                this.clearTokens();
                this.clearUser();
                throw new Error('Unauthorized');
            }
            throw new Error('Failed to fetch user profile');
        }

        const data = await response.json();
        // Cache user data for persistence
        this.setUser(data);
        return data;
    }

    // Check if token is expired (basic check, assumes JWT)
    static isTokenExpired(token: string): boolean {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const exp = payload.exp * 1000; // Convert to milliseconds
            return Date.now() >= exp;
        } catch {
            return true;
        }
    }

    // Check if token needs refresh (refresh 5 minutes before expiry)
    static shouldRefreshToken(token: string): boolean {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const exp = payload.exp * 1000;
            const fiveMinutes = 5 * 60 * 1000;
            return Date.now() >= (exp - fiveMinutes);
        } catch {
            return true;
        }
    }
}
