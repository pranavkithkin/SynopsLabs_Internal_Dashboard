-- Create database
CREATE DATABASE synops_labs;

-- Create user (you can change the password)
CREATE USER synops_user WITH PASSWORD 'synops_secure_password_2024';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE synops_labs TO synops_user;

-- Connect to the new database
\c synops_labs

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO synops_user;
