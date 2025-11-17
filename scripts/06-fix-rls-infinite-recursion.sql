-- Drop existing policies that cause infinite recursion
DROP POLICY IF EXISTS "Admin can view all users" ON users;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can view their own apartment" ON apartments;
DROP POLICY IF EXISTS "Admin can view all payments" ON payments;
DROP POLICY IF EXISTS "Tenants can view payments for their apartment" ON payments;
DROP POLICY IF EXISTS "Admin can insert payments" ON payments;
DROP POLICY IF EXISTS "Admin can update payments" ON payments;
DROP POLICY IF EXISTS "Admin can view all late fees" ON late_fees;
DROP POLICY IF EXISTS "Tenants can view late fees for their apartment" ON late_fees;
DROP POLICY IF EXISTS "Admin can manage invitation codes" ON invitation_codes;

-- Create a function to check if current user is admin (avoids recursion)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for users (fixed to avoid recursion)
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Allow user insert during signup" ON users
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE
  USING (id = auth.uid());

-- RLS Policies for apartments (fixed)
CREATE POLICY "Users can view apartments" ON apartments
  FOR SELECT
  USING (
    is_admin()
    OR
    id IN (SELECT apartment_id FROM users WHERE id = auth.uid())
  );

-- RLS Policies for payments (fixed)
CREATE POLICY "Users can view payments" ON payments
  FOR SELECT
  USING (
    is_admin()
    OR
    apartment_id IN (SELECT apartment_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Admin can insert payments" ON payments
  FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admin can update payments" ON payments
  FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admin can delete payments" ON payments
  FOR DELETE
  USING (is_admin());

-- RLS Policies for expenses (all authenticated users can view)
CREATE POLICY "Users can view expenses" ON expenses
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin can insert expenses" ON expenses
  FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admin can update expenses" ON expenses
  FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admin can delete expenses" ON expenses
  FOR DELETE
  USING (is_admin());

-- RLS Policies for late fees (fixed)
CREATE POLICY "Users can view late fees" ON late_fees
  FOR SELECT
  USING (
    is_admin()
    OR
    apartment_id IN (SELECT apartment_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Admin can manage late fees" ON late_fees
  FOR ALL
  USING (is_admin());

-- RLS Policies for invitation codes
CREATE POLICY "Admin can manage invitation codes" ON invitation_codes
  FOR ALL
  USING (is_admin());

CREATE POLICY "Anyone can view active invitation codes" ON invitation_codes
  FOR SELECT
  USING (is_active = true AND expires_at > NOW());
