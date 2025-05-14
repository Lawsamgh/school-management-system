-- Disable RLS temporarily
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;

-- Enable RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Create a simple policy that allows authenticated users to read any role
CREATE POLICY "Allow authenticated users to read roles"
ON user_roles
FOR SELECT
TO authenticated
USING (true); 