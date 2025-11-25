import { UserTable } from '@/components/admin/user-table';

export default function UsersPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white">User Management</h1>
                <p className="text-gray-400 mt-2">
                    Manage users, roles, and access across your organization
                </p>
            </div>
            <UserTable />
        </div>
    );
}
