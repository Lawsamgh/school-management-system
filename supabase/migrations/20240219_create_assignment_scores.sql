-- Create assignment_scores table
CREATE TABLE IF NOT EXISTS assignment_scores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    student_id BIGINT NOT NULL REFERENCES user_roles(id) ON DELETE CASCADE,
    score DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    max_score DECIMAL(5,2) NOT NULL,
    feedback TEXT,
    graded_by BIGINT REFERENCES user_roles(id) ON DELETE SET NULL,
    graded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(assignment_id, student_id),
    CONSTRAINT valid_score CHECK (score >= 0 AND score <= max_score)
);

-- Create an index for faster lookups
CREATE INDEX idx_assignment_scores_lookup ON assignment_scores(assignment_id, student_id);

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_assignment_scores_updated_at
    BEFORE UPDATE ON assignment_scores
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS (Row Level Security) policies
ALTER TABLE assignment_scores ENABLE ROW LEVEL SECURITY;

-- Policy for students to view their own scores
CREATE POLICY "Students can view their own scores"
    ON assignment_scores
    FOR SELECT
    TO authenticated
    USING (
        auth.uid()::text = (
            SELECT user_id::text 
            FROM user_roles 
            WHERE id = student_id
        )
    );

-- Policy for teachers to manage scores for their class
CREATE POLICY "Teachers can manage scores for their class"
    ON assignment_scores
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            JOIN assignments a ON a.class_id = ur.class_id
            WHERE ur.user_id = auth.uid()
            AND ur.role = 'teacher'
            AND a.id = assignment_scores.assignment_id
        )
    );

-- Policy for admins to manage all scores in their school
CREATE POLICY "Admins can manage all scores in their school"
    ON assignment_scores
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            JOIN assignments a ON a.school_id = ur.school_id
            WHERE ur.user_id = auth.uid()
            AND ur.role IN ('admin', 'superadmin')
            AND a.id = assignment_scores.assignment_id
        )
    );

-- Add comments to the table and columns
COMMENT ON TABLE assignment_scores IS 'Stores scores and feedback for student assignment submissions';
COMMENT ON COLUMN assignment_scores.id IS 'Unique identifier for the score record';
COMMENT ON COLUMN assignment_scores.assignment_id IS 'Reference to the assignment';
COMMENT ON COLUMN assignment_scores.student_id IS 'Reference to the student user_role';
COMMENT ON COLUMN assignment_scores.score IS 'The score achieved by the student';
COMMENT ON COLUMN assignment_scores.max_score IS 'The maximum possible score for this assignment';
COMMENT ON COLUMN assignment_scores.feedback IS 'Teacher feedback on the submission';
COMMENT ON COLUMN assignment_scores.graded_by IS 'Reference to the teacher who graded the assignment';
COMMENT ON COLUMN assignment_scores.graded_at IS 'When the assignment was graded';
COMMENT ON COLUMN assignment_scores.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN assignment_scores.updated_at IS 'Timestamp when the record was last updated'; 