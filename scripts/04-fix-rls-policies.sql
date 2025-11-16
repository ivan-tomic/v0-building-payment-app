-- Add missing INSERT and UPDATE policies for users table
-- This allows authenticated users to create their own profile

-- Drop existing policies that don't include INSERT/UPDATE
DROP POLICY IF EXISTS "Admin can view all users" ON users;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;

-- New comprehensive policies for users table
CREATE POLICY "Users can create their own profile" ON users
  FOR INSERT
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Admin can view all users" ON users
  FOR SELECT
  USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin' OR id = auth.uid());

CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT
  USING (id = auth.uid());
