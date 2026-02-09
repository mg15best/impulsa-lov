-- Create grants table
CREATE TABLE IF NOT EXISTS public.grants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status_code TEXT NOT NULL DEFAULT 'draft',
  type_code TEXT,
  program_code TEXT,
  priority_code TEXT DEFAULT 'medium',
  amount_requested NUMERIC(15, 2),
  amount_awarded NUMERIC(15, 2),
  application_deadline DATE,
  decision_date DATE,
  grant_period_start DATE,
  grant_period_end DATE,
  responsible_user_id UUID REFERENCES auth.users(id),
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create grant_applications table
CREATE TABLE IF NOT EXISTS public.grant_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grant_id UUID REFERENCES public.grants(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status_code TEXT NOT NULL DEFAULT 'draft',
  submitted_date DATE,
  review_date DATE,
  decision_date DATE,
  assigned_to_id UUID REFERENCES auth.users(id),
  feedback TEXT,
  documents_url TEXT,
  order_index INTEGER DEFAULT 0,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX idx_grants_company ON public.grants(company_id);
CREATE INDEX idx_grants_status ON public.grants(status_code);
CREATE INDEX idx_grants_type ON public.grants(type_code);
CREATE INDEX idx_grants_program ON public.grants(program_code);
CREATE INDEX idx_grants_responsible ON public.grants(responsible_user_id);
CREATE INDEX idx_grant_applications_grant ON public.grant_applications(grant_id);
CREATE INDEX idx_grant_applications_status ON public.grant_applications(status_code);
CREATE INDEX idx_grant_applications_assigned ON public.grant_applications(assigned_to_id);

-- Enable RLS
ALTER TABLE public.grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grant_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for grants
-- Users with read permission can view all grants
CREATE POLICY "Grants are viewable by authenticated users with read permission"
  ON public.grants FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid()
    )
  );

-- Users with write permission can insert grants
CREATE POLICY "Grants are insertable by users with write permission"
  ON public.grants FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'tecnico')
    )
  );

-- Users with write permission can update grants
CREATE POLICY "Grants are updatable by users with write permission"
  ON public.grants FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'tecnico')
    )
  );

-- Users with write permission can delete grants
CREATE POLICY "Grants are deletable by users with write permission"
  ON public.grants FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'tecnico')
    )
  );

-- RLS Policies for grant_applications
-- Users with read permission can view all grant applications
CREATE POLICY "Grant applications are viewable by authenticated users with read permission"
  ON public.grant_applications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid()
    )
  );

-- Users with write permission can insert grant applications
CREATE POLICY "Grant applications are insertable by users with write permission"
  ON public.grant_applications FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'tecnico')
    )
  );

-- Users with write permission can update grant applications
CREATE POLICY "Grant applications are updatable by users with write permission"
  ON public.grant_applications FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'tecnico')
    )
  );

-- Users with write permission can delete grant applications
CREATE POLICY "Grant applications are deletable by users with write permission"
  ON public.grant_applications FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'tecnico')
    )
  );

-- Create triggers for updated_at
CREATE TRIGGER update_grants_updated_at
  BEFORE UPDATE ON public.grants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_grant_applications_updated_at
  BEFORE UPDATE ON public.grant_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add comments to document the tables
COMMENT ON TABLE public.grants IS 'Grants (subvenciones) for companies with status tracking and amount management';
COMMENT ON TABLE public.grant_applications IS 'Individual applications/submissions within a grant';
COMMENT ON COLUMN public.grants.company_id IS 'Reference to the company this grant belongs to';
COMMENT ON COLUMN public.grants.status_code IS 'Status of the grant (from catalog)';
COMMENT ON COLUMN public.grants.type_code IS 'Type of grant (from catalog)';
COMMENT ON COLUMN public.grants.program_code IS 'Grant program (from catalog)';
COMMENT ON COLUMN public.grants.priority_code IS 'Priority level (from catalog)';
COMMENT ON COLUMN public.grants.amount_requested IS 'Amount requested in the grant';
COMMENT ON COLUMN public.grants.amount_awarded IS 'Amount awarded/approved';
COMMENT ON COLUMN public.grant_applications.grant_id IS 'Reference to the parent grant';
COMMENT ON COLUMN public.grant_applications.status_code IS 'Status of the application (from catalog)';
COMMENT ON COLUMN public.grant_applications.order_index IS 'Display order within the grant';
