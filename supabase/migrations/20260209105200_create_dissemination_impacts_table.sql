-- PR-J: Create dissemination_impacts table for tracking outreach and engagement
-- Tracks dissemination activities and their impacts across companies and activities

-- Create enum for dissemination status
CREATE TYPE public.dissemination_status AS ENUM (
  'planned',
  'active',
  'completed',
  'cancelled'
);

-- Create enum for entity types that can have dissemination impacts
CREATE TYPE public.dissemination_entity_type AS ENUM (
  'empresa',
  'evento',
  'formacion',
  'material',
  'general' -- For general campaigns not tied to specific entities
);

-- Create dissemination_impacts table
CREATE TABLE IF NOT EXISTS public.dissemination_impacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic information
  titulo TEXT NOT NULL,
  descripcion TEXT,
  
  -- Categorization using catalogs
  canal TEXT NOT NULL, -- Uses catalog: dissemination_channels (email, web, evento, webinar, social_media, etc.)
  tipo TEXT, -- Uses catalog: dissemination_types (campaign, announcement, newsletter, etc.)
  
  -- Status
  estado dissemination_status NOT NULL DEFAULT 'planned',
  
  -- Related entity (polymorphic relationship)
  entity_type dissemination_entity_type NOT NULL DEFAULT 'general',
  entity_id UUID, -- ID of the related entity (empresa, evento, formacion, material)
  
  -- Additional relationships
  empresa_ids UUID[], -- Array of empresa IDs affected by this dissemination
  
  -- Dates
  fecha_inicio DATE,
  fecha_fin DATE,
  fecha_ejecucion DATE, -- When the dissemination was actually executed
  
  -- Impact metrics
  alcance INTEGER DEFAULT 0, -- Reach/impressions
  visualizaciones INTEGER DEFAULT 0, -- Views
  descargas INTEGER DEFAULT 0, -- Downloads
  interacciones INTEGER DEFAULT 0, -- Engagements/clicks
  conversiones INTEGER DEFAULT 0, -- Conversions (registrations, applications, etc.)
  
  -- Custom metrics (flexible JSON for additional metrics)
  metricas_adicionales JSONB,
  
  -- Cost tracking
  presupuesto DECIMAL(10, 2),
  coste_real DECIMAL(10, 2),
  
  -- Target audience
  publico_objetivo TEXT,
  segmento TEXT, -- Uses catalog: audience_segments
  
  -- Content references
  material_ids UUID[], -- Array of material IDs used in this dissemination
  
  -- Additional metadata
  tags TEXT[], -- Array of tags for searchability
  observaciones TEXT,
  
  -- Audit fields
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Constraints
  CONSTRAINT dissemination_impacts_titulo_check CHECK (char_length(titulo) > 0),
  CONSTRAINT dissemination_impacts_canal_check CHECK (char_length(canal) > 0),
  CONSTRAINT dissemination_impacts_alcance_check CHECK (alcance >= 0),
  CONSTRAINT dissemination_impacts_visualizaciones_check CHECK (visualizaciones >= 0),
  CONSTRAINT dissemination_impacts_descargas_check CHECK (descargas >= 0),
  CONSTRAINT dissemination_impacts_interacciones_check CHECK (interacciones >= 0),
  CONSTRAINT dissemination_impacts_conversiones_check CHECK (conversiones >= 0),
  CONSTRAINT dissemination_impacts_presupuesto_check CHECK (presupuesto IS NULL OR presupuesto >= 0),
  CONSTRAINT dissemination_impacts_coste_real_check CHECK (coste_real IS NULL OR coste_real >= 0),
  CONSTRAINT dissemination_impacts_dates_check CHECK (fecha_fin IS NULL OR fecha_inicio IS NULL OR fecha_fin >= fecha_inicio)
);

-- Create indexes for better query performance
CREATE INDEX idx_dissemination_impacts_canal ON public.dissemination_impacts(canal);
CREATE INDEX idx_dissemination_impacts_tipo ON public.dissemination_impacts(tipo);
CREATE INDEX idx_dissemination_impacts_estado ON public.dissemination_impacts(estado);
CREATE INDEX idx_dissemination_impacts_entity ON public.dissemination_impacts(entity_type, entity_id);
CREATE INDEX idx_dissemination_impacts_entity_type ON public.dissemination_impacts(entity_type);
CREATE INDEX idx_dissemination_impacts_created_by ON public.dissemination_impacts(created_by);
CREATE INDEX idx_dissemination_impacts_created_at ON public.dissemination_impacts(created_at DESC);
CREATE INDEX idx_dissemination_impacts_fecha_inicio ON public.dissemination_impacts(fecha_inicio DESC) WHERE fecha_inicio IS NOT NULL;
CREATE INDEX idx_dissemination_impacts_fecha_ejecucion ON public.dissemination_impacts(fecha_ejecucion DESC) WHERE fecha_ejecucion IS NOT NULL;
CREATE INDEX idx_dissemination_impacts_tags ON public.dissemination_impacts USING gin(tags);
CREATE INDEX idx_dissemination_impacts_empresa_ids ON public.dissemination_impacts USING gin(empresa_ids);
CREATE INDEX idx_dissemination_impacts_material_ids ON public.dissemination_impacts USING gin(material_ids);
CREATE INDEX idx_dissemination_impacts_metricas ON public.dissemination_impacts USING gin(metricas_adicionales);

-- Enable RLS
ALTER TABLE public.dissemination_impacts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for dissemination_impacts
-- All authenticated users can view dissemination impacts
CREATE POLICY "Dissemination impacts are viewable by authenticated users"
  ON public.dissemination_impacts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid()
    )
  );

-- Users with write permission can insert dissemination impacts
CREATE POLICY "Dissemination impacts are insertable by users with write permission"
  ON public.dissemination_impacts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'tecnico')
    )
  );

-- Users with write permission can update dissemination impacts
CREATE POLICY "Dissemination impacts are updatable by users with write permission"
  ON public.dissemination_impacts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND (role = 'admin' OR (role = 'tecnico' AND created_by = auth.uid()))
    )
  );

-- Only admins can delete dissemination impacts
CREATE POLICY "Dissemination impacts are deletable by admins"
  ON public.dissemination_impacts FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_dissemination_impacts_updated_at
  BEFORE UPDATE ON public.dissemination_impacts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add helpful comments
COMMENT ON TABLE public.dissemination_impacts IS 'Dissemination impacts table for tracking outreach activities and their metrics across companies and activities';
COMMENT ON COLUMN public.dissemination_impacts.titulo IS 'Title of the dissemination activity';
COMMENT ON COLUMN public.dissemination_impacts.canal IS 'Channel used for dissemination (uses catalog: dissemination_channels)';
COMMENT ON COLUMN public.dissemination_impacts.tipo IS 'Type of dissemination (uses catalog: dissemination_types)';
COMMENT ON COLUMN public.dissemination_impacts.estado IS 'Status (planned, active, completed, cancelled)';
COMMENT ON COLUMN public.dissemination_impacts.entity_type IS 'Type of entity this dissemination is related to';
COMMENT ON COLUMN public.dissemination_impacts.entity_id IS 'ID of the related entity';
COMMENT ON COLUMN public.dissemination_impacts.empresa_ids IS 'Array of empresa IDs affected by this dissemination';
COMMENT ON COLUMN public.dissemination_impacts.alcance IS 'Reach/impressions of the dissemination';
COMMENT ON COLUMN public.dissemination_impacts.visualizaciones IS 'Number of views';
COMMENT ON COLUMN public.dissemination_impacts.descargas IS 'Number of downloads';
COMMENT ON COLUMN public.dissemination_impacts.interacciones IS 'Number of engagements/clicks';
COMMENT ON COLUMN public.dissemination_impacts.conversiones IS 'Number of conversions';
COMMENT ON COLUMN public.dissemination_impacts.metricas_adicionales IS 'Additional custom metrics in JSON format';
COMMENT ON COLUMN public.dissemination_impacts.material_ids IS 'Array of material IDs used in this dissemination';
COMMENT ON COLUMN public.dissemination_impacts.tags IS 'Array of tags for searchability';

-- Helper function to get dissemination impacts for a specific entity
CREATE OR REPLACE FUNCTION public.get_dissemination_impacts_for_entity(
  p_entity_type dissemination_entity_type,
  p_entity_id UUID
)
RETURNS SETOF public.dissemination_impacts
LANGUAGE sql
STABLE
AS $$
  SELECT * FROM public.dissemination_impacts
  WHERE entity_type = p_entity_type AND entity_id = p_entity_id
  ORDER BY created_at DESC;
$$;

COMMENT ON FUNCTION public.get_dissemination_impacts_for_entity IS 'Helper function to retrieve all dissemination impacts for a given entity';

-- Helper function to get total impact metrics for an entity
CREATE OR REPLACE FUNCTION public.get_total_impact_metrics_for_entity(
  p_entity_type dissemination_entity_type,
  p_entity_id UUID
)
RETURNS TABLE (
  total_alcance BIGINT,
  total_visualizaciones BIGINT,
  total_descargas BIGINT,
  total_interacciones BIGINT,
  total_conversiones BIGINT,
  total_actividades BIGINT
)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    COALESCE(SUM(alcance), 0) as total_alcance,
    COALESCE(SUM(visualizaciones), 0) as total_visualizaciones,
    COALESCE(SUM(descargas), 0) as total_descargas,
    COALESCE(SUM(interacciones), 0) as total_interacciones,
    COALESCE(SUM(conversiones), 0) as total_conversiones,
    COUNT(*) as total_actividades
  FROM public.dissemination_impacts
  WHERE entity_type = p_entity_type AND entity_id = p_entity_id;
$$;

COMMENT ON FUNCTION public.get_total_impact_metrics_for_entity IS 'Helper function to get aggregated impact metrics for a given entity';
