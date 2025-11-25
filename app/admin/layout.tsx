'use client';

import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // Check if user is CEO (hierarchy_level === 1)
        if (!isLoading && user) {
            const permissions = user.permissions as Record<string, boolean> | undefined;
            const hasAdminAccess = permissions?.['admin.settings.access'];
            if (!hasAdminAccess) {
                router.push('/');
            }
        }
    }, [user, isLoading, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
            </div>
        );
    }

    const permissions = user?.permissions as Record<string, boolean> | undefined;
    if (!permissions?.['admin.settings.access']) {
        return null;
    }

    return (
        <div className="min-h-screen bg-black flex">
            <AdminSidebar />
            <main className="flex-1 p-8">
                {children}
            </main>
        </div>
    );
}
