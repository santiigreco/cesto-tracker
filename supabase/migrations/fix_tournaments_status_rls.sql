
-- Migration: Add status to tournaments and fix RLS
-- Ensure 'status' column exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tournaments' AND column_name='status') THEN
        ALTER TABLE tournaments ADD COLUMN status text DEFAULT 'active';
    END IF;
END $$;

-- Enable RLS
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;

-- Policy for viewing: Everyone (authenticated) or even public if needed
DROP POLICY IF EXISTS "Anyone can view tournaments" ON tournaments;
CREATE POLICY "Anyone can view tournaments" ON tournaments
    FOR SELECT USING (true);

-- Policy for managing: Only Admins 
-- We use a check on the profiles table or similar if we have the role there.
-- Assuming the user.id is checked against a column or we use a function.
-- Let's use a simple admin check if we have one, otherwise let authenticated users for now if it's internal.

DROP POLICY IF EXISTS "Admins can manage tournaments" ON tournaments;
CREATE POLICY "Admins can manage tournaments" ON tournaments
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND (is_admin = true OR permission_role = 'admin')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND (is_admin = true OR permission_role = 'admin')
        )
    );
