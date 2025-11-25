-- ============================================
-- Synops Labs Database Initialization
-- Creates database, user, and initial schema
-- ============================================

-- This script runs automatically when PostgreSQL container starts
-- It's only executed if the database doesn't already exist

-- Grant all privileges to synops_user
GRANT ALL PRIVILEGES ON DATABASE synops_labs TO synops_user;

-- Switch to synops_labs database
\c synops_labs synops_user

-- Create tables (if using SQLAlchemy, it will create them automatically)
-- This is just a placeholder for any manual initialization you might need

-- Example: Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Log completion
SELECT 'Database initialized successfully' AS status;
