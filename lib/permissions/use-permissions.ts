import { usePermissionContext } from './permission-context';
import type { PermissionKey } from './types';

export function usePermissions() {
    const context = usePermissionContext();

    return {
        permissions: context.permissions,
        hasPermission: context.hasPermission,
        hasAnyPermission: context.hasAnyPermission,
        hasAllPermissions: context.hasAllPermissions,
        isLoading: context.isLoading,
    };
}

// Convenience hook for checking a single permission
export function useHasPermission(permission: PermissionKey): boolean {
    const { hasPermission } = usePermissions();
    return hasPermission(permission);
}

// Convenience hook for checking multiple permissions (any)
export function useHasAnyPermission(permissions: PermissionKey[]): boolean {
    const { hasAnyPermission } = usePermissions();
    return hasAnyPermission(permissions);
}

// Convenience hook for checking multiple permissions (all)
export function useHasAllPermissions(permissions: PermissionKey[]): boolean {
    const { hasAllPermissions } = usePermissions();
    return hasAllPermissions(permissions);
}
