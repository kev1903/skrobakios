-- Update the newly added stakeholders to the correct company
UPDATE public.stakeholders 
SET company_id = '4042458b-8e95-4842-90d9-29f43815ecf8'
WHERE display_name IN (
  'Toma Power Solutions',
  'Intuitive Plumbing', 
  'J & G Plumbing Solutions',
  'Kooka',
  'Executive Heating & Cooling',
  'TBS Services Group',
  'Jay Conrad',
  'By Built'
) AND company_id = 'df0df659-7e4c-41c4-a028-495539a0b556';