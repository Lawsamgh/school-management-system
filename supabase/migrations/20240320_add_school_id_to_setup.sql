-- Add school_id column to setup table
ALTER TABLE setup ADD COLUMN school_id UUID REFERENCES schools(id);

-- Create index for better query performance
CREATE INDEX idx_setup_school_id ON setup(school_id);

-- Update RLS policies to allow access to setup data
CREATE POLICY "Users can view their school's setup"
ON setup
FOR SELECT
TO authenticated
USING (
  school_id IN (
    SELECT school_id 
    FROM user_roles 
    WHERE email = auth.jwt()->>'email'
  )
);

-- Allow superadmin to view all setup data
CREATE POLICY "Superadmin can view all setup data"
ON setup
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM user_roles
    WHERE email = auth.jwt()->>'email'
    AND role = 'SuperAdmin'
  )
); 