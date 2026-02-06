-- Create reports table for company reports
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status_code TEXT NOT NULL DEFAULT 'draft',
  report_type_code TEXT,
  report_date DATE,
  content TEXT,
  conclusions TEXT,
  recommendations TEXT,
  responsible_user_id UUID REFERENCES auth.users(id),
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX idx_reports_company ON public.reports(company_id);
CREATE INDEX idx_reports_status ON public.reports(status_code);
CREATE INDEX idx_reports_type ON public.reports(report_type_code);
CREATE INDEX idx_reports_responsible ON public.reports(responsible_user_id);
CREATE INDEX idx_reports_date ON public.reports(report_date);

-- Enable RLS
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reports
-- Users with read permission can view all reports
CREATE POLICY "Reports are viewable by authenticated users with read permission"
  ON public.reports FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid()
    )
  );

-- Users with write permission can insert reports
CREATE POLICY "Reports are insertable by users with write permission"
  ON public.reports FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'tecnico')
    )
  );

-- Users with write permission can update reports
CREATE POLICY "Reports are updatable by users with write permission"
  ON public.reports FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'tecnico')
    )
  );

-- Users with write permission can delete reports
CREATE POLICY "Reports are deletable by users with write permission"
  ON public.reports FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'tecnico')
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add comments to document the table
COMMENT ON TABLE public.reports IS 'Reports for companies with tracking and management';
COMMENT ON COLUMN public.reports.company_id IS 'Reference to the company this report belongs to';
COMMENT ON COLUMN public.reports.status_code IS 'Status of the report (from catalog)';
COMMENT ON COLUMN public.reports.report_type_code IS 'Type/category of the report (from catalog)';
COMMENT ON COLUMN public.reports.report_date IS 'Date of the report';
COMMENT ON COLUMN public.reports.content IS 'Main content of the report';
COMMENT ON COLUMN public.reports.conclusions IS 'Conclusions of the report';
COMMENT ON COLUMN public.reports.recommendations IS 'Recommendations from the report';
