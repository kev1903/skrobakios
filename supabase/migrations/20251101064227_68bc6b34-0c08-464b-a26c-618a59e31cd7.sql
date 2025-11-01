-- Update all stakeholders with category 'trade' to 'subcontractor'
UPDATE stakeholders 
SET category = 'subcontractor' 
WHERE category = 'trade';