/**
 * Admin API Service
 * Client functions for admin panel operations
 */

import type {
    UserWithDetails,
    UserFormData,
    AuditLog,
    SystemConfig,
    PaginatedResponse,
    PaginationParams
} from '@/types/admin';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Helper to get auth token
function getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('auth_access_token');
    }
    return null;
}

// Helper to get auth headers
function getAuthHeaders(): Record<string, string> {
    const token = getAuthToken();
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
    };
}

// Helper to make authenticated requests
async function fetchWithAuth(url: string, options: RequestInit = {}) {
    const token = getAuthToken();

    if (!token) {
        throw new Error('Not authenticated');
    }

    const response = await fetch(url, {
        ...options,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message || error.detail || 'Request failed');
    }

    return response.json();
}

// ============================================
// USER MANAGEMENT
// ============================================

export async function getAllUsers(params?: PaginationParams): Promise<PaginatedResponse<UserWithDetails>> {
    const queryParams = new URLSearchParams();

    if (params) {
        if (params.page) queryParams.set('skip', String((params.page - 1) * (params.limit || 20)));
        if (params.limit) queryParams.set('limit', String(params.limit));
        if (params.search) queryParams.set('search', params.search);
        if (params.filter?.department) queryParams.set('department', params.filter.department);
        if (params.filter?.is_active !== undefined) queryParams.set('is_active', String(params.filter.is_active));
    }

    return fetchWithAuth(`${API_URL}/api/admin/users?${queryParams}`);
}

export async function getUser(userId: number): Promise<UserWithDetails> {
    return fetchWithAuth(`${API_URL}/api/admin/users/${userId}`);
}

export async function createUser(userData: UserFormData): Promise<UserWithDetails> {
    return fetchWithAuth(`${API_URL}/api/admin/users`, {
        method: 'POST',
        body: JSON.stringify(userData),
    });
}

export async function updateUser(userId: number, userData: Partial<UserFormData>): Promise<UserWithDetails> {
    return fetchWithAuth(`${API_URL}/api/admin/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(userData),
    });
}

export async function deleteUser(userId: number): Promise<{ message: string }> {
    return fetchWithAuth(`${API_URL}/api/admin/users/${userId}`, {
        method: 'DELETE',
    });
}

// ============================================
// PERMISSION MANAGEMENT
// ============================================

export async function getUserPermissions(userId: number): Promise<{ permissions: Record<string, boolean> }> {
    return fetchWithAuth(`${API_URL}/api/admin/users/${userId}/permissions`);
}

export async function updateUserPermissions(
    userId: number,
    permissions: Record<string, boolean>
): Promise<{ permissions: Record<string, boolean> }> {
    return fetchWithAuth(`${API_URL}/api/admin/users/${userId}/permissions`, {
        method: 'PUT',
        body: JSON.stringify({ permissions }),
    });
}

export async function getRoles(): Promise<{
    roles: Array<{ level: number; name: string; description: string }>;
    departments: string[];
}> {
    return fetchWithAuth(`${API_URL}/api/admin/roles`);
}

// ============================================
// AUDIT LOGS
// ============================================

export async function getAuditLogs(params?: {
    skip?: number;
    limit?: number;
    user_id?: number;
    action?: string;
}): Promise<PaginatedResponse<AuditLog>> {
    const queryParams = new URLSearchParams();

    if (params) {
        if (params.skip) queryParams.set('skip', String(params.skip));
        if (params.limit) queryParams.set('limit', String(params.limit));
        if (params.user_id) queryParams.set('user_id', String(params.user_id));
        if (params.action) queryParams.set('action', params.action);
    }

    return fetchWithAuth(`${API_URL}/api/admin/logs?${queryParams}`);
}

// ============================================
// SYSTEM CONFIGURATION
// ============================================

export async function getSystemConfig(): Promise<SystemConfig> {
    return fetchWithAuth(`${API_URL}/api/admin/config`);
}

export async function updateSystemConfig(config: Partial<SystemConfig>): Promise<SystemConfig> {
    return fetchWithAuth(`${API_URL}/api/admin/config`, {
        method: 'PUT',
        body: JSON.stringify(config),
    });
}

// ============================================
// PERMISSIONS API
// ============================================

export async function getPermissionFeatures() {
    const response = await fetch(`${API_URL}/api/admin/permissions/features`, {
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        throw new Error('Failed to fetch permission features');
    }

    return response.json();
}

export async function getPermissionTemplates() {
    const response = await fetch(`${API_URL}/api/admin/permissions/templates`, {
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        throw new Error('Failed to fetch permission templates');
    }

    return response.json();
}

export async function getPermissionTemplate(role: string, department: string) {
    const response = await fetch(`${API_URL}/api/admin/permissions/templates/${role}/${department}`, {
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        throw new Error('Failed to fetch permission template');
    }

    return response.json();
}

export async function updatePermissionTemplate(
    role: string,
    department: string,
    permissions: Record<string, boolean>
) {
    const response = await fetch(`${API_URL}/api/admin/permissions/templates/${role}/${department}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ permissions })
    });

    if (!response.ok) {
        throw new Error('Failed to update permission template');
    }

    return response.json();
}

export async function resetPermissionsToDefaults() {
    const response = await fetch(`${API_URL}/api/admin/permissions/reset-defaults`, {
        method: 'POST',
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        throw new Error('Failed to reset permissions');
    }

    return response.json();
}
