-- Clean up all data from the database to start fresh
-- This script deletes all users and data but keeps the tables and structure intact

-- Disable foreign key checks temporarily
SET session_replication_role = 'replica';

-- Delete all data in reverse dependency order
DELETE FROM invitation_codes;
DELETE FROM late_fees;
DELETE FROM expenses;
DELETE FROM payments;
DELETE FROM users;
DELETE FROM apartments;

-- Re-enable foreign key checks
SET session_replication_role = 'default';

-- Reset sequences for IDs
ALTER SEQUENCE apartments_id_seq RESTART WITH 1;
ALTER SEQUENCE payments_id_seq RESTART WITH 1;
ALTER SEQUENCE expenses_id_seq RESTART WITH 1;
ALTER SEQUENCE late_fees_id_seq RESTART WITH 1;
ALTER SEQUENCE invitation_codes_id_seq RESTART WITH 1;
