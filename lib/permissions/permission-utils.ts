import type { PermissionKey } from './types';

/**
 * Check if a permission key matches a pattern
 * Supports wildcards: 'metrics.*.view' matches 'metrics.mrr.view', 'metrics.cac.view', etc.
 */
export function matchesPermission(permission: PermissionKey, pattern: string): boolean {
    const permissionParts = permission.split('.');
    const patternParts = pattern.split('.');

    if (permissionParts.length !== patternParts.length) {
        return false;
    }

    return patternParts.every((part, index) => {
        return part === '*' || part === permissionParts[index];
    });
}

/**
 * Check if user has a specific permission
 */
export function hasPermission(
    userPermissions: PermissionKey[],
    requiredPermission: PermissionKey
): boolean {
    return userPermissions.some(
        (permission) =>
            permission === requiredPermission ||
            matchesPermission(requiredPermission, permission)
    );
}

/**
 * Check if user has any of the required permissions
 */
export function hasAnyPermission(
    userPermissions: PermissionKey[],
    requiredPermissions: PermissionKey[]
): boolean {
    return requiredPermissions.some((required) =>
        hasPermission(userPermissions, required)
    );
}

/**
 * Check if user has all of the required permissions
 */
export function hasAllPermissions(
    userPermissions: PermissionKey[],
    requiredPermissions: PermissionKey[]
): boolean {
    return requiredPermissions.every((required) =>
        hasPermission(userPermissions, required)
    );
}

/**
 * Get permissions for a specific role
 */
export function getPermissionsForRole(role: string): PermissionKey[] {
    const { ROLE_PERMISSIONS } = require('./types');
    return ROLE_PERMISSIONS[role] || [];
}

/**
 * Filter permissions by category
 */
export function filterPermissionsByCategory(
    permissions: PermissionKey[],
    category: string
): PermissionKey[] {
    return permissions.filter((permission) => permission.startsWith(`${category}.`));
}

/**
 * Group permissions by category
 */
export function groupPermissionsByCategory(
    permissions: PermissionKey[]
): Record<string, PermissionKey[]> {
    return permissions.reduce((acc, permission) => {
        const category = permission.split('.')[0];
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(permission);
        return acc;
    }, {} as Record<string, PermissionKey[]>);
}
