-- First, disable RLS to make sure we start fresh
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;

-- Enable RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Create a simple policy that allows authenticated users to read any role
-- This is simpler and avoids the recursion issue
CREATE POLICY "Allow authenticated users to read roles"
ON user_roles
FOR SELECT
TO authenticated
USING (true);

-- If you want to restrict users to only see their own role, use this instead:
-- CREATE POLICY "Users can read their own role"
-- ON user_roles
-- FOR SELECT
-- TO authenticated
-- USING (auth.jwt()->>'email' = email);

-- Create a policy that allows admins to read all roles (optional)
CREATE POLICY "Admins can read all roles"
ON user_roles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE email = auth.jwt()->>'email'
    AND role = 'SuperAdmin'
  )
); 