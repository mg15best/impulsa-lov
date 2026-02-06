-- Create company_compliance table for managing company consent data
-- This table has a 1:1 relationship with empresas table

CREATE TABLE IF NOT EXISTS public.company_compliance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL UNIQUE REFERENCES public.empresas(id) ON DELETE CASCADE,
  data_protection_consent BOOLEAN DEFAULT false,
  data_consent_date DATE,
  image_rights_consent BOOLEAN DEFAULT false,
  image_consent_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Create index on company_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_company_compliance_company_id ON public.company_compliance(company_id);

-- Add comment for documentation
COMMENT ON TABLE public.company_compliance IS 'Stores compliance and consent information for companies with 1:1 relationship to empresas';
COMMENT ON COLUMN public.company_compliance.company_id IS 'Foreign key to empresas table, unique to enforce 1:1 relationship';
COMMENT ON COLUMN public.company_compliance.data_protection_consent IS 'Consent for data protection (GDPR compliance)';
COMMENT ON COLUMN public.company_compliance.data_consent_date IS 'Date when data protection consent was given';
COMMENT ON COLUMN public.company_compliance.image_rights_consent IS 'Consent for image rights usage';
COMMENT ON COLUMN public.company_compliance.image_consent_date IS 'Date when image rights consent was given';

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_company_compliance_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_company_compliance_updated_at
  BEFORE UPDATE ON public.company_compliance
  FOR EACH ROW
  EXECUTE FUNCTION public.update_company_compliance_updated_at();

-- Enable Row Level Security
ALTER TABLE public.company_compliance ENABLE ROW LEVEL SECURITY;

-- RLS Policy: All authenticated users can view compliance data
CREATE POLICY "Authenticated users can view company compliance"
  ON public.company_compliance
  FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policy: Users with write permissions can create compliance records
-- Same logic as empresas: user must be admin or tecnico and be the creator
CREATE POLICY "Users with write permissions can create company compliance"
  ON public.company_compliance
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = created_by AND
    (public.is_admin(auth.uid()) OR public.has_role(auth.uid(), 'tecnico'))
  );

-- RLS Policy: Admin can update any compliance record, tecnico only their own
CREATE POLICY "Users can update company compliance based on role"
  ON public.company_compliance
  FOR UPDATE
  TO authenticated
  USING (
    public.is_admin(auth.uid()) OR
    (public.has_role(auth.uid(), 'tecnico') AND created_by = auth.uid())
  )
  WITH CHECK (
    public.is_admin(auth.uid()) OR
    (public.has_role(auth.uid(), 'tecnico') AND created_by = auth.uid())
  );

-- RLS Policy: Only admin can delete compliance records
CREATE POLICY "Only admin can delete company compliance"
  ON public.company_compliance
  FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Grant necessary permissions
GRANT SELECT ON public.company_compliance TO authenticated;
GRANT INSERT ON public.company_compliance TO authenticated;
GRANT UPDATE ON public.company_compliance TO authenticated;
GRANT DELETE ON public.company_compliance TO authenticated;
