-- Make rfi_number nullable since not all issues are RFIs
ALTER TABLE issues 
ALTER COLUMN rfi_number DROP NOT NULL;