-- Update all existing issues that have NULL or empty rfi_number
UPDATE issues 
SET rfi_number = generate_rfi_number(project_id)
WHERE rfi_number IS NULL OR rfi_number = '';