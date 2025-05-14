-- Create a function to generate the next ID for a role
CREATE OR REPLACE FUNCTION get_next_id_for_role(role_prefix TEXT, role_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    current_max TEXT;
    next_number BIGINT;
    new_id TEXT;
BEGIN
    -- Lock the table to prevent concurrent access
    LOCK TABLE user_roles IN SHARE MODE;
    
    -- Get the current maximum ID for this role prefix
    SELECT identification INTO current_max
    FROM user_roles
    WHERE role = role_name
    AND identification LIKE role_prefix || '%'
    ORDER BY identification DESC
    LIMIT 1;

    IF current_max IS NULL THEN
        -- No existing IDs for this role, start with 1
        next_number := 1;
    ELSE
        -- Extract the number part and increment
        next_number := (SUBSTRING(current_max FROM 3))::BIGINT + 1;
    END IF;

    -- Generate the new ID with padding (6 digits instead of 10)
    new_id := role_prefix || LPAD(next_number::TEXT, 6, '0');

    -- Verify uniqueness
    WHILE EXISTS (
        SELECT 1 
        FROM user_roles 
        WHERE identification = new_id
    ) LOOP
        next_number := next_number + 1;
        new_id := role_prefix || LPAD(next_number::TEXT, 6, '0');
    END LOOP;

    RETURN new_id;
END;
$$; 