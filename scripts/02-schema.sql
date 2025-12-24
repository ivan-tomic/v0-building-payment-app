-- =============================================
-- Building Management App - Database Schema
-- Self-hosted PostgreSQL (No Supabase)
-- =============================================

-- Drop existing tables if migrating (comment out if fresh install)
-- DROP TABLE IF EXISTS invitation_codes CASCADE;
-- DROP TABLE IF EXISTS late_fees CASCADE;
-- DROP TABLE IF EXISTS expenses CASCADE;
-- DROP TABLE IF EXISTS payments CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;
-- DROP TABLE IF EXISTS apartments CASCADE;

-- =============================================
-- TABLES
-- =============================================

-- Apartments table
CREATE TABLE IF NOT EXISTS apartments (
    id SERIAL PRIMARY KEY,
    building_number INTEGER NOT NULL,
    apartment_number INTEGER NOT NULL,
    floor INTEGER NOT NULL,
    size_sqm DECIMAL(5, 2),
    monthly_fee DECIMAL(10, 2) NOT NULL DEFAULT 0.20,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(building_number, apartment_number)
);

-- Users table (standalone, no auth.users reference)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'tenant' CHECK (role IN ('admin', 'tenant')),
    apartment_id INTEGER REFERENCES apartments(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    apartment_id INTEGER NOT NULL REFERENCES apartments(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    payment_date DATE NOT NULL,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL CHECK (year >= 2020),
    payment_method TEXT,
    notes TEXT,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(apartment_id, month, year)
);

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    expense_date DATE NOT NULL,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL CHECK (year >= 2020),
    created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Late Fees table
CREATE TABLE IF NOT EXISTS late_fees (
    id SERIAL PRIMARY KEY,
    apartment_id INTEGER NOT NULL REFERENCES apartments(id) ON DELETE CASCADE,
    payment_id INTEGER REFERENCES payments(id) ON DELETE CASCADE,
    fee_amount DECIMAL(10, 2) NOT NULL,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL CHECK (year >= 2020),
    paid BOOLEAN DEFAULT FALSE,
    paid_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(apartment_id, month, year)
);

-- Invitation Codes table
CREATE TABLE IF NOT EXISTS invitation_codes (
    id SERIAL PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    apartment_id INTEGER NOT NULL REFERENCES apartments(id) ON DELETE CASCADE,
    created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    used_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '90 days')
);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_apartment_id ON users(apartment_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_payments_apartment_id ON payments(apartment_id);
CREATE INDEX IF NOT EXISTS idx_payments_month_year ON payments(month, year);
CREATE INDEX IF NOT EXISTS idx_expenses_month_year ON expenses(month, year);
CREATE INDEX IF NOT EXISTS idx_expenses_created_by ON expenses(created_by);
CREATE INDEX IF NOT EXISTS idx_late_fees_apartment_id ON late_fees(apartment_id);
CREATE INDEX IF NOT EXISTS idx_late_fees_paid ON late_fees(paid);
CREATE INDEX IF NOT EXISTS idx_invitation_codes_code ON invitation_codes(code);
CREATE INDEX IF NOT EXISTS idx_invitation_codes_apartment_id ON invitation_codes(apartment_id);

-- =============================================
-- FUNCTIONS
-- =============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =============================================
-- TRIGGERS
-- =============================================

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_expenses_updated_at ON expenses;
CREATE TRIGGER update_expenses_updated_at
    BEFORE UPDATE ON expenses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- SEED DATA: Apartments (Skendera Kulenovića 5)
-- =============================================

-- Building 1: 29 apartments (based on your requirements)
INSERT INTO apartments (building_number, apartment_number, floor, monthly_fee) VALUES
    -- Ground floor
    (1, 1, 0, 0.20),
    (1, 2, 0, 0.20),
    -- First floor
    (1, 3, 1, 0.20),
    (1, 4, 1, 0.20),
    (1, 5, 1, 0.20),
    -- Second floor
    (1, 6, 2, 0.20),
    (1, 7, 2, 0.20),
    (1, 8, 2, 0.20),
    -- Third floor
    (1, 9, 3, 0.20),
    (1, 10, 3, 0.20),
    (1, 11, 3, 0.20),
    -- Fourth floor
    (1, 12, 4, 0.20),
    (1, 13, 4, 0.20),
    (1, 14, 4, 0.20),
    -- Fifth floor
    (1, 15, 5, 0.20),
    (1, 16, 5, 0.20),
    (1, 17, 5, 0.20),
    -- Sixth floor
    (1, 18, 6, 0.20),
    (1, 19, 6, 0.20),
    (1, 20, 6, 0.20),
    -- Seventh floor
    (1, 21, 7, 0.20),
    (1, 22, 7, 0.20),
    (1, 23, 7, 0.20),
    -- Eighth floor
    (1, 24, 8, 0.20),
    (1, 25, 8, 0.20),
    (1, 26, 8, 0.20),
    -- Ninth floor
    (1, 27, 9, 0.20),
    (1, 28, 9, 0.20),
    (1, 29, 9, 0.20)
ON CONFLICT (building_number, apartment_number) DO NOTHING;

-- =============================================
-- VERIFICATION
-- =============================================

-- Check tables created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check apartment count
SELECT COUNT(*) as apartment_count FROM apartments;
