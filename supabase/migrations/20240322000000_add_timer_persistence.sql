-- Add timer persistence fields to assignment_status table
ALTER TABLE assignment_status
ADD COLUMN started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN remaining_time INTEGER;

-- Add comment for the new columns
COMMENT ON COLUMN assignment_status.started_at IS 'When the student first started the timed assignment';
COMMENT ON COLUMN assignment_status.remaining_time IS 'Remaining time in seconds when the student last saved progress'; 