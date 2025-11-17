-- Complete RLS policy reset - drops ALL policies and recreates them correctly

-- Drop ALL existing policies on users table
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'users') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON users';
    END LOOP;
END $$;

-- Drop ALL existing policies on apartments table
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'apartments') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON apartments';
    END LOOP;
END $$;

-- Drop ALL existing policies on payments table
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'payments') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON payments';
    END LOOP;
END $$;

-- Drop ALL existing policies on expenses table
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'expenses') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON expenses';
    END LOOP;
END $$;

-- Drop ALL existing policies on late_fees table
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'late_fees') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON late_fees';
    END LOOP;
END $$;

-- Drop ALL existing policies on invitation_codes table
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'invitation_codes') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON invitation_codes';
    END LOOP;
END $$;

-- Now create new simple policies without recursion

-- Users table policies (no recursion - uses auth.uid() directly)
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

-- Expenses table policies
CREATE POLICY "Anyone authenticated can view expenses" ON expenses
  FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Authenticated users can insert expenses" ON expenses
  FOR INSERT
  TO authenticated
  WITH CHECK (TRUE);

-- Late fees table policies
CREATE POLICY "Anyone authenticated can view late fees" ON late_fees
  FOR SELECT
  TO authenticated
  USING (TRUE);

-- Invitation codes policies
CREATE POLICY "Anyone authenticated can view invitation codes" ON invitation_codes
  FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Authenticated users can insert invitation codes" ON invitation_codes
  FOR INSERT
  TO authenticated
  WITH CHECK (TRUE);

CREATE POLICY "Authenticated users can update invitation codes" ON invitation_codes
  FOR UPDATE
  TO authenticated
  USING (TRUE);
