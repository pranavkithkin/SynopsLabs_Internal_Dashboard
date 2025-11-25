"use client";

import { User, Briefcase } from 'lucide-react';

interface PermissionTemplateSelectorProps {
    selectedRole: string;
    selectedDepartment: string;
    onRoleChange: (role: string) => void;
    onDepartmentChange: (department: string) => void;
}

export function PermissionTemplateSelector({
    selectedRole,
    selectedDepartment,
    onRoleChange,
    onDepartmentChange
}: PermissionTemplateSelectorProps) {
    const roles = [
        { value: 'co_founder', label: 'Co-Founder' },
        { value: 'director', label: 'Director' },
        { value: 'project_lead', label: 'Project Lead' },
        { value: 'agent', label: 'Agent' },
    ];

    const departments = [
        { value: 'Executive', label: 'Executive' },
        { value: 'Sales', label: 'Sales' },
        { value: 'Finance', label: 'Finance' },
        { value: 'Technical', label: 'Technical' },
        { value: 'Marketing', label: 'Marketing' },
        { value: 'Operations', label: 'Operations' },
    ];

    return (
        <div className="bg-black/40 border border-cyan-500/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
                Select Role & Department Template
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Role Selector */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                        <User className="w-4 h-4 text-cyan-500" />
                        Role
                    </label>
                    <select
                        value={selectedRole}
                        onChange={(e) => onRoleChange(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-cyan-500 transition-colors"
                    >
                        {roles.map((role) => (
                            <option key={role.value} value={role.value}>
                                {role.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Department Selector */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-cyan-500" />
                        Department
                    </label>
                    <select
                        value={selectedDepartment}
                        onChange={(e) => onDepartmentChange(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-cyan-500 transition-colors"
                    >
                        {departments.map((dept) => (
                            <option key={dept.value} value={dept.value}>
                                {dept.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="mt-4 p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                <p className="text-sm text-gray-300">
                    Configuring default permissions for:{' '}
                    <span className="font-semibold text-cyan-400">
                        {roles.find(r => r.value === selectedRole)?.label}
                    </span>
                    {' '}in{' '}
                    <span className="font-semibold text-cyan-400">
                        {departments.find(d => d.value === selectedDepartment)?.label}
                    </span>
                </p>
            </div>
        </div>
    );
}
