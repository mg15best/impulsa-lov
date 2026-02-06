-- Create catalogs table for transversal catalog management
-- This table will store all catalog entries as code-label pairs grouped by catalog_type

CREATE TABLE IF NOT EXISTS public.catalogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  catalog_type TEXT NOT NULL,
  code TEXT NOT NULL,
  label TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (catalog_type, code)
);

-- Create indexes for better query performance
CREATE INDEX idx_catalogs_type ON public.catalogs(catalog_type);
CREATE INDEX idx_catalogs_active ON public.catalogs(catalog_type, is_active) WHERE is_active = true;
CREATE INDEX idx_catalogs_order ON public.catalogs(catalog_type, sort_order);

-- Enable RLS
ALTER TABLE public.catalogs ENABLE ROW LEVEL SECURITY;

-- Policy: All authenticated users can view active catalogs
CREATE POLICY "Catalogs are viewable by authenticated users" ON public.catalogs
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Policy: Only admins can modify catalogs
CREATE POLICY "Catalogs are manageable by admins" ON public.catalogs
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_catalogs_updated_at
  BEFORE UPDATE ON public.catalogs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed initial catalog data for event types (matching existing enum values)
INSERT INTO public.catalogs (catalog_type, code, label, sort_order) VALUES
  ('event_types', 'taller', 'Taller', 1),
  ('event_types', 'seminario', 'Seminario', 2),
  ('event_types', 'networking', 'Networking', 3),
  ('event_types', 'conferencia', 'Conferencia', 4),
  ('event_types', 'presentacion', 'Presentación', 5),
  ('event_types', 'otro', 'Otro', 99);

-- Seed initial catalog data for event statuses (matching existing enum values)
INSERT INTO public.catalogs (catalog_type, code, label, sort_order) VALUES
  ('event_statuses', 'planificado', 'Planificado', 1),
  ('event_statuses', 'confirmado', 'Confirmado', 2),
  ('event_statuses', 'en_curso', 'En curso', 3),
  ('event_statuses', 'completado', 'Completado', 4),
  ('event_statuses', 'cancelado', 'Cancelado', 5);

-- Seed initial catalog data for consultation statuses (matching existing enum values)
INSERT INTO public.catalogs (catalog_type, code, label, sort_order) VALUES
  ('consultation_statuses', 'programado', 'Programado', 1),
  ('consultation_statuses', 'en_curso', 'En curso', 2),
  ('consultation_statuses', 'completado', 'Completado', 3),
  ('consultation_statuses', 'cancelado', 'Cancelado', 4);

-- Add comment to document the table
COMMENT ON TABLE public.catalogs IS 'Transversal catalog table storing code-label pairs for various catalog types across the application';
COMMENT ON COLUMN public.catalogs.catalog_type IS 'Type of catalog (e.g., event_types, event_statuses, consultation_statuses)';
COMMENT ON COLUMN public.catalogs.code IS 'Internal code value used in database fields';
COMMENT ON COLUMN public.catalogs.label IS 'Human-readable label displayed in UI';
COMMENT ON COLUMN public.catalogs.is_active IS 'Whether this catalog entry is active and should be displayed';
COMMENT ON COLUMN public.catalogs.sort_order IS 'Display order for sorting catalog entries';
