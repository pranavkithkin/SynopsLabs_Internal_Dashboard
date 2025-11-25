'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { useAuth } from '@/lib/auth';
import type { PermissionKey, PermissionContextType } from './types';
import { hasPermission, hasAnyPermission, hasAllPermissions } from './permission-utils';

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export function PermissionProvider({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();

    const permissions = useMemo(() => {
        if (!user?.permissions) return [];

        // Convert permissions object to array of keys where value is true
        if (typeof user.permissions === 'object' && !Array.isArray(user.permissions)) {
            return Object.entries(user.permissions)
                .filter(([_, value]) => value === true)
                .map(([key]) => key);
        }

        return user.permissions;
    }, [user]);

    const contextValue: PermissionContextType = {
        permissions: permissions as PermissionKey[],
        hasPermission: (permission: PermissionKey) =>
            hasPermission(permissions as PermissionKey[], permission),
        hasAnyPermission: (requiredPermissions: PermissionKey[]) =>
            hasAnyPermission(permissions as PermissionKey[], requiredPermissions),
        hasAllPermissions: (requiredPermissions: PermissionKey[]) =>
            hasAllPermissions(permissions as PermissionKey[], requiredPermissions),
        isLoading,
    };

    return (
        <PermissionContext.Provider value={contextValue}>
            {children}
        </PermissionContext.Provider>
    );
}

export function usePermissionContext() {
    const context = useContext(PermissionContext);

    if (context === undefined) {
        throw new Error('usePermissionContext must be used within a PermissionProvider');
    }

    return context;
}
