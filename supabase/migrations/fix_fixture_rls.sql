-- Migration: Fix RLS for fixture table
-- Objective: Allow administrators (is_admin = true) or permission_role = 'admin' to manage fixtures

-- 1. Enable RLS
ALTER TABLE fixture ENABLE ROW LEVEL SECURITY;

-- 2. Public Read Access
DROP POLICY IF EXISTS "Public Read" ON fixture;
CREATE POLICY "Public Read" ON fixture 
  FOR SELECT 
  USING (true);

-- 3. Admin and Fixture Manager Insert Access
DROP POLICY IF EXISTS "Admins can insert" ON fixture;
CREATE POLICY "Admins can insert" ON fixture 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND (profiles.is_admin = true OR profiles.permission_role = 'admin' OR profiles.permission_role = 'fixture_manager')
    )
  );

-- 4. Admin and Fixture Manager Update Access
DROP POLICY IF EXISTS "Admins can update" ON fixture;
CREATE POLICY "Admins can update" ON fixture 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND (profiles.is_admin = true OR profiles.permission_role = 'admin' OR profiles.permission_role = 'fixture_manager')
    )
  );

-- 5. Admin and Fixture Manager Delete Access
DROP POLICY IF EXISTS "Admins can delete" ON fixture;
CREATE POLICY "Admins can delete" ON fixture 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND (profiles.is_admin = true OR profiles.permission_role = 'admin' OR profiles.permission_role = 'fixture_manager')
    )
  );
