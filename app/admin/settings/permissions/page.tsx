"use client";

import { useState, useEffect } from 'react';
import { Shield, Save, RotateCcw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PermissionMatrix } from '@/components/admin/permission-matrix';
import { PermissionTemplateSelector } from '@/components/admin/permission-template-selector';
import { getPermissionFeatures, getPermissionTemplate, updatePermissionTemplate } from '@/lib/services/admin-api';

interface PermissionFeature {
    key: string;
    name: string;
    category: string;
    description: string;
}

export default function PermissionsPage() {
    const [selectedRole, setSelectedRole] = useState('director');
    const [selectedDepartment, setSelectedDepartment] = useState('Sales');
    const [permissions, setPermissions] = useState<Record<string, boolean>>({});
    const [features, setFeatures] = useState<PermissionFeature[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load features on mount
    useEffect(() => {
        loadFeatures();
    }, []);

    // Load permissions when role/department changes
    useEffect(() => {
        if (selectedRole && selectedDepartment) {
            loadPermissions();
        }
    }, [selectedRole, selectedDepartment]);

    const loadFeatures = async () => {
        try {
            const data = await getPermissionFeatures();
            setFeatures(data.features);
        } catch (err) {
            setError('Failed to load features');
            console.error(err);
        }
    };

    const loadPermissions = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getPermissionTemplate(selectedRole, selectedDepartment);
            setPermissions(data.permissions);
            setHasChanges(false);
        } catch (err) {
            setError('Failed to load permissions');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handlePermissionChange = (featureKey: string, value: boolean) => {
        setPermissions(prev => ({
            ...prev,
            [featureKey]: value
        }));
        setHasChanges(true);
    };

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        try {
            await updatePermissionTemplate(selectedRole, selectedDepartment, permissions);
            setHasChanges(false);
            // Show success message (could use toast)
        } catch (err) {
            setError('Failed to save permissions');
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        loadPermissions();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Permission Management</h1>
                    <p className="text-gray-400 mt-2">
                        Configure role and department-based access control
                    </p>
                </div>
                <Shield className="w-10 h-10 text-cyan-500" />
            </div>

            {/* Info Box */}
            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-cyan-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-gray-300">
                    <p className="font-medium text-white mb-1">Permission Hierarchy</p>
                    <p>
                        Permissions are applied based on role and department combinations.
                        Individual users can have custom overrides through User Management.
                    </p>
                </div>
            </div>

            {/* Template Selector */}
            <PermissionTemplateSelector
                selectedRole={selectedRole}
                selectedDepartment={selectedDepartment}
                onRoleChange={setSelectedRole}
                onDepartmentChange={setSelectedDepartment}
            />

            {/* Error Message */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                    <p className="text-red-400">{error}</p>
                </div>
            )}

            {/* Permission Matrix */}
            {loading ? (
                <div className="bg-black/40 border border-cyan-500/20 rounded-lg p-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
                    <p className="text-gray-400 mt-4">Loading permissions...</p>
                </div>
            ) : (
                <PermissionMatrix
                    features={features}
                    permissions={permissions}
                    onChange={handlePermissionChange}
                />
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                <div className="text-sm text-gray-400">
                    {hasChanges && (
                        <span className="text-yellow-500">● Unsaved changes</span>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    {hasChanges && (
                        <Button
                            variant="outline"
                            onClick={handleReset}
                            disabled={saving}
                            className="border-gray-700 text-gray-300 hover:bg-gray-800"
                        >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Reset
                        </Button>
                    )}
                    <Button
                        onClick={handleSave}
                        disabled={!hasChanges || saving}
                        className="bg-cyan-500 hover:bg-cyan-600 text-black font-medium"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
