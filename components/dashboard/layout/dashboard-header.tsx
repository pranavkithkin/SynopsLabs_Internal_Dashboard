'use client';

import { useAuth } from '@/lib/auth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PermissionGate } from '@/lib/permissions/permission-gate';
import Link from 'next/link';
import { Settings } from 'lucide-react';

export function DashboardHeader() {
    const { user, logout } = useAuth();

    return (
        <div className="flex items-center justify-between mb-8">
            <div>
                <h1 className="text-3xl font-bold text-white">
                    Welcome back, {user?.name}
                </h1>
                <div className="flex items-center gap-3 mt-2">
                    <Badge className="bg-cyan-500 text-black">
                        {user?.role}
                    </Badge>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-400">{user?.email}</span>
                </div>
            </div>
            <div className="flex items-center gap-3">
                {/* Only show Admin Settings to CEO/Co-Founder */}
                {(user?.role === "Founder & CEO" || user?.role === "Co-Founder") && (
                    <PermissionGate permission="admin.settings.access">
                        <Link href="/admin/settings/users">
                            <Button variant="outline" className="border-cyan-500/30 text-cyan-500 hover:bg-cyan-500/10">
                                <Settings className="w-4 h-4 mr-2" />
                                Admin Settings
                            </Button>
                        </Link>
                    </PermissionGate>
                )}
                <div className="text-sm text-gray-400">
                    Press <kbd className="px-2 py-1 bg-gray-800 rounded">⌘K</kbd> for Alfred
                </div>
                <Button onClick={logout} variant="outline" className="border-cyan-500/30 text-cyan-500 hover:bg-cyan-500/10">
                    Logout
                </Button>
            </div>
        </div>
    );
}
