-- Add 'voided' status to issues table (including existing statuses)
ALTER TABLE issues DROP CONSTRAINT IF EXISTS issues_status_check;
ALTER TABLE issues ADD CONSTRAINT issues_status_check CHECK (status IN ('open', 'pending', 'in_progress', 'resolved', 'closed', 'voided'));