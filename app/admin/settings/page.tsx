import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Users, Shield, FileText, Settings } from 'lucide-react';

export default function AdminSettingsPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white">Admin Settings</h1>
                <p className="text-gray-400 mt-2">
                    Manage your organization's users, permissions, and system configuration
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* User Management */}
                <Link href="/admin/settings/users">
                    <div className="bg-black/40 border border-cyan-500/20 rounded-lg p-6 hover:border-cyan-500/40 transition-all cursor-pointer group">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-cyan-500/20 rounded-lg group-hover:bg-cyan-500/30 transition-all">
                                <Users className="w-6 h-6 text-cyan-500" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-white">User Management</h3>
                                <p className="text-gray-400 text-sm mt-1">
                                    Create, edit, and manage user accounts
                                </p>
                            </div>
                        </div>
                    </div>
                </Link>

                {/* Permission Management */}
                <Link href="/admin/settings/permissions">
                    <div className="bg-black/40 border border-cyan-500/20 rounded-lg p-6 hover:border-cyan-500/40 transition-all cursor-pointer group">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-cyan-500/20 rounded-lg group-hover:bg-cyan-500/30 transition-all">
                                <Shield className="w-6 h-6 text-cyan-500" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-white">Permissions</h3>
                                <p className="text-gray-400 text-sm mt-1">
                                    Configure role-based access control
                                </p>
                            </div>
                        </div>
                    </div>
                </Link>

                {/* System Logs */}
                <Link href="/admin/settings/logs">
                    <div className="bg-black/40 border border-cyan-500/20 rounded-lg p-6 hover:border-cyan-500/40 transition-all cursor-pointer group">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-cyan-500/20 rounded-lg group-hover:bg-cyan-500/30 transition-all">
                                <FileText className="w-6 h-6 text-cyan-500" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-white">System Logs</h3>
                                <p className="text-gray-400 text-sm mt-1">
                                    View audit logs and system activity
                                </p>
                            </div>
                        </div>
                    </div>
                </Link>

                {/* Configuration */}
                <Link href="/admin/settings/config">
                    <div className="bg-black/40 border border-cyan-500/20 rounded-lg p-6 hover:border-cyan-500/40 transition-all cursor-pointer group">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-cyan-500/20 rounded-lg group-hover:bg-cyan-500/30 transition-all">
                                <Settings className="w-6 h-6 text-cyan-500" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-white">Configuration</h3>
                                <p className="text-gray-400 text-sm mt-1">
                                    System settings and integrations
                                </p>
                            </div>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
}
