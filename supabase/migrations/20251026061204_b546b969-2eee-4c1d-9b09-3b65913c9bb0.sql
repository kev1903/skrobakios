-- Remove duplicate WBS items with same wbs_id = '4'
-- Keep the first one (with cost in title) and delete the duplicate
DELETE FROM wbs_items 
WHERE id = '5d6755e8-097e-4bd3-acdd-c8bdbded6ac4';