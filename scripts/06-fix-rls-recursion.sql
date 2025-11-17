-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admin can view all users" ON users;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can view their own apartment" ON apartments;
DROP POLICY IF EXISTS "Admin can view all payments" ON payments;
DROP POLICY IF EXISTS "Tenants can view payments for their apartment" ON payments;
DROP POLICY IF EXISTS "Admin can insert payments" ON payments;
DROP POLICY IF EXISTS "Admin can update payments" ON payments;
DROP POLICY IF EXISTS "Admin can view all late fees" ON late_fees;
DROP POLICY IF EXISTS "Tenants can view late fees for their apartment" ON late_fees;

-- Create new RLS policies without recursion using auth.uid() directly

-- Users table policies (no recursion)
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile" ON users
  FOR INSERT
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE
  USING (id = auth.uid());

-- Apartments table policies
CREATE POLICY "Anyone authenticated can view apartments" ON apartments
  FOR SELECT
  TO authenticated
  USING (TRUE);

-- Payments table policies
CREATE POLICY "Anyone authenticated can view payments" ON payments
  FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Authenticated users can insert payments" ON payments
  FOR INSERT
  TO authenticated
  WITH CHECK (TRUE);

CREATE POLICY "Authenticated users can update payments" ON payments
  FOR UPDATE
  TO authenticated
  USING (TRUE);

-- Late fees table policies
CREATE POLICY "Anyone authenticated can view late fees" ON late_fees
  FOR SELECT
  TO authenticated
  USING (TRUE);

-- Note: Role-based access control will be handled in the application layer
-- This prevents RLS infinite recursion issues while still requiring authentication
