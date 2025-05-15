-- Add family-related columns to user_roles table
ALTER TABLE user_roles 
ADD COLUMN family_name TEXT,
ADD COLUMN family_relationship TEXT,
ADD COLUMN family_email TEXT,
ADD COLUMN emergency_contact TEXT,
ADD COLUMN address TEXT; 