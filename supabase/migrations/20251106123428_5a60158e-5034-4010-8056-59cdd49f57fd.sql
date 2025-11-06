-- Make category nullable in time_entries since we're removing it from the UI
ALTER TABLE time_entries ALTER COLUMN category DROP NOT NULL;
ALTER TABLE time_entries ALTER COLUMN category SET DEFAULT NULL;