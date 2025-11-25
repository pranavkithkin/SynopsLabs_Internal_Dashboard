'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, Shield, FileText, Settings, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
    { name: 'Users', href: '/admin/settings/users', icon: Users },
    { name: 'Permissions', href: '/admin/settings/permissions', icon: Shield },
    { name: 'System Logs', href: '/admin/settings/logs', icon: FileText },
    { name: 'Configuration', href: '/admin/settings/config', icon: Settings },
    { name: 'Analytics', href: '/admin/settings/analytics', icon: BarChart3 },
];

export function AdminSidebar() {
    const pathname = usePathname();

    return (
        <div className="w-64 bg-black/40 border-r border-cyan-500/20 h-full">
            <div className="p-6">
                <h2 className="text-xl font-bold text-white mb-6">Admin Settings</h2>
                <nav className="space-y-2">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-all',
                                    isActive
                                        ? 'bg-cyan-500/20 text-cyan-500 border border-cyan-500/30'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                )}
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="font-medium">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
}
