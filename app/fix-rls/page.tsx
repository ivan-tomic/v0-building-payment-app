'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useState } from 'react'

const SQL_TO_RUN = `-- Complete RLS policy reset - drops ALL policies and recreates them correctly

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

CREATE POLICY "Authenticated users can insert apartments" ON apartments
  FOR INSERT
  TO authenticated
  WITH CHECK (TRUE);

CREATE POLICY "Authenticated users can update apartments" ON apartments
  FOR UPDATE
  TO authenticated
  USING (TRUE);

CREATE POLICY "Authenticated users can delete apartments" ON apartments
  FOR DELETE
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
  USING (TRUE);`

export default function FixRLSPage() {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(SQL_TO_RUN)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle>Popravi RLS politike</CardTitle>
          <CardDescription>
            Pratite korake ispod da popravite RLS politike i riješite problem beskonačne rekurzije.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-yellow-50 p-4 text-sm text-yellow-800">
            <p className="font-semibold">Problem:</p>
            <p>RLS politike u bazi podataka uzrokuju beskonačnu rekurziju prilikom prijave.</p>
          </div>

          <div className="space-y-2">
            <p className="font-semibold">Koraci za rješavanje:</p>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Idite na <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Supabase Dashboard</a></li>
              <li>Kliknite na vaš projekat</li>
              <li>U lijevom meniju kliknite na "SQL Editor"</li>
              <li>Kliknite "New query"</li>
              <li>Kopirajte SQL kod ispod i zalijepite ga u editor</li>
              <li>Kliknite "Run" (ili pritisnite Ctrl+Enter)</li>
              <li>Nakon uspješnog izvršavanja, vratite se i prijavite se ponovo</li>
            </ol>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-sm">SQL kod za izvršavanje:</p>
              <Button onClick={handleCopy} variant="outline" size="sm">
                {copied ? 'Kopirano!' : 'Kopiraj SQL'}
              </Button>
            </div>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs max-h-96 overflow-y-auto">
              {SQL_TO_RUN}
            </pre>
          </div>

          <div className="flex gap-2">
            <Button asChild variant="default" className="flex-1">
              <Link href="/auth/signin">Nazad na prijavu</Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href="/cleanup">Očisti sve podatke</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
