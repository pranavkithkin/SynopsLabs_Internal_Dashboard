'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllUsers, deleteUser } from '@/lib/services/admin-api';
import type { UserWithDetails, Department } from '@/types/admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Search, Edit, Trash2, Eye, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function UserTable() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [deleteUserId, setDeleteUserId] = useState<number | null>(null);

    const { data, isLoading } = useQuery({
        queryKey: ['admin-users', page, search, departmentFilter, statusFilter],
        queryFn: () => getAllUsers({
            page,
            limit: 20,
            search: search || undefined,
            filter: {
                department: departmentFilter !== 'all' ? departmentFilter : undefined,
                is_active: statusFilter === 'all' ? undefined : statusFilter === 'active',
            },
        }),
    });

    const deleteMutation = useMutation({
        mutationFn: deleteUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            toast.success('User deleted successfully');
            setDeleteUserId(null);
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to delete user');
        },
    });

    const handleDelete = (userId: number) => {
        deleteMutation.mutate(userId);
    };

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 bg-black/40 border-cyan-500/30 text-white"
                    />
                </div>
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                    <SelectTrigger className="w-48 bg-black/40 border-cyan-500/30 text-white">
                        <SelectValue placeholder="Department" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
                        <SelectItem value="Executive">Executive</SelectItem>
                        <SelectItem value="Sales">Sales</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                        <SelectItem value="Technical">Technical</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                        <SelectItem value="Operations">Operations</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40 bg-black/40 border-cyan-500/30 text-white">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                </Select>
                <Button
                    onClick={() => router.push('/admin/settings/users/new')}
                    className="bg-cyan-500 hover:bg-cyan-600 text-black"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add User
                </Button>
            </div>

            {/* Table */}
            <div className="border border-cyan-500/20 rounded-lg overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="border-cyan-500/20 hover:bg-transparent">
                            <TableHead className="text-cyan-500">Name</TableHead>
                            <TableHead className="text-cyan-500">Email</TableHead>
                            <TableHead className="text-cyan-500">Role</TableHead>
                            <TableHead className="text-cyan-500">Department</TableHead>
                            <TableHead className="text-cyan-500">Status</TableHead>
                            <TableHead className="text-cyan-500">Last Login</TableHead>
                            <TableHead className="text-cyan-500 text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center text-gray-400">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : data?.data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center text-gray-400">
                                    No users found
                                </TableCell>
                            </TableRow>
                        ) : (
                            data?.data.map((user) => (
                                <TableRow key={user.id} className="border-cyan-500/10 hover:bg-white/5">
                                    <TableCell className="font-medium text-white">{user.name}</TableCell>
                                    <TableCell className="text-gray-400">{user.email}</TableCell>
                                    <TableCell>
                                        <Badge className="bg-cyan-500/20 text-cyan-500 border-cyan-500/30">
                                            {user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-gray-400">{user.department}</TableCell>
                                    <TableCell>
                                        <Badge
                                            className={
                                                user.is_active
                                                    ? 'bg-green-500/20 text-green-500 border-green-500/30'
                                                    : 'bg-red-500/20 text-red-500 border-red-500/30'
                                            }
                                        >
                                            {user.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-gray-400">
                                        {user.last_login
                                            ? new Date(user.last_login).toLocaleDateString()
                                            : 'Never'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => router.push(`/admin/settings/users/${user.id}`)}
                                                className="text-cyan-500 hover:text-cyan-400 hover:bg-cyan-500/10"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => router.push(`/admin/settings/permissions?userId=${user.id}`)}
                                                className="text-cyan-500 hover:text-cyan-400 hover:bg-cyan-500/10"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setDeleteUserId(user.id)}
                                                className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {data && data.total_pages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-400">
                        Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, data.total)} of {data.total} users
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="border-cyan-500/30 text-cyan-500 hover:bg-cyan-500/10"
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setPage(p => Math.min(data.total_pages, p + 1))}
                            disabled={page === data.total_pages}
                            className="border-cyan-500/30 text-cyan-500 hover:bg-cyan-500/10"
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteUserId !== null} onOpenChange={() => setDeleteUserId(null)}>
                <AlertDialogContent className="bg-black border-cyan-500/30">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-white">Delete User</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-400">
                            Are you sure you want to delete this user? This action will deactivate the user account.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="border-cyan-500/30 text-white hover:bg-white/5">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteUserId && handleDelete(deleteUserId)}
                            className="bg-red-500 hover:bg-red-600 text-white"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
