-- Add school_id column to user_roles table
ALTER TABLE user_roles ADD COLUMN school_id UUID REFERENCES schools(id);

-- Create index for better query performance
CREATE INDEX idx_user_roles_school_id ON user_roles(school_id);

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their school's data" ON schools;
DROP POLICY IF EXISTS "Superadmin can view all schools" ON schools;

-- Enable RLS on schools table
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;

-- Create policy for regular users to view their school
CREATE POLICY "Users can view their school's data"
ON schools
FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT school_id 
    FROM user_roles 
    WHERE email = auth.jwt()->>'email'
    AND role != 'superadmin'
  )
);

-- Create policy for superadmin to view all schools
CREATE POLICY "Superadmin can view all schools"
ON schools
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM user_roles 
    WHERE email = auth.jwt()->>'email'
    AND role = 'superadmin'
  )
);

-- Create function to check if user is superadmin
CREATE OR REPLACE FUNCTION check_is_superadmin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM user_roles
    WHERE email = auth.jwt()->>'email'
    AND role = 'superadmin'
  );
END;
$$;

-- Insert a test school if none exist
INSERT INTO schools (name, email, phone, address, type)
SELECT 
  'Test School',
  'test@school.com',
  '+233123456789',
  'Test Address',
  'primary'
WHERE NOT EXISTS (SELECT 1 FROM schools LIMIT 1); 