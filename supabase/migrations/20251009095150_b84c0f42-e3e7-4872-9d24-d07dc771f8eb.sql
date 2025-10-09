-- Create document_categories table
CREATE TABLE IF NOT EXISTS public.document_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  document_type text NOT NULL,
  section_number integer NOT NULL,
  section_name text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(section_number, sort_order)
);

-- Enable RLS
ALTER TABLE public.document_categories ENABLE ROW LEVEL SECURITY;

-- Create policy for viewing document categories (all authenticated users)
CREATE POLICY "Authenticated users can view document categories"
  ON public.document_categories
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Create policy for managing document categories (superadmins only)
CREATE POLICY "Superadmins can manage document categories"
  ON public.document_categories
  FOR ALL
  TO authenticated
  USING (is_superadmin())
  WITH CHECK (is_superadmin());

-- Insert all document categories from the existing array
INSERT INTO public.document_categories (name, document_type, section_number, section_name, sort_order) VALUES
  -- Section 1: Application & Administrative Documents
  ('Application Form for a Building Permit', 'document', 1, 'Application & Administrative Documents', 1),
  ('Owner–Builder / Agent Authority Form', 'document', 1, 'Application & Administrative Documents', 2),
  ('Section 30A – Document Checklist', 'document', 1, 'Application & Administrative Documents', 3),
  ('Section 80 – Builder Appointment Form', 'document', 1, 'Application & Administrative Documents', 4),
  ('Re-establishment, Feature & Level Survey', 'document', 1, 'Application & Administrative Documents', 5),
  ('Title, Plan of Subdivision & Covenant', 'document', 1, 'Application & Administrative Documents', 6),
  ('Property Report / Land Data Report', 'report', 1, 'Application & Administrative Documents', 7),
  ('Planning Property Report', 'report', 1, 'Application & Administrative Documents', 8),
  ('Council Zoning / Planning Information Letter', 'document', 1, 'Application & Administrative Documents', 9),
  ('Google Site Photos / Site Inspection Photos', 'image', 1, 'Application & Administrative Documents', 10),
  ('Domestic Building Insurance Certificate (DBI)', 'document', 1, 'Application & Administrative Documents', 11),
  ('Builders Contract & Construction Management Letter', 'document', 1, 'Application & Administrative Documents', 12),
  ('Building Surveyor Appointment Form', 'document', 1, 'Application & Administrative Documents', 13),
  ('Form 2 – Building Permit', 'document', 1, 'Application & Administrative Documents', 14),
  ('Form 6 – Protection Work Determination', 'document', 1, 'Application & Administrative Documents', 15),
  ('Form 7 – Protection Work Notice(s)', 'document', 1, 'Application & Administrative Documents', 16),
  ('Form 8 – Protection Work Agreement(s)', 'document', 1, 'Application & Administrative Documents', 17),
  ('Reg 51 – Property Information', 'document', 1, 'Application & Administrative Documents', 18),
  ('Reg 74 – Approved Permit (and Extension of Time)', 'document', 1, 'Application & Administrative Documents', 19),
  ('Reg 133 – Performance Solution Report / LPD', 'report', 1, 'Application & Administrative Documents', 20),
  ('Reg 126 – Certificate of Compliance (Structural, Civil, Stormwater)', 'document', 1, 'Application & Administrative Documents', 21),

  -- Section 2: Engineering & Technical Reports
  ('Structural Engineering Plans (Stamped)', 'drawing', 2, 'Engineering & Technical Reports', 1),
  ('Structural Computations & Certification (Reg 126 CoC)', 'report', 2, 'Engineering & Technical Reports', 2),
  ('Civil Engineering Plans (Drainage, Stormwater, Driveway)', 'drawing', 2, 'Engineering & Technical Reports', 3),
  ('Civil / Structural Combined Certificate of Compliance (Reg 126)', 'document', 2, 'Engineering & Technical Reports', 4),
  ('Drainage Computations', 'report', 2, 'Engineering & Technical Reports', 5),
  ('Sewer Plan & Stormwater Layout Plan', 'drawing', 2, 'Engineering & Technical Reports', 6),
  ('Soil Report (Geotechnical Investigation)', 'report', 2, 'Engineering & Technical Reports', 7),
  ('Energy Rating Report (NatHERS or Section J)', 'report', 2, 'Engineering & Technical Reports', 8),
  ('Energy-Endorsed Drawings', 'drawing', 2, 'Engineering & Technical Reports', 9),
  ('Performance Solution – Regulation 38 Statement (if applicable)', 'report', 2, 'Engineering & Technical Reports', 10),
  ('Engineering Design Schedule / Compliance Summary', 'document', 2, 'Engineering & Technical Reports', 11),
  ('Site Sewer / Drainage Connection Approval', 'document', 2, 'Engineering & Technical Reports', 12),
  ('Re-establishment Survey Plan (Feature & Level)', 'drawing', 2, 'Engineering & Technical Reports', 13),

  -- Section 3: Architectural & Design Drawings
  ('Architectural Plans (Working Drawings – Site, Floor, Elevations, Sections, Roof Plan)', 'drawing', 3, 'Architectural & Design Drawings', 1),
  ('Design Plans & Details (Architectural Set)', 'drawing', 3, 'Architectural & Design Drawings', 2),
  ('LD Planning & Basic Property Reports', 'report', 3, 'Architectural & Design Drawings', 3),
  ('3D / Rendered Design Package (if applicable)', 'drawing', 3, 'Architectural & Design Drawings', 4),
  ('Landscape Detail Design Package', 'drawing', 3, 'Architectural & Design Drawings', 5),
  ('Skylight / Window / Door Schedule', 'specification', 3, 'Architectural & Design Drawings', 6),
  ('Nathers Energy Drawings (Stamped)', 'drawing', 3, 'Architectural & Design Drawings', 7),
  ('Form 18 – Partial Compliance (Energy Efficiency)', 'document', 3, 'Architectural & Design Drawings', 8),
  ('Section 10 Application (BCA / NCC Compliance)', 'document', 3, 'Architectural & Design Drawings', 9),
  ('Section 10 Determination (Pre-May 2023 NCC)', 'document', 3, 'Architectural & Design Drawings', 10),
  ('Specification Book / Building Notes', 'specification', 3, 'Architectural & Design Drawings', 11),
  ('Site Signage & Project Sign Plan', 'drawing', 3, 'Architectural & Design Drawings', 12),

  -- Section 4: Product Certifications & Technical Data
  ('Manufacturer Codemarks & Product Certificates (e.g., Axon, Knauf, Skylight, Cladding Systems)', 'specification', 4, 'Product Certifications & Technical Data', 1),
  ('Installation Manuals & Technical Datasheets', 'specification', 4, 'Product Certifications & Technical Data', 2),
  ('Warranty Certificates (Cladding, Roofing, Windows, etc.)', 'document', 4, 'Product Certifications & Technical Data', 3),
  ('Bushfire Attack Level (BAL) Report (if applicable)', 'report', 4, 'Product Certifications & Technical Data', 4),
  ('Acoustic Report / Engineer''s Certification (if required)', 'report', 4, 'Product Certifications & Technical Data', 5),

  -- Section 5: Protection & Inspection Reports
  ('Protection Work Forms (6, 7, 8)', 'document', 5, 'Protection & Inspection Reports', 1),
  ('Protection Work Insurance Certificate', 'document', 5, 'Protection & Inspection Reports', 2),
  ('Dilapidation Reports (Pre- and Post-Construction)', 'report', 5, 'Protection & Inspection Reports', 3),
  ('Inspection Reports (e.g., Bored Piers, Frame, Slab, etc.)', 'report', 5, 'Protection & Inspection Reports', 4),
  ('Building Surveyor Inspection Requirements & Sign-Offs', 'document', 5, 'Protection & Inspection Reports', 5),
  ('Site Safety Signage Documentation', 'document', 5, 'Protection & Inspection Reports', 6),

  -- Section 6: Compliance & Authority Approvals
  ('Building Permit (Stamped & Signed)', 'document', 6, 'Compliance & Authority Approvals', 1),
  ('Planning Permit (if applicable)', 'document', 6, 'Compliance & Authority Approvals', 2),
  ('Energy Efficiency Compliance Certificates', 'document', 6, 'Compliance & Authority Approvals', 3),
  ('Drainage Certificate of Compliance', 'document', 6, 'Compliance & Authority Approvals', 4),
  ('Structural Certificate of Compliance (Reg 126)', 'document', 6, 'Compliance & Authority Approvals', 5),
  ('Stormwater Certificate of Compliance', 'document', 6, 'Compliance & Authority Approvals', 6),
  ('Consent & Report (if required by adjoining properties or authorities)', 'report', 6, 'Compliance & Authority Approvals', 7),
  ('Melbourne Water / Council Approval Letters', 'document', 6, 'Compliance & Authority Approvals', 8),
  ('Performance Solution Reports (Reg 38 / Reg 233)', 'report', 6, 'Compliance & Authority Approvals', 9),

  -- Section 7: Optional / Project-Specific Documents
  ('Construction Management Plan', 'document', 7, 'Optional / Project-Specific Documents', 1),
  ('Environmental / Waste Management Plan', 'document', 7, 'Optional / Project-Specific Documents', 2),
  ('Traffic Management Plan', 'document', 7, 'Optional / Project-Specific Documents', 3),
  ('Site Sign-Off Documents', 'document', 7, 'Optional / Project-Specific Documents', 4),
  ('As-Built Drawings (post-construction)', 'drawing', 7, 'Optional / Project-Specific Documents', 5),
  ('Occupancy Permit or Certificate of Final Inspection', 'document', 7, 'Optional / Project-Specific Documents', 6);

-- Create index for faster queries
CREATE INDEX idx_document_categories_section ON public.document_categories(section_number, sort_order);
CREATE INDEX idx_document_categories_active ON public.document_categories(is_active) WHERE is_active = true;