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

-- Users table (standalone, no external auth system)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'tenant')),
  apartment_id BIGINT REFERENCES apartments(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
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
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
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
  created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
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
  created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  used_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP + INTERVAL '90 days'
);

-- Note: RLS (Row Level Security) policies are not used in this setup.
-- Access control is handled at the application level via NextAuth session checks.
-- All API routes verify user authentication and role before executing queries.

-- Create indexes for performance
CREATE INDEX idx_users_apartment_id ON users(apartment_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_payments_apartment_id ON payments(apartment_id);
CREATE INDEX idx_payments_month_year ON payments(month, year);
CREATE INDEX idx_expenses_month_year ON expenses(month, year);
CREATE INDEX idx_late_fees_apartment_id ON late_fees(apartment_id);
CREATE INDEX idx_late_fees_paid ON late_fees(paid);
CREATE INDEX idx_invitation_codes_apartment_id ON invitation_codes(apartment_id);
