'use client';

import { UserForm } from '@/components/admin/user-form';
import { createUser } from '@/lib/services/admin-api';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { UserFormData } from '@/types/admin';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export default function NewUserPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (data: UserFormData) => {
        setIsLoading(true);
        try {
            await createUser(data);
            // Invalidate and refetch users list
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            toast.success('User created successfully');
            router.push('/admin/settings/users');
        } catch (error: any) {
            toast.error(error.message || 'Failed to create user');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/settings/users">
                    <Button variant="ghost" size="sm" className="text-cyan-500 hover:text-cyan-400">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Users
                    </Button>
                </Link>
            </div>

            <div>
                <h1 className="text-3xl font-bold text-white">Create New User</h1>
                <p className="text-gray-400 mt-2">
                    Add a new user to your organization
                </p>
            </div>

            <div className="bg-black/40 border border-cyan-500/20 rounded-lg p-6">
                <UserForm onSubmit={handleSubmit} isLoading={isLoading} />
            </div>
        </div>
    );
}
