'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { UserFormData, Department, HierarchyLevel } from '@/types/admin';

const userSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters').optional(),
    role: z.string().min(1, 'Role is required'),
    department: z.enum(['Executive', 'Sales', 'Finance', 'Technical', 'Marketing', 'Operations']),
    hierarchy_level: z.number().min(1).max(6),
    is_active: z.boolean(),
    force_password_reset: z.boolean().optional(),
});

type UserFormValues = z.infer<typeof userSchema>;

interface UserFormProps {
    initialData?: Partial<UserFormData>;
    onSubmit: (data: UserFormData) => Promise<void>;
    isLoading?: boolean;
    isEdit?: boolean;
}

const ROLES = [
    { level: 1, name: 'Founder & CEO' },
    { level: 2, name: 'Co-Founder' },
    { level: 3, name: 'Director' },
    { level: 4, name: 'Project Lead' },
    { level: 5, name: 'Agent' },
    { level: 6, name: 'Junior' },
];

const DEPARTMENTS = [
    'Executive',
    'Sales',
    'Finance',
    'Technical',
    'Marketing',
    'Operations',
];

export function UserForm({ initialData, onSubmit, isLoading, isEdit }: UserFormProps) {
    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<UserFormValues>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            name: initialData?.name || '',
            email: initialData?.email || '',
            role: initialData?.role || '',
            department: (initialData?.department as Department) || 'Executive',
            hierarchy_level: initialData?.hierarchy_level || 6,
            is_active: initialData?.is_active ?? true,
            force_password_reset: false,
        },
    });

    const selectedRole = watch('role');
    const isActive = watch('is_active');

    const handleRoleChange = (roleName: string) => {
        const role = ROLES.find(r => r.name === roleName);
        if (role) {
            setValue('role', roleName);
            setValue('hierarchy_level', role.level);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
                <Label htmlFor="name" className="text-white">Name *</Label>
                <Input
                    id="name"
                    {...register('name')}
                    className="bg-black/40 border-cyan-500/30 text-white"
                    placeholder="John Doe"
                />
                {errors.name && (
                    <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
            </div>

            {/* Email */}
            <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email *</Label>
                <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    className="bg-black/40 border-cyan-500/30 text-white"
                    placeholder="john@synopslabs.com"
                    disabled={isEdit}
                />
                {errors.email && (
                    <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
            </div>

            {/* Password */}
            <div className="space-y-2">
                <Label htmlFor="password" className="text-white">
                    Password {!isEdit && '*'}
                </Label>
                <Input
                    id="password"
                    type="password"
                    {...register('password')}
                    className="bg-black/40 border-cyan-500/30 text-white"
                    placeholder={isEdit ? 'Leave blank to keep current' : '••••••••'}
                />
                {errors.password && (
                    <p className="text-sm text-red-500">{errors.password.message}</p>
                )}
            </div>

            {/* Department */}
            <div className="space-y-2">
                <Label htmlFor="department" className="text-white">Department *</Label>
                <Select
                    value={watch('department')}
                    onValueChange={(value) => setValue('department', value as Department)}
                >
                    <SelectTrigger className="bg-black/40 border-cyan-500/30 text-white">
                        <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                        {DEPARTMENTS.map((dept) => (
                            <SelectItem key={dept} value={dept}>
                                {dept}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {errors.department && (
                    <p className="text-sm text-red-500">{errors.department.message}</p>
                )}
            </div>

            {/* Role */}
            <div className="space-y-2">
                <Label htmlFor="role" className="text-white">Role *</Label>
                <Select value={selectedRole} onValueChange={handleRoleChange}>
                    <SelectTrigger className="bg-black/40 border-cyan-500/30 text-white">
                        <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                        {ROLES.map((role) => (
                            <SelectItem key={role.level} value={role.name}>
                                {role.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {errors.role && (
                    <p className="text-sm text-red-500">{errors.role.message}</p>
                )}
            </div>

            {/* Status */}
            <div className="flex items-center justify-between p-4 bg-black/40 border border-cyan-500/30 rounded-lg">
                <div>
                    <Label htmlFor="is_active" className="text-white">Active Status</Label>
                    <p className="text-sm text-gray-400">User can login and access the system</p>
                </div>
                <Switch
                    id="is_active"
                    checked={isActive}
                    onCheckedChange={(checked: boolean) => setValue('is_active', checked)}
                />
            </div>

            {/* Force Password Reset (Edit only) */}
            {isEdit && (
                <div className="flex items-center justify-between p-4 bg-black/40 border border-cyan-500/30 rounded-lg">
                    <div>
                        <Label htmlFor="force_password_reset" className="text-white">
                            Force Password Reset
                        </Label>
                        <p className="text-sm text-gray-400">
                            User must change password on next login
                        </p>
                    </div>
                    <Switch
                        id="force_password_reset"
                        checked={watch('force_password_reset')}
                        onCheckedChange={(checked: boolean) => setValue('force_password_reset', checked)}
                    />
                </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-3">
                <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-black"
                >
                    {isLoading ? 'Saving...' : isEdit ? 'Update User' : 'Create User'}
                </Button>
            </div>
        </form>
    );
}
