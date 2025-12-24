-- Grant Permissions to building_app_user
-- Run this as postgres superuser

-- Grant privileges on all existing tables
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO building_app_user;

-- Grant privileges on all sequences (for SERIAL columns)
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO building_app_user;

-- Grant privileges on schema
GRANT USAGE ON SCHEMA public TO building_app_user;
GRANT CREATE ON SCHEMA public TO building_app_user;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO building_app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO building_app_user;

-- Verify (optional - run as building_app_user to test)
-- SELECT * FROM users LIMIT 1;

