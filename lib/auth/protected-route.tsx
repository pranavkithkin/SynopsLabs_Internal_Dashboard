'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './auth-context';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: 'CEO' | 'Co-Founder' | 'Sales Agent';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }

        if (!isLoading && isAuthenticated && requiredRole && user?.role !== requiredRole) {
            // User doesn't have required role, redirect to dashboard
            router.push('/');
        }
    }, [isLoading, isAuthenticated, requiredRole, user, router]);

    // Show loading state while checking auth
    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
            </div>
        );
    }

    // Don't render children if not authenticated
    if (!isAuthenticated) {
        return null;
    }

    // Don't render if role requirement not met
    if (requiredRole && user?.role !== requiredRole) {
        return null;
    }

    return <>{children}</>;
}
