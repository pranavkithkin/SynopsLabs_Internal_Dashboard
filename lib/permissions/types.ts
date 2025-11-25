// Permission key structure: {category}.{feature}.{action}
export type PermissionKey =
    // Metrics permissions
    | 'metrics.mrr.view'
    | 'metrics.cac.view'
    | 'metrics.ltv.view'
    | 'metrics.qvc.view'
    | 'metrics.ltgp.view'
    | 'metrics.all.view'

    // Alfred AI permissions
    | 'alfred.chat'
    | 'alfred.history.view'

    // KPI permissions
    | 'kpis.sales.view'
    | 'kpis.sales.edit'
    | 'kpis.marketing.view'
    | 'kpis.marketing.edit'
    | 'kpis.operations.view'
    | 'kpis.operations.edit'
    | 'kpis.finance.view'
    | 'kpis.finance.edit'
    | 'kpis.all.view'
    | 'kpis.all.edit'

    // Team management permissions
    | 'team.view'
    | 'team.manage'
    | 'team.invite'
    | 'team.remove'

    // Settings permissions
    | 'settings.view'
    | 'settings.edit'
    | 'settings.integrations.view'
    | 'settings.integrations.edit'

    // Dashboard permissions
    | 'dashboard.view'
    | 'dashboard.customize'

    // Admin permissions
    | 'admin.settings.access'
    | 'admin.users.view'
    | 'admin.users.create'
    | 'admin.users.edit'
    | 'admin.users.delete'
    | 'admin.permissions.view'
    | 'admin.permissions.edit'
    | 'admin.logs.view'
    | 'admin.logs.export'
    | 'admin.config.view'
    | 'admin.config.edit';

export interface PermissionContextType {
    permissions: PermissionKey[];
    hasPermission: (permission: PermissionKey) => boolean;
    hasAnyPermission: (permissions: PermissionKey[]) => boolean;
    hasAllPermissions: (permissions: PermissionKey[]) => boolean;
    isLoading: boolean;
}

// Role-based permission presets
export const ROLE_PERMISSIONS: Record<string, PermissionKey[]> = {
    CEO: [
        // CEO has all permissions
        'metrics.mrr.view',
        'metrics.cac.view',
        'metrics.ltv.view',
        'metrics.qvc.view',
        'metrics.ltgp.view',
        'metrics.all.view',
        'alfred.chat',
        'alfred.history.view',
        'kpis.sales.view',
        'kpis.sales.edit',
        'kpis.marketing.view',
        'kpis.marketing.edit',
        'kpis.operations.view',
        'kpis.operations.edit',
        'kpis.finance.view',
        'kpis.finance.edit',
        'kpis.all.view',
        'kpis.all.edit',
        'team.view',
        'team.manage',
        'team.invite',
        'team.remove',
        'settings.view',
        'settings.edit',
        'settings.integrations.view',
        'settings.integrations.edit',
        'dashboard.view',
        'dashboard.customize',
        'admin.settings.access',
        'admin.users.view',
        'admin.users.create',
        'admin.users.edit',
        'admin.users.delete',
        'admin.permissions.view',
        'admin.permissions.edit',
        'admin.logs.view',
        'admin.logs.export',
        'admin.config.view',
        'admin.config.edit',
    ],
    'Co-Founder': [
        // Co-Founder has most permissions except team management and settings edit
        'metrics.mrr.view',
        'metrics.cac.view',
        'metrics.ltv.view',
        'metrics.qvc.view',
        'metrics.ltgp.view',
        'metrics.all.view',
        'alfred.chat',
        'alfred.history.view',
        'kpis.sales.view',
        'kpis.sales.edit',
        'kpis.marketing.view',
        'kpis.marketing.edit',
        'kpis.operations.view',
        'kpis.operations.edit',
        'kpis.finance.view',
        'kpis.finance.edit',
        'kpis.all.view',
        'kpis.all.edit',
        'team.view',
        'settings.view',
        'settings.integrations.view',
        'dashboard.view',
        'dashboard.customize',
    ],
    'Sales Agent': [
        // Sales Agent has limited permissions
        'metrics.mrr.view',
        'metrics.cac.view',
        'kpis.sales.view',
        'alfred.chat',
        'dashboard.view',
        'team.view',
    ],
};
