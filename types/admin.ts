/**
 * Admin Panel Type Definitions
 * Hierarchical role-based permission system
 */

// Department type
export type Department =
    | 'Executive'
    | 'Sales'
    | 'Finance'
    | 'Technical'
    | 'Marketing'
    | 'Operations';

// Hierarchy levels (1 = highest authority)
export enum HierarchyLevel {
    CEO = 1,
    CO_FOUNDER = 2,
    DIRECTOR = 3,
    PROJECT_LEAD = 4,
    AGENT = 5,
    JUNIOR = 6,
}

// Role names corresponding to hierarchy levels
export const ROLE_NAMES: Record<HierarchyLevel, string> = {
    [HierarchyLevel.CEO]: 'Founder & CEO',
    [HierarchyLevel.CO_FOUNDER]: 'Co-Founder',
    [HierarchyLevel.DIRECTOR]: 'Director',
    [HierarchyLevel.PROJECT_LEAD]: 'Project Lead',
    [HierarchyLevel.AGENT]: 'Agent',
    [HierarchyLevel.JUNIOR]: 'Junior',
};

// User status
export enum UserStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    PENDING = 'pending',
}

// Extended user interface with hierarchy
export interface UserWithDetails {
    id: number;
    name: string;
    email: string;
    role: string;
    department: Department;
    hierarchy_level: HierarchyLevel;
    is_active: boolean;
    last_login?: string;
    created_at: string;
    updated_at: string;
    permissions: Record<string, boolean>;
}

// User creation/update data
export interface UserFormData {
    name: string;
    email: string;
    password?: string;
    role: string;
    department: Department;
    hierarchy_level: HierarchyLevel;
    is_active: boolean;
    force_password_reset?: boolean;
}

// Audit log entry
export interface AuditLog {
    id: number;
    user_id: number;
    user_name: string;
    action: AuditAction;
    details: string;
    ip_address: string;
    timestamp: string;
}

// Audit action types
export enum AuditAction {
    USER_LOGIN = 'user_login',
    USER_LOGOUT = 'user_logout',
    USER_CREATED = 'user_created',
    USER_UPDATED = 'user_updated',
    USER_DELETED = 'user_deleted',
    PERMISSION_UPDATED = 'permission_updated',
    CONFIG_UPDATED = 'config_updated',
    LOGIN_FAILED = 'login_failed',
}

// System configuration
export interface SystemConfig {
    company_name: string;
    logo_url?: string;
    theme_color: string;
    session_timeout: number; // minutes
    password_min_length: number;
    password_require_special: boolean;
    password_require_number: boolean;
    google_sheets_credentials?: string;
    openai_api_key?: string;
    webhooks?: string[];
}

// Permission matrix structure
export interface PermissionMatrix {
    categories: PermissionCategory[];
    roles: RolePermissions[];
}

export interface PermissionCategory {
    name: string;
    permissions: PermissionItem[];
}

export interface PermissionItem {
    key: string;
    label: string;
    description: string;
}

export interface RolePermissions {
    role: string;
    hierarchy_level: HierarchyLevel;
    department: Department;
    permissions: Record<string, boolean>;
}

// Table pagination
export interface PaginationParams {
    page: number;
    limit: number;
    search?: string;
    filter?: Record<string, any>;
    sort?: {
        field: string;
        order: 'asc' | 'desc';
    };
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
}

// Permission feature type
export interface PermissionFeature {
    key: string;
    name: string;
    category: string;
    description: string;
}

// Permission template type
export interface PermissionTemplate {
    role: string;
    department: Department;
    permissions: Record<string, boolean>;
}
