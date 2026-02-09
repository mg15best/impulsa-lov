-- PR-J: Create materials table for document/resource management
-- Materials can be linked to companies, events, trainings, or communication modules

-- Create enum for material status
CREATE TYPE public.material_status AS ENUM (
  'draft',
  'review',
  'published',
  'archived'
);

-- Create materials table
CREATE TABLE IF NOT EXISTS public.materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic information
  titulo TEXT NOT NULL,
  descripcion TEXT,
  
  -- Categorization using catalogs
  tipo TEXT NOT NULL, -- Uses catalog: material_types
  categoria TEXT, -- Uses catalog: material_categories
  formato TEXT, -- Uses catalog: material_formats
  
  -- Status
  estado material_status NOT NULL DEFAULT 'draft',
  
  -- Relationships to entities (optional, can be linked to multiple)
  -- Using arrays to allow multiple relationships
  empresa_ids UUID[], -- Array of empresa IDs this material is relevant for
  evento_ids UUID[], -- Array of evento IDs this material is used in
  formacion_ids UUID[], -- Array of formacion IDs this material is used in
  
  -- File/download information
  url_descarga TEXT, -- Direct download URL if available
  es_descargable BOOLEAN DEFAULT true,
  requiere_autenticacion BOOLEAN DEFAULT true,
  
  -- Tracking
  numero_descargas INTEGER DEFAULT 0,
  fecha_publicacion TIMESTAMP WITH TIME ZONE,
  
  -- Additional metadata
  tags TEXT[], -- Array of tags for searchability
  keywords TEXT, -- Search keywords
  idioma TEXT DEFAULT 'es', -- Language code
  version TEXT, -- Version number if applicable
  
  -- Audit fields
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Constraints
  CONSTRAINT materials_titulo_check CHECK (char_length(titulo) > 0),
  CONSTRAINT materials_tipo_check CHECK (char_length(tipo) > 0),
  CONSTRAINT materials_numero_descargas_check CHECK (numero_descargas >= 0)
);

-- Create indexes for better query performance
CREATE INDEX idx_materials_tipo ON public.materials(tipo);
CREATE INDEX idx_materials_estado ON public.materials(estado);
CREATE INDEX idx_materials_categoria ON public.materials(categoria);
CREATE INDEX idx_materials_formato ON public.materials(formato);
CREATE INDEX idx_materials_created_by ON public.materials(created_by);
CREATE INDEX idx_materials_created_at ON public.materials(created_at DESC);
CREATE INDEX idx_materials_fecha_publicacion ON public.materials(fecha_publicacion DESC) WHERE fecha_publicacion IS NOT NULL;
CREATE INDEX idx_materials_tags ON public.materials USING gin(tags); -- GIN index for array searching
CREATE INDEX idx_materials_empresa_ids ON public.materials USING gin(empresa_ids); -- GIN index for array searching
CREATE INDEX idx_materials_evento_ids ON public.materials USING gin(evento_ids);
CREATE INDEX idx_materials_formacion_ids ON public.materials USING gin(formacion_ids);

-- Enable RLS
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;

-- RLS Policies for materials
-- Authenticated users with roles can view published materials, creators and admins can view all
CREATE POLICY "Materials are viewable by authenticated users"
  ON public.materials FOR SELECT
  TO authenticated
  USING (
    estado = 'published' OR
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Users with write permission can insert materials
CREATE POLICY "Materials are insertable by users with write permission"
  ON public.materials FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'tecnico')
    )
  );

-- Users with write permission can update materials (admin can update all, tecnico only their own)
CREATE POLICY "Materials are updatable by users with write permission"
  ON public.materials FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND (role = 'admin' OR (role = 'tecnico' AND created_by = auth.uid()))
    )
  );

-- Only admins can delete materials
CREATE POLICY "Materials are deletable by admins"
  ON public.materials FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_materials_updated_at
  BEFORE UPDATE ON public.materials
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add helpful comments
COMMENT ON TABLE public.materials IS 'Materials and resources table for document management with relationships to companies, events, and trainings';
COMMENT ON COLUMN public.materials.titulo IS 'Title of the material';
COMMENT ON COLUMN public.materials.tipo IS 'Type of material (uses catalog: material_types)';
COMMENT ON COLUMN public.materials.categoria IS 'Category of material (uses catalog: material_categories)';
COMMENT ON COLUMN public.materials.formato IS 'Format of material (uses catalog: material_formats)';
COMMENT ON COLUMN public.materials.estado IS 'Publication status (draft, review, published, archived)';
COMMENT ON COLUMN public.materials.empresa_ids IS 'Array of empresa IDs this material is relevant for';
COMMENT ON COLUMN public.materials.evento_ids IS 'Array of evento IDs this material is used in';
COMMENT ON COLUMN public.materials.formacion_ids IS 'Array of formacion IDs this material is used in';
COMMENT ON COLUMN public.materials.url_descarga IS 'Direct download URL if available';
COMMENT ON COLUMN public.materials.es_descargable IS 'Whether this material can be downloaded';
COMMENT ON COLUMN public.materials.numero_descargas IS 'Number of times this material has been downloaded';
COMMENT ON COLUMN public.materials.tags IS 'Array of tags for searchability';

-- Helper function to increment download counter
CREATE OR REPLACE FUNCTION public.increment_material_downloads(
  p_material_id UUID
)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE public.materials
  SET numero_descargas = numero_descargas + 1
  WHERE id = p_material_id;
$$;

COMMENT ON FUNCTION public.increment_material_downloads IS 'Helper function to increment download counter for a material';

-- Helper function to get materials for a specific entity
CREATE OR REPLACE FUNCTION public.get_materials_for_entity(
  p_entity_type TEXT,
  p_entity_id UUID
)
RETURNS SETOF public.materials
LANGUAGE sql
STABLE
AS $$
  SELECT * FROM public.materials
  WHERE 
    CASE p_entity_type
      WHEN 'empresa' THEN p_entity_id = ANY(empresa_ids)
      WHEN 'evento' THEN p_entity_id = ANY(evento_ids)
      WHEN 'formacion' THEN p_entity_id = ANY(formacion_ids)
      ELSE false
    END
  ORDER BY created_at DESC;
$$;

COMMENT ON FUNCTION public.get_materials_for_entity IS 'Helper function to retrieve all materials for a given entity type and ID';
