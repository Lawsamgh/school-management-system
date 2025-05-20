-- Add timer-related columns to assignments table
ALTER TABLE assignments 
ADD COLUMN has_timer BOOLEAN DEFAULT false,
ADD COLUMN time_limit INTEGER; -- Time limit in minutes

-- Add check constraint to ensure time_limit is positive when has_timer is true
ALTER TABLE assignments
ADD CONSTRAINT valid_timer_settings 
CHECK (
    (has_timer = false AND time_limit IS NULL) OR 
    (has_timer = true AND time_limit > 0)
);

-- Add comments for the new columns
COMMENT ON COLUMN assignments.has_timer IS 'Whether the assignment has a time limit';
COMMENT ON COLUMN assignments.time_limit IS 'Time limit in minutes for the assignment, only applicable if has_timer is true'; 