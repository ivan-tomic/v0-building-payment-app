-- Create tables for building management app

-- Apartments table
CREATE TABLE IF NOT EXISTS apartments (
  id BIGSERIAL PRIMARY KEY,
  building_number INT NOT NULL,
  apartment_number INT NOT NULL,
  floor INT NOT NULL,
  size_sqm DECIMAL(5, 2),
  monthly_fee DECIMAL(10, 2) NOT NULL DEFAULT 0.2,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(building_number, apartment_number)
);

-- Users table (connected to Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'tenant')),
  apartment_id BIGINT REFERENCES apartments(id),
  is_active BOOLEAN DEFAULT TRUE,
  invitation_code TEXT UNIQUE,
  invitation_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id BIGSERIAL PRIMARY KEY,
  apartment_id BIGINT NOT NULL REFERENCES apartments(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  payment_date DATE NOT NULL,
  month INT NOT NULL,
  year INT NOT NULL,
  payment_method TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(apartment_id, month, year)
);

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  expense_date DATE NOT NULL,
  month INT NOT NULL,
  year INT NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Late Fees table
CREATE TABLE IF NOT EXISTS late_fees (
  id BIGSERIAL PRIMARY KEY,
  apartment_id BIGINT NOT NULL REFERENCES apartments(id) ON DELETE CASCADE,
  payment_id BIGINT REFERENCES payments(id) ON DELETE CASCADE,
  fee_amount DECIMAL(10, 2) NOT NULL,
  month INT NOT NULL,
  year INT NOT NULL,
  paid BOOLEAN DEFAULT FALSE,
  paid_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(apartment_id, month, year)
);

-- Invitation Codes table
CREATE TABLE IF NOT EXISTS invitation_codes (
  id BIGSERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  apartment_id BIGINT NOT NULL REFERENCES apartments(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  used_by UUID REFERENCES auth.users(id),
  used_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP + INTERVAL '90 days'
);

-- Enable RLS (Row Level Security)
ALTER TABLE apartments ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE late_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitation_codes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for apartments
CREATE POLICY "Users can view their own apartment" ON apartments
  FOR SELECT
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
    OR
    id IN (SELECT apartment_id FROM users WHERE id = auth.uid())
  );

-- RLS Policies for users
CREATE POLICY "Admin can view all users" ON users
  FOR SELECT
  USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT
  USING (id = auth.uid());

-- RLS Policies for payments
CREATE POLICY "Admin can view all payments" ON payments
  FOR SELECT
  USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Tenants can view payments for their apartment" ON payments
  FOR SELECT
  USING (
    apartment_id IN (SELECT apartment_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Admin can insert payments" ON payments
  FOR INSERT
  WITH CHECK ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Admin can update payments" ON payments
  FOR UPDATE
  USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');

-- RLS Policies for expenses
CREATE POLICY "All users can view expenses" ON expenses
  FOR SELECT
  USING (TRUE);

-- RLS Policies for late fees
CREATE POLICY "Admin can view all late fees" ON late_fees
  FOR SELECT
  USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Tenants can view late fees for their apartment" ON late_fees
  FOR SELECT
  USING (
    apartment_id IN (SELECT apartment_id FROM users WHERE id = auth.uid())
  );

-- RLS Policies for invitation codes
CREATE POLICY "Admin can manage invitation codes" ON invitation_codes
  FOR ALL
  USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');

-- Create indexes for performance
CREATE INDEX idx_users_apartment_id ON users(apartment_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_payments_apartment_id ON payments(apartment_id);
CREATE INDEX idx_payments_month_year ON payments(month, year);
CREATE INDEX idx_expenses_month_year ON expenses(month, year);
CREATE INDEX idx_late_fees_apartment_id ON late_fees(apartment_id);
CREATE INDEX idx_late_fees_paid ON late_fees(paid);
CREATE INDEX idx_invitation_codes_apartment_id ON invitation_codes(apartment_id);
