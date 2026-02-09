-- Create opportunities table
CREATE TABLE IF NOT EXISTS public.opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  stage_code TEXT NOT NULL DEFAULT 'identification',
  status_code TEXT NOT NULL DEFAULT 'open',
  source_code TEXT,
  estimated_value DECIMAL(12, 2),
  probability INTEGER DEFAULT 50 CHECK (probability >= 0 AND probability <= 100),
  expected_close_date DATE,
  actual_close_date DATE,
  assigned_to_id UUID REFERENCES auth.users(id),
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create opportunity_notes table
CREATE TABLE IF NOT EXISTS public.opportunity_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE CASCADE NOT NULL,
  note TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX idx_opportunities_company ON public.opportunities(company_id);
CREATE INDEX idx_opportunities_stage ON public.opportunities(stage_code);
CREATE INDEX idx_opportunities_status ON public.opportunities(status_code);
CREATE INDEX idx_opportunities_assigned ON public.opportunities(assigned_to_id);
CREATE INDEX idx_opportunity_notes_opportunity ON public.opportunity_notes(opportunity_id);

-- Enable RLS
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunity_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for opportunities
-- Users with read permission can view all opportunities
CREATE POLICY "Opportunities are viewable by authenticated users with read permission"
  ON public.opportunities FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid()
    )
  );

-- Users with write permission can insert opportunities
CREATE POLICY "Opportunities are insertable by users with write permission"
  ON public.opportunities FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'tecnico')
    )
  );

-- Users with write permission can update opportunities
CREATE POLICY "Opportunities are updatable by users with write permission"
  ON public.opportunities FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'tecnico')
    )
  );

-- Users with write permission can delete opportunities
CREATE POLICY "Opportunities are deletable by users with write permission"
  ON public.opportunities FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'tecnico')
    )
  );

-- RLS Policies for opportunity_notes
-- Users with read permission can view all opportunity notes
CREATE POLICY "Opportunity notes are viewable by authenticated users with read permission"
  ON public.opportunity_notes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid()
    )
  );

-- Users with write permission can insert opportunity notes
CREATE POLICY "Opportunity notes are insertable by users with write permission"
  ON public.opportunity_notes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'tecnico')
    )
  );

-- Users with write permission can update opportunity notes
CREATE POLICY "Opportunity notes are updatable by users with write permission"
  ON public.opportunity_notes FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'tecnico')
    )
  );

-- Users with write permission can delete opportunity notes
CREATE POLICY "Opportunity notes are deletable by users with write permission"
  ON public.opportunity_notes FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'tecnico')
    )
  );

-- Add comments to document the tables
COMMENT ON TABLE public.opportunities IS 'Tracks business opportunities (pipeline) by company with stage, status, and value information';
COMMENT ON TABLE public.opportunity_notes IS 'Notes and activity log for opportunities';
COMMENT ON COLUMN public.opportunities.company_id IS 'Foreign key to empresas table';
COMMENT ON COLUMN public.opportunities.stage_code IS 'Current stage in the sales pipeline (from catalogs)';
COMMENT ON COLUMN public.opportunities.status_code IS 'Current status of the opportunity (from catalogs)';
COMMENT ON COLUMN public.opportunities.source_code IS 'Origin/source of the opportunity (from catalogs)';
COMMENT ON COLUMN public.opportunities.estimated_value IS 'Estimated monetary value of the opportunity';
COMMENT ON COLUMN public.opportunities.probability IS 'Probability of closing (0-100%)';
