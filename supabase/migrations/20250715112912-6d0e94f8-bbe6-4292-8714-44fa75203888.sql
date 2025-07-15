-- Insert sample SK_25008 project tasks with the specified timeline
INSERT INTO sk_25008_design (
  task_name,
  task_type,
  status,
  start_date,
  end_date,
  duration_days,
  progress_percentage,
  description,
  requirements,
  compliance_notes,
  company_id
) VALUES 
(
  'Initial Consultation',
  'consultation',
  'complete',
  '2025-07-13',
  '2025-07-15',
  3,
  100,
  'Initial client consultation and requirements gathering',
  'Meet with client to understand project requirements and scope',
  'Consultation completed successfully with all requirements documented',
  (SELECT id FROM companies LIMIT 1)
),
(
  'Concept Design',
  'design',
  'pending',
  '2025-07-16',
  '2025-07-19',
  4,
  0,
  'Initial concept design and layout development',
  'Create initial design concepts based on client requirements',
  'Must comply with local building codes and zoning requirements',
  (SELECT id FROM companies LIMIT 1)
),
(
  'Detailed Design',
  'design',
  'pending',
  '2025-07-20',
  '2025-07-24',
  5,
  0,
  'Detailed architectural drawings and specifications',
  'Develop comprehensive construction drawings and technical specifications',
  'All drawings must be stamped by licensed architect',
  (SELECT id FROM companies LIMIT 1)
),
(
  'Review and Approval',
  'review',
  'pending',
  '2025-07-25',
  '2025-07-27',
  3,
  0,
  'Client review and approval of final designs',
  'Present final designs to client for review and approval',
  'Client sign-off required before proceeding to construction phase',
  (SELECT id FROM companies LIMIT 1)
)
ON CONFLICT (id) DO NOTHING;