-- Add INSERT policy for apartments table so admins can seed data

-- Add INSERT policy for apartments
CREATE POLICY "Authenticated users can insert apartments" ON apartments
  FOR INSERT
  TO authenticated
  WITH CHECK (TRUE);

-- Add UPDATE policy for apartments (for future needs)
CREATE POLICY "Authenticated users can update apartments" ON apartments
  FOR UPDATE
  TO authenticated
  USING (TRUE);

-- Add DELETE policy for apartments (for cleanup)
CREATE POLICY "Authenticated users can delete apartments" ON apartments
  FOR DELETE
  TO authenticated
  USING (TRUE);
