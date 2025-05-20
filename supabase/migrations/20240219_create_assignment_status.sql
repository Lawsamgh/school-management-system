-- Create assignment_status table
CREATE TABLE IF NOT EXISTS assignment_status (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    student_id BIGINT NOT NULL REFERENCES user_roles(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
    submitted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(assignment_id, student_id)
);

-- Create an index for faster lookups
CREATE INDEX idx_assignment_status_lookup ON assignment_status(assignment_id, student_id);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_assignment_status_updated_at
    BEFORE UPDATE ON assignment_status
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS (Row Level Security) policies
ALTER TABLE assignment_status ENABLE ROW LEVEL SECURITY;

-- Policy for students to view their own submissions
CREATE POLICY "Students can view their own submissions"
    ON assignment_status
    FOR SELECT
    TO authenticated
    USING (
        auth.uid()::text = (
            SELECT user_id::text 
            FROM user_roles 
            WHERE id = student_id
        )
    );

-- Policy for students to update their own submissions
CREATE POLICY "Students can update their own submissions"
    ON assignment_status
    FOR UPDATE
    TO authenticated
    USING (
        auth.uid()::text = (
            SELECT user_id::text 
            FROM user_roles 
            WHERE id = student_id
        )
    )
    WITH CHECK (
        auth.uid()::text = (
            SELECT user_id::text 
            FROM user_roles 
            WHERE id = student_id
        )
    );

-- Policy for teachers to view submissions for their class
CREATE POLICY "Teachers can view submissions for their class"
    ON assignment_status
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            JOIN assignments a ON a.class_id = ur.class_id
            WHERE ur.user_id = auth.uid()
            AND ur.role = 'teacher'
            AND a.id = assignment_status.assignment_id
        )
    );

-- Policy for admins to view all submissions in their school
CREATE POLICY "Admins can view all submissions in their school"
    ON assignment_status
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            JOIN assignments a ON a.school_id = ur.school_id
            WHERE ur.user_id = auth.uid()
            AND ur.role IN ('admin', 'superadmin')
            AND a.id = assignment_status.assignment_id
        )
    );

-- Add comments to the table and columns
COMMENT ON TABLE assignment_status IS 'Tracks the submission status of assignments for each student';
COMMENT ON COLUMN assignment_status.id IS 'Unique identifier for the assignment status record';
COMMENT ON COLUMN assignment_status.assignment_id IS 'Reference to the assignment';
COMMENT ON COLUMN assignment_status.student_id IS 'Reference to the student user_role';
COMMENT ON COLUMN assignment_status.status IS 'Current status of the assignment (pending or completed)';
COMMENT ON COLUMN assignment_status.submitted_at IS 'Timestamp when the assignment was submitted';
COMMENT ON COLUMN assignment_status.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN assignment_status.updated_at IS 'Timestamp when the record was last updated'; 