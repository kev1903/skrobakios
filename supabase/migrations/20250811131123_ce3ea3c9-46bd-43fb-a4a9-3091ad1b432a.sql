-- Insert 4.0 PRELIMINARY stage tasks
INSERT INTO public.activities (
  company_id, project_id, name, description, stage, cost_est, level, sort_order, parent_id
) VALUES
-- Using a default company_id - you'll need to replace this with actual company/project IDs
(
  (SELECT id FROM companies LIMIT 1),
  NULL, -- Will be set when assigned to specific projects
  'Site Survey and Assessment',
  'Conduct comprehensive site survey and environmental assessment',
  '4.0 PRELIMINARY',
  15000,
  1,
  1,
  NULL
),
(
  (SELECT id FROM companies LIMIT 1),
  NULL,
  'Soil Testing and Geotechnical Analysis',
  'Perform soil testing and geotechnical analysis for foundation design',
  '4.0 PRELIMINARY',
  25000,
  1,
  2,
  NULL
),
(
  (SELECT id FROM companies LIMIT 1),
  NULL,
  'Topographical Survey',
  'Complete topographical survey of the construction site',
  '4.0 PRELIMINARY',
  12000,
  1,
  3,
  NULL
),
(
  (SELECT id FROM companies LIMIT 1),
  NULL,
  'Environmental Impact Assessment',
  'Assess environmental impact and compliance requirements',
  '4.0 PRELIMINARY',
  18000,
  1,
  4,
  NULL
),
(
  (SELECT id FROM companies LIMIT 1),
  NULL,
  'Utility Survey and Mapping',
  'Survey and map existing utility infrastructure',
  '4.0 PRELIMINARY',
  8000,
  1,
  5,
  NULL
),
(
  (SELECT id FROM companies LIMIT 1),
  NULL,
  'Traffic Impact Study',
  'Analyze traffic impact and mitigation measures',
  '4.0 PRELIMINARY',
  22000,
  1,
  6,
  NULL
),
(
  (SELECT id FROM companies LIMIT 1),
  NULL,
  'Heritage and Archaeological Assessment',
  'Assess heritage and archaeological significance',
  '4.0 PRELIMINARY',
  14000,
  1,
  7,
  NULL
),
(
  (SELECT id FROM companies LIMIT 1),
  NULL,
  'Flood Risk Assessment',
  'Evaluate flood risk and drainage requirements',
  '4.0 PRELIMINARY',
  16000,
  1,
  8,
  NULL
),
(
  (SELECT id FROM companies LIMIT 1),
  NULL,
  'Noise and Vibration Assessment',
  'Assess noise and vibration impact during construction',
  '4.0 PRELIMINARY',
  9000,
  1,
  9,
  NULL
),
(
  (SELECT id FROM companies LIMIT 1),
  NULL,
  'Air Quality Assessment',
  'Evaluate air quality impact and mitigation measures',
  '4.0 PRELIMINARY',
  11000,
  1,
  10,
  NULL
),
(
  (SELECT id FROM companies LIMIT 1),
  NULL,
  'Planning Permit Application',
  'Prepare and submit planning permit applications',
  '4.0 PRELIMINARY',
  35000,
  1,
  11,
  NULL
),
(
  (SELECT id FROM companies LIMIT 1),
  NULL,
  'Building Permit Documentation',
  'Prepare building permit documentation and submissions',
  '4.0 PRELIMINARY',
  28000,
  1,
  12,
  NULL
),
(
  (SELECT id FROM companies LIMIT 1),
  NULL,
  'Concept Design Development',
  'Develop initial concept designs and layouts',
  '4.0 PRELIMINARY',
  45000,
  1,
  13,
  NULL
),
(
  (SELECT id FROM companies LIMIT 1),
  NULL,
  'Preliminary Cost Estimation',
  'Prepare preliminary cost estimates and budgets',
  '4.0 PRELIMINARY',
  12000,
  1,
  14,
  NULL
),
(
  (SELECT id FROM companies LIMIT 1),
  NULL,
  'Stakeholder Consultation',
  'Conduct stakeholder consultation and community engagement',
  '4.0 PRELIMINARY',
  20000,
  1,
  15,
  NULL
),
(
  (SELECT id FROM companies LIMIT 1),
  NULL,
  'Risk Assessment and Management Plan',
  'Develop comprehensive risk assessment and management strategies',
  '4.0 PRELIMINARY',
  24000,
  1,
  16,
  NULL
),
(
  (SELECT id FROM companies LIMIT 1),
  NULL,
  'Construction Methodology Planning',
  'Plan construction methodology and sequencing',
  '4.0 PRELIMINARY',
  18000,
  1,
  17,
  NULL
),
(
  (SELECT id FROM companies LIMIT 1),
  NULL,
  'Material Testing and Specification',
  'Test and specify construction materials and standards',
  '4.0 PRELIMINARY',
  15000,
  1,
  18,
  NULL
),
(
  (SELECT id FROM companies LIMIT 1),
  NULL,
  'Preliminary Program Schedule',
  'Develop preliminary construction program and timeline',
  '4.0 PRELIMINARY',
  10000,
  1,
  19,
  NULL
),
(
  (SELECT id FROM companies LIMIT 1),
  NULL,
  'Feasibility Study Report',
  'Compile comprehensive feasibility study report',
  '4.0 PRELIMINARY',
  32000,
  1,
  20,
  NULL
);

-- Insert 5.1 BASE STAGE tasks
INSERT INTO public.activities (
  company_id, project_id, name, description, stage, cost_est, level, sort_order, parent_id
) VALUES
(
  (SELECT id FROM companies LIMIT 1),
  NULL,
  'Site Preparation and Clearing',
  'Clear and prepare construction site including vegetation removal',
  '5.1 BASE STAGE',
  85000,
  1,
  21,
  NULL
),
(
  (SELECT id FROM companies LIMIT 1),
  NULL,
  'Excavation and Earthworks',
  'Perform bulk excavation and earthworks for foundations',
  '5.1 BASE STAGE',
  120000,
  1,
  22,
  NULL
),
(
  (SELECT id FROM companies LIMIT 1),
  NULL,
  'Foundation Construction',
  'Construct concrete foundations and footings',
  '5.1 BASE STAGE',
  180000,
  1,
  23,
  NULL
),
(
  (SELECT id FROM companies LIMIT 1),
  NULL,
  'Structural Steel Erection',
  'Erect structural steel framework and connections',
  '5.1 BASE STAGE',
  250000,
  1,
  24,
  NULL
),
(
  (SELECT id FROM companies LIMIT 1),
  NULL,
  'Concrete Slab Construction',
  'Pour and finish concrete slabs and structural elements',
  '5.1 BASE STAGE',
  160000,
  1,
  25,
  NULL
),
(
  (SELECT id FROM companies LIMIT 1),
  NULL,
  'Masonry and Blockwork',
  'Construct masonry walls and block work',
  '5.1 BASE STAGE',
  95000,
  1,
  26,
  NULL
),
(
  (SELECT id FROM companies LIMIT 1),
  NULL,
  'Roofing Structure Installation',
  'Install roofing structure and framework',
  '5.1 BASE STAGE',
  140000,
  1,
  27,
  NULL
),
(
  (SELECT id FROM companies LIMIT 1),
  NULL,
  'External Wall Framing',
  'Construct external wall framing and structure',
  '5.1 BASE STAGE',
  110000,
  1,
  28,
  NULL
),
(
  (SELECT id FROM companies LIMIT 1),
  NULL,
  'Internal Wall Framing',
  'Construct internal wall framing and partitions',
  '5.1 BASE STAGE',
  75000,
  1,
  29,
  NULL
),
(
  (SELECT id FROM companies LIMIT 1),
  NULL,
  'Waterproofing and Dampproofing',
  'Apply waterproofing and dampproofing systems',
  '5.1 BASE STAGE',
  65000,
  1,
  30,
  NULL
),
(
  (SELECT id FROM companies LIMIT 1),
  NULL,
  'Insulation Installation',
  'Install thermal and acoustic insulation systems',
  '5.1 BASE STAGE',
  45000,
  1,
  31,
  NULL
),
(
  (SELECT id FROM companies LIMIT 1),
  NULL,
  'Window and Door Frames',
  'Install window and door frames and openings',
  '5.1 BASE STAGE',
  85000,
  1,
  32,
  NULL
),
(
  (SELECT id FROM companies LIMIT 1),
  NULL,
  'Mechanical Rough-in',
  'Install mechanical systems rough-in including HVAC',
  '5.1 BASE STAGE',
  125000,
  1,
  33,
  NULL
),
(
  (SELECT id FROM companies LIMIT 1),
  NULL,
  'Electrical Rough-in',
  'Install electrical systems rough-in and conduits',
  '5.1 BASE STAGE',
  90000,
  1,
  34,
  NULL
),
(
  (SELECT id FROM companies LIMIT 1),
  NULL,
  'Plumbing Rough-in',
  'Install plumbing systems rough-in and infrastructure',
  '5.1 BASE STAGE',
  80000,
  1,
  35,
  NULL
),
(
  (SELECT id FROM companies LIMIT 1),
  NULL,
  'Fire Services Installation',
  'Install fire protection systems and equipment',
  '5.1 BASE STAGE',
  115000,
  1,
  36,
  NULL
),
(
  (SELECT id FROM companies LIMIT 1),
  NULL,
  'Exterior Cladding',
  'Install exterior cladding and weatherproofing',
  '5.1 BASE STAGE',
  135000,
  1,
  37,
  NULL
),
(
  (SELECT id FROM companies LIMIT 1),
  NULL,
  'Roofing and Guttering',
  'Install roofing materials and guttering systems',
  '5.1 BASE STAGE',
  105000,
  1,
  38,
  NULL
);