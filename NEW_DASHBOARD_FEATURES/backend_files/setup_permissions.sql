-- Enterprise-Level Permission System for TRART Dashboard
-- Based on PRD.md requirements

-- Clear existing permissions
TRUNCATE TABLE roles_permissions;

-- ============================================
-- CEO PERMISSIONS (Super Admin - Full Access)
-- ============================================

-- Task Management
INSERT INTO roles_permissions (role, permission_key, enabled) VALUES
('ceo', 'create_task', true),
('ceo', 'edit_task', true),
('ceo', 'delete_task', true),
('ceo', 'assign_task', true),
('ceo', 'view_all_tasks', true),
('ceo', 'comment_task', true);

-- Meeting Management
INSERT INTO roles_permissions (role, permission_key, enabled) VALUES
('ceo', 'schedule_meeting', true),
('ceo', 'edit_meeting', true),
('ceo', 'delete_meeting', true),
('ceo', 'view_all_meetings', true),
('ceo', 'cancel_meeting', true);

-- User Management
INSERT INTO roles_permissions (role, permission_key, enabled) VALUES
('ceo', 'invite_user', true),
('ceo', 'edit_user', true),
('ceo', 'delete_user', true),
('ceo', 'view_all_users', true),
('ceo', 'change_user_role', true),
('ceo', 'impersonate_user', true);

-- Alfred/Jarvis Controls
INSERT INTO roles_permissions (role, permission_key, enabled) VALUES
('ceo', 'use_alfred', true),
('ceo', 'configure_alfred', true),
('ceo', 'impersonate_jarvis', true),
('ceo', 'alfred_auto_schedule', true),
('ceo', 'alfred_auto_delete', true),
('ceo', 'alfred_auto_invite', true);

-- Workflow & Automation
INSERT INTO roles_permissions (role, permission_key, enabled) VALUES
('ceo', 'run_workflow', true),
('ceo', 'create_workflow', true),
('ceo', 'modify_workflow', true),
('ceo', 'delete_workflow', true);

-- Integration Management
INSERT INTO roles_permissions (role, permission_key, enabled) VALUES
('ceo', 'manage_integrations', true),
('ceo', 'configure_api_keys', true),
('ceo', 'view_audit_logs', true);

-- Feature Voting
INSERT INTO roles_permissions (role, permission_key, enabled) VALUES
('ceo', 'submit_feature', true),
('ceo', 'vote_feature', true),
('ceo', 'manage_features', true);

-- Settings & Admin
INSERT INTO roles_permissions (role, permission_key, enabled) VALUES
('ceo', 'access_admin_panel', true),
('ceo', 'manage_permissions', true),
('ceo', 'view_analytics', true),
('ceo', 'export_data', true);

-- ============================================
-- CO-FOUNDER PERMISSIONS (Admin - Limited)
-- ============================================

-- Task Management (Cannot assign to CEO or other co-founders)
INSERT INTO roles_permissions (role, permission_key, enabled) VALUES
('co_founder', 'create_task', true),
('co_founder', 'edit_task', true),
('co_founder', 'delete_task', true),
('co_founder', 'assign_task', true),  -- Limited to employees only (enforced in backend)
('co_founder', 'view_all_tasks', true),
('co_founder', 'comment_task', true);

-- Meeting Management
INSERT INTO roles_permissions (role, permission_key, enabled) VALUES
('co_founder', 'schedule_meeting', true),
('co_founder', 'edit_meeting', true),
('co_founder', 'delete_meeting', true),  -- Only their own meetings
('co_founder', 'view_all_meetings', true),
('co_founder', 'cancel_meeting', true);  -- Only their own meetings

-- User Management (Limited)
INSERT INTO roles_permissions (role, permission_key, enabled) VALUES
('co_founder', 'invite_user', true),  -- Can invite employees only
('co_founder', 'edit_user', false),  -- Cannot edit users
('co_founder', 'delete_user', false),  -- Cannot delete users
('co_founder', 'view_all_users', true),
('co_founder', 'change_user_role', false),  -- Cannot change roles
('co_founder', 'impersonate_user', false);  -- Cannot impersonate

-- Alfred/Jarvis Controls (Limited)
INSERT INTO roles_permissions (role, permission_key, enabled) VALUES
('co_founder', 'use_alfred', true),
('co_founder', 'configure_alfred', false),  -- Cannot configure Alfred
('co_founder', 'impersonate_jarvis', false),  -- Cannot impersonate
('co_founder', 'alfred_auto_schedule', true),
('co_founder', 'alfred_auto_delete', false),  -- Requires approval
('co_founder', 'alfred_auto_invite', false);  -- Requires approval

-- Workflow & Automation (Limited)
INSERT INTO roles_permissions (role, permission_key, enabled) VALUES
('co_founder', 'run_workflow', true),
('co_founder', 'create_workflow', true),
('co_founder', 'modify_workflow', true),  -- Only their own workflows
('co_founder', 'delete_workflow', false);  -- Cannot delete workflows

-- Integration Management (Own keys only)
INSERT INTO roles_permissions (role, permission_key, enabled) VALUES
('co_founder', 'manage_integrations', true),  -- Own integrations only
('co_founder', 'configure_api_keys', true),  -- Own API keys only
('co_founder', 'view_audit_logs', true);  -- Own logs only

-- Feature Voting
INSERT INTO roles_permissions (role, permission_key, enabled) VALUES
('co_founder', 'submit_feature', true),
('co_founder', 'vote_feature', true),
('co_founder', 'manage_features', false);  -- Cannot manage features

-- Settings & Admin (Limited)
INSERT INTO roles_permissions (role, permission_key, enabled) VALUES
('co_founder', 'access_admin_panel', false),  -- No admin panel access
('co_founder', 'manage_permissions', false),  -- Cannot manage permissions
('co_founder', 'view_analytics', true),  -- Department analytics only
('co_founder', 'export_data', false);  -- Cannot export data

-- ============================================
-- EMPLOYEE PERMISSIONS (Basic Access)
-- ============================================

-- Task Management (Own tasks only)
INSERT INTO roles_permissions (role, permission_key, enabled) VALUES
('employee', 'create_task', true),
('employee', 'edit_task', true),  -- Own tasks only
('employee', 'delete_task', false),  -- Cannot delete tasks
('employee', 'assign_task', false),  -- Cannot assign tasks
('employee', 'view_all_tasks', false),  -- Own tasks only
('employee', 'comment_task', true);

-- Meeting Management (Limited)
INSERT INTO roles_permissions (role, permission_key, enabled) VALUES
('employee', 'schedule_meeting', true),
('employee', 'edit_meeting', true),  -- Own meetings only
('employee', 'delete_meeting', false),  -- Cannot delete meetings
('employee', 'view_all_meetings', false),  -- Own meetings only
('employee', 'cancel_meeting', true);  -- Own meetings only

-- User Management (None)
INSERT INTO roles_permissions (role, permission_key, enabled) VALUES
('employee', 'invite_user', false),
('employee', 'edit_user', false),
('employee', 'delete_user', false),
('employee', 'view_all_users', true),  -- Can see team members
('employee', 'change_user_role', false),
('employee', 'impersonate_user', false);

-- Alfred/Jarvis Controls (Basic)
INSERT INTO roles_permissions (role, permission_key, enabled) VALUES
('employee', 'use_alfred', true),
('employee', 'configure_alfred', false),
('employee', 'impersonate_jarvis', false),
('employee', 'alfred_auto_schedule', true),
('employee', 'alfred_auto_delete', false),
('employee', 'alfred_auto_invite', false);

-- Workflow & Automation (None)
INSERT INTO roles_permissions (role, permission_key, enabled) VALUES
('employee', 'run_workflow', false),
('employee', 'create_workflow', false),
('employee', 'modify_workflow', false),
('employee', 'delete_workflow', false);

-- Integration Management (Own keys only)
INSERT INTO roles_permissions (role, permission_key, enabled) VALUES
('employee', 'manage_integrations', true),  -- Own integrations only
('employee', 'configure_api_keys', true),  -- Own API keys only
('employee', 'view_audit_logs', false);  -- Cannot view audit logs

-- Feature Voting
INSERT INTO roles_permissions (role, permission_key, enabled) VALUES
('employee', 'submit_feature', true),
('employee', 'vote_feature', true),
('employee', 'manage_features', false);

-- Settings & Admin (None)
INSERT INTO roles_permissions (role, permission_key, enabled) VALUES
('employee', 'access_admin_panel', false),
('employee', 'manage_permissions', false),
('employee', 'view_analytics', false),
('employee', 'export_data', false);

-- Display results
SELECT role, COUNT(*) as permission_count 
FROM roles_permissions 
GROUP BY role 
ORDER BY role;

