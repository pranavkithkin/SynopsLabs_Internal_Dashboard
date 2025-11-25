'use client';

import { usePermissions } from './use-permissions';
import type { PermissionKey } from './types';

interface PermissionGateProps {
    children: React.ReactNode;
    permission?: PermissionKey;
    anyPermissions?: PermissionKey[];
    allPermissions?: PermissionKey[];
    fallback?: React.ReactNode;
}

/**
 * Conditionally render children based on user permissions
 * 
 * Usage:
 * <PermissionGate permission="metrics.mrr.view">
 *   <MRRMetric />
 * </PermissionGate>
 * 
 * <PermissionGate anyPermissions={['kpis.sales.view', 'kpis.marketing.view']}>
 *   <KPIDashboard />
 * </PermissionGate>
 */
export function PermissionGate({
    children,
    permission,
    anyPermissions,
    allPermissions,
    fallback = null,
}: PermissionGateProps) {
    const { hasPermission, hasAnyPermission, hasAllPermissions, isLoading } = usePermissions();

    // Don't render anything while loading
    if (isLoading) {
        return null;
    }

    // Check single permission
    if (permission && !hasPermission(permission)) {
        return <>{fallback}</>;
    }

    // Check any permissions
    if (anyPermissions && !hasAnyPermission(anyPermissions)) {
        return <>{fallback}</>;
    }

    // Check all permissions
    if (allPermissions && !hasAllPermissions(allPermissions)) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}
