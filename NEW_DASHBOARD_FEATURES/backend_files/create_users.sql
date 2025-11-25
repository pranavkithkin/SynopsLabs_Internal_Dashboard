-- ============================================
-- TRART Dashboard - User Setup Script
-- ============================================
-- This script creates the initial users for TRART
-- Run this after setting up the database schema

-- ============================================
-- 1. CREATE USERS
-- ============================================

-- CEO & Founder: Pranav
INSERT INTO users (name, email, role, department, is_active, created_at, updated_at)
VALUES (
    'Pranav',
    'pranav@trart.com',
    'ceo',
    'Executive',
    TRUE,
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    department = EXCLUDED.department,
    updated_at = NOW();

-- Co-Founder: Fazil
INSERT INTO users (name, email, role, department, is_active, created_at, updated_at)
VALUES (
    'Fazil',
    'fazil@trart.com',
    'co-founder',
    'Executive',
    TRUE,
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    department = EXCLUDED.department,
    updated_at = NOW();

-- Co-Founder: Thameem
INSERT INTO users (name, email, role, department, is_active, created_at, updated_at)
VALUES (
    'Thameem',
    'thameem@trart.com',
    'co-founder',
    'Executive',
    TRUE,
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    department = EXCLUDED.department,
    updated_at = NOW();

-- Sales Agent: Suhail
INSERT INTO users (name, email, role, department, is_active, created_at, updated_at)
VALUES (
    'Suhail',
    'suhail@trart.com',
    'sales_agent',
    'Sales',
    TRUE,
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    department = EXCLUDED.department,
    updated_at = NOW();

-- ============================================
-- 2. SET UP ROLE DEFAULTS
-- ============================================

-- CEO Role Defaults (All permissions)
INSERT INTO role_defaults (role, feature_key, is_granted)
SELECT 'ceo', key, TRUE
FROM system_features
ON CONFLICT (role, feature_key) DO UPDATE SET is_granted = TRUE;

-- Co-Founder Role Defaults (All permissions, same as CEO)
INSERT INTO role_defaults (role, feature_key, is_granted)
SELECT 'co-founder', key, TRUE
FROM system_features
ON CONFLICT (role, feature_key) DO UPDATE SET is_granted = TRUE;

-- Sales Agent Role Defaults (Limited permissions)
-- First, set all to FALSE
INSERT INTO role_defaults (role, feature_key, is_granted)
SELECT 'sales_agent', key, FALSE
FROM system_features
ON CONFLICT (role, feature_key) DO UPDATE SET is_granted = FALSE;

-- Then grant specific permissions for sales agent
INSERT INTO role_defaults (role, feature_key, is_granted)
VALUES
    -- Alfred permissions
    ('sales_agent', 'alfred.chat', TRUE),
    ('sales_agent', 'alfred.create_tasks', TRUE),
    ('sales_agent', 'alfred.schedule_meetings', TRUE),
    ('sales_agent', 'alfred.send_messages', TRUE),
    
    -- Metrics permissions (limited)
    ('sales_agent', 'metrics.mrr.view', TRUE),
    ('sales_agent', 'metrics.cac.view', TRUE),
    
    -- KPI permissions (sales only)
    ('sales_agent', 'kpis.sales.view', TRUE),
    ('sales_agent', 'kpis.daily.view', TRUE),
    ('sales_agent', 'kpis.weekly.view', TRUE),
    ('sales_agent', 'kpis.monthly.view', TRUE),
    
    -- Task management
    ('sales_agent', 'tasks.create', TRUE),
    ('sales_agent', 'tasks.view_own', TRUE),
    ('sales_agent', 'tasks.edit_own', TRUE),
    
    -- Meeting management
    ('sales_agent', 'meetings.create', TRUE),
    ('sales_agent', 'meetings.view_own', TRUE),
    
    -- Customer management
    ('sales_agent', 'customers.add', TRUE),
    ('sales_agent', 'customers.view', TRUE)
ON CONFLICT (role, feature_key) DO UPDATE SET is_granted = EXCLUDED.is_granted;

-- ============================================
-- 3. VERIFY SETUP
-- ============================================

-- Display created users
SELECT 
    id,
    name,
    email,
    role,
    department,
    is_active,
    created_at
FROM users
WHERE email IN ('pranav@trart.com', 'fazil@trart.com', 'thameem@trart.com', 'suhail@trart.com')
ORDER BY 
    CASE role
        WHEN 'ceo' THEN 1
        WHEN 'co-founder' THEN 2
        WHEN 'sales_agent' THEN 3
        ELSE 4
    END,
    name;

-- Display role permission counts
SELECT 
    role,
    COUNT(*) as total_permissions,
    SUM(CASE WHEN is_granted THEN 1 ELSE 0 END) as granted_permissions,
    SUM(CASE WHEN NOT is_granted THEN 1 ELSE 0 END) as denied_permissions
FROM role_defaults
WHERE role IN ('ceo', 'co-founder', 'sales_agent')
GROUP BY role
ORDER BY 
    CASE role
        WHEN 'ceo' THEN 1
        WHEN 'co-founder' THEN 2
        WHEN 'sales_agent' THEN 3
        ELSE 4
    END;

-- ============================================
-- 4. NOTES
-- ============================================

-- IMPORTANT: 
-- 1. Change default passwords immediately after first login
-- 2. Enable two-factor authentication for all users
-- 3. Review and adjust permissions as needed
-- 4. Set up email notifications for new users
-- 5. Provide onboarding documentation

-- To add more users later, use this template:
/*
INSERT INTO users (name, email, role, department, is_active, created_at, updated_at)
VALUES (
    'User Name',
    'user@trart.com',
    'role_name',  -- ceo, co-founder, manager, sales_agent, etc.
    'Department Name',
    TRUE,
    NOW(),
    NOW()
);
*/

-- To grant specific permissions to a user:
/*
INSERT INTO user_permissions (user_id, feature_key, is_granted, granted_by)
VALUES (
    (SELECT id FROM users WHERE email = 'user@trart.com'),
    'feature.key.here',
    TRUE,
    (SELECT id FROM users WHERE email = 'pranav@trart.com')  -- Granter (CEO)
);
*/

-- To check a user's effective permissions:
/*
-- Method 1: Check role defaults
SELECT rd.feature_key, rd.is_granted, sf.name, sf.description
FROM role_defaults rd
JOIN system_features sf ON rd.feature_key = sf.key
WHERE rd.role = (SELECT role FROM users WHERE email = 'user@trart.com')
ORDER BY sf.category, sf.key;

-- Method 2: Check user-specific overrides
SELECT up.feature_key, up.is_granted, sf.name, sf.description, up.granted_at
FROM user_permissions up
JOIN system_features sf ON up.feature_key = sf.key
WHERE up.user_id = (SELECT id FROM users WHERE email = 'user@trart.com')
ORDER BY sf.category, sf.key;
*/
