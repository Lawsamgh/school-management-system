DROP POLICY IF EXISTS "Users can read their own role" ON user_roles;
DROP POLICY IF EXISTS "Admins can read all roles" ON user_roles;
DROP POLICY IF EXISTS "Allow authenticated users to read roles" ON user_roles; 