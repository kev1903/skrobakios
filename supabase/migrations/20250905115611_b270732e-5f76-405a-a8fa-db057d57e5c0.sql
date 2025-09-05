-- Delete test projects created during troubleshooting
DELETE FROM public.projects 
WHERE id IN (
  'b7090822-854e-47bb-b4cb-1867279c4e7e', -- Skrobaki Test Project
  'be5ba38f-0389-460c-9304-5351a7e81d76', -- Courtscapes Test Project  
  'cb4e36eb-ff76-4f70-92a5-939f2d360e00', -- Skrobaki PM Test Project
  '99414d98-b36a-4d55-b285-42b6b8fcc3a8'  -- Test Construction Project
);