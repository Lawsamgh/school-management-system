-- Add username column to user_roles table
ALTER TABLE user_roles ADD COLUMN username TEXT;

-- Update existing records to set username from email (temporary)
UPDATE user_roles SET username = SPLIT_PART(email, '@', 1);

-- Make username NOT NULL after setting initial values
ALTER TABLE user_roles ALTER COLUMN username SET NOT NULL; 