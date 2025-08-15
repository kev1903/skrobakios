-- Add sample projects to the active company for testing
-- This will give the user some projects to see in the interface

INSERT INTO projects (
  id,
  company_id,
  project_id,
  name,
  description,
  status,
  priority,
  location,
  contract_price,
  start_date,
  deadline,
  created_at,
  updated_at
) VALUES 
  (
    gen_random_uuid(),
    '4042458b-8e95-4842-90d9-29f43815ecf8',  -- Skrobaki company ID
    'PROJ-001',
    'Melbourne Office Renovation',
    'Complete renovation of the Melbourne office building including new electrical systems and interior design.',
    'in_progress',
    'High',
    '123 Collins Street, Melbourne VIC 3000',
    '$450000',
    '2024-01-15',
    '2024-06-30',
    now(),
    now()
  ),
  (
    gen_random_uuid(),
    '4042458b-8e95-4842-90d9-29f43815ecf8',
    'PROJ-002',
    'Sydney Warehouse Construction',
    'New warehouse facility construction with modern logistics systems.',
    'pending',
    'Medium',
    '789 Industrial Drive, Sydney NSW 2000',
    '$2300000',
    '2024-03-01',
    '2024-12-15',
    now(),
    now()
  ),
  (
    gen_random_uuid(),
    '4042458b-8e95-4842-90d9-29f43815ecf8',
    'PROJ-003',
    'Brisbane Residential Complex',
    'Multi-story residential complex with 50 units and underground parking.',
    'completed',
    'High',
    '456 River Road, Brisbane QLD 4000',
    '$8500000',
    '2023-06-01',
    '2024-02-28',
    now(),
    now()
  ),
  (
    gen_random_uuid(),
    '4042458b-8e95-4842-90d9-29f43815ecf8',
    'PROJ-004',
    'Perth Shopping Center Expansion',
    'Expansion of existing shopping center with new retail spaces and food court.',
    'in_progress',
    'Medium',
    '321 Shopping Plaza, Perth WA 6000',
    '$1200000',
    '2024-02-01',
    '2024-08-31',
    now(),
    now()
  ),
  (
    gen_random_uuid(),
    '4042458b-8e95-4842-90d9-29f43815ecf8',
    'PROJ-005',
    'Adelaide Hospital Wing',
    'New medical wing construction with specialized equipment installation.',
    'pending',
    'High',
    '987 Medical Boulevard, Adelaide SA 5000',
    '$3400000',
    '2024-05-01',
    '2025-03-31',
    now(),
    now()
  );